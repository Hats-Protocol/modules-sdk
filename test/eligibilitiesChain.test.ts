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
import { Abi } from "abitype";

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

  let eligibilitesChainAbi: Abi;

  let immutableArgs: unknown[][];
  let mutableArgs: unknown[][];

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

    immutableArgs = [];
    mutableArgs = [];

    const jokeraceId =
      "0xa3adb9634f813822f254bdfcecc48836b644a45f585121894409ac5eb01c67fc";
    const stakingId =
      "0x62c11f54dfa48ad24d8b40532ade2d3e72648e9c6c37a7a679f24268be8b155d";
    const erc20Id =
      "0x61ed5dcdd400854c4032ebbe1ba8a9ee43a937588ad95ccbcd4e538155fe7e3a";
    const erc721Id =
      "0x40a3e1da005ca0bb15c678de0508683e516f7f39e6519be6fbb01f4e6d238c91";
    const erc1155Id =
      "0x6ba54170154b15251037f4fdb42249717419d1845715dc3f619123fbad0d3d7e";

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

        moduleImmutableArgs.push(arg);
      }
      immutableArgs.push(moduleImmutableArgs);

      for (let i = 0; i < module.args.mutable.length; i++) {
        let arg: unknown;
        const exampleArg = module.args.mutable[i].example;
        const tsType = solidityToTypescriptType(module.args.mutable[i].type);
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

    const eligibilitesChainModule =
      hatsModulesClient.getElibilitiesChainModule();
    eligibilitesChainAbi = eligibilitesChainModule.abi;
  }, 35000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

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

    const numClausesResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "NUM_CONJUCTION_CLAUSES",
      args: [],
    });

    const clauseLengthsResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "CONJUCTION_CLAUSE_LENGTHS",
      args: [],
    });

    const modulesResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "MODULES",
      args: [],
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

    const numClausesResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "NUM_CONJUCTION_CLAUSES",
      args: [],
    });

    const clauseLengthsResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "CONJUCTION_CLAUSE_LENGTHS",
      args: [],
    });

    const modulesResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "MODULES",
      args: [],
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

    const numClausesResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "NUM_CONJUCTION_CLAUSES",
      args: [],
    });

    const clauseLengthsResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "CONJUCTION_CLAUSE_LENGTHS",
      args: [],
    });

    const modulesResult = await publicClient.readContract({
      address: res.newInstance as Address,
      abi: eligibilitesChainAbi,
      functionName: "MODULES",
      args: [],
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
