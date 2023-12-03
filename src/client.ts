import { PublicClient, WalletClient, encodePacked, decodeEventLog } from "viem";
import {
  MissingPublicClientError,
  ChainIdMismatchError,
  MissingWalletClientError,
  ModuleNotAvailableError,
  TransactionRevertedError,
  InvalidParamError,
  ClientNotPreparedError,
  ModulesRegistryFetchError,
  ModuleParameterError,
  getModuleFunctionError,
} from "./errors";
import { verify } from "./schemas";
import { HATS_MODULE_ABI, HATS_ABI, HATS_V1 } from "./constants";
import axios from "axios";
import {
  checkAndEncodeArgs,
  checkImmutableArgs,
  getNewInstancesFromReceipt,
  checkWriteFunctionArgs,
} from "./utils";
import type { Account, Address, TransactionReceipt } from "viem";
import type {
  Module,
  Factory,
  FunctionInfo,
  ChainModule,
  ModuleParameter,
  CreateInstanceResult,
  BatchCreateInstancesResult,
  CallInstanceWriteFunctionResult,
  Registry,
  Role,
  WriteFunction,
} from "./types";

export class HatsModulesClient {
  private readonly _publicClient: PublicClient;
  private readonly _walletClient: WalletClient;
  private _modules: { [key: string]: Module } | undefined;
  private _factory: Factory | undefined;
  private _eligibilitiesChain: ChainModule | undefined;
  private _togglesChain: ChainModule | undefined;

  /**
   * Initialize a HatsModulesClient.
   *
   * @param publicClient - Viem Public Client.
   * @param walletClient - Viem Wallet Client.
   * @returns A HatsModulesClient instance.
   *
   * @throws MissingPublicClientError
   * Thrown when a public client is not provided.
   *
   * @throws MissingWalletClientError
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
   * Fetches the modules registry and prepares the client for usage.
   *
   * @param registry - Optional registry object. If provided, then these modules will be used instead of fetching from the registry.
   *
   * @throws ModulesRegistryFetchError
   * Thrown in case there was an error while fetching from the modules registry.
   */
  async prepare(registry?: Registry) {
    let registryToUse: Registry;
    if (registry !== undefined) {
      registryToUse = registry;
    } else {
      try {
        const result = await axios.get(
          "https://raw.githubusercontent.com/Hats-Protocol/modules-registry/main/modules.json"
        );
        registryToUse = result.data;
      } catch (err) {
        throw new ModulesRegistryFetchError(
          "Could not fetch modules from the registry"
        );
      }
    }

    this._modules = {};
    for (
      let moduleIndex = 0;
      moduleIndex < registryToUse.modules.length;
      moduleIndex++
    ) {
      const module = registryToUse.modules[moduleIndex];
      let moduleSupportedInChain = false;
      module.deployments.forEach((deployment) => {
        if (deployment.chainId === this._publicClient.chain?.id.toString()) {
          moduleSupportedInChain = true;
        }
      });

      if (moduleSupportedInChain) {
        const moduleId: string = module.implementationAddress;

        if (this._modules !== undefined) {
          this._modules[moduleId] = module;
        }
      }
    }

    this._factory = registryToUse.factory;
    this._eligibilitiesChain = registryToUse.eligibilitiesChain;
    this._togglesChain = registryToUse.togglesChain;
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
   * @throws InvalidParamError
   * Thrown if the provided 'hatId' parameter or one of the creation args is invalid.
   *
   * @throws ParametersLengthsMismatchError
   * Thrown if one of the creation args array's length doens't match the module's schema.
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
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Module with id ${moduleId} does not exist`
      );
    }

    // verify hat ID
    if (!verify(hatId, "uint256")) {
      throw new InvalidParamError(`Invalid hat ID parameter`);
    }

    const { encodedImmutableArgs, encodedMutableArgs } = checkAndEncodeArgs({
      module,
      immutableArgs,
      mutableArgs,
    });

    try {
      const hash = await this._walletClient.writeContract({
        address: this._factory.implementationAddress as `0x${string}`,
        abi: this._factory.abi,
        functionName: "createHatsModule",
        account,
        args: [
          module.implementationAddress as `0x${string}`,
          hatId,
          encodedImmutableArgs,
          encodedMutableArgs,
        ],
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      const instances = getNewInstancesFromReceipt(receipt);

      if (instances.length != 1) {
        throw new Error("Unexpected error: instance address was not found");
      }

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        newInstance: instances[0],
      };
    } catch (err) {
      console.log(err);
      throw new TransactionRevertedError("Transaction reverted");
    }
  }

  /**
   * Batch create new module instances.
   *
   * @param account - A Viem account.
   * @param moduleIds - The module IDs.
   * @param hatIds - The hat IDs for which the modules are created.
   * @param immutableArgsArray - Each module's immutable arguments.
   * @param mutableArgsArray - Each module's mutable arguments.
   * @returns An object containing the status of the call, the transaction hash and the new module instances addresses.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   *
   * @throws ModuleNotAvailableError
   * Thrown if there is no module that matches the provided module ID.
   *
   * @throws InvalidParamError
   * Thrown if one of the provided 'hatId' parameters or one of the creation args is invalid.
   *
   * @throws ParametersLengthsMismatchError
   * Thrown if one of the creation args array's length doens't match the module's schema.
   *
   * @throws TransactionRevertedError
   * Thrown if the transaction reverted.
   */
  async batchCreateNewInstances({
    account,
    moduleIds,
    hatIds,
    immutableArgsArray,
    mutableArgsArray,
  }: {
    account: Account | Address;
    moduleIds: string[];
    hatIds: bigint[];
    immutableArgsArray: unknown[][];
    mutableArgsArray: unknown[][];
  }): Promise<BatchCreateInstancesResult> {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const implementations: Array<string> = [];
    const encodedImmutableArgsArray: Array<`0x${string}` | ""> = [];
    const encodedMutableArgsArray: Array<`0x${string}` | ""> = [];

    for (let i = 0; i < moduleIds.length; i++) {
      const module = this.getModuleById(moduleIds[i]);
      if (module === undefined) {
        throw new ModuleNotAvailableError(
          `Module with id ${moduleIds[i]} does not exist`
        );
      }

      // verify hat ID
      if (!verify(hatIds[i], "uint256")) {
        throw new InvalidParamError(`Invalid hat ID parameter`);
      }

      const { encodedImmutableArgs, encodedMutableArgs } = checkAndEncodeArgs({
        module,
        immutableArgs: immutableArgsArray[i],
        mutableArgs: mutableArgsArray[i],
      });

      encodedMutableArgsArray.push(encodedMutableArgs);
      encodedImmutableArgsArray.push(encodedImmutableArgs);
      implementations.push(module.implementationAddress);
    }

    let receipt: TransactionReceipt;
    try {
      const hash = await this._walletClient.writeContract({
        address: this._factory.implementationAddress as `0x${string}`,
        abi: this._factory.abi,
        functionName: "batchCreateHatsModule",
        account,
        args: [
          implementations as Array<`0x${string}`>,
          hatIds,
          encodedImmutableArgsArray,
          encodedMutableArgsArray,
        ],
        chain: this._walletClient.chain,
      });

      receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });
    } catch (err) {
      console.log(err);
      throw new TransactionRevertedError("Transaction reverted");
    }

    const instances = getNewInstancesFromReceipt(receipt);

    return {
      status: receipt.status,
      transactionHash: receipt.transactionHash,
      newInstances: instances,
    };
  }

  /**
   * Create a new eligibilities chain module.
   *
   * @param account - A Viem account.
   * @param hatId - The hat ID for which the module is created.
   * @param numClauses - Number of conjunction clauses.
   * @param clausesLengths - Lengths of each clause.
   * @param modules - Array of module instances to chain, at the order corresponding to the provided clauses.
   * @returns An object containing the status of the call, the transaction hash and the new module instance address.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   *
   * @throws TransactionRevertedError
   * Thrown if the transaction reverted.
   */
  async createEligibilitiesChain({
    account,
    hatId,
    numClauses,
    clausesLengths,
    modules,
  }: {
    account: Account | Address;
    hatId: bigint;
    numClauses: number;
    clausesLengths: number[];
    modules: `0x${string}`[];
  }): Promise<CreateInstanceResult> {
    if (
      this._modules === undefined ||
      this._factory === undefined ||
      this._eligibilitiesChain === undefined
    ) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const numModules = clausesLengths.reduce(
      (partialSum, len) => partialSum + len,
      0
    );
    const immutableArgsTypes = ["uint256", "uint256[]"];
    const immutableArgs: unknown[] = [numClauses, clausesLengths];
    for (let i = 0; i < numModules; i++) {
      immutableArgsTypes.push("address");
      immutableArgs.push(modules[i]);
    }

    const mutableArgsEncoded = "";
    const immutableArgsEncoded = encodePacked(
      immutableArgsTypes,
      immutableArgs
    );

    try {
      const hash = await this._walletClient.writeContract({
        address: this._factory.implementationAddress as `0x${string}`,
        abi: this._factory.abi,
        functionName: "createHatsModule",
        account,
        args: [
          this._eligibilitiesChain.implementationAddress,
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
   * Create a new toggles chain module.
   *
   * @param account - A Viem account.
   * @param hatId - The hat ID for which the module is created.
   * @param numClauses - Number of conjunction clauses.
   * @param clausesLengths - Lengths of each clause.
   * @param modules - Array of module instances to chain, at the order corresponding to the provided clauses.
   * @returns An object containing the status of the call, the transaction hash and the new module instance address.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   *
   * @throws TransactionRevertedError
   * Thrown if the transaction reverted.
   */
  async createTogglesChain({
    account,
    hatId,
    numClauses,
    clausesLengths,
    modules,
  }: {
    account: Account | Address;
    hatId: bigint;
    numClauses: number;
    clausesLengths: number[];
    modules: `0x${string}`[];
  }): Promise<CreateInstanceResult> {
    if (
      this._modules === undefined ||
      this._factory === undefined ||
      this._togglesChain === undefined
    ) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const numModules = clausesLengths.reduce(
      (partialSum, len) => partialSum + len,
      0
    );
    const immutableArgsTypes = ["uint256", "uint256[]"];
    const immutableArgs: unknown[] = [numClauses, clausesLengths];
    for (let i = 0; i < numModules; i++) {
      immutableArgsTypes.push("address");
      immutableArgs.push(modules[i]);
    }

    const mutableArgsEncoded = "";
    const immutableArgsEncoded = encodePacked(
      immutableArgsTypes,
      immutableArgs
    );

    try {
      const hash = await this._walletClient.writeContract({
        address: this._factory.implementationAddress as `0x${string}`,
        abi: this._factory.abi,
        functionName: "createHatsModule",
        account,
        args: [
          this._togglesChain.implementationAddress,
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
   * Predict a module's address.
   *
   * @param moduleId - The module ID.
   * @param hatId - The hat ID for which the module is created.
   * @param immutableArgs - The module's immutable arguments.
   * @returns The module's predicted address.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   *
   * @throws ModuleNotAvailableError
   * Thrown if there is no module that matches the provided module ID.
   *
   * @throws InvalidParamError
   * Thrown if the provided 'hatId' parameter or one of the immutable args is invalid.
   *
   * @throws ParametersLengthsMismatchError
   * Thrown if immutable args array's length doens't match the module's schema.
   */
  async predictHatsModuleAddress({
    moduleId,
    hatId,
    immutableArgs,
  }: {
    moduleId: string;
    hatId: bigint;
    immutableArgs: unknown[];
  }): Promise<Address> {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Module with id ${moduleId} does not exist`
      );
    }

    // verify hat ID
    if (!verify(hatId, "uint256")) {
      throw new InvalidParamError(`Invalid hat ID parameter`);
    }

    checkImmutableArgs({ module, immutableArgs });

    const immutableArgsTypes = module.creationArgs.immutable.map((arg) => {
      return arg.type;
    });
    const immutableArgsEncoded =
      immutableArgs.length > 0
        ? encodePacked(immutableArgsTypes, immutableArgs)
        : "";

    const predictedAddress: Address = (await this._publicClient.readContract({
      address: this._factory.implementationAddress as Address,
      abi: this._factory.abi,
      functionName: "getHatsModuleAddress",
      args: [
        module.implementationAddress as Address,
        hatId,
        immutableArgsEncoded,
      ],
    })) as Address;

    return predictedAddress;
  }

  /**
   * Check if a module is already deployed.
   *
   * @param moduleId - The module ID.
   * @param hatId - The hat ID for which the module is created.
   * @param immutableArgs - The module's immutable arguments.
   * @returns The module's predicted address.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   *
   * @throws ModuleNotAvailableError
   * Thrown if there is no module that matches the provided module ID.
   *
   * @throws InvalidParamError
   * Thrown if the provided 'hatId' parameter or one of the immutable args is invalid.
   *
   * @throws ParametersLengthsMismatchError
   * Thrown if immutable args array's length doens't match the module's schema.
   */
  async isModuleDeployed({
    moduleId,
    hatId,
    immutableArgs,
  }: {
    moduleId: string;
    hatId: bigint;
    immutableArgs: unknown[];
  }): Promise<boolean> {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Module with id ${moduleId} does not exist`
      );
    }

    // verify hat ID
    if (!verify(hatId, "uint256")) {
      throw new InvalidParamError(`Invalid hat ID parameter`);
    }

    checkImmutableArgs({ module, immutableArgs });

    const immutableArgsTypes = module.creationArgs.immutable.map((arg) => {
      return arg.type;
    });
    const immutableArgsEncoded =
      immutableArgs.length > 0
        ? encodePacked(immutableArgsTypes, immutableArgs)
        : "";

    const deployed: boolean = (await this._publicClient.readContract({
      address: this._factory.implementationAddress as Address,
      abi: this._factory.abi,
      functionName: "deployed",
      args: [
        module.implementationAddress as Address,
        hatId,
        immutableArgsEncoded,
      ],
    })) as boolean;

    return deployed;
  }

  /**
   * Get a module's functions.
   *
   * @param moduleId - The nodule ID.
   * @returns A list of the moudle's functions. Each function's information includes its name, whether it's a "read" or "write" operation and an array
   * of inputs to the function.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getFunctionsInModule(moduleId: string): FunctionInfo[] {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
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
   * Get module instance's parameters.
   * The parameters to fetch are listed in the module's registry object. If the given address is not a registry module, returns 'undefined'.
   *
   * @param instance - The module instace address.
   * @returns A list of objects, for each parameter. Each object includes the parameter's value, label, Solidity type and display type. If
   * the given address is not an instance of a registry module, then returns 'undefined'.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   *
   * @throws ModuleParameterError
   * Thrown if failed reading a module's parameter.
   */
  async getInstanceParameters(
    instance: Address
  ): Promise<ModuleParameter[] | undefined> {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const moduleParameters: ModuleParameter[] = [];
    const module = await this.getModuleByInstance(instance);

    // check if instance is a registry module
    if (module === undefined) {
      return undefined;
    }

    for (
      let paramIndex = 0;
      paramIndex < module.parameters.length;
      paramIndex++
    ) {
      const param = module.parameters[paramIndex];

      for (
        let abiItemIndex = 0;
        abiItemIndex < module.abi.length;
        abiItemIndex++
      ) {
        const abiItem = module.abi[abiItemIndex];

        if (
          abiItem.type === "function" &&
          abiItem.name === param.functionName
        ) {
          if (abiItem.inputs.length > 0 || abiItem.outputs.length !== 1) {
            break;
          }

          let parameterValue: unknown;
          try {
            parameterValue = await this._publicClient.readContract({
              address: instance,
              abi: module.abi,
              functionName: param.functionName,
            });
          } catch (err) {
            throw new ModuleParameterError(
              `Failed reading function ${param.functionName} from the module instance`
            );
          }

          const solidityType = abiItem.outputs[0].type;

          moduleParameters.push({
            label: param.label,
            value: parameterValue,
            solidityType: solidityType,
            displayType: param.displayType,
          });
        }
      }
    }

    return moduleParameters;
  }

  /**
   * Get a module by its ID.
   *
   * @param moduleId - The module ID.
   * @returns The module matching the provided ID.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getModuleById(moduleId: string): Module | undefined {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    return this._modules[moduleId];
  }

  /**
   * Get a module by its implementation address.
   *
   * @param address - The implementation address.
   * @returns The module matching the provided implementation address. If no matching, returns 'undefined'.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getModuleByImplementation(address: Address): Module | undefined {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    for (const [, module] of Object.entries(this._modules)) {
      if (module.implementationAddress === address) {
        return module;
      }
    }
  }

  /**
   * Get the module object of an instance.
   *
   * @param address - Instance address.
   * @returns The module matching the provided instance address. If the given address is not an insance of a registry module, then returns
   * 'undefined'.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  async getModuleByInstance(address: Address): Promise<Module | undefined> {
    if (this._modules === undefined || this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    try {
      const implementationAddress = await this._publicClient.readContract({
        address: address,
        abi: HATS_MODULE_ABI,
        functionName: "IMPLEMENTATION",
      });

      const res = this.getModuleByImplementation(implementationAddress);
      return res;
    } catch (err) {
      return undefined;
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
        "Client has not been initialized, requires a call to the prepare function"
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
        "Client has not been initialized, requires a call to the prepare function"
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
        "Client has not been initialized, requires a call to the prepare function"
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
        "Client has not been initialized, requires a call to the prepare function"
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

  /**
   * Get eligibilities chain module.
   *
   * @returns the eligibilities chain module.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getElibilitiesChainModule(): ChainModule {
    if (this._eligibilitiesChain === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    return this._eligibilitiesChain;
  }

  /**
   * Get toggles chain module.
   *
   * @returns the toggles chain module.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getTogglesChainModule(): ChainModule {
    if (this._togglesChain === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    return this._togglesChain;
  }

  /**
   * Get the Hats Module Factory from the registry.
   *
   * @returns the factory.
   *
   * @throws ClientNotPreparedError
   * Thrown if the "prepare" function has not been called yet.
   */
  getFactory(): Factory {
    if (this._factory === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    return this._factory;
  }

  /*//////////////////////////////////////////////////////////////
                  Module Roles & Write Functions
  //////////////////////////////////////////////////////////////*/

  async getRolesOfHatInInstance(
    instance: Address,
    hat: bigint
  ): Promise<Role[]> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = await this.getModuleByInstance(instance);
    if (module === undefined) {
      throw new Error("Not a module instance");
    }

    const roles: Role[] = [];

    const criteriaHats: bigint[] = [];
    for (let i = 2; i < module.roles.length; i++) {
      const criteriaHat = (await this._publicClient.readContract({
        address: instance,
        abi: module.abi,
        functionName: module.roles[i].criteria,
      })) as bigint;
      criteriaHats.push(criteriaHat);
    }

    let instanceUsesHatsAdmins = false;
    if (module.roles[1].functions.length > 0 || criteriaHats.includes(0n)) {
      instanceUsesHatsAdmins = true;
    }

    let isAdmin = false;
    if (instanceUsesHatsAdmins) {
      const moduleOfHat = (await this._publicClient.readContract({
        address: instance,
        abi: module.abi,
        functionName: "hatId",
      })) as bigint;

      const hatLevel = await this._publicClient.readContract({
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: "getHatLevel",
        args: [moduleOfHat],
      });

      const calls = [];
      for (let level = hatLevel - 1; level >= 0; level--) {
        calls.push({
          address: HATS_V1 as Address,
          abi: HATS_ABI,
          functionName: "getAdminAtLevel",
          args: [moduleOfHat, level],
        });
      }
      const admins = await this._publicClient.multicall({
        contracts: calls,
      });

      for (let i = 0; i < admins.length; i++) {
        if (admins[i].result == hat) {
          isAdmin = true;
          break;
        }
      }
    }

    if (module.roles[1].functions.length > 0 && isAdmin) {
      roles.push(module.roles[1]);
    }
    criteriaHats.forEach((criteriaHat, index) => {
      if (criteriaHat == hat) {
        roles.push(module.roles[index + 2]);
      }
    });

    return roles;
  }

  async callInstanceWriteFunction({
    account,
    moduleId,
    instance,
    func,
    args,
  }: {
    account: Account | Address;
    moduleId: string;
    instance: Address;
    func: WriteFunction;
    args: unknown[];
  }): Promise<CallInstanceWriteFunctionResult> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      if (module === undefined) {
        throw new ModuleNotAvailableError(
          `Module with id ${moduleId} does not exist`
        );
      }
    }

    checkWriteFunctionArgs({ func, args });

    try {
      const { request } = await this._publicClient.simulateContract({
        address: instance,
        abi: module.abi,
        functionName: func.functionName,
        args: args,
        account,
      });

      const hash = await this._walletClient.writeContract(request);

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      getModuleFunctionError(err);
    }
  }
}
