import {
  HatsModulesClient,
  solidityToTypescriptType,
  HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
} from "../src/index";
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
import type { Module, Registry } from "../src/types";
import "dotenv/config";

describe("Batch Create Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;

  let jokeraceInstance: `0x${string}`;
  let stakingInstance: `0x${string}`;
  let erc20Instance: `0x${string}`;
  let erc721Instance: `0x${string}`;
  let erc1155Instance: `0x${string}`;

  let chain1: `0x${string}`;
  let chain2: `0x${string}`;
  let chain3: `0x${string}`;

  let immutableArgs: unknown[][];
  let mutableArgs: unknown[][];

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
    const registryModules: Registry = JSON.parse(data);

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });

    await hatsModulesClient.prepare(registryModules);

    immutableArgs = [];
    mutableArgs = [];

    const jokeraceId = "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a";
    const stakingId = "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7";
    const erc20Id = "0xbA5b218e6685D0607139c06f81442681a32a0EC3";
    const erc721Id = "0xF37cf12fB4493D29270806e826fDDf50dd722bab";
    const erc1155Id = "0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17";

    const jokeraceModule = hatsModulesClient.getModuleById(
      jokeraceId
    ) as Module;
    const stakingModule = hatsModulesClient.getModuleById(stakingId) as Module;
    const erc20Module = hatsModulesClient.getModuleById(erc20Id) as Module;
    const erc721Module = hatsModulesClient.getModuleById(erc721Id) as Module;
    const erc1155Module = hatsModulesClient.getModuleById(erc1155Id) as Module;

    const modules: Module[] = [
      jokeraceModule,
      stakingModule,
      erc20Module,
      erc721Module,
      erc1155Module,
    ];
    const moduleIds: string[] = [
      jokeraceId,
      stakingId,
      erc20Id,
      erc721Id,
      erc1155Id,
    ];
    const hatIds: bigint[] = [
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      ),
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      ),
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      ),
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      ),
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      ),
    ];

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const moduleImmutableArgs: unknown[] = [];
      const moduleMutableArgs: unknown[] = [];

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

        moduleImmutableArgs.push(arg);
      }
      immutableArgs.push(moduleImmutableArgs);

      for (let i = 0; i < module.creationArgs.mutable.length; i++) {
        let arg: unknown;
        const exampleArg = module.creationArgs.mutable[i].example;
        const tsType = solidityToTypescriptType(
          module.creationArgs.mutable[i].type
        );
        if (tsType === "bigint") {
          arg = BigInt(exampleArg as string);
        } else if (tsType === "bigint[]") {
          arg = (exampleArg as Array<string>).map((val) => BigInt(val));
        } else {
          arg = exampleArg;
        }

        moduleMutableArgs.push(arg);
      }
      mutableArgs.push(moduleMutableArgs);
    }

    const res = await hatsModulesClient.batchCreateNewInstances({
      account: deployerAccount,
      moduleIds,
      hatIds,
      immutableArgsArray: immutableArgs,
      mutableArgsArray: mutableArgs,
    });

    jokeraceInstance = res.newInstances[0];
    stakingInstance = res.newInstances[1];
    erc20Instance = res.newInstances[2];
    erc721Instance = res.newInstances[3];
    erc1155Instance = res.newInstances[4];
  }, 35000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  describe("Chain creation tests", () => {
    test("Test scenario 1", async () => {
      const res = await hatsModulesClient.createEligibilitiesChain({
        account: deployerAccount,
        hatId: BigInt(
          "0x0000000100000000000000000000000000000000000000000000000000000000"
        ),
        numClauses: 2,
        clausesLengths: [2, 3],
        modules: [
          jokeraceInstance,
          stakingInstance,
          erc20Instance,
          erc721Instance,
          erc1155Instance,
        ],
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

      expect(numClausesResult).toBe(2n);
      expect(clauseLengthsResult).toStrictEqual([2n, 3n]);
      expect(modulesResult).toStrictEqual([
        jokeraceInstance,
        stakingInstance,
        erc20Instance,
        erc721Instance,
        erc1155Instance,
      ]);
    });

    test("Test scenario 2", async () => {
      const res = await hatsModulesClient.createEligibilitiesChain({
        account: deployerAccount,
        hatId: BigInt(
          "0x0000000100000000000000000000000000000000000000000000000000000000"
        ),
        numClauses: 1,
        clausesLengths: [5],
        modules: [
          jokeraceInstance,
          stakingInstance,
          erc20Instance,
          erc721Instance,
          erc1155Instance,
        ],
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

      expect(numClausesResult).toBe(1n);
      expect(clauseLengthsResult).toStrictEqual([5n]);
      expect(modulesResult).toStrictEqual([
        jokeraceInstance,
        stakingInstance,
        erc20Instance,
        erc721Instance,
        erc1155Instance,
      ]);
    });

    test("Test scenario 3", async () => {
      const res = await hatsModulesClient.createEligibilitiesChain({
        account: deployerAccount,
        hatId: BigInt(
          "0x0000000100000000000000000000000000000000000000000000000000000000"
        ),
        numClauses: 5,
        clausesLengths: [1, 1, 1, 1, 1],
        modules: [
          jokeraceInstance,
          stakingInstance,
          erc20Instance,
          erc721Instance,
          erc1155Instance,
        ],
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

      expect(numClausesResult).toBe(5n);
      expect(clauseLengthsResult).toStrictEqual([1n, 1n, 1n, 1n, 1n]);
      expect(modulesResult).toStrictEqual([
        jokeraceInstance,
        stakingInstance,
        erc20Instance,
        erc721Instance,
        erc1155Instance,
      ]);
    });
  });

  describe("Chain getter tests", () => {
    test("Scenario 1", async () => {
      const isChain = await hatsModulesClient.isChain(chain1);
      expect(isChain).toBe(true);

      const rulesets = await hatsModulesClient.getChain(chain1);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(2);

        // check first ruleset
        const ruleset1 = rulesets[0];
        expect(ruleset1.length).toBe(2);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");

        // check second ruleset
        const ruleset2 = rulesets[1];
        expect(ruleset2.length).toBe(3);
        expect(ruleset2[0].address).toBe(erc20Instance);
        expect(ruleset2[0].module.name).toBe("ERC20 Eligibility");
        expect(ruleset2[1].address).toBe(erc721Instance);
        expect(ruleset2[1].module.name).toBe("ERC721 Eligibility");
        expect(ruleset2[2].address).toBe(erc1155Instance);
        expect(ruleset2[2].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("Scenario 2", async () => {
      const isChain = await hatsModulesClient.isChain(chain2);
      expect(isChain).toBe(true);

      const rulesets = await hatsModulesClient.getChain(chain2);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(1);

        // check first ruleset
        const ruleset1 = rulesets[0];
        expect(ruleset1.length).toBe(5);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");
        expect(ruleset1[2].address).toBe(erc20Instance);
        expect(ruleset1[2].module.name).toBe("ERC20 Eligibility");
        expect(ruleset1[3].address).toBe(erc721Instance);
        expect(ruleset1[3].module.name).toBe("ERC721 Eligibility");
        expect(ruleset1[4].address).toBe(erc1155Instance);
        expect(ruleset1[4].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("Scenario 3", async () => {
      const isChain = await hatsModulesClient.isChain(chain3);
      expect(isChain).toBe(true);

      const rulesets = await hatsModulesClient.getChain(chain3);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(5);

        // check first ruleset
        const ruleset1 = rulesets[0];
        expect(ruleset1.length).toBe(1);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");

        // check second ruleset
        const ruleset2 = rulesets[1];
        expect(ruleset2.length).toBe(1);
        expect(ruleset2[0].address).toBe(stakingInstance);
        expect(ruleset2[0].module.name).toBe("Staking Eligibility");

        // check third ruleset
        const ruleset3 = rulesets[2];
        expect(ruleset3.length).toBe(1);
        expect(ruleset3[0].address).toBe(erc20Instance);
        expect(ruleset3[0].module.name).toBe("ERC20 Eligibility");

        // check fourth ruleset
        const ruleset4 = rulesets[3];
        expect(ruleset4.length).toBe(1);
        expect(ruleset4[0].address).toBe(erc721Instance);
        expect(ruleset4[0].module.name).toBe("ERC721 Eligibility");

        // check fifth ruleset
        const ruleset5 = rulesets[4];
        expect(ruleset5.length).toBe(1);
        expect(ruleset5[0].address).toBe(erc1155Instance);
        expect(ruleset5[0].module.name).toBe("ERC1155 Eligibility");
      }
    });
  });

  describe("get rulesets tests", () => {
    test("Scenario 1", async () => {
      const rulesets = await hatsModulesClient.getRulesets(chain1, {
        includeLiveParams: true,
      });
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(2);

        // check first ruleset
        const ruleset1 = rulesets[0];
        expect(ruleset1.length).toBe(2);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[0].liveParams).toBeDefined();
        expect(ruleset1[0].liveParams?.length).toBe(4);
        if (ruleset1[0].liveParams !== undefined) {
          expect(ruleset1[0].liveParams[0].value).toBe(
            26959946667150639794667015087019630673637144422540572481103610249216n
          );
        }
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");

        // check second ruleset
        const ruleset2 = rulesets[1];
        expect(ruleset2.length).toBe(3);
        expect(ruleset2[0].address).toBe(erc20Instance);
        expect(ruleset2[0].module.name).toBe("ERC20 Eligibility");
        expect(ruleset2[1].address).toBe(erc721Instance);
        expect(ruleset2[1].module.name).toBe("ERC721 Eligibility");
        expect(ruleset2[2].address).toBe(erc1155Instance);
        expect(ruleset2[2].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("Scenario 2", async () => {
      const rulesets = await hatsModulesClient.getRulesets(chain2);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(1);

        // check first ruleset
        const ruleset1 = rulesets[0];
        expect(ruleset1.length).toBe(5);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");
        expect(ruleset1[2].address).toBe(erc20Instance);
        expect(ruleset1[2].module.name).toBe("ERC20 Eligibility");
        expect(ruleset1[3].address).toBe(erc721Instance);
        expect(ruleset1[3].module.name).toBe("ERC721 Eligibility");
        expect(ruleset1[4].address).toBe(erc1155Instance);
        expect(ruleset1[4].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("Scenario 3", async () => {
      const rulesets = await hatsModulesClient.getRulesets(chain3);
      expect(rulesets).toBeDefined();
      if (rulesets !== undefined) {
        expect(rulesets.length).toBe(5);

        // check first ruleset
        const ruleset1 = rulesets[0];
        expect(ruleset1.length).toBe(1);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");

        // check second ruleset
        const ruleset2 = rulesets[1];
        expect(ruleset2.length).toBe(1);
        expect(ruleset2[0].address).toBe(stakingInstance);
        expect(ruleset2[0].module.name).toBe("Staking Eligibility");

        // check third ruleset
        const ruleset3 = rulesets[2];
        expect(ruleset3.length).toBe(1);
        expect(ruleset3[0].address).toBe(erc20Instance);
        expect(ruleset3[0].module.name).toBe("ERC20 Eligibility");

        // check fourth ruleset
        const ruleset4 = rulesets[3];
        expect(ruleset4.length).toBe(1);
        expect(ruleset4[0].address).toBe(erc721Instance);
        expect(ruleset4[0].module.name).toBe("ERC721 Eligibility");

        // check fifth ruleset
        const ruleset5 = rulesets[4];
        expect(ruleset5.length).toBe(1);
        expect(ruleset5[0].address).toBe(erc1155Instance);
        expect(ruleset5[0].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("Scenario 4", async () => {
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

    test("Scenario 5", async () => {
      const rulesets = await hatsModulesClient.getRulesets(
        deployerAccount.address
      );
      expect(rulesets).toBeUndefined();
    });
  });

  describe("Test get chains batched", () => {
    test("scenario 1", async () => {
      const res = await hatsModulesClient.getChainBatched([
        chain1,
        chain2,
        chain3,
      ]);

      // check first chain
      const rulesets1 = res[0];
      expect(rulesets1).toBeDefined();
      if (rulesets1 !== undefined) {
        expect(rulesets1.length).toBe(2);

        // check first ruleset
        const ruleset1 = rulesets1[0];
        expect(ruleset1.length).toBe(2);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");

        // check second ruleset
        const ruleset2 = rulesets1[1];
        expect(ruleset2.length).toBe(3);
        expect(ruleset2[0].address).toBe(erc20Instance);
        expect(ruleset2[0].module.name).toBe("ERC20 Eligibility");
        expect(ruleset2[1].address).toBe(erc721Instance);
        expect(ruleset2[1].module.name).toBe("ERC721 Eligibility");
        expect(ruleset2[2].address).toBe(erc1155Instance);
        expect(ruleset2[2].module.name).toBe("ERC1155 Eligibility");
      }

      // check second chain
      const rulesets2 = res[1];
      expect(rulesets2).toBeDefined();
      if (rulesets2 !== undefined) {
        expect(rulesets2.length).toBe(1);

        // check first ruleset
        const ruleset1 = rulesets2[0];
        expect(ruleset1.length).toBe(5);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");
        expect(ruleset1[2].address).toBe(erc20Instance);
        expect(ruleset1[2].module.name).toBe("ERC20 Eligibility");
        expect(ruleset1[3].address).toBe(erc721Instance);
        expect(ruleset1[3].module.name).toBe("ERC721 Eligibility");
        expect(ruleset1[4].address).toBe(erc1155Instance);
        expect(ruleset1[4].module.name).toBe("ERC1155 Eligibility");
      }

      // check third cahin
      const rulesets3 = res[2];
      expect(rulesets3).toBeDefined();
      if (rulesets3 !== undefined) {
        expect(rulesets3.length).toBe(5);

        // check first ruleset
        const ruleset1 = rulesets3[0];
        expect(ruleset1.length).toBe(1);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");

        // check second ruleset
        const ruleset2 = rulesets3[1];
        expect(ruleset2.length).toBe(1);
        expect(ruleset2[0].address).toBe(stakingInstance);
        expect(ruleset2[0].module.name).toBe("Staking Eligibility");

        // check third ruleset
        const ruleset3 = rulesets3[2];
        expect(ruleset3.length).toBe(1);
        expect(ruleset3[0].address).toBe(erc20Instance);
        expect(ruleset3[0].module.name).toBe("ERC20 Eligibility");

        // check fourth ruleset
        const ruleset4 = rulesets3[3];
        expect(ruleset4.length).toBe(1);
        expect(ruleset4[0].address).toBe(erc721Instance);
        expect(ruleset4[0].module.name).toBe("ERC721 Eligibility");

        // check fifth ruleset
        const ruleset5 = rulesets3[4];
        expect(ruleset5.length).toBe(1);
        expect(ruleset5[0].address).toBe(erc1155Instance);
        expect(ruleset5[0].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("scenario 2", async () => {
      const res = await hatsModulesClient.getChainBatched([
        erc20Instance,
        chain2,
        chain3,
      ]);

      // check first chain
      const rulesets1 = res[0];
      expect(rulesets1).toBeUndefined();

      // check second chain
      const rulesets2 = res[1];
      expect(rulesets2).toBeDefined();
      if (rulesets2 !== undefined) {
        expect(rulesets2.length).toBe(1);

        // check first ruleset
        const ruleset1 = rulesets2[0];
        expect(ruleset1.length).toBe(5);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");
        expect(ruleset1[2].address).toBe(erc20Instance);
        expect(ruleset1[2].module.name).toBe("ERC20 Eligibility");
        expect(ruleset1[3].address).toBe(erc721Instance);
        expect(ruleset1[3].module.name).toBe("ERC721 Eligibility");
        expect(ruleset1[4].address).toBe(erc1155Instance);
        expect(ruleset1[4].module.name).toBe("ERC1155 Eligibility");
      }

      // check third cahin
      const rulesets3 = res[2];
      expect(rulesets3).toBeDefined();
      if (rulesets3 !== undefined) {
        expect(rulesets3.length).toBe(5);

        // check first ruleset
        const ruleset1 = rulesets3[0];
        expect(ruleset1.length).toBe(1);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");

        // check second ruleset
        const ruleset2 = rulesets3[1];
        expect(ruleset2.length).toBe(1);
        expect(ruleset2[0].address).toBe(stakingInstance);
        expect(ruleset2[0].module.name).toBe("Staking Eligibility");

        // check third ruleset
        const ruleset3 = rulesets3[2];
        expect(ruleset3.length).toBe(1);
        expect(ruleset3[0].address).toBe(erc20Instance);
        expect(ruleset3[0].module.name).toBe("ERC20 Eligibility");

        // check fourth ruleset
        const ruleset4 = rulesets3[3];
        expect(ruleset4.length).toBe(1);
        expect(ruleset4[0].address).toBe(erc721Instance);
        expect(ruleset4[0].module.name).toBe("ERC721 Eligibility");

        // check fifth ruleset
        const ruleset5 = rulesets3[4];
        expect(ruleset5.length).toBe(1);
        expect(ruleset5[0].address).toBe(erc1155Instance);
        expect(ruleset5[0].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("scenario 3", async () => {
      const res = await hatsModulesClient.getChainBatched([erc20Instance]);

      // check first chain
      const rulesets1 = res[0];
      expect(rulesets1).toBeUndefined();
    });
  });

  describe("Is chains tests", () => {
    test("Scenario 1", async () => {
      const res = await hatsModulesClient.isChainBatched([chain1]);
      expect(res.length).toBe(1);
      expect(res[0]).toBe(true);
    });

    test("Scenario 2", async () => {
      const res = await hatsModulesClient.isChainBatched([chain1, chain2]);
      expect(res.length).toBe(2);
      expect(res[0]).toBe(true);
      expect(res[1]).toBe(true);
    });

    test("Scenario 3", async () => {
      const res = await hatsModulesClient.isChainBatched([
        erc20Instance,
        chain2,
      ]);
      expect(res.length).toBe(2);
      expect(res[0]).toBe(false);
      expect(res[1]).toBe(true);
    });

    test("Scenario 4", async () => {
      const res = await hatsModulesClient.isChainBatched([]);
      expect(res.length).toBe(0);
    });
  });

  describe("get rulesets batched tests", () => {
    test("Scenario 1", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([
        chain1,
        chain2,
      ]);

      expect(rulesetsArray.length).toBe(2);

      const rulesets1 = rulesetsArray[0];
      expect(rulesets1).toBeDefined();
      if (rulesets1 !== undefined) {
        expect(rulesets1.length).toBe(2);

        // check first ruleset
        const ruleset1 = rulesets1[0];
        expect(ruleset1.length).toBe(2);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");

        // check second ruleset
        const ruleset2 = rulesets1[1];
        expect(ruleset2.length).toBe(3);
        expect(ruleset2[0].address).toBe(erc20Instance);
        expect(ruleset2[0].module.name).toBe("ERC20 Eligibility");
        expect(ruleset2[1].address).toBe(erc721Instance);
        expect(ruleset2[1].module.name).toBe("ERC721 Eligibility");
        expect(ruleset2[2].address).toBe(erc1155Instance);
        expect(ruleset2[2].module.name).toBe("ERC1155 Eligibility");
      }

      const rulesets2 = rulesetsArray[1];
      expect(rulesets2).toBeDefined();
      if (rulesets2 !== undefined) {
        expect(rulesets2.length).toBe(1);

        // check first ruleset
        const ruleset1 = rulesets2[0];
        expect(ruleset1.length).toBe(5);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");
        expect(ruleset1[2].address).toBe(erc20Instance);
        expect(ruleset1[2].module.name).toBe("ERC20 Eligibility");
        expect(ruleset1[3].address).toBe(erc721Instance);
        expect(ruleset1[3].module.name).toBe("ERC721 Eligibility");
        expect(ruleset1[4].address).toBe(erc1155Instance);
        expect(ruleset1[4].module.name).toBe("ERC1155 Eligibility");
      }
    });

    test("Scenario 2", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([
        chain1,
        erc20Instance,
      ]);

      expect(rulesetsArray.length).toBe(2);

      const rulesets1 = rulesetsArray[0];
      expect(rulesets1).toBeDefined();
      if (rulesets1 !== undefined) {
        expect(rulesets1.length).toBe(2);

        // check first ruleset
        const ruleset1 = rulesets1[0];
        expect(ruleset1.length).toBe(2);
        expect(ruleset1[0].address).toBe(jokeraceInstance);
        expect(ruleset1[0].module.name).toBe("JokeRace Eligibility");
        expect(ruleset1[1].address).toBe(stakingInstance);
        expect(ruleset1[1].module.name).toBe("Staking Eligibility");

        // check second ruleset
        const ruleset2 = rulesets1[1];
        expect(ruleset2.length).toBe(3);
        expect(ruleset2[0].address).toBe(erc20Instance);
        expect(ruleset2[0].module.name).toBe("ERC20 Eligibility");
        expect(ruleset2[1].address).toBe(erc721Instance);
        expect(ruleset2[1].module.name).toBe("ERC721 Eligibility");
        expect(ruleset2[2].address).toBe(erc1155Instance);
        expect(ruleset2[2].module.name).toBe("ERC1155 Eligibility");
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

    test("Scenario 3", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([
        erc721Instance,
        erc20Instance,
      ]);

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

    test("Scenario 4", async () => {
      const rulesetsArray = await hatsModulesClient.getRulesetsBatched([
        erc721Instance,
        deployerAccount.address,
      ]);

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
