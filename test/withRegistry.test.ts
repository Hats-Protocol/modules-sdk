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
import "dotenv/config";

describe("Eligibility Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;

  let instances: { implementation: Address; instance: Address }[];

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

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });

    await hatsModulesClient.prepare();

    instances = [];
  }, 50000);

  afterAll(async () => {
    await anvil.stop();
  }, 50000);

  test("Test create all modules", async () => {
    const modules = hatsModulesClient.getModules();
    for (const [id, module] of Object.entries(modules)) {
      const hatId = module.creationArgs.useHatId
        ? BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000"
          )
        : BigInt("0");
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
        } else if (tsType === "bigint[]") {
          arg = (exampleArg as Array<string>).map((val) => BigInt(val));
        } else {
          arg = exampleArg;
        }

        mutableArgs.push(arg);
      }

      // check that module is not yet deployed
      const isDeployedPrev = await hatsModulesClient.isModuleDeployed({
        moduleId: id,
        hatId: hatId,
        immutableArgs: immutableArgs,
      });
      expect(isDeployedPrev).toBe(false);

      // create a new instance
      const res = await hatsModulesClient.createNewInstance({
        account: deployerAccount,
        moduleId: id,
        hatId: hatId,
        immutableArgs: immutableArgs,
        mutableArgs: mutableArgs,
      });
      instances.push({
        implementation: module.implementationAddress as Address,
        instance: res.newInstance,
      });

      const hatIdResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: module.abi,
        functionName: "hatId",
        args: [],
      });

      expect(hatIdResult).toBe(hatId);

      // predict module address
      const predictedAddress = await hatsModulesClient.predictHatsModuleAddress(
        {
          moduleId: id,
          hatId: hatId,
          immutableArgs: immutableArgs,
        }
      );
      expect(predictedAddress).toBe(res.newInstance);

      // check that module is deployed
      const isDeployedAfter = await hatsModulesClient.isModuleDeployed({
        moduleId: id,
        hatId: hatId,
        immutableArgs: immutableArgs,
      });
      expect(isDeployedAfter).toBe(true);
    }
  }, 30000);

  test("Test get module by instance address", async () => {
    for (let i = 0; i < instances.length; i++) {
      const { instance, implementation } = instances[i];
      const module = await hatsModulesClient.getModuleByInstance(instance);
      expect(module?.implementationAddress).toBe(implementation);
    }

    const nonExistentModule = await hatsModulesClient.getModuleByInstance(
      "0x0000000000000000000000000000000000000000"
    );
    expect(nonExistentModule).toBe(undefined);
  });
});
