import { HatsModulesClient } from "../src/index";
import { HatsClient } from "@hatsprotocol/sdk-v1-core";
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

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.SEPOLIA_RPC,
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

    hatsClient = new HatsClient({
      chainId: sepolia.id,
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

    await hatsClient.mintHat({
      account: account1,
      hatId: hat1_1,
      wearer: account2.address,
    });
  }, 30000);

  describe("Allow List Eligibility Write Functions", () => {
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

    test("Test addAccount", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
          instance: allowListInstance,
          func: module?.writeFunctions[0],
          args: [account2.address],
        });
      }).rejects.toThrow(
        "Error: the caller does not wear the module's Owner Hat"
      );

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
          instance: allowListInstance,
          func: module?.writeFunctions[0],
          args: [1],
        });
      }).rejects.toThrow(
        "Error: received an invalid value for parameter 'Account'"
      );

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
        instance: allowListInstance,
        func: module?.writeFunctions[0],
        args: [account2.address],
      });

      const eligibilityRes = (await publicClient.readContract({
        address: allowListInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account2.address, hat1_1_1],
      })) as boolean[];

      expect(res.status).toBe("success");
      expect(eligibilityRes[0]).toBe(true);
    }, 30000);

    test("Test removeAccount", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      ) as Module;

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
        instance: allowListInstance,
        func: module?.writeFunctions[2],
        args: [account2.address],
      });

      const eligibilityRes = (await publicClient.readContract({
        address: allowListInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account2.address, hat1_1_1],
      })) as boolean[];

      expect(res.status).toBe("success");
      expect(eligibilityRes[0]).toBe(false);
    }, 30000);

    test("Test addAccounts", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      ) as Module;

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
        instance: allowListInstance,
        func: module?.writeFunctions[1],
        args: [[account1.address, account2.address]],
      });

      const eligibilityRes1 = (await publicClient.readContract({
        address: allowListInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account1.address, hat1_1_1],
      })) as boolean[];
      const eligibilityRes2 = (await publicClient.readContract({
        address: allowListInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account2.address, hat1_1_1],
      })) as boolean[];

      expect(res.status).toBe("success");
      expect(eligibilityRes1[0]).toBe(true);
      expect(eligibilityRes2[0]).toBe(true);
    }, 30000);

    test("Test removeAccounts", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      ) as Module;

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
        instance: allowListInstance,
        func: module?.writeFunctions[4],
        args: [[account1.address, account2.address]],
      });

      const eligibilityRes1 = (await publicClient.readContract({
        address: allowListInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account1.address, hat1_1_1],
      })) as boolean[];
      const eligibilityRes2 = (await publicClient.readContract({
        address: allowListInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account2.address, hat1_1_1],
      })) as boolean[];

      expect(res.status).toBe("success");
      expect(eligibilityRes1[0]).toBe(false);
      expect(eligibilityRes2[0]).toBe(false);
    }, 30000);

    test("Test setStandingForAccount", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
          instance: allowListInstance,
          func: module?.writeFunctions[5],
          args: [account2.address, false],
        });
      }).rejects.toThrow(
        "Error: the caller does not wear the module's Arbitrator Hat"
      );

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account2,
        moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
        instance: allowListInstance,
        func: module?.writeFunctions[5],
        args: [account2.address, false],
      });

      const standingRes = (await publicClient.readContract({
        address: allowListInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account2.address, hat1_1_1],
      })) as boolean[];

      expect(res.status).toBe("success");
      expect(standingRes[1]).toBe(false);
    }, 30000);

    test("Test removeAccountAndBurnHat", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
          instance: allowListInstance,
          func: module?.writeFunctions[3],
          args: [account2.address],
        });
      }).rejects.toThrow(
        "Error: Attempting to burn a hat that an account is not wearing"
      );
    }, 30000);

    test("Test setStandingForAccounts", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5",
          instance: allowListInstance,
          func: module?.writeFunctions[7],
          args: [[account2.address], [true, false]],
        });
      }).rejects.toThrow("Error: array arguments are not of the same length");
    }, 30000);
  });

  describe("Hat Elections Eligibility Write Functions", () => {
    let hatElectionsInstance: Address;
    let electionsEndTime: bigint;

    beforeAll(async () => {
      const block = await publicClient.getBlock();
      electionsEndTime = block.timestamp + 3600n;

      const hatElectionsInstanceRes = await hatsModulesClient.createNewInstance(
        {
          account: account1,
          moduleId: "0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E",
          hatId: hat1_1_1,
          immutableArgs: [hat1_1, hat1_2],
          mutableArgs: [electionsEndTime],
        }
      );
      hatElectionsInstance = hatElectionsInstanceRes.newInstance;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: hatElectionsInstance,
      });
    }, 30000);

    test("Test elect", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: "0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E",
          instance: hatElectionsInstance,
          func: module?.writeFunctions[1],
          args: [electionsEndTime, [account1.address]],
        });
      }).rejects.toThrow(
        "Error: the caller does not wear the module's Ballot Box Hat"
      );

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account2,
        moduleId: "0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E",
        instance: hatElectionsInstance,
        func: module?.writeFunctions[1],
        args: [electionsEndTime, [account1.address]],
      });

      const eligibilityRes = (await publicClient.readContract({
        address: hatElectionsInstance,
        abi: module.abi,
        functionName: "getWearerStatus",
        args: [account1.address, hat1_1_1],
      })) as boolean[];

      expect(res.status).toBe("success");
      expect(eligibilityRes[0]).toBe(true);
    }, 30000);
  });

  describe("JokeRace Eligibility Write Functions", () => {
    let jokeraceInstance: Address;
    let electionsEndTime: bigint;

    beforeAll(async () => {
      const block = await publicClient.getBlock();
      electionsEndTime = block.timestamp + 3600n;

      const jokeraceInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a",
        hatId: hat1_1_1,
        immutableArgs: [hat1_1],
        mutableArgs: [
          "0xc5E226Caec417de53A38Fc63242291e474772274",
          electionsEndTime,
          3n,
        ],
      });
      jokeraceInstance = jokeraceInstanceRes.newInstance;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: jokeraceInstance,
      });
    }, 30000);

    test("Test pullElectionResults and reelection", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a",
          instance: jokeraceInstance,
          func: module?.writeFunctions[1],
          args: [
            "0x8E612AD3CD04981A69e8ad532b5c20466e3Af5E0",
            electionsEndTime,
            5n,
          ],
        });
      }).rejects.toThrow(
        "Error: can only set a new election once the current term has ended"
      );

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account2,
        moduleId: "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a",
        instance: jokeraceInstance,
        func: module?.writeFunctions[0],
        args: [],
      });

      expect(res.status).toBe("success");
    }, 30000);
  });

  describe("Passthrough Eligibility Write Functions", () => {
    let passthroughInstance: Address;

    beforeAll(async () => {
      const passthroughInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: "0x050079a8fbFCE76818C62481BA015b89567D2d35",
        hatId: hat1_1_1,
        immutableArgs: [hat1_1],
        mutableArgs: [],
      });
      passthroughInstance = passthroughInstanceRes.newInstance;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: passthroughInstance,
      });
    }, 30000);

    test("Test setHatWearerStatus", async () => {
      const module = hatsModulesClient.getModuleById(
        "0x050079a8fbFCE76818C62481BA015b89567D2d35"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: "0x050079a8fbFCE76818C62481BA015b89567D2d35",
          instance: passthroughInstance,
          func: module?.writeFunctions[0],
          args: [hat1_1_1, account2.address, false, false],
        });
      }).rejects.toThrow(
        "Error: caller is not wearing the eligibility/toggle passthrough hat"
      );

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account2,
        moduleId: "0x050079a8fbFCE76818C62481BA015b89567D2d35",
        instance: passthroughInstance,
        func: module?.writeFunctions[0],
        args: [hat1_1_1, account2.address, false, false],
      });

      expect(res.status).toBe("success");
    }, 30000);
  });

  describe("Season Toggle Write Functions", () => {
    let seasonInstance: Address;

    beforeAll(async () => {
      const seasonInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: "0xFb6bD2e96B123d0854064823f6cb59420A285C00",
        hatId: hat1_2,
        immutableArgs: [],
        mutableArgs: [2592000n, 5000n],
      });
      seasonInstance = seasonInstanceRes.newInstance;

      await hatsClient.changeHatToggle({
        account: account1,
        hatId: hat1_2,
        newToggle: seasonInstance,
      });
    }, 30000);

    test("Test extend", async () => {
      const module = hatsModulesClient.getModuleById(
        "0xFb6bD2e96B123d0854064823f6cb59420A285C00"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: "0xFb6bD2e96B123d0854064823f6cb59420A285C00",
          instance: seasonInstance,
          func: module?.writeFunctions[0],
          args: [2592000n, 5000n],
        });
      }).rejects.toThrow(
        "Error: caller is not an admin of the season toggle branch"
      );
    }, 30000);
  });

  describe("Staking Eligibility Write Functions", () => {
    let stakingInstance: Address;

    beforeAll(async () => {
      const stakingInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7",
        hatId: hat1_1_1,
        immutableArgs: ["0x1d256A1154382921067d4B17CA52209f2d3bE106"],
        mutableArgs: [100n, hat1_1, hat1_1, 86400n],
      });
      stakingInstance = stakingInstanceRes.newInstance;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: stakingInstance,
      });
    }, 30000);

    test("Test slash", async () => {
      const module = hatsModulesClient.getModuleById(
        "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7"
      ) as Module;

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7",
          instance: stakingInstance,
          func: module?.writeFunctions[8],
          args: [account2.address],
        });
      }).rejects.toThrow("Error: caller is not wearing the Judge Hat");
    }, 30000);
  });

  afterAll(async () => {
    await anvil.stop();
  }, 30000);
});
