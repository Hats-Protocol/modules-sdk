import {
  PublicClient,
  WalletClient,
  keccak256,
  stringToBytes,
  encodePacked,
  encodeAbiParameters,
  decodeEventLog,
} from "viem";
import {
  MissingPublicClientError,
  ChainIdMismatchError,
  MissingWalletClientError,
  ModuleNotAvailableError,
  TransactionRevertedError,
  InvalidParamError,
  ClientNotPreparedError,
  ParametersLengthsMismatchError,
} from "./errors";
import { verify } from "./schemas";
import type { CreateInstanceResult } from "./types";
import { request } from "@octokit/request";
import type { Account, Address } from "viem";
import type { Module, Factory, FunctionInfo } from "./types";

export class HatsModulesClient {
  private readonly _publicClient: PublicClient;
  private readonly _walletClient: WalletClient;
  private _modules: { [key: string]: Module } | undefined;
  private _factory: Factory | undefined;

  /**
   * Initialize a HatsModulesClient.
   *
   * @param publicClient - Viem Public Client.
   * @param walletClient - Viem Wallet Client.
   * @param chainId - Client chain ID. The client is initialized to work with one specific chain.
   * @returns A HatsModulesClient instance.
   *
   * @throws MissingPublicClientError
   * Thrown when a public client is not provided.
   *
   * * @throws MissingWalletClientError
   * Thrown when a wallet client is not provided.
   *
   * @throws ChainIdMismatchError
   * Thrown when there is a chain ID mismatch between the Viem clients.
   */
  constructor({
    publicClient,
    walletClient,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
  }) {
    if (publicClient === undefined) {
      throw new MissingPublicClientError("Public client is required");
    }
    if (walletClient === undefined) {
      throw new MissingWalletClientError("Wallet client is required");
    }

    if (walletClient.chain?.id !== publicClient.chain?.id) {
      throw new ChainIdMismatchError(
        "Provided chain id should match the wallet client chain id"
      );
    }

    this._publicClient = publicClient;
    this._walletClient = walletClient;
  }

  /**
   * Fetches the modules from the modules registry and prepares the client for usage.
   *
   * @param modules - Optional array of modules. If provided, then these modules will be used instead of fetching from the registry.
   */
  async prepare(modules?: Module[]) {
    let registryModules: Module[];
    if (modules !== undefined) {
      registryModules = modules;
    } else {
      const result = await request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
          owner: "Hats-Protocol",
          repo: "modules-registry",
          path: "modules.json",
          mediaType: {
            format: "raw",
          },
        }
      );

      registryModules = JSON.parse(result.data as unknown as string);
    }

    this._modules = {};
    for (
      let moduleIndex = 1;
      moduleIndex < registryModules.length;
      moduleIndex++
    ) {
      const module = registryModules[moduleIndex];
      let moduleSupportedInChain = false;
      module.deployments.forEach((deployment) => {
        if (deployment.chainId === this._publicClient.chain?.id.toString()) {
          moduleSupportedInChain = true;
        }
      });

      if (moduleSupportedInChain) {
        const moduleId: string = keccak256(
          stringToBytes(JSON.stringify(module))
        );

        if (this._modules !== undefined) {
          this._modules[moduleId] = module;
        }
      }
    }

    this._factory = registryModules[0];
  }

  /**
   * Create a new module instance.
   *
   * @param account - A Viem account.
   * @param moduleId - The module ID.
   * @param hatId - The hat ID for which the module is created.
   * @param immutableArgs - The module's immutable arguments.
   * @param mutableArgs - The module's mutable arguments.
   * @returns An object containing the status of the call, the transaction hash and the new module instance address.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   *
   * @throws ModuleNotAvailableError
   * Thrown if there is no module that matches the provided module ID.
   *
   * @throws TransactionRevertedError
   * Thrown if the transaction reverted.
   */
  async createNewInstance({
    account,
    moduleId,
    hatId,
    immutableArgs,
    mutableArgs,
  }: {
    account: Account | Address;
    moduleId: string;
    hatId: bigint;
    immutableArgs: unknown[];
    mutableArgs: unknown[];
  }): Promise<CreateInstanceResult> {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Module with id ${moduleId} does not exist`
      );
    }

    this._verifyModuleCreationArgs(module, hatId, immutableArgs, mutableArgs);

    const mutableArgsTypes = module.args.mutable.map((arg) => {
      return { type: arg.type };
    });
    const immutableArgsTypes = module.args.immutable.map((arg) => {
      return arg.type;
    });

    const mutableArgsEncoded =
      immutableArgs.length > 0
        ? encodeAbiParameters(mutableArgsTypes, mutableArgs)
        : "";
    const immutableArgsEncoded =
      immutableArgs.length > 0
        ? encodePacked(immutableArgsTypes, immutableArgs)
        : "";

    try {
      const hash = await this._walletClient.writeContract({
        address: this._factory.implementationAddress as `0x${string}`,
        abi: this._factory.abi,
        functionName: "createHatsModule",
        account,
        args: [
          module.implementationAddress as `0x${string}`,
          hatId,
          immutableArgsEncoded,
          mutableArgsEncoded,
        ],
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      let instance: `0x${string}` = "0x";
      for (let eventIndex = 0; eventIndex < receipt.logs.length; eventIndex++) {
        try {
          const event: any = decodeEventLog({
            abi: this._factory.abi,
            eventName: "HatsModuleFactory_ModuleDeployed",
            data: receipt.logs[eventIndex].data,
            topics: receipt.logs[eventIndex].topics,
          });

          instance = event.args.instance;
          break;
        } catch (err) {
          // continue
        }
      }

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        newInstance: instance,
      };
    } catch (err) {
      console.log(err);
      throw new TransactionRevertedError("Transaction reverted");
    }
  }

  /**
   * Get a module's functions.
   *
   * @param moduleId - The nodule ID.
   * @returns A list of the moudle's functions. Each function's information includes the its name, whether it's a "read" of "write" operation and an array
   * of inputs to the function.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getFunctionsInModule(moduleId: string): FunctionInfo[] {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    const functions: FunctionInfo[] = [];
    const { abi } = this._modules[moduleId];

    for (let i = 0; i < abi.length; i++) {
      const abiItem = abi[i];
      if (abiItem.type === "function") {
        if (
          abiItem.name === "IMPLEMENTATION" ||
          abiItem.name === "HATS" ||
          abiItem.name === "setUp" ||
          abiItem.name === "version" ||
          abiItem.name === "version_"
        ) {
          continue;
        }

        const functionType: "write" | "read" =
          abiItem.stateMutability === "pure" ||
          abiItem.stateMutability === "view"
            ? "read"
            : "write";

        const functionInputs = abiItem.inputs.map((input) => {
          return { name: input.name, type: input.type };
        });

        functions.push({
          name: abiItem.name,
          type: functionType,
          inputs: functionInputs,
        });
      }
    }

    return functions;
  }

  /**
   * Get a module by its ID.
   *
   * @param moduleId - The nodule ID.
   * @returns The module matching the provided ID.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getModuleById(moduleId: string): Module | undefined {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    return this._modules[moduleId];
  }

  /**
   * Get a module by its implementation address.
   *
   * @param moduleId - The nodule ID.
   * @returns The module matching the provided implementation address.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getModuleByImplementaion(address: string): Module | undefined {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    for (const [, module] of Object.entries(this._modules)) {
      if (module.implementationAddress === address) {
        return module;
      }
    }
  }

  /**
   * Get all the available modules.
   *
   * @returns An object which keys are module IDs and the values are the corresponding modules.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getAllModules(): { [id: string]: Module } {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    return this._modules;
  }

  /**
   * Get all the available eligibility modules.
   *
   * @returns An object which keys are module IDs and the values are the corresponding eligibility modules.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getAllEligibilityModules(): { [id: string]: Module } {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    const res: { [id: string]: Module } = {};
    for (const id of Object.keys(this._modules)) {
      const module = this._modules[id];
      if (module.type.eligibility) {
        res[id] = module;
      }
    }

    return res;
  }

  /**
   * Get all the available toggle modules.
   *
   * @returns An object which keys are module IDs and the values are the corresponding toggle modules.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getAllToggleModules(): { [id: string]: Module } {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    const res: { [id: string]: Module } = {};
    for (const id of Object.keys(this._modules)) {
      const module = this._modules[id];
      if (module.type.toggle) {
        res[id] = module;
      }
    }

    return res;
  }

  /**
   * Get all the available hatter modules.
   *
   * @returns An object which keys are module IDs and the values are the corresponding hatter modules.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getAllHatterModules(): { [id: string]: Module } {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    const res: { [id: string]: Module } = {};
    for (const id of Object.keys(this._modules)) {
      const module = this._modules[id];
      if (module.type.hatter) {
        res[id] = module;
      }
    }

    return res;
  }

  _verifyModuleCreationArgs(
    module: Module,
    hatId: bigint,
    immutableArgs: unknown[],
    mutableArgs: unknown[]
  ) {
    // verify hat ID
    if (!verify(hatId, "uint256")) {
      throw new InvalidParamError(`Invalid hat ID parameter`);
    }

    // verify immutable and mutable array lengths
    if (immutableArgs.length !== module.args.immutable.length) {
      throw new ParametersLengthsMismatchError(
        "Immutable args array length doesn't match the module's schema"
      );
    }
    if (mutableArgs.length !== module.args.mutable.length) {
      throw new ParametersLengthsMismatchError(
        "Mutable args array length doesn't match the module's schema"
      );
    }

    // verify immutable args
    for (let i = 0; i < immutableArgs.length; i++) {
      const val = immutableArgs[i];
      const type = module.args.immutable[i].type;
      if (!verify(val, type)) {
        throw new InvalidParamError(`Invalid immutable argument at index ${i}`);
      }
    }

    // verify mutable args
    for (let i = 0; i < mutableArgs.length; i++) {
      const val = mutableArgs[i];
      const type = module.args.mutable[i].type;
      if (!verify(val, type)) {
        throw new InvalidParamError(`Invalid mutable argument at index ${i}`);
      }
    }
  }
}
