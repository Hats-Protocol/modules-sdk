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
} from "../errors";
//import {
//  eligibilityModules,
//  eligibilityFactory,
//} from "@hatsprotocol/modules-registry";
import { verify } from "../schemas";
import type {
  CreateInstanceResult,
  SupportedChain,
  //CreateInstanceArg,
} from "../types";
import * as fs from "fs";
//import type { EligibilityModule } from "@hatsprotocol/modules-registry";
import type { Account, Address } from "viem";
import type { Module, Factory } from "../types";

export class EligibilityClient {
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
  }

  async prepare() {
    if (this._modules !== undefined) {
      throw new Error();
    }

    const modulesFile = new URL("modules.json", import.meta.url);
    const data = fs.readFileSync(modulesFile, "utf-8");
    const modules: Module[] = JSON.parse(data);

    this._modules = {};
    for (let moduleIndex = 1; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex];
      let moduleSupportedInChian = false;
      module.deployments.forEach((deployment) => {
        if (deployment.chainId === this._chainId.toString()) {
          moduleSupportedInChian = true;
        }
      });

      if (moduleSupportedInChian) {
        const moduleId: string = keccak256(
          stringToBytes(JSON.stringify(module))
        );

        if (this._modules !== undefined) {
          this._modules[moduleId] = module;
        }
      }
    }

    this._factory = modules[0];

    //console.log(JSON.stringify(modulesInfo, null, 2));
    //console.log(typeof modulesInfo);
    //console.log("number of modules:", modulesInfo.length);
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
    if (this._modules !== undefined && this._factory !== undefined) {
      const module = this.getModuleById(moduleId);
      if (module === undefined) {
        throw new ModuleNotAvailableError(
          `Module with id ${moduleId} does not exist`
        );
      }

      if (!verify(hatId, "uint256")) {
        throw new InvalidParamError(`Invalid hat ID parameter`);
      }

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
        for (
          let eventIndex = 0;
          eventIndex < receipt.logs.length;
          eventIndex++
        ) {
          try {
            const event: any = decodeEventLog({
              abi: this._factory.abi,
              eventName: "HatsModuleFactory_ModuleDeployed",
              data: receipt.logs[0].data,
              topics: receipt.logs[0].topics,
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
    } else {
      throw new Error();
    }
  }

  //verifyParameter()

  getModuleById(moduleId: string): Module | undefined {
    if (this._modules !== undefined) {
      return this._modules[moduleId];
    }
  }

  getAllModules(): { [id: string]: Module } | undefined {
    if (this._modules !== undefined) {
      return this._modules;
    }
  }
}
