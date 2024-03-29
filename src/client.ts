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
  MissingWalletClientChainError,
  MissingPublicClientChainError,
} from "./errors";
import { verify } from "./schemas";
import {
  HATS_MODULE_ABI,
  HATS_MODULES_FACTORY_ABI,
  HATS_MODULES_FACTORY_ADDRESS,
  HATS_ELIGIBILITIES_CHAIN_MODULE_ADDRESS,
  HATS_TOGGLES_CHAIN_MODULE_ADDRESS,
} from "./constants";
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
  ModuleParameter,
  CreateInstanceResult,
  BatchCreateInstancesResult,
  CallInstanceWriteFunctionResult,
  Registry,
  WriteFunction,
} from "./types";

export class HatsModulesClient {
  private readonly _publicClient: PublicClient;
  private readonly _walletClient: WalletClient;
  private readonly _chainId: number;
  private _modules: { [key: string]: Module } | undefined;

  /**
   * Initialize a HatsModulesClient.
   *
   * @param publicClient - Viem Public Client.
   * @param walletClient - Viem Wallet Client.
   * @returns A HatsModulesClient instance.
   */
  constructor({
    publicClient,
    walletClient,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
  }) {
    if (publicClient === undefined) {
      throw new MissingPublicClientError("Error: Public client is required");
    }
    if (walletClient === undefined) {
      throw new MissingWalletClientError("Error: Wallet client is required");
    }
    if (walletClient.chain === undefined) {
      throw new MissingWalletClientChainError(
        "Error: Wallet client must be initialized with a chain"
      );
    }
    if (publicClient.chain === undefined) {
      throw new MissingPublicClientChainError(
        "Error: Public client must be initialized with a chain"
      );
    }
    if (walletClient.chain.id !== publicClient.chain.id) {
      throw new ChainIdMismatchError(
        "Error: Provided chain id should match the wallet client chain id"
      );
    }

    this._publicClient = publicClient;
    this._walletClient = walletClient;
    this._chainId = walletClient.chain.id;
  }

  /**
   * Fetches the modules registry and prepares the client for usage.
   *
   * @param registry - Optional registry object. If provided, then these modules will be used instead of fetching from the registry.
   */
  async prepare(registry?: Registry) {
    let registryToUse: Registry;
    if (registry !== undefined) {
      registryToUse = registry;
    } else {
      try {
        const result = await axios.get(
          "https://raw.githubusercontent.com/Hats-Protocol/modules-registry/v1/modules.json"
        );
        registryToUse = result.data;
      } catch (err) {
        throw new ModulesRegistryFetchError(
          "Error: Could not fetch modules from the registry"
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
  }

  /**
   * Create a new module instance.
   *
   * @param account - A Viem account.
   * @param moduleId - The module ID.
   * @param hatId - The hat ID for which the module is created.
   * @param immutableArgs - The module's immutable arguments.
   * @param mutableArgs - The module's mutable arguments.
   * @param saltNonce - Optional salt nonce to use. If not provided, will be randomly generated.
   * @returns An object containing the status of the call, the transaction hash and the new module instance address.
   */
  async createNewInstance({
    account,
    moduleId,
    hatId,
    immutableArgs,
    mutableArgs,
    saltNonce,
  }: {
    account: Account | Address;
    moduleId: string;
    hatId: bigint;
    immutableArgs: unknown[];
    mutableArgs: unknown[];
    saltNonce?: bigint;
  }): Promise<CreateInstanceResult> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Error: Module with id ${moduleId} does not exist`
      );
    }

    // verify hat ID
    if (!verify(hatId, "uint256")) {
      throw new InvalidParamError(`Error: Invalid hat ID parameter`);
    }

    const { encodedImmutableArgs, encodedMutableArgs } = checkAndEncodeArgs({
      module,
      immutableArgs,
      mutableArgs,
    });

    let saltNonceToUse: bigint;
    if (saltNonce !== undefined) {
      // verify salt nonce
      if (!verify(saltNonce, "uint256")) {
        throw new InvalidParamError(`Error: Invalid salt nonce parameter`);
      }
      saltNonceToUse = saltNonce;
    } else {
      saltNonceToUse = BigInt(
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      );
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_MODULES_FACTORY_ADDRESS,
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: "createHatsModule",
        account,
        args: [
          module.implementationAddress as `0x${string}`,
          hatId,
          encodedImmutableArgs,
          encodedMutableArgs,
          saltNonceToUse,
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
      throw new TransactionRevertedError("Error: Transaction reverted");
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
   * @param saltNonces - Optional salt nonces to use. If not provided, will be randomly generated.
   * @returns An object containing the status of the call, the transaction hash and the new module instances addresses.
   */
  async batchCreateNewInstances({
    account,
    moduleIds,
    hatIds,
    immutableArgsArray,
    mutableArgsArray,
    saltNonces,
  }: {
    account: Account | Address;
    moduleIds: string[];
    hatIds: bigint[];
    immutableArgsArray: unknown[][];
    mutableArgsArray: unknown[][];
    saltNonces?: bigint[];
  }): Promise<BatchCreateInstancesResult> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
      );
    }

    const implementations: Array<string> = [];
    const encodedImmutableArgsArray: Array<`0x${string}`> = [];
    const encodedMutableArgsArray: Array<`0x${string}`> = [];
    const saltNoncesToUse: Array<bigint> = [];

    for (let i = 0; i < moduleIds.length; i++) {
      const module = this.getModuleById(moduleIds[i]);
      if (module === undefined) {
        throw new ModuleNotAvailableError(
          `Error: Module with id ${moduleIds[i]} does not exist`
        );
      }

      // verify hat ID
      if (!verify(hatIds[i], "uint256")) {
        throw new InvalidParamError(`Error: Invalid hat ID parameter`);
      }

      if (saltNonces !== undefined) {
        // verify salt nonce
        if (!verify(saltNonces[i], "uint256")) {
          throw new InvalidParamError(`Error: Invalid salt nonce parameter`);
        }
        saltNoncesToUse.push(saltNonces[i]);
      } else {
        saltNoncesToUse.push(
          BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
        );
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
        address: HATS_MODULES_FACTORY_ADDRESS as `0x${string}`,
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: "batchCreateHatsModule",
        account,
        args: [
          implementations as Array<`0x${string}`>,
          hatIds,
          encodedImmutableArgsArray,
          encodedMutableArgsArray,
          saltNoncesToUse,
        ],
        chain: this._walletClient.chain,
      });

      receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });
    } catch (err) {
      console.log(err);
      throw new TransactionRevertedError("Error: Transaction reverted");
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
   * @param saltNonce - Optional salt nonce to use. If not provided, will be randomly generated.
   * @returns An object containing the status of the call, the transaction hash and the new module instance address.
   */
  async createEligibilitiesChain({
    account,
    hatId,
    numClauses,
    clausesLengths,
    modules,
    saltNonce,
  }: {
    account: Account | Address;
    hatId: bigint;
    numClauses: number;
    clausesLengths: number[];
    modules: `0x${string}`[];
    saltNonce?: bigint;
  }): Promise<CreateInstanceResult> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
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

    const mutableArgsEncoded = "0x";
    const immutableArgsEncoded = encodePacked(
      immutableArgsTypes,
      immutableArgs
    );

    let saltNonceToUse: bigint;
    if (saltNonce !== undefined) {
      // verify salt nonce
      if (!verify(saltNonce, "uint256")) {
        throw new InvalidParamError(`Error: Invalid salt nonce parameter`);
      }
      saltNonceToUse = saltNonce;
    } else {
      saltNonceToUse = BigInt(
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      );
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_MODULES_FACTORY_ADDRESS,
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: "createHatsModule",
        account,
        args: [
          HATS_ELIGIBILITIES_CHAIN_MODULE_ADDRESS[this._chainId],
          hatId,
          immutableArgsEncoded,
          mutableArgsEncoded,
          saltNonceToUse,
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
            abi: HATS_MODULES_FACTORY_ABI,
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
      throw new TransactionRevertedError("Error: Transaction reverted");
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
   * @param saltNonce - Optional salt nonce to use. If not provided, will be randomly generated.
   * @returns An object containing the status of the call, the transaction hash and the new module instance address.
   */
  async createTogglesChain({
    account,
    hatId,
    numClauses,
    clausesLengths,
    modules,
    saltNonce,
  }: {
    account: Account | Address;
    hatId: bigint;
    numClauses: number;
    clausesLengths: number[];
    modules: `0x${string}`[];
    saltNonce?: bigint;
  }): Promise<CreateInstanceResult> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
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

    const mutableArgsEncoded = "0x";
    const immutableArgsEncoded = encodePacked(
      immutableArgsTypes,
      immutableArgs
    );

    let saltNonceToUse: bigint;
    if (saltNonce !== undefined) {
      // verify salt nonce
      if (!verify(saltNonce, "uint256")) {
        throw new InvalidParamError(`Error: Invalid salt nonce parameter`);
      }
      saltNonceToUse = saltNonce;
    } else {
      saltNonceToUse = BigInt(
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      );
    }

    try {
      const hash = await this._walletClient.writeContract({
        address: HATS_MODULES_FACTORY_ADDRESS,
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: "createHatsModule",
        account,
        args: [
          HATS_TOGGLES_CHAIN_MODULE_ADDRESS[this._chainId],
          hatId,
          immutableArgsEncoded,
          mutableArgsEncoded,
          saltNonceToUse,
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
            abi: HATS_MODULES_FACTORY_ABI,
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
      throw new TransactionRevertedError("Error: Transaction reverted");
    }
  }

  /**
   * Predict a module's address.
   *
   * @param moduleId - The module ID.
   * @param hatId - The hat ID for which the module is created.
   * @param immutableArgs - The module's immutable arguments.
   * @param saltNonce - Salt nonce to use.
   * @returns The module's predicted address.
   */
  async predictHatsModuleAddress({
    moduleId,
    hatId,
    immutableArgs,
    saltNonce,
  }: {
    moduleId: string;
    hatId: bigint;
    immutableArgs: unknown[];
    saltNonce: bigint;
  }): Promise<Address> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
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
        : "0x";

    const predictedAddress: Address = (await this._publicClient.readContract({
      address: HATS_MODULES_FACTORY_ADDRESS,
      abi: HATS_MODULES_FACTORY_ABI,
      functionName: "getHatsModuleAddress",
      args: [
        module.implementationAddress as Address,
        hatId,
        immutableArgsEncoded,
        saltNonce,
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
   * @param saltNonce - Salt nonce to use.
   * @returns The module's predicted address.
   */
  async isModuleDeployed({
    moduleId,
    hatId,
    immutableArgs,
    saltNonce,
  }: {
    moduleId: string;
    hatId: bigint;
    immutableArgs: unknown[];
    saltNonce: bigint;
  }): Promise<boolean> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Error: Module with id ${moduleId} does not exist`
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
        : "0x";

    const deployed: boolean = (await this._publicClient.readContract({
      address: HATS_MODULES_FACTORY_ADDRESS,
      abi: HATS_MODULES_FACTORY_ABI,
      functionName: "deployed",
      args: [
        module.implementationAddress as Address,
        hatId,
        immutableArgsEncoded,
        saltNonce,
      ],
    })) as boolean;

    return deployed;
  }

  /**
   * Get module instance's parameters.
   * The parameters to fetch are listed in the module's registry object. If the given address is not a registry module, returns 'undefined'.
   *
   * @param instance - The module instace address.
   * @returns A list of objects, for each parameter. Each object includes the parameter's value, label, Solidity type and display type. If
   * the given address is not an instance of a registry module, then returns 'undefined'.
   */
  async getInstanceParameters(
    instance: Address
  ): Promise<ModuleParameter[] | undefined> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
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
              `Error: Failed reading function ${param.functionName} from the module instance`
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

  /*//////////////////////////////////////////////////////////////
                       Module Getters
  //////////////////////////////////////////////////////////////*/

  /**
   * Get a module by its ID.
   *
   * @param moduleId - The module ID.
   * @returns The module matching the provided ID.
   */
  getModuleById(moduleId: string): Module | undefined {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
      );
    }

    return this._modules[moduleId];
  }

  /**
   * Get a module by its implementation address.
   *
   * @param address - The implementation address.
   * @returns The module matching the provided implementation address. If no matching, returns 'undefined'.
   */
  getModuleByImplementation(address: Address): Module | undefined {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
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
   */
  async getModuleByInstance(address: Address): Promise<Module | undefined> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
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
   * Get the module objects of instances.
   *
   * @param addresses - Module Instances addresses.
   * @returns The modules matching the provided instances addresses. For every address that is not an instance of a registry module, the corresponding
   * return value in the array will be 'undefined'.
   */
  async getModulesByInstances(
    addresses: Address[]
  ): Promise<(Module | undefined)[]> {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
      );
    }

    const calls = addresses.map((address) => {
      return {
        address: address,
        abi: HATS_MODULE_ABI,
        functionName: "IMPLEMENTATION",
      };
    });

    try {
      const results = await this._publicClient.multicall({
        contracts: calls,
      });

      const modules: (Module | undefined)[] = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "failure") {
          modules.push(undefined);
          continue;
        }

        const module = this.getModuleByImplementation(
          results[i].result as Address
        );

        modules.push(module);
      }

      return modules;
    } catch (err) {
      throw new Error("Error: multicall unexpected error");
    }
  }

  /**
   * Get all the available modules.
   *
   * @returns An object which keys are module IDs and the values are the corresponding modules.
   */
  getModules(filter?: (module: Module) => boolean): { [id: string]: Module } {
    if (this._modules === undefined) {
      throw new ClientNotPreparedError(
        "Error: Client has not been initialized, requires a call to the prepare function"
      );
    }

    if (filter !== undefined) {
      return Object.fromEntries(
        Object.entries(this._modules).filter(([, module]) => {
          return filter(module);
        })
      );
    }

    return this._modules;
  }

  /*//////////////////////////////////////////////////////////////
                    Module Write Functions
  //////////////////////////////////////////////////////////////*/

  /**
   * Call a module's instance write function.
   *
   * @param account - A Viem account.
   * @param moduleId - Module's ID.
   * @param instance - Module instance.
   * @param func - Function to call.
   * @param args - Function's input arguments.
   * @returns An object containing the status of the call and the transaction hash.
   */
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
        "Error: Client has not been initialized, requires a call to the prepare function"
      );
    }

    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Error: Module with id ${moduleId} does not exist`
      );
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
      getModuleFunctionError(err, moduleId);
    }
  }
}
