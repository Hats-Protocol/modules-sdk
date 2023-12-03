import { HatsModulesClient, solidityToTypescriptType } from "../src/index";
import { HatsClient } from "@hatsprotocol/sdk-v1-core";
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

describe("Write Functions Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let hatsClient: HatsClient;
  let anvil: Anvil;

  let account1: PrivateKeyAccount;
  let account2: PrivateKeyAccount;
  let hat1: bigint;
  let hat1_1: bigint;
  let hat1_1_1: bigint;
  let hat1_2: bigint;
  let hat1_2_1: bigint;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.GOERLI_RPC,
      startTimeout: 20000,
    });
    await anvil.start();

    account1 = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );
    account2 = privateKeyToAccount(
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
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

    hatsClient = new HatsClient({
      chainId: goerli.id,
      publicClient: publicClient,
      walletClient: walletClient,
    });

    const resHat1 = await hatsClient.mintTopHat({
      target: account1.address,
      details: "Tophat SDK",
      imageURI: "Tophat URI",
      account: account1,
    });
    hat1 = resHat1.hatId;

    const resHat1_1 = await hatsClient.createHat({
      admin: hat1,
      maxSupply: 3,
      eligibility: account1.address,
      toggle: account1.address,
      mutable: true,
      details: "1.1 details",
      imageURI: "1.1 URI",
      account: account1,
    });
    hat1_1 = resHat1_1.hatId;

    const resHat1_1_1 = await hatsClient.createHat({
      admin: hat1_1,
      maxSupply: 3,
      eligibility: account1.address,
      toggle: account1.address,
      mutable: true,
      details: "1.1 details",
      imageURI: "1.1 URI",
      account: account1,
    });
    hat1_1_1 = resHat1_1_1.hatId;

    const resHat1_2 = await hatsClient.createHat({
      admin: hat1,
      maxSupply: 3,
      eligibility: account1.address,
      toggle: account1.address,
      mutable: true,
      details: "1.1 details",
      imageURI: "1.1 URI",
      account: account1,
    });
    hat1_2 = resHat1_2.hatId;

    const resHat1_2_1 = await hatsClient.createHat({
      admin: hat1_2,
      maxSupply: 3,
      eligibility: account1.address,
      toggle: account1.address,
      mutable: true,
      details: "1.1 details",
      imageURI: "1.1 URI",
      account: account1,
    });
    hat1_2_1 = resHat1_2_1.hatId;
  }, 30000);

  describe("Allow List Eligibility Scenario 1 Tests", () => {
    let allowListInstance: Address;

    beforeAll(async () => {
      const resAllowListInstance = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
        hatId: hat1_1_1,
        immutableArgs: [hat1, hat1_1],
        mutableArgs: [[]],
      });
      allowListInstance = resAllowListInstance.newInstance;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: allowListInstance,
      });
    }, 30000);

    test("Test getRolesOfHatInInstance with owner hat", async () => {
      const rolesHat1 = await hatsModulesClient.getRolesOfHatInInstance(
        allowListInstance,
        hat1
      );
      const allowListModule = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      );
      expect(rolesHat1.length).toBe(1);
      expect(rolesHat1[0]).toStrictEqual(allowListModule?.roles[2]);
    }, 30000);

    test("Test getRolesOfHatInInstance with arbitrator hat", async () => {
      const rolesHat1_1 = await hatsModulesClient.getRolesOfHatInInstance(
        allowListInstance,
        hat1_1
      );
      const allowListModule = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      );
      expect(rolesHat1_1.length).toBe(1);
      expect(rolesHat1_1[0]).toStrictEqual(allowListModule?.roles[3]);
    }, 30000);

    test("Test getRolesOfHatInInstance with a no-role hat", async () => {
      const rolesHat1_1_1 = await hatsModulesClient.getRolesOfHatInInstance(
        allowListInstance,
        hat1_1_1
      );

      expect(rolesHat1_1_1.length).toBe(0);
    }, 30000);
  });

  describe("Allow List Eligibility Scenario 2 Tests", () => {
    let allowListInstance: Address;

    beforeAll(async () => {
      const resAllowListInstance = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
        hatId: hat1_1_1,
        immutableArgs: [hat1_1, hat1_1],
        mutableArgs: [[]],
      });
      allowListInstance = resAllowListInstance.newInstance;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: allowListInstance,
      });
    }, 30000);

    test("Test getRolesOfHatInInstance with owner and arbitrator hat", async () => {
      const rolesHat1_1 = await hatsModulesClient.getRolesOfHatInInstance(
        allowListInstance,
        hat1_1
      );
      const allowListModule = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      );
      expect(rolesHat1_1.length).toBe(2);
      expect(rolesHat1_1[0]).toStrictEqual(allowListModule?.roles[2]);
      expect(rolesHat1_1[1]).toStrictEqual(allowListModule?.roles[3]);
    }, 30000);

    test("Test getRolesOfHatInInstance with a no-role hat", async () => {
      const rolesHat1_1_1 = await hatsModulesClient.getRolesOfHatInInstance(
        allowListInstance,
        hat1_1_1
      );

      expect(rolesHat1_1_1.length).toBe(0);
    }, 30000);
  });

  afterAll(async () => {
    await anvil.stop();
  }, 30000);
});
