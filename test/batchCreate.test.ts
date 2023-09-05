import { HatsModulesClient, solidityToTypescriptType } from "../src/index";
import { createPublicClient, createWalletClient, http } from "viem";
import { goerli } from "viem/chains";
import { createAnvil } from "@viem/anvil";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import type { PublicClient, WalletClient, PrivateKeyAccount } from "viem";
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
  let claimsInstance: `0x${string}`;

  let jokeraceAbi: Abi;
  let stakingAbi: Abi;
  let erc20Abi: Abi;
  let erc721Abi: Abi;
  let erc1155Abi: Abi;
  let claimsAbi: Abi;

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
    const claimsHatterId =
      "0x65d08c510207af375cce45e411803a12a4da2c49459061d584fd5b33e9089b43";

    const jokeraceModule = hatsModulesClient.getModuleById(
      jokeraceId
    ) as Module;
    const stakingModule = hatsModulesClient.getModuleById(stakingId) as Module;
    const erc20Module = hatsModulesClient.getModuleById(erc20Id) as Module;
    const erc721Module = hatsModulesClient.getModuleById(erc721Id) as Module;
    const erc1155Module = hatsModulesClient.getModuleById(erc1155Id) as Module;
    const claimsHatterModule = hatsModulesClient.getModuleById(
      claimsHatterId
    ) as Module;

    jokeraceAbi = jokeraceModule.abi;
    stakingAbi = stakingModule.abi;
    erc20Abi = erc20Module.abi;
    erc721Abi = erc721Module.abi;
    erc1155Abi = erc1155Module.abi;
    claimsAbi = claimsHatterModule.abi;

    const modules: Module[] = [
      jokeraceModule,
      stakingModule,
      erc20Module,
      erc721Module,
      erc1155Module,
      claimsHatterModule,
    ];
    const moduleIds: string[] = [
      jokeraceId,
      stakingId,
      erc20Id,
      erc721Id,
      erc1155Id,
      claimsHatterId,
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
    claimsInstance = res.newInstances[5];
  }, 35000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test jokerace instance", async () => {
    const hatIdResult = await publicClient.readContract({
      address: jokeraceInstance,
      abi: jokeraceAbi,
      functionName: "hatId",
      args: [],
    });

    const adminHatResult = await publicClient.readContract({
      address: jokeraceInstance,
      abi: jokeraceAbi,
      functionName: "ADMIN_HAT",
      args: [],
    });

    const underlyingContestResult = await publicClient.readContract({
      address: jokeraceInstance,
      abi: jokeraceAbi,
      functionName: "underlyingContest",
      args: [],
    });

    const termEndResult = await publicClient.readContract({
      address: jokeraceInstance,
      abi: jokeraceAbi,
      functionName: "termEnd",
      args: [],
    });

    const topKResult = await publicClient.readContract({
      address: jokeraceInstance,
      abi: jokeraceAbi,
      functionName: "topK",
      args: [],
    });

    expect(hatIdResult).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(adminHatResult).toBe(immutableArgs[0][0]);
    expect(underlyingContestResult).toBe(mutableArgs[0][0]);
    expect(termEndResult).toBe(mutableArgs[0][1]);
    expect(topKResult).toBe(mutableArgs[0][2]);
  });

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

    expect(hatIdResult).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(tokenResult).toBe(immutableArgs[1][0]);
    expect(minStakeResult).toBe(mutableArgs[1][0]);
    expect(judgeHatResult).toBe(mutableArgs[1][1]);
    expect(recipientHatResult).toBe(mutableArgs[1][2]);
    expect(cooldownPeriodResult).toBe(mutableArgs[1][3]);
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
      functionName: "TOKEN_ADDRESS",
      args: [],
    });

    const minBalanceResult = await publicClient.readContract({
      address: erc20Instance,
      abi: erc20Abi,
      functionName: "MIN_BALANCE",
      args: [],
    });

    expect(hatIdResult).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(tokenResult).toBe(immutableArgs[2][0]);
    expect(minBalanceResult).toBe(immutableArgs[2][1]);
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
      functionName: "TOKEN_ADDRESS",
      args: [],
    });

    const minBalanceResult = await publicClient.readContract({
      address: erc721Instance,
      abi: erc721Abi,
      functionName: "MIN_BALANCE",
      args: [],
    });

    expect(hatIdResult).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(tokenResult).toBe(immutableArgs[3][0]);
    expect(minBalanceResult).toBe(immutableArgs[3][1]);
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

    expect(hatIdResult).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
    expect(tokenResult).toBe(immutableArgs[4][0]);
    expect(arrayLengthResult).toBe(immutableArgs[4][1]);
    expect(tokenIdsResult).toEqual(immutableArgs[4][2]);
    expect(minBalancesResult).toEqual(immutableArgs[4][3]);
  });

  test("Test claims hatter instance", async () => {
    const hatIdResult = await publicClient.readContract({
      address: claimsInstance,
      abi: claimsAbi,
      functionName: "hatId",
      args: [],
    });

    expect(hatIdResult).toBe(
      BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      )
    );
  });
});
