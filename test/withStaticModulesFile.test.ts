import { HatsModulesClient, solidityToTypescriptType } from "../src/index";
import { createPublicClient, createWalletClient, http } from "viem";
import { goerli } from "viem/chains";
import { createAnvil } from "@viem/anvil";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import type {
  PublicClient,
  WalletClient,
  PrivateKeyAccount,
  Address,
} from "viem";
import type { Anvil } from "@viem/anvil";
import type { Module, Registry } from "../src/types";
import "dotenv/config";

describe("Client Tests With a Static Modules File", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.GOERLI_RPC,
      startTimeout: 20000,
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

    const modulesFile = new URL("modules.json", import.meta.url);
    const data = fs.readFileSync(modulesFile, "utf-8");
    const registryModules: Registry = JSON.parse(data);

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
      registryToken: process.env.GITHUB_TOKEN as string,
    });

    await hatsModulesClient.prepare(registryModules);
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test create new jokerace instance", async () => {
    const jokeraceId =
      "0xf0f5628b66bb62ee20d3af78e2f3fdc776778c19f31a156dc9da25e0f2024838";
    const module = hatsModulesClient.getModuleById(jokeraceId) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.creationArgs.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.immutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.immutable[i].type
      );
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.creationArgs.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.mutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.mutable[i].type
      );
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
  }, 10000);

  test("Test get jokerace functions names", () => {
    const jokeraceId =
      "0xf0f5628b66bb62ee20d3af78e2f3fdc776778c19f31a156dc9da25e0f2024838";
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
    const stakingId =
      "0xf6097eef343ddc8abecc76eb95131a0404c071b6622003c9619e08df9e7b9e4a";
    const module = hatsModulesClient.getModuleById(stakingId) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.creationArgs.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.immutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.immutable[i].type
      );
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.creationArgs.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.mutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.mutable[i].type
      );
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
    const erc20Id =
      "0x20c63b02c721d706826d9cb051c1f3d900a4e34437c0ea2f0bf5e77a54dbe605";
    const module = hatsModulesClient.getModuleById(erc20Id) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.creationArgs.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.immutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.immutable[i].type
      );
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.creationArgs.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.mutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.mutable[i].type
      );
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
      functionName: "ERC20_TOKEN_ADDRESS",
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
      "0xdc8eca16b384dac049617719134fce02cc5a8ef5e767d03c2124f95782ee1369";
    const module = hatsModulesClient.getModuleById(erc721Id) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];

    for (let i = 0; i < module.creationArgs.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.immutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.immutable[i].type
      );
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.creationArgs.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.mutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.mutable[i].type
      );
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
      functionName: "ERC721_TOKEN_ADDRESS",
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
      "0x7e585bcd45d8a5436d13a61ac27f2b759155ef1057c7f80763356797506aea8b";
    const module = hatsModulesClient.getModuleById(erc1155Id) as Module;

    const hatId = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const immutableArgs: unknown[] = [];
    const mutableArgs: unknown[] = [];
    for (let i = 0; i < module.creationArgs.immutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.immutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.immutable[i].type
      );
      if (tsType === "bigint") {
        arg = BigInt(exampleArg as string);
      } else if (tsType === "bigint[]") {
        arg = (exampleArg as Array<string>).map((val) => BigInt(val));
      } else {
        arg = exampleArg;
      }

      immutableArgs.push(arg);
    }

    for (let i = 0; i < module.creationArgs.mutable.length; i++) {
      let arg: unknown;
      const exampleArg = module.creationArgs.mutable[i].example;
      const tsType = solidityToTypescriptType(
        module.creationArgs.mutable[i].type
      );
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
      "0xe755ba756e0617e672bebe30a0d39dcfb7d0d0c2aac2144fd67a660cc7e344e1";
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

  test("Test get module by implementation", async () => {
    const claimsHatterId =
      "0xe755ba756e0617e672bebe30a0d39dcfb7d0d0c2aac2144fd67a660cc7e344e1";
    const claimsHatterModule = hatsModulesClient.getModuleById(
      claimsHatterId
    ) as Module;

    expect(
      hatsModulesClient.getModuleByImplementaion(
        "0xC00236108E64A29Cca05aCf4c37ba21eaE348De1"
      )
    ).toEqual(claimsHatterModule);
  });
});
