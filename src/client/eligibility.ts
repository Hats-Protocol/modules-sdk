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
} from "../errors";
import {
  eligibilityModules,
  eligibilityFactory,
} from "@hatsprotocol/modules-registry";
//import { verify } from "../schemas";
import type {
  CreateInstanceResult,
  SupportedChain,
  //CreateInstanceArg,
} from "../types";
import type { EligibilityModule } from "@hatsprotocol/modules-registry";
import type { Account, Address } from "viem";

export class EligibilityClient {
  private readonly _publicClient: PublicClient;
  private readonly _walletClient: WalletClient;
  private readonly _chainId: SupportedChain;
  private readonly _modules: { [key: string]: EligibilityModule };

  constructor({
    publicClient,
    walletClient,
    chainId,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
    chainId: "5" | "1";
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
    this._modules = {};

    eligibilityModules.forEach((module) => {
      if (this._chainId.toString() in module.moduleInfo.deployments) {
        const moduleId: string = keccak256(
          stringToBytes(JSON.stringify(module))
        );
        this._modules[moduleId] = module;
      }
    });
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
    const module = this.getModuleById(moduleId);
    if (module === undefined) {
      throw new ModuleNotAvailableError(
        `Module with id ${moduleId} does not exist`
      );
    }

    const mutableArgsTypes = module.moduleInfo.args.mutable.map((arg) => {
      return { type: arg.type };
    });
    const immutableArgsTypes = module.moduleInfo.args.immutable.map((arg) => {
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
        address: eligibilityFactory.factoryInfo.deployments[this._chainId]
          .address as `0x${string}`,
        abi: eligibilityFactory.factoryAbi,
        functionName: "createHatsModule",
        account,
        args: [
          module.moduleInfo.deployments[this._chainId].address as `0x${string}`,
          hatId,
          immutableArgsEncoded,
          mutableArgsEncoded,
        ],
        chain: this._walletClient.chain,
      });

      const receipt = await this._publicClient.waitForTransactionReceipt({
        hash,
      });

      const event = decodeEventLog({
        abi: eligibilityFactory.factoryAbi,
        eventName: "HatsModuleFactory_ModuleDeployed",
        data: receipt.logs[0].data,
        topics: receipt.logs[0].topics,
      });

      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        newInstance: event.args.instance,
      };
    } catch (err) {
      console.log(err);
      throw new TransactionRevertedError("Transaction reverted");
    }
  }

  getModuleById(moduleId: string): EligibilityModule | undefined {
    return this._modules[moduleId];
  }

  getAllModules(): { [id: string]: EligibilityModule } {
    return this._modules;
  }
}
