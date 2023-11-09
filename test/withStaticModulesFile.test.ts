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
      "0xe3e2b163f6c73b6fb7088cf423d8df8a6e53e3593bce3cf46af38568cf245323";
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
      "0xe3e2b163f6c73b6fb7088cf423d8df8a6e53e3593bce3cf46af38568cf245323";
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
      "0x33d53892ca1e344814cea8062e3985d945f1e1a1999519cdb2fe38530ee0b59b";
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
      "0xdf3b1fc065bdc76f163c2b612f1763fd6ffd0dd15040d414ee8cda17cd437735";
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
      "0xdf16f18da1351629f5be196578c9e17e35bdb0fd9dfe8d4cefbba80cd2bcede6";
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
      "0xd8273e662c11dfb6a02797962c5c876e831efd4286d8a2098dfc7e4c9f1fcc0e";
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

  test("Test get module by implementation", async () => {
    const claimsHatterId =
      "0x667d7a33b3ac22a0c6ea1dbb65d4f14eb5163ae6573a3a2d6c6f4edffeb3d1fa";
    const claimsHatterModule = hatsModulesClient.getModuleById(
      claimsHatterId
    ) as Module;

    expect(
      hatsModulesClient.getModuleByImplementation(
        "0xB985eA1be961f7c4A4C45504444C02c88c4fdEF9"
      )
    ).toEqual(claimsHatterModule);
  });
});
