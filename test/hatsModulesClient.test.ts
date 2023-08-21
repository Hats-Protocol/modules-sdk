import { HatsModulesClient, solidityToTypescriptType } from "../src/index";
import { createPublicClient, createWalletClient, http } from "viem";
import { goerli } from "viem/chains";
import { createAnvil } from "@viem/anvil";
import { privateKeyToAccount } from "viem/accounts";
import type {
  PublicClient,
  WalletClient,
  PrivateKeyAccount,
  Address,
} from "viem";
import type { Anvil } from "@viem/anvil";
import type { Module } from "../src/types";
import "dotenv/config";

describe("Eligibility Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.GOERLI_RPC,
    });
    await anvil.start();

    deployerAccount = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );

    // init Viem clients
    publicClient = createPublicClient({
      chain: goerli,
      transport: http("http://127.0.0.1:8545"),
    });
    walletClient = createWalletClient({
      chain: goerli,
      transport: http("http://127.0.0.1:8545"),
    });

    // init jokerace eligibility and hats clients
    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
      chainId: "5",
    });

    await hatsModulesClient.prepare();
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test create new jokerace instance", async () => {
    const jokeraceId =
      "0xa3adb9634f813822f254bdfcecc48836b644a45f585121894409ac5eb01c67fc";
    const module = hatsModulesClient.getModuleById(jokeraceId) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.args.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.immutable[i].example;
      const tsType = solidityToTypescriptType(module.args.immutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.args.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.mutable[i].example;
      const tsType = solidityToTypescriptType(module.args.mutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      mutableArgs.push(arg);
    }

    const res = await hatsModulesClient.createNewInstance({
      account: deployerAccount,
      moduleId: jokeraceId,
      hatId: hatId,
      immutableArgs: immutableArgs,
      mutableArgs: mutableArgs,
    });

    const hatIdResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "hatId",
      args: [],
    });

    const adminHatResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "ADMIN_HAT",
      args: [],
    });

    const underlyingContestResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "underlyingContest",
      args: [],
    });

    const termEndResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "termEnd",
      args: [],
    });

    const topKResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "topK",
      args: [],
    });

    expect(hatIdResult).toBe(hatId);
    expect(adminHatResult).toBe(immutableArgs[0]);
    expect(underlyingContestResult).toBe(mutableArgs[0]);
    expect(termEndResult).toBe(mutableArgs[1]);
    expect(topKResult).toBe(mutableArgs[2]);
  });

  test("Test get jokerace functions names", () => {
    const jokeraceId =
      "0xa3adb9634f813822f254bdfcecc48836b644a45f585121894409ac5eb01c67fc";
    const functions = hatsModulesClient.getFunctionsInModule(jokeraceId);
    const expectedFunctions = [
      {
        name: "ADMIN_HAT",
        type: "read",
        inputs: [],
      },
      {
        name: "eligibleWearersPerContest",
        type: "read",
        inputs: [
          {
            name: "wearer",
            type: "address",
          },
          {
            name: "contest",
            type: "address",
          },
        ],
      },
      {
        name: "getWearerStatus",
        type: "read",
        inputs: [
          {
            name: "_wearer",
            type: "address",
          },
          {
            name: "",
            type: "uint256",
          },
        ],
      },
      {
        name: "hatId",
        type: "read",
        inputs: [],
      },
      {
        name: "pullElectionResults",
        type: "write",
        inputs: [],
      },
      {
        name: "reelection",
        type: "write",
        inputs: [
          {
            name: "newUnderlyingContest",
            type: "address",
          },
          {
            name: "newTermEnd",
            type: "uint256",
          },
          {
            name: "newTopK",
            type: "uint256",
          },
        ],
      },
      {
        name: "reelectionAllowed",
        type: "read",
        inputs: [],
      },
      {
        name: "termEnd",
        type: "read",
        inputs: [],
      },
      {
        name: "topK",
        type: "read",
        inputs: [],
      },
      {
        name: "underlyingContest",
        type: "read",
        inputs: [],
      },
    ];
    expect(functions).toEqual(expectedFunctions);
  });

  test("Test create new staking instance", async () => {
    //const modules = hatsModulesClient.getAllModules();
    //console.log(Object.keys(modules));

    const stakingId =
      "0x62c11f54dfa48ad24d8b40532ade2d3e72648e9c6c37a7a679f24268be8b155d";
    const module = hatsModulesClient.getModuleById(stakingId) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.args.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.immutable[i].example;
      const tsType = solidityToTypescriptType(module.args.immutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.args.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.mutable[i].example;
      const tsType = solidityToTypescriptType(module.args.mutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      mutableArgs.push(arg);
    }

    const res = await hatsModulesClient.createNewInstance({
      account: deployerAccount,
      moduleId: stakingId,
      hatId: hatId,
      immutableArgs: immutableArgs,
      mutableArgs: mutableArgs,
    });

    const hatIdResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "TOKEN",
      args: [],
    });

    const minStakeResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "minStake",
      args: [],
    });

    const judgeHatResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "judgeHat",
      args: [],
    });

    const recipientHatResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "recipientHat",
      args: [],
    });
    const cooldownPeriodResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "cooldownPeriod",
      args: [],
    });

    expect(hatIdResult).toBe(hatId);
    expect(tokenResult).toBe(immutableArgs[0]);
    expect(minStakeResult).toBe(mutableArgs[0]);
    expect(judgeHatResult).toBe(mutableArgs[1]);
    expect(recipientHatResult).toBe(mutableArgs[2]);
    expect(cooldownPeriodResult).toBe(mutableArgs[3]);
  });

  test("Test create new erc20 eligibility instance", async () => {
    //const modules = hatsModulesClient.getAllModules();
    //console.log(Object.keys(modules));

    const erc20Id =
      "0x61ed5dcdd400854c4032ebbe1ba8a9ee43a937588ad95ccbcd4e538155fe7e3a";
    const module = hatsModulesClient.getModuleById(erc20Id) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.args.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.immutable[i].example;
      const tsType = solidityToTypescriptType(module.args.immutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.args.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.mutable[i].example;
      const tsType = solidityToTypescriptType(module.args.mutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      mutableArgs.push(arg);
    }

    const res = await hatsModulesClient.createNewInstance({
      account: deployerAccount,
      moduleId: erc20Id,
      hatId: hatId,
      immutableArgs: immutableArgs,
      mutableArgs: mutableArgs,
    });

    const hatIdResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "TOKEN_ADDRESS",
      args: [],
    });

    const minBalanceResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "MIN_BALANCE",
      args: [],
    });

    expect(hatIdResult).toBe(hatId);
    expect(tokenResult).toBe(immutableArgs[0]);
    expect(minBalanceResult).toBe(immutableArgs[1]);
  });

  test("Test create new erc721 eligibility instance", async () => {
    const erc721Id =
      "0x40a3e1da005ca0bb15c678de0508683e516f7f39e6519be6fbb01f4e6d238c91";
    const module = hatsModulesClient.getModuleById(erc721Id) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.args.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.immutable[i].example;
      const tsType = solidityToTypescriptType(module.args.immutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.args.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.mutable[i].example;
      const tsType = solidityToTypescriptType(module.args.mutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      mutableArgs.push(arg);
    }

    const res = await hatsModulesClient.createNewInstance({
      account: deployerAccount,
      moduleId: erc721Id,
      hatId: hatId,
      immutableArgs: immutableArgs,
      mutableArgs: mutableArgs,
    });

    const hatIdResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "TOKEN_ADDRESS",
      args: [],
    });

    const minBalanceResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "MIN_BALANCE",
      args: [],
    });

    expect(hatIdResult).toBe(hatId);
    expect(tokenResult).toBe(immutableArgs[0]);
    expect(minBalanceResult).toBe(immutableArgs[1]);
  });

  test("Test create new erc1155 eligibility instance", async () => {
    const erc1155Id =
      "0x6ba54170154b15251037f4fdb42249717419d1845715dc3f619123fbad0d3d7e";
    const module = hatsModulesClient.getModuleById(erc1155Id) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];
    for (let i = 0; i < module.args.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.immutable[i].example;
      const tsType = solidityToTypescriptType(module.args.immutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else if (tsType === "bigint[]") {
        arg = (exampleArg as Array<string>).map((val) => BigInt(val));
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.args.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.args.mutable[i].example;
      const tsType = solidityToTypescriptType(module.args.mutable[i].type);
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      mutableArgs.push(arg);
    }

    const res = await hatsModulesClient.createNewInstance({
      account: deployerAccount,
      moduleId: erc1155Id,
      hatId: hatId,
      immutableArgs: immutableArgs,
      mutableArgs: mutableArgs,
    });

    const hatIdResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "hatId",
      args: [],
    });

    const tokenResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "TOKEN_ADDRESS",
      args: [],
    });

    const arrayLengthResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "ARRAY_LENGTH",
      args: [],
    });

    const tokenIdsResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "TOKEN_IDS",
      args: [],
    });

    const minBalancesResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "MIN_BALANCES",
      args: [],
    });

    expect(hatIdResult).toBe(hatId);
    expect(tokenResult).toBe(immutableArgs[0]);
    expect(arrayLengthResult).toBe(immutableArgs[1]);
    expect(tokenIdsResult).toEqual(immutableArgs[2]);
    expect(minBalancesResult).toEqual(immutableArgs[3]);
  });

  test("Test create new claims hatter instance", async () => {
    //const modules = hatsModulesClient.getAllModules();
    //console.log(Object.keys(modules));

    const claimsHatterId =
      "0x65d08c510207af375cce45e411803a12a4da2c49459061d584fd5b33e9089b43";
    const module = hatsModulesClient.getModuleById(claimsHatterId) as Module;
    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    const res = await hatsModulesClient.createNewInstance({
      account: deployerAccount,
      moduleId: claimsHatterId,
      hatId: hatId,
      immutableArgs: immutableArgs,
      mutableArgs: mutableArgs,
    });

    const hatIdResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: module.abi,
      functionName: "hatId",
      args: [],
    });

    expect(hatIdResult).toBe(hatId);
  });
});
