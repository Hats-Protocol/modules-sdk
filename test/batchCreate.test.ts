import "dotenv/config";

import type { Anvil } from "@viem/anvil";
import { createAnvil } from "@viem/anvil";
import { Abi } from "abitype";
import * as fs from "fs";
import type { Address, PrivateKeyAccount, PublicClient, WalletClient } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { HatsModulesClient } from "../src/index";
import type { Module, Registry } from "../src/types";
import { prepareArgs } from "./utils";

const HAT_ID = "0x0000000100000000000000000000000000000000000000000000000000000000";
// const JOKERACE_MODULE_ID = "0x0Bb0a2B9bc5Da206fead8e87D7Cbc6fCBa455320"; // jokerace v0.3.0
const STAKING_MODULE_ID = "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7"; // staking v0.1.0
const ERC20_MODULE_ID = "0xbA5b218e6685D0607139c06f81442681a32a0EC3"; // erc20 v0.1.0
const ERC721_MODULE_ID = "0xF37cf12fB4493D29270806e826fDDf50dd722bab"; // erc721 v0.1.0
const ERC1155_MODULE_ID = "0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17"; // erc1155 v0.1.0

describe("Batch Create Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;
  // let timestamp: bigint;

  // let jokeraceInstance: Address;
  let stakingInstance: Address;
  let erc20Instance: Address;
  let erc721Instance: Address;
  let erc1155Instance: Address;

  // let jokeraceAbi: Abi;
  let stakingAbi: Abi;
  let erc20Abi: Abi;
  let erc721Abi: Abi;
  let erc1155Abi: Abi;

  let modules: { [key: string]: { mod: Module; immutable: unknown[]; mutable: unknown[] } };

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.SEPOLIA_RPC,
      startTimeout: 20000,
    });
    await anvil.start();

    deployerAccount = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

    // init Viem clients
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });
    walletClient = createWalletClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });

    // const block = await publicClient.getBlock();
    // timestamp = block.timestamp;

    const modulesFile = new URL("modules.json", import.meta.url);
    const data = fs.readFileSync(modulesFile, "utf-8");
    const registryModules: Registry = JSON.parse(data);

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });

    await hatsModulesClient.prepare(registryModules);

    // const jokeraceModule = hatsModulesClient.getModuleByImplementation(JOKERACE_MODULE_ID) as Module;
    const stakingModule = hatsModulesClient.getModuleByImplementation(STAKING_MODULE_ID) as Module;
    const erc20Module = hatsModulesClient.getModuleByImplementation(ERC20_MODULE_ID) as Module;
    const erc721Module = hatsModulesClient.getModuleByImplementation(ERC721_MODULE_ID) as Module;
    const erc1155Module = hatsModulesClient.getModuleByImplementation(ERC1155_MODULE_ID) as Module;

    // jokeraceAbi = jokeraceModule.abi;
    stakingAbi = stakingModule.abi;
    erc20Abi = erc20Module.abi;
    erc721Abi = erc721Module.abi;
    erc1155Abi = erc1155Module.abi;

    modules = {
      [ERC20_MODULE_ID]: {
        mod: erc20Module,
        immutable: prepareArgs({ args: erc20Module.creationArgs.immutable }),
        mutable: prepareArgs({ args: erc20Module.creationArgs.mutable }),
      },
      [ERC721_MODULE_ID]: {
        mod: erc721Module,
        immutable: prepareArgs({ args: erc721Module.creationArgs.immutable }),
        mutable: prepareArgs({ args: erc721Module.creationArgs.mutable }),
      },
      [ERC1155_MODULE_ID]: {
        mod: erc1155Module,
        immutable: prepareArgs({ args: erc1155Module.creationArgs.immutable }),
        mutable: prepareArgs({ args: erc1155Module.creationArgs.mutable }),
      },
      [STAKING_MODULE_ID]: {
        mod: stakingModule,
        immutable: prepareArgs({ args: stakingModule.creationArgs.immutable }),
        mutable: prepareArgs({ args: stakingModule.creationArgs.mutable }),
      },
      // [JOKERACE_MODULE_ID]: {
      //   mod: jokeraceModule,
      //   immutable: prepareArgs({ args: jokeraceModule.creationArgs.immutable }),
      //   mutable: prepareArgs({ args: jokeraceModule.creationArgs.mutable }),
      // },
    };
    const hatIds: bigint[] = Array(Object.keys(modules).length).fill(BigInt(HAT_ID));

    const res = await hatsModulesClient.batchCreateNewInstances({
      account: deployerAccount,
      moduleIds: Object.keys(modules),
      hatIds,
      immutableArgsArray: Object.keys(modules).map((m) => modules[m].immutable),
      mutableArgsArray: Object.keys(modules).map((m) => modules[m].mutable),
    });

    [erc20Instance, erc721Instance, erc1155Instance, stakingInstance] = res.newInstances;
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  // test("Test jokerace instance", async () => {
  //   const hatIdResult = await publicClient.readContract({
  //     address: jokeraceInstance,
  //     abi: jokeraceAbi,
  //     functionName: "hatId",
  //     args: [],
  //   });

  //   const adminHatResult = await publicClient.readContract({
  //     address: jokeraceInstance,
  //     abi: jokeraceAbi,
  //     functionName: "ADMIN_HAT",
  //     args: [],
  //   });

  //   const underlyingContestResult = await publicClient.readContract({
  //     address: jokeraceInstance,
  //     abi: jokeraceAbi,
  //     functionName: "underlyingContest",
  //     args: [],
  //   });

  //   const termEndResult = await publicClient.readContract({
  //     address: jokeraceInstance,
  //     abi: jokeraceAbi,
  //     functionName: "termEnd",
  //     args: [],
  //   });

  //   const topKResult = await publicClient.readContract({
  //     address: jokeraceInstance,
  //     abi: jokeraceAbi,
  //     functionName: "topK",
  //     args: [],
  //   });

  //   expect(hatIdResult).toBe(BigInt("0x0000000100000000000000000000000000000000000000000000000000000000"));
  //   expect(adminHatResult).toBe(modules[JOKERACE_MODULE_ID].immutable[0]);
  //   expect(underlyingContestResult).toBe(modules[JOKERACE_MODULE_ID].mutable[0]);
  //   expect(termEndResult).toBe(modules[JOKERACE_MODULE_ID].mutable[1]);
  //   expect(topKResult).toBe(modules[JOKERACE_MODULE_ID].mutable[2]);
  // });

  test("Test staking instance", async () => {
    const hatIdResult = await publicClient.readContract({
      address: stakingInstance,
      abi: stakingAbi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: stakingInstance,
      abi: stakingAbi,
      functionName: "TOKEN",
      args: [],
    });

    const minStakeResult = await publicClient.readContract({
      address: stakingInstance,
      abi: stakingAbi,
      functionName: "minStake",
      args: [],
    });

    const judgeHatResult = await publicClient.readContract({
      address: stakingInstance,
      abi: stakingAbi,
      functionName: "judgeHat",
      args: [],
    });

    const recipientHatResult = await publicClient.readContract({
      address: stakingInstance,
      abi: stakingAbi,
      functionName: "recipientHat",
      args: [],
    });
    const cooldownPeriodResult = await publicClient.readContract({
      address: stakingInstance,
      abi: stakingAbi,
      functionName: "cooldownPeriod",
      args: [],
    });

    expect(hatIdResult).toBe(BigInt(HAT_ID));
    expect(tokenResult).toBe(modules[STAKING_MODULE_ID].immutable[0]);
    expect(minStakeResult).toBe(modules[STAKING_MODULE_ID].mutable[0]);
    expect(judgeHatResult).toBe(modules[STAKING_MODULE_ID].mutable[1]);
    expect(recipientHatResult).toBe(modules[STAKING_MODULE_ID].mutable[2]);
    expect(cooldownPeriodResult).toBe(modules[STAKING_MODULE_ID].mutable[3]);
  });

  test("Test erc20 instance", async () => {
    const hatIdResult = await publicClient.readContract({
      address: erc20Instance,
      abi: erc20Abi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: erc20Instance,
      abi: erc20Abi,
      functionName: "ERC20_TOKEN_ADDRESS",
      args: [],
    });

    const minBalanceResult = await publicClient.readContract({
      address: erc20Instance,
      abi: erc20Abi,
      functionName: "MIN_BALANCE",
      args: [],
    });

    expect(hatIdResult).toBe(BigInt("0x0000000100000000000000000000000000000000000000000000000000000000"));
    expect(tokenResult).toBe(modules[ERC20_MODULE_ID].immutable[0]);
    expect(minBalanceResult).toBe(modules[ERC20_MODULE_ID].immutable[1]);
  });

  test("Test erc721 instance", async () => {
    const hatIdResult = await publicClient.readContract({
      address: erc721Instance,
      abi: erc721Abi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: erc721Instance,
      abi: erc721Abi,
      functionName: "ERC721_TOKEN_ADDRESS",
      args: [],
    });

    const minBalanceResult = await publicClient.readContract({
      address: erc721Instance,
      abi: erc721Abi,
      functionName: "MIN_BALANCE",
      args: [],
    });

    expect(hatIdResult).toBe(BigInt("0x0000000100000000000000000000000000000000000000000000000000000000"));
    expect(tokenResult).toBe(modules[ERC721_MODULE_ID].immutable[0]);
    expect(minBalanceResult).toBe(modules[ERC721_MODULE_ID].immutable[1]);
  });

  test("Test erc1155 instance", async () => {
    const hatIdResult = await publicClient.readContract({
      address: erc1155Instance,
      abi: erc1155Abi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: erc1155Instance,
      abi: erc1155Abi,
      functionName: "TOKEN_ADDRESS",
      args: [],
    });

    const arrayLengthResult = await publicClient.readContract({
      address: erc1155Instance,
      abi: erc1155Abi,
      functionName: "ARRAY_LENGTH",
      args: [],
    });

    const tokenIdsResult = await publicClient.readContract({
      address: erc1155Instance,
      abi: erc1155Abi,
      functionName: "TOKEN_IDS",
      args: [],
    });

    const minBalancesResult = await publicClient.readContract({
      address: erc1155Instance,
      abi: erc1155Abi,
      functionName: "MIN_BALANCES",
      args: [],
    });

    expect(hatIdResult).toBe(BigInt("0x0000000100000000000000000000000000000000000000000000000000000000"));
    expect(tokenResult).toBe(modules[ERC1155_MODULE_ID].immutable[0]);
    expect(arrayLengthResult).toBe(modules[ERC1155_MODULE_ID].immutable[1]);
    expect(tokenIdsResult).toEqual(modules[ERC1155_MODULE_ID].immutable[2]);
    expect(minBalancesResult).toEqual(modules[ERC1155_MODULE_ID].immutable[3]);
  });
});
