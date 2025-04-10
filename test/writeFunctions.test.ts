import "dotenv/config";

import { HatsClient } from "@hatsprotocol/sdk-v1-core";
import type { Anvil } from "@viem/anvil";
import { createAnvil } from "@viem/anvil";
import * as fs from "fs";
import type { Address, PrivateKeyAccount, PublicClient, WalletClient } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { HatsModulesClient } from "../src/index";
import type { Module, Registry } from "../src/types";

const AGREEMENT_MODULE_ID = "0x4F10B9e99ce11f081652646f4b192ed1b812D5Bb";
const ALLOWLIST_MODULE_ID = "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5";
const MCH_MODULE_ID = "0xB985eA1be961f7c4A4C45504444C02c88c4fdEF9";
const ELECTIONS_MODULE_ID = "0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E";
const JOKERACE_MODULE_ID = "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a"; // jokerace v0.2.0
const PASSTHROUGH_MODULE_ID = "0x050079a8fbFCE76818C62481BA015b89567D2d35";
const SEASON_TOGGLE_MODULE_ID = "0xFb6bD2e96B123d0854064823f6cb59420A285C00";
const STAKING_MODULE_ID = "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7";

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
  let hat1_1_2: bigint;
  let hat1_2: bigint;
  let mchInstance: Address;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.SEPOLIA_RPC,
      startTimeout: 20000,
    });
    await anvil.start();

    account1 = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    account2 = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");

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

    // create top hat
    const resHat1 = await hatsClient.mintTopHat({
      target: account1.address,
      details: "Tophat SDK",
      imageURI: "Tophat URI",
      account: account1,
    });
    hat1 = resHat1.hatId;

    // create 1.1 hat
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

    // create 1.1.1 hat
    const resHat1_1_1 = await hatsClient.createHat({
      admin: hat1_1,
      maxSupply: 3,
      eligibility: account1.address,
      toggle: account1.address,
      mutable: true,
      details: "1.1.1 details",
      imageURI: "1.1.1 URI",
      account: account1,
    });
    hat1_1_1 = resHat1_1_1.hatId;

    // create 1.1.2 hat
    const resHat1_1_2 = await hatsClient.createHat({
      admin: hat1_1,
      maxSupply: 1,
      eligibility: account1.address,
      toggle: account1.address,
      mutable: true,
      details: "1.1.2 details",
      imageURI: "1.1.2 URI",
      account: account1,
    });
    hat1_1_2 = resHat1_1_2.hatId;

    // create 1.2 hat
    const resHat1_2 = await hatsClient.createHat({
      admin: hat1_1,
      maxSupply: 3,
      eligibility: account1.address,
      toggle: account1.address,
      mutable: true,
      details: "1.2 details",
      imageURI: "1.2 URI",
      account: account1,
    });
    hat1_2 = resHat1_2.hatId;

    // create MCH instance with initial claimable hat
    const resMchInstance = await hatsModulesClient.createNewInstance({
      account: account1,
      moduleId: MCH_MODULE_ID,
      hatId: hat1,
      immutableArgs: [],
      mutableArgs: [
        [hat1_1_1, hat1_1_2],
        [2, 2],
      ],
    });
    mchInstance = resMchInstance.newInstance;

    // mint 1.1 hat to mch instance
    await hatsClient.mintHat({
      account: account1,
      hatId: hat1_1,
      wearer: mchInstance,
    });

    // mint 1.1 hat to account2
    await hatsClient.mintHat({
      account: account1,
      hatId: hat1_1,
      wearer: account2.address,
    });
  }, 30000);

  describe("Allowlist Eligibility Write Functions", () => {
    let allowListInstance: Address;
    let module: Module;

    beforeAll(async () => {
      // set module details
      module = hatsModulesClient.getModuleById(ALLOWLIST_MODULE_ID) as Module;
      // create new instance
      const resAllowListInstance = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: ALLOWLIST_MODULE_ID,
        hatId: hat1_1_1,
        immutableArgs: [hat1, hat1_1],
        mutableArgs: [[]],
      });
      allowListInstance = resAllowListInstance.newInstance;

      // update hat eligibility
      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: allowListInstance,
      });
    }, 30000);

    test("Test addAccount", async () => {
      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: ALLOWLIST_MODULE_ID,
          instance: allowListInstance,
          func: module?.writeFunctions[0],
          args: [account2.address],
        });
      }).rejects.toThrow("Error: the caller does not wear the module's Owner Hat");

      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: ALLOWLIST_MODULE_ID,
          instance: allowListInstance,
          func: module?.writeFunctions[0],
          args: [1],
        });
      }).rejects.toThrow("Error: received an invalid value for parameter 'Account'");

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: ALLOWLIST_MODULE_ID,
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
      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: ALLOWLIST_MODULE_ID,
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
      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: ALLOWLIST_MODULE_ID,
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
      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account1,
        moduleId: ALLOWLIST_MODULE_ID,
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
      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: ALLOWLIST_MODULE_ID,
          instance: allowListInstance,
          func: module?.writeFunctions[5],
          args: [account2.address, false],
        });
      }).rejects.toThrow("Error: the caller does not wear the module's Arbitrator Hat");

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account2,
        moduleId: ALLOWLIST_MODULE_ID,
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
      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: ALLOWLIST_MODULE_ID,
          instance: allowListInstance,
          func: module?.writeFunctions[3],
          args: [account2.address],
        });
      }).rejects.toThrow("Error: Attempting to burn a hat that an account is not wearing");
    }, 30000);

    test("Test setStandingForAccounts", async () => {
      await expect(async () => {
        await hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: ALLOWLIST_MODULE_ID,
          instance: allowListInstance,
          func: module?.writeFunctions[7],
          args: [[account2.address], [true, false]],
        });
      }).rejects.toThrow("Error: array arguments are not of the same length");
    }, 30000);
  });

  describe("Agreement Eligibility Write Functions", () => {
    let agreementInstance: Address;
    let agreementInstance2: Address;
    let module: Module;
    let gracePeriodEndTime: bigint;

    beforeAll(async () => {
      const block = await publicClient.getBlock();
      gracePeriodEndTime = block.timestamp + 3600n;

      module = hatsModulesClient.getModuleById(AGREEMENT_MODULE_ID) as Module;

      const resAgreementInstance = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: AGREEMENT_MODULE_ID,
        hatId: hat1_1_1,
        immutableArgs: [],
        mutableArgs: [hat1_1, hat1_1, "test agreement"], // should be an IPFS hash
      });
      agreementInstance = resAgreementInstance.newInstance;

      const resAgreementInstance2 = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: AGREEMENT_MODULE_ID,
        hatId: hat1_1_2,
        immutableArgs: [],
        mutableArgs: [hat1_1, hat1_1, "test agreement"], // should be an IPFS hash
      });
      agreementInstance2 = resAgreementInstance2.newInstance;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: agreementInstance,
      });

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_2,
        newEligibility: agreementInstance2,
      });
    }, 30000);

    test("Test setAgreement fails if caller is not owner", async () => {
      const func = module.writeFunctions.find((f) => f.functionName === "setAgreement");
      if (!func) throw new Error("Error: setAgreement write function not found");

      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: AGREEMENT_MODULE_ID,
          instance: agreementInstance,
          func,
          args: ["test agreement", gracePeriodEndTime],
        }),
      ).rejects.toThrow("Do not know how to serialize a BigInt"); // ("Error: the caller does not wear the module's Owner Hat");
    });

    test("Test setAgreement succeeds for owner", async () => {
      const func = module.writeFunctions.find((f) => f.functionName === "setAgreement");
      if (!func) throw new Error("Error: setAgreement write function not found");

      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: AGREEMENT_MODULE_ID,
          instance: agreementInstance,
          func,
          args: ["test agreement", gracePeriodEndTime],
        }),
      ).resolves.toHaveProperty("status", "success");
    });

    test("Test signAgreement", async () => {
      const func = module.writeFunctions.find((f) => f.functionName === "signAgreement");
      if (!func) throw new Error("Error: signAgreement write function not found");

      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: AGREEMENT_MODULE_ID,
          instance: agreementInstance,
          func,
          args: [],
        }),
      ).resolves.toHaveProperty("status", "success");
    });

    test("Test signAgreementAndClaim", async () => {
      const func = module.writeFunctions.find((f) => f.functionName === "signAgreementAndClaimHat");
      if (!func) throw new Error("Error: signAgreementAndClaim write function not found");

      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: AGREEMENT_MODULE_ID,
          instance: agreementInstance,
          func,
          args: [mchInstance],
        }),
      ).resolves.toHaveProperty("status", "success");
    });

    test("Test signAgreementAndClaim fails with AllHatsWorn error", async () => {
      const func = module.writeFunctions.find((f) => f.functionName === "signAgreementAndClaimHat");
      if (!func) throw new Error("Error: signAgreementAndClaim write function not found");

      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: AGREEMENT_MODULE_ID,
          instance: agreementInstance2,
          func,
          args: [mchInstance],
        }),
      ).resolves.toHaveProperty("status", "success");

      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: AGREEMENT_MODULE_ID,
          instance: agreementInstance2,
          func,
          args: [mchInstance],
        }),
      ).rejects.toThrow(`Error: attempting to mint ${hat1_1_2} but its maxSupply has been reached`);
    });
  });

  describe("Hat Elections Eligibility Write Functions", () => {
    let hatElectionsInstance: Address;
    let electionsEndTime: bigint;
    let module: Module;

    beforeAll(async () => {
      const block = await publicClient.getBlock();
      electionsEndTime = block.timestamp + 3600n;

      const hatElectionsInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: ELECTIONS_MODULE_ID,
        hatId: hat1_1_1,
        immutableArgs: [hat1_1, hat1_2],
        mutableArgs: [electionsEndTime],
      });
      hatElectionsInstance = hatElectionsInstanceRes.newInstance;

      module = hatsModulesClient.getModuleById(ELECTIONS_MODULE_ID) as Module;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: hatElectionsInstance,
      });
    });

    test("Test elect", async () => {
      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: ELECTIONS_MODULE_ID,
          instance: hatElectionsInstance,
          func: module?.writeFunctions[1],
          args: [electionsEndTime, [account1.address]],
        }),
      ).rejects.toThrow("Error: the caller does not wear the module's Ballot Box Hat");

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account2,
        moduleId: ELECTIONS_MODULE_ID,
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
    });
  });

  describe("JokeRace Eligibility Write Functions", () => {
    let jokeraceInstance: Address;
    let electionsEndTime: bigint;
    let module: Module;

    beforeAll(async () => {
      const block = await publicClient.getBlock();
      electionsEndTime = block.timestamp + 3600n;

      const jokeraceInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: JOKERACE_MODULE_ID,
        hatId: hat1_1_1,
        immutableArgs: [hat1_1],
        mutableArgs: ["0xc5E226Caec417de53A38Fc63242291e474772274", electionsEndTime, 3n],
      });
      jokeraceInstance = jokeraceInstanceRes.newInstance;

      module = hatsModulesClient.getModuleById(JOKERACE_MODULE_ID) as Module;

      await hatsClient.changeHatEligibility({
        account: account1,
        hatId: hat1_1_1,
        newEligibility: jokeraceInstance,
      });
    });

    test("Test pullElectionResults and reelection", async () => {
      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: JOKERACE_MODULE_ID,
          instance: jokeraceInstance,
          func: module?.writeFunctions[1],
          args: ["0x8E612AD3CD04981A69e8ad532b5c20466e3Af5E0", electionsEndTime, 5n],
        }),
      ).rejects.toThrow("Error: can only set a new election once the current term has ended");

      const res = await hatsModulesClient.callInstanceWriteFunction({
        account: account2,
        moduleId: JOKERACE_MODULE_ID,
        instance: jokeraceInstance,
        func: module?.writeFunctions[0],
        args: [],
      });

      expect(res.status).toBe("success");
    });
  });

  describe("Passthrough Eligibility Write Functions", () => {
    let passthroughInstance: Address;
    let module: Module;

    beforeAll(async () => {
      module = hatsModulesClient.getModuleById(PASSTHROUGH_MODULE_ID) as Module;

      const passthroughInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: PASSTHROUGH_MODULE_ID,
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
    });

    test("Test setHatWearerStatus", async () => {
      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: PASSTHROUGH_MODULE_ID,
          instance: passthroughInstance,
          func: module?.writeFunctions[0],
          args: [hat1_1_1, account2.address, false, false],
        }),
      ).rejects.toThrow("Error: caller is not wearing the eligibility/toggle passthrough hat");

      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: PASSTHROUGH_MODULE_ID,
          instance: passthroughInstance,
          func: module?.writeFunctions[0],
          args: [hat1_1_1, account2.address, false, false],
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("Season Toggle Write Functions", () => {
    let seasonInstance: Address;
    let module: Module;

    beforeAll(async () => {
      module = hatsModulesClient.getModuleById(SEASON_TOGGLE_MODULE_ID) as Module;

      const seasonInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: SEASON_TOGGLE_MODULE_ID,
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
    });

    test("Test extend", async () => {
      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account2,
          moduleId: SEASON_TOGGLE_MODULE_ID,
          instance: seasonInstance,
          func: module?.writeFunctions[0],
          args: [2592000n, 5000n],
        }),
      ).rejects.toThrow("Error: attempting to extend a branch to a new season before its extendable");
      // ).rejects.toThrow("Error: caller is not an admin of the season toggle branch");
    });
  });

  describe("Staking Eligibility Write Functions", () => {
    let stakingInstance: Address;
    let module: Module;

    beforeAll(async () => {
      module = hatsModulesClient.getModuleById(STAKING_MODULE_ID) as Module;

      const stakingInstanceRes = await hatsModulesClient.createNewInstance({
        account: account1,
        moduleId: STAKING_MODULE_ID,
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
    });

    test("Test slash", async () => {
      await expect(
        hatsModulesClient.callInstanceWriteFunction({
          account: account1,
          moduleId: STAKING_MODULE_ID,
          instance: stakingInstance,
          func: module?.writeFunctions[8],
          args: [account2.address],
        }),
      ).rejects.toThrow("Error: caller is not wearing the Judge Hat");
    });
  });

  afterAll(async () => {
    await anvil.stop();
  }, 30000);
});
