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
} from "./errors";
import { verify } from "./schemas";
import type { CreateInstanceResult, SupportedChain } from "./types";
import * as fs from "fs";
import type { Account, Address } from "viem";
import type { Module, Factory, FunctionInfo } from "./types";

export class HatsModulesClient {
  private readonly _publicClient: PublicClient;
  private readonly _walletClient: WalletClient;
  private readonly _chainId: SupportedChain;
  private _modules: { [key: string]: Module } | undefined;
  private _factory: Factory | undefined;

  constructor({
    publicClient,
    walletClient,
    chainId,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
    chainId: SupportedChain;
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
    this._chainId = chainId;
  }

  async prepare() {
    //if (this._modules !== undefined) {
    //  throw new Error();
    //}

    const modulesFile = new URL("modules.json", import.meta.url);
    const data = fs.readFileSync(modulesFile, "utf-8");
    const modules: Module[] = JSON.parse(data);

    this._modules = {};
    for (let moduleIndex = 1; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex];
      let moduleSupportedInChain = false;
      module.deployments.forEach((deployment) => {
        if (deployment.chainId === this._chainId.toString()) {
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

    this._factory = modules[0];
  }

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

    this.verifyModuleCreationArgs(module, hatId, immutableArgs, mutableArgs);

    const mutableArgsTypes = module.args.mutable.map((arg) => {
      return { type: arg.type };
    });
    const immutableArgsTypes = module.args.immutable.map((arg) => {
      return arg.type;
    });

    const mutableArgsEncoded =
      immutableArgs.length > 0
        ? encodeAbiParameters(mutableArgsTypes, mutableArgs)
        : "0x";
    const immutableArgsEncoded =
      immutableArgs.length > 0
        ? encodePacked(immutableArgsTypes, immutableArgs)
        : "0x";

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

  verifyParameter(val: unknown, type: string): boolean {
    return verify(val, type);
  }

  verifyModuleCreationArgs(
    module: Module,
    hatId: bigint,
    immutableArgs: unknown[],
    mutableArgs: unknown[]
  ) {
    // verify hat ID
    if (!this.verifyParameter(hatId, "uint256")) {
      throw new InvalidParamError(`Invalid hat ID parameter`);
    }

    // verify immutable and mutable array lengths
    if (immutableArgs.length !== module.args.immutable.length) {
      throw new Error();
    }
    if (mutableArgs.length !== module.args.mutable.length) {
      throw new Error();
    }

    // verify immutable args
    for (let i = 0; i < immutableArgs.length; i++) {
      const val = immutableArgs[i];
      const type = module.args.immutable[i].type;
      if (!this.verifyParameter(val, type)) {
        throw new Error(`Invalid immutable argument at index ${i}`);
      }
    }

    // verify mutable args
    for (let i = 0; i < mutableArgs.length; i++) {
      const val = mutableArgs[i];
      const type = module.args.mutable[i].type;
      if (!this.verifyParameter(val, type)) {
        throw new Error(`Invalid mutable argument at index ${i}`);
      }
    }
  }

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

  getModuleById(moduleId: string): Module {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    return this._modules[moduleId];
  }

  getAllModules(): { [id: string]: Module } {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client have not been initilized, requires a call to the prepare function"
      );
    }

    return this._modules;
  }

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
}
