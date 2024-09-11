import { HatsModulesClient, solidityToTypescriptType } from "../src/index";
import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
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
  let registryModules: Registry;

  let erc20EligibilityInstance: Address;
  let erc721EligibilityInstance: Address;
  let erc1155EligibilityInstance: Address;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.SEPOLIA_RPC,
      startTimeout: 20000,
    });
    await anvil.start();

    deployerAccount = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );

    // init Viem clients
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });
    walletClient = createWalletClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });

    const modulesFile = new URL("modules.json", import.meta.url);
    const data = fs.readFileSync(modulesFile, "utf-8");
    registryModules = JSON.parse(data);

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });

    await hatsModulesClient.prepare(registryModules);
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test get all active module", () => {
    const filter = (module: Module) => {
      for (let tagIndex = 0; tagIndex < module.tags.length; tagIndex++) {
        const tag = module.tags[tagIndex];
        if (tag.value === "deprecated") {
          return false;
        }
      }
      return true;
    };
    const activeModules = hatsModulesClient.getModules(filter);
    const allModules = hatsModulesClient.getModules();

    for (const [id, module] of Object.entries(allModules)) {
      let deprecated = false;
      for (let tagIndex = 0; tagIndex < module.tags.length; tagIndex++) {
        const tag = module.tags[tagIndex];
        if (tag.value === "deprecated") {
          deprecated = true;
        }
      }

      if (deprecated) {
        expect(activeModules[id]).toBe(undefined);
      } else {
        expect(activeModules[id]).toStrictEqual(allModules[id]);
      }
    }
  });

  test("Test get only meta modules", () => {
    const filter = (module: Module) => {
      for (let tagIndex = 0; tagIndex < module.tags.length; tagIndex++) {
        const tag = module.tags[tagIndex];
        if (tag.value === "meta") {
          return true;
        }
      }
      return false;
    };

    const metaModules = hatsModulesClient.getModules(filter);

    let metaModulesCount = 0;
    for (const [, module] of Object.entries(metaModules)) {
      metaModulesCount += 1;
      let isMeta = false;
      for (let tagIndex = 0; tagIndex < module.tags.length; tagIndex++) {
        const tag = module.tags[tagIndex];
        if (tag.value === "meta") {
          isMeta = true;
        }
      }

      expect(isMeta).toBe(true);
    }
    expect(metaModulesCount).toBe(4);
  });

  test("Test create new jokerace instance and get instace parameters", async () => {
    const jokeraceId = "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a";
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

  test("Test create new staking instance and get instace parameters", async () => {
    const stakingId = "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7";
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
    const erc20Id = "0xbA5b218e6685D0607139c06f81442681a32a0EC3";
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

    erc20EligibilityInstance = res.newInstance;

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
    const erc721Id = "0xF37cf12fB4493D29270806e826fDDf50dd722bab";
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

    erc721EligibilityInstance = res.newInstance;

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
    const erc1155Id = "0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17";
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

    erc1155EligibilityInstance = res.newInstance;

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
    const claimsHatterId = "0xB985eA1be961f7c4A4C45504444C02c88c4fdEF9";
    const claimsHatterModule = hatsModulesClient.getModuleById(
      claimsHatterId
    ) as Module;

    expect(
      hatsModulesClient.getModuleByImplementation(
        "0xB985eA1be961f7c4A4C45504444C02c88c4fdEF9"
      )
    ).toEqual(claimsHatterModule);
  });

  test("Test getModulesByInstances scenario 1", async () => {
    const modules = await hatsModulesClient.getModulesByInstances([
      erc20EligibilityInstance,
      erc721EligibilityInstance,
      erc1155EligibilityInstance,
    ]);

    expect(modules[0]?.implementationAddress).toBe(
      "0xbA5b218e6685D0607139c06f81442681a32a0EC3"
    );
    expect(modules[1]?.implementationAddress).toBe(
      "0xF37cf12fB4493D29270806e826fDDf50dd722bab"
    );
    expect(modules[2]?.implementationAddress).toBe(
      "0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17"
    );
  }, 30000);

  test("Test getModulesByInstances scenario 2", async () => {
    const modules = await hatsModulesClient.getModulesByInstances([
      erc20EligibilityInstance,
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      erc1155EligibilityInstance,
    ]);

    expect(modules[0]?.implementationAddress).toBe(
      "0xbA5b218e6685D0607139c06f81442681a32a0EC3"
    );
    expect(modules[1]).toBe(undefined);
    expect(modules[2]?.implementationAddress).toBe(
      "0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17"
    );
  }, 30000);

  test("Test getModulesByInstances scenario 3", async () => {
    const modules = await hatsModulesClient.getModulesByInstances([
      erc20EligibilityInstance,
      "0x5790e25C58cAe56EB243F0bacE67C38284417771",
      erc1155EligibilityInstance,
    ]);

    expect(modules[0]?.implementationAddress).toBe(
      "0xbA5b218e6685D0607139c06f81442681a32a0EC3"
    );
    expect(modules[1]).toBe(undefined);
    expect(modules[2]?.implementationAddress).toBe(
      "0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17"
    );
  }, 30000);
});
