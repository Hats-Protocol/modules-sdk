import "dotenv/config";

import type { Anvil } from "@viem/anvil";
import { createAnvil } from "@viem/anvil";
import * as fs from "fs";
import type { Address, PrivateKeyAccount, PublicClient, WalletClient } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { HATS_ELIGIBILITIES_CHAIN_MODULE_ABI, HatsModulesClient } from "../src/index";
import type { Module, Registry } from "../src/types";
import { checkRuleset, ModuleChain, prepareArgs } from "./utils";

// const JOKERACE_MODULE_ID = "0x0Bb0a2B9bc5Da206fead8e87D7Cbc6fCBa455320"; // jokerace v0.3.0
const STAKING_MODULE_ID = "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7"; // staking v0.1.0
const ERC20_MODULE_ID = "0xbA5b218e6685D0607139c06f81442681a32a0EC3"; // erc20 v0.1.0
const ERC721_MODULE_ID = "0xF37cf12fB4493D29270806e826fDDf50dd722bab"; // erc721 v0.1.0
const ERC1155_MODULE_ID = "0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17"; // erc1155 v0.1.0

const HAT_ID = "0x0000000100000000000000000000000000000000000000000000000000000000";

const SCENARIO_1_DESC = "[2, 2]";
const SCENARIO_2_DESC = "[4]";
const SCENARIO_3_DESC = "[1, 1, 1, 1]";

describe("Batch Create Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;

  // let jokeraceInstance: Address;
  let stakingInstance: Address;
  let erc20Instance: Address;
  let erc721Instance: Address;
  let erc1155Instance: Address;

  let chain1: Address;
  let chain2: Address;
  let chain3: Address;

  let modules: { [key: string]: Module };
  let chains: { [key: string]: ModuleChain };

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

    modules = {
      [ERC20_MODULE_ID]: erc20Module,
      [ERC721_MODULE_ID]: erc721Module,
      [ERC1155_MODULE_ID]: erc1155Module,
      [STAKING_MODULE_ID]: stakingModule,
      // [JOKERACE_MODULE_ID]: jokeraceModule,
    };

    const hatIds = Array(Object.keys(modules).length).fill(BigInt(HAT_ID));

    const res = await hatsModulesClient.batchCreateNewInstances({
      account: deployerAccount,
      moduleIds: Object.keys(modules),
      hatIds,
      immutableArgsArray: Object.values(modules).map((m) => prepareArgs({ args: m.creationArgs.immutable })),
      mutableArgsArray: Object.values(modules).map((m) => prepareArgs({ args: m.creationArgs.mutable })),
    });

    [erc20Instance, erc721Instance, erc1155Instance, stakingInstance] = res.newInstances; // jokeraceInstance

    const localModules = [erc20Module, erc721Module, erc1155Module, stakingModule];
    const localInstances = [erc20Instance, erc721Instance, erc1155Instance, stakingInstance];

    chains = {
      scenario1: {
        modules: localModules,
        instances: localInstances,
        numClauses: 2,
        clausesLengths: [2, 2],
        rulesets: [
          [
            { ...erc20Module, instance: erc20Instance },
            { ...erc721Module, instance: erc721Instance },
          ],
          [
            { ...erc1155Module, instance: erc1155Instance },
            { ...stakingModule, instance: stakingInstance },
          ],
        ],
      },
      scenario2: {
        modules: localModules,
        instances: localInstances,
        numClauses: 1,
        clausesLengths: [4],
        rulesets: [
          [
            { ...erc20Module, instance: erc20Instance },
            { ...erc721Module, instance: erc721Instance },
            { ...erc1155Module, instance: erc1155Instance },
            { ...stakingModule, instance: stakingInstance },
          ],
        ],
      },
      scenario3: {
        modules: localModules,
        instances: localInstances,
        numClauses: 4,
        clausesLengths: [1, 1, 1, 1],
        rulesets: [
          [{ ...erc20Module, instance: erc20Instance }],
          [{ ...erc721Module, instance: erc721Instance }],
          [{ ...erc1155Module, instance: erc1155Instance }],
          [{ ...stakingModule, instance: stakingInstance }],
        ],
      },
    };
  }, 35000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  describe("Chain creation tests", () => {
    test("Scenario 1 - " + SCENARIO_1_DESC, async () => {
      const res = await hatsModulesClient.createEligibilitiesChain({
        account: deployerAccount,
        hatId: BigInt(HAT_ID),
        numClauses: chains.scenario1.numClauses,
        clausesLengths: chains.scenario1.clausesLengths,
        modules: chains.scenario1.instances,
      });

      chain1 = res.newInstance;

      const numClausesResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "NUM_CONJUNCTION_CLAUSES",
      });

      const clauseLengthsResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "CONJUNCTION_CLAUSE_LENGTHS",
      });

      const modulesResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "MODULES",
      });

      expect(numClausesResult).toBe(BigInt(chains.scenario1.numClauses));
      expect(clauseLengthsResult).toStrictEqual(chains.scenario1.clausesLengths.map(BigInt));
      expect(modulesResult).toStrictEqual(chains.scenario1.instances);
    });

    test("Scenario 2 - " + SCENARIO_2_DESC, async () => {
      const res = await hatsModulesClient.createEligibilitiesChain({
        account: deployerAccount,
        hatId: BigInt(HAT_ID),
        numClauses: chains.scenario2.numClauses,
        clausesLengths: chains.scenario2.clausesLengths,
        modules: chains.scenario2.instances,
      });

      chain2 = res.newInstance;

      const numClausesResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "NUM_CONJUNCTION_CLAUSES",
      });

      const clauseLengthsResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "CONJUNCTION_CLAUSE_LENGTHS",
      });

      const modulesResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "MODULES",
      });

      expect(numClausesResult).toBe(BigInt(chains.scenario2.numClauses));
      expect(clauseLengthsResult).toStrictEqual(chains.scenario2.clausesLengths.map(BigInt));
      expect(modulesResult).toStrictEqual(chains.scenario2.instances);
    });

    test("Scenario 3 - " + SCENARIO_3_DESC, async () => {
      const res = await hatsModulesClient.createEligibilitiesChain({
        account: deployerAccount,
        hatId: BigInt(HAT_ID),
        numClauses: chains.scenario3.numClauses,
        clausesLengths: chains.scenario3.clausesLengths,
        modules: chains.scenario3.instances,
      });

      chain3 = res.newInstance;

      const numClausesResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "NUM_CONJUNCTION_CLAUSES",
      });

      const clauseLengthsResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "CONJUNCTION_CLAUSE_LENGTHS",
      });

      const modulesResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
        functionName: "MODULES",
      });

      expect(numClausesResult).toBe(BigInt(chains.scenario3.numClauses));
      expect(clauseLengthsResult).toStrictEqual(chains.scenario3.clausesLengths.map(BigInt));
      expect(modulesResult).toStrictEqual(chains.scenario3.instances);
    });
  });

  describe("Chain getter tests", () => {
    test("Scenario 1 - " + SCENARIO_1_DESC, async () => {
      const isChain = await hatsModulesClient.isChain(chain1);
      expect(isChain).toBe(true);

      const rulesets = await hatsModulesClient.getChain(chain1);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(chains.scenario1.numClauses);

        // check each ruleset
        for (let i = 0; i < rulesets.length; i++) {
          const ruleset = rulesets[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario1.rulesets[i].length,
            instances: chains.scenario1.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario1.rulesets[i],
          });
        }
      }
    });

    test("Scenario 2 - " + SCENARIO_2_DESC, async () => {
      const isChain = await hatsModulesClient.isChain(chain2);
      expect(isChain).toBe(true);

      const rulesets = await hatsModulesClient.getChain(chain2);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(chains.scenario2.numClauses);

        for (let i = 0; i < rulesets.length; i++) {
          const ruleset = rulesets[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario2.rulesets[i].length,
            instances: chains.scenario2.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario2.rulesets[i],
          });
        }
      }
    });

    test("Scenario 3 - " + SCENARIO_3_DESC, async () => {
      const isChain = await hatsModulesClient.isChain(chain3);
      expect(isChain).toBe(true);

      const rulesets = await hatsModulesClient.getChain(chain3);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(chains.scenario3.numClauses);

        for (let i = 0; i < rulesets.length; i++) {
          const ruleset = rulesets[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario3.rulesets[i].length,
            instances: chains.scenario3.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario3.rulesets[i],
          });
        }
      }
    });
  });

  describe("get rulesets tests", () => {
    test("Scenario 1 - " + SCENARIO_1_DESC, async () => {
      const rulesets = await hatsModulesClient.getRulesets(chain1, {
        includeLiveParams: true,
      });
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(chains.scenario1.numClauses);

        // check each ruleset
        for (let i = 0; i < rulesets.length; i++) {
          const ruleset = rulesets[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario1.rulesets[i].length,
            instances: chains.scenario1.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario1.rulesets[i],
          });
          // TODO check live params
        }
      }
    });

    test("Scenario 2 - " + SCENARIO_2_DESC, async () => {
      const rulesets = await hatsModulesClient.getRulesets(chain2);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(chains.scenario2.numClauses);

        // check each ruleset
        for (let i = 0; i < rulesets.length; i++) {
          const ruleset = rulesets[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario2.rulesets[i].length,
            instances: chains.scenario2.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario2.rulesets[i],
          });
          // TODO check live params
        }
      }
    });

    test("Scenario 3 - " + SCENARIO_3_DESC, async () => {
      const rulesets = await hatsModulesClient.getRulesets(chain3);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(chains.scenario3.numClauses);

        // check each ruleset
        for (let i = 0; i < rulesets.length; i++) {
          const ruleset = rulesets[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario3.rulesets[i].length,
            instances: chains.scenario3.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario3.rulesets[i],
          });
          // TODO check live params
        }
      }
    });

    test("Scenario 4 -- unchained erc20 instance", async () => {
      const rulesets = await hatsModulesClient.getRulesets(erc20Instance);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(1);
        const ruleset = rulesets[0];
        expect(ruleset.length).toBe(1);
        expect(ruleset[0].module.name).toBe("ERC20 Eligibility");
        expect(ruleset[0].address).toBe(erc20Instance);
      }
    });

    test("Scenario 5 -- invalid address", async () => {
      const rulesets = await hatsModulesClient.getRulesets(deployerAccount.address);
      expect(rulesets).toBeUndefined();
    });
  });

  describe("Get chains batched", () => {
    test("Scenario 1 - " + SCENARIO_1_DESC, async () => {
      const res = await hatsModulesClient.getChainBatched([chain1, chain2, chain3]);

      // check each chain
      for (let i = 0; i < res.length; i++) {
        const rulesets = res[i];
        expect(rulesets).toBeDefined();

        if (rulesets !== undefined) {
          // check each ruleset
          for (let j = 0; j < rulesets.length; j++) {
            const ruleset = rulesets[j];
            checkRuleset({
              ruleset,
              numClauses: chains[`scenario${i + 1}`].rulesets[j].length,
              instances: chains[`scenario${i + 1}`].rulesets[j].map((r) => r.instance as Address),
              modules: chains[`scenario${i + 1}`].rulesets[j],
            });
          }
        }
      }
    });

    test("Scenario 2 - " + SCENARIO_2_DESC, async () => {
      const res = await hatsModulesClient.getChainBatched([erc20Instance, chain2, chain3]);

      // check first chain
      const rulesets1 = res[0];
      expect(rulesets1).toBeUndefined();

      // check second chain
      const rulesets2 = res[1];
      expect(rulesets2).toBeDefined();
      if (rulesets2 !== undefined) {
        expect(rulesets2.length).toBe(chains.scenario2.numClauses);

        // check first ruleset
        for (let i = 0; i < rulesets2.length; i++) {
          const ruleset = rulesets2[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario2.rulesets[i].length,
            instances: chains.scenario2.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario2.rulesets[i],
          });
        }
      }

      // check third chain
      const rulesets3 = res[2];
      expect(rulesets3).toBeDefined();
      if (rulesets3 !== undefined) {
        expect(rulesets3.length).toBe(chains.scenario3.numClauses);

        // check each ruleset
        for (let i = 0; i < rulesets3.length; i++) {
          const ruleset = rulesets3[i];
          checkRuleset({
            ruleset,
            numClauses: chains.scenario3.rulesets[i].length,
            instances: chains.scenario3.rulesets[i].map((r) => r.instance as Address),
            modules: chains.scenario3.rulesets[i],
          });
        }
      }
    });

    test("Scenario 3 - " + SCENARIO_3_DESC, async () => {
      const res = await hatsModulesClient.getChainBatched([erc20Instance]);

      // check first chain
      const rulesets1 = res[0];
      expect(rulesets1).toBeUndefined();
    });
  });

  describe("Is chains tests", () => {
    test("Scenario 1 - " + SCENARIO_1_DESC, async () => {
      const res = await hatsModulesClient.isChainBatched([chain1]);
      expect(res.length).toBe(1);
      expect(res[0]).toBe(true);
    });

    test("Scenario 2 - " + SCENARIO_2_DESC, async () => {
      const res = await hatsModulesClient.isChainBatched([chain1, chain2]);
      expect(res.length).toBe(2);
      expect(res[0]).toBe(true);
      expect(res[1]).toBe(true);
    });

    test("Scenario 3 - " + SCENARIO_3_DESC, async () => {
      const res = await hatsModulesClient.isChainBatched([erc20Instance, chain2]);
      expect(res.length).toBe(2);
      expect(res[0]).toBe(false);
      expect(res[1]).toBe(true);
    });

    test("Scenario 4 - empty array", async () => {
      const res = await hatsModulesClient.isChainBatched([]);
      expect(res.length).toBe(0);
    });
  });

  describe("Get rulesets batched", () => {
    test("Scenario 1 - [chain1, chain2]", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([chain1, chain2]);

      expect(rulesetsArray.length).toBe(2);

      for (let i = 0; i < rulesetsArray.length; i++) {
        const rulesets = rulesetsArray[i];
        expect(rulesets).toBeDefined();
        if (rulesets !== undefined) {
          for (let j = 0; j < rulesets.length; j++) {
            const ruleset = rulesets[j];
            checkRuleset({
              ruleset,
              numClauses: chains[`scenario${i + 1}`].rulesets[j].length,
              instances: chains[`scenario${i + 1}`].rulesets[j].map((r) => r.instance as Address),
              modules: chains[`scenario${i + 1}`].rulesets[j],
            });
          }
        }
      }
    });

    test("Scenario 2 - [chain1, erc20Instance]", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([chain1, erc20Instance]);

      expect(rulesetsArray.length).toBe(2);

      for (let i = 0; i < rulesetsArray.length; i++) {
        const rulesets = rulesetsArray[i];
        expect(rulesets).toBeDefined();

        if (i === 1) continue; // theoretically could check the erc20 instance ruleset

        if (rulesets !== undefined) {
          for (let j = 0; j < rulesets.length; j++) {
            const ruleset = rulesets[j];

            checkRuleset({
              ruleset,
              numClauses: chains[`scenario${i + 1}`].rulesets[j].length,
              instances: chains[`scenario${i + 1}`].rulesets[j].map((r) => r.instance as Address),
              modules: chains[`scenario${i + 1}`].rulesets[j],
            });
          }
        }
      }
    });

    test("Scenario 3 - [erc721, erc20]", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([erc721Instance, erc20Instance]);

      expect(rulesetsArray.length).toBe(2);

      const rulesets1 = rulesetsArray[0];
      expect(rulesets1).toBeDefined();
      if (rulesets1 !== undefined) {
        expect(rulesets1.length).toBe(1);
        const ruleset = rulesets1[0];
        expect(ruleset.length).toBe(1);
        expect(ruleset[0].module.name).toBe("ERC721 Eligibility");
        expect(ruleset[0].address).toBe(erc721Instance);
      }

      const rulesets2 = rulesetsArray[1];
      expect(rulesets2).toBeDefined();
      if (rulesets2 !== undefined) {
        expect(rulesets2.length).toBe(1);
        const ruleset = rulesets2[0];
        expect(ruleset.length).toBe(1);
        expect(ruleset[0].module.name).toBe("ERC20 Eligibility");
        expect(ruleset[0].address).toBe(erc20Instance);
      }
    });

    test("Scenario 4 - [erc721, invalid address]", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([erc721Instance, deployerAccount.address]);

      expect(rulesetsArray.length).toBe(2);

      const rulesets1 = rulesetsArray[0];
      expect(rulesets1).toBeDefined();
      if (rulesets1 !== undefined) {
        expect(rulesets1.length).toBe(1);
        const ruleset = rulesets1[0];
        expect(ruleset.length).toBe(1);
        expect(ruleset[0].module.name).toBe("ERC721 Eligibility");
        expect(ruleset[0].address).toBe(erc721Instance);
      }

      const rulesets2 = rulesetsArray[1];
      expect(rulesets2).toBeUndefined();
    });
  });
});
