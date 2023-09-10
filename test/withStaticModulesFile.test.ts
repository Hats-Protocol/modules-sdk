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
import type { Module, Registry, ModuleParameter } from "../src/types";
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
    });

    await hatsModulesClient.prepare(registryModules);
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test create new jokerace instance and get instace parameters", async () => {
    const jokeraceId =
      "0x7361672a53d246afa75a76b693df21e4592940570a9c934f9cb8afa161c01163";
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

    // Test getting instance parameters
    const instanceParams = (await hatsModulesClient.getInstanceParameters(
      res.newInstance
    )) as ModuleParameter[];

    expect(instanceParams).not.toBe(undefined);
    expect(instanceParams[0].value).toBe(adminHatResult);
    expect(instanceParams[0].solidityType).toBe("uint256");
    expect(instanceParams[1].value).toBe(underlyingContestResult);
    expect(instanceParams[1].solidityType).toBe("address");
    expect(instanceParams[2].value).toBe(termEndResult);
    expect(instanceParams[2].solidityType).toBe("uint256");
    expect(instanceParams[3].value).toBe(topKResult);
    expect(instanceParams[3].solidityType).toBe("uint256");
  }, 10000);

  test("Test get jokerace functions names", () => {
    const jokeraceId =
      "0x7361672a53d246afa75a76b693df21e4592940570a9c934f9cb8afa161c01163";
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

  test("Test create new staking instance and get instace parameters", async () => {
    const stakingId =
      "0xf650f73dbb6f081bd193e142f14ec43f4ffbd4e1e0c4a7e1af09dff5cd46f01e";
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

    // Test getting instance parameters
    const instanceParams = (await hatsModulesClient.getInstanceParameters(
      res.newInstance
    )) as ModuleParameter[];

    expect(instanceParams).not.toBe(undefined);
    expect(instanceParams[0].value).toBe(tokenResult);
    expect(instanceParams[0].solidityType).toBe("address");
    expect(instanceParams[1].value).toBe(minStakeResult);
    expect(instanceParams[1].solidityType).toBe("uint248");
    expect(instanceParams[2].value).toBe(judgeHatResult);
    expect(instanceParams[2].solidityType).toBe("uint256");
    expect(instanceParams[3].value).toBe(recipientHatResult);
    expect(instanceParams[3].solidityType).toBe("uint256");
  });

  test("Test create new erc20 eligibility instance and get instance parameters", async () => {
    const erc20Id =
      "0x7b22c54dd5310e6a320ceef6b50e11a78248b357ac9b59b863b85be404cb0b00";
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

    // Test getting instance parameters
    const instanceParams = (await hatsModulesClient.getInstanceParameters(
      res.newInstance
    )) as ModuleParameter[];

    expect(instanceParams).not.toBe(undefined);
    expect(instanceParams[0].value).toBe(tokenResult);
    expect(instanceParams[0].solidityType).toBe("address");
    expect(instanceParams[1].value).toBe(minBalanceResult);
    expect(instanceParams[1].solidityType).toBe("uint256");
  });

  test("Test create new erc721 eligibility instance and get instance parameters", async () => {
    const erc721Id =
      "0x397bfaa15ce406221434fa4f46402f4c070952b1054a9f974aac99e2371ae96d";
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

    // Test getting instance parameters
    const instanceParams = (await hatsModulesClient.getInstanceParameters(
      res.newInstance
    )) as ModuleParameter[];

    expect(instanceParams).not.toBe(undefined);
    expect(instanceParams[0].value).toBe(tokenResult);
    expect(instanceParams[0].solidityType).toBe("address");
    expect(instanceParams[1].value).toBe(minBalanceResult);
    expect(instanceParams[1].solidityType).toBe("uint256");
  });

  test("Test create new erc1155 eligibility instance and get instance parameters", async () => {
    const erc1155Id =
      "0x85385cde46786f5665f0f9a6f5b539629fe54f152bbf6eef64c431749fda4a77";
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

    // Test getting instance parameters
    const instanceParams = (await hatsModulesClient.getInstanceParameters(
      res.newInstance
    )) as ModuleParameter[];

    expect(instanceParams).not.toBe(undefined);
    expect(instanceParams[0].value).toBe(tokenResult);
    expect(instanceParams[0].solidityType).toBe("address");
    expect(instanceParams[1].value).toEqual(tokenIdsResult);
    expect(instanceParams[1].solidityType).toBe("uint256[]");
    expect(instanceParams[2].value).toEqual(minBalancesResult);
    expect(instanceParams[2].solidityType).toBe("uint256[]");
  });

  test("Test create new claims hatter instance", async () => {
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
