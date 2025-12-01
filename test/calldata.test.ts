import "dotenv/config";

import * as fs from "fs";
import {
  type Address,
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { sepolia } from "viem/chains";

import { HATS_MODULES_FACTORY_ABI } from "../src/constants";
import { HatsModulesClient } from "../src/index";
import type { Module, Registry } from "../src/types";
import { prepareArgs } from "./utils";

const ERC20_MODULE_ID = "0xbA5b218e6685D0607139c06f81442681a32a0EC3";
const ERC721_MODULE_ID = "0xF37cf12fB4493D29270806e826fDDf50dd722bab";
const STAKING_MODULE_ID = "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7";
const ALLOWLIST_MODULE_ID = "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5";

describe("Calldata Functions Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let registryModules: Registry;

  beforeAll(async () => {
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

  describe("createNewInstanceCalldata", () => {
    test("generates valid calldata for ERC20 module", () => {
      const module = hatsModulesClient.getModuleById(ERC20_MODULE_ID) as Module;
      const hatId = BigInt("0x0000000100000000000000000000000000000000000000000000000000000000");
      const immutableArgs = prepareArgs({ args: module.creationArgs.immutable });
      const mutableArgs = prepareArgs({ args: module.creationArgs.mutable });
      const saltNonce = BigInt(1);

      const result = hatsModulesClient.createNewInstanceCalldata({
        moduleId: ERC20_MODULE_ID,
        hatId,
        immutableArgs,
        mutableArgs,
        saltNonce,
      });

      expect(result.functionName).toBe("createHatsModule");
      expect(result.callData).toMatch(/^0x/);

      const decoded = decodeFunctionData({
        abi: HATS_MODULES_FACTORY_ABI,
        data: result.callData,
      });

      expect(decoded.functionName).toBe("createHatsModule");
      expect(decoded.args?.[0]).toBe(module.implementationAddress);
      expect(decoded.args?.[1]).toBe(hatId);
      expect(decoded.args?.[4]).toBe(saltNonce);
    });

    test("generates valid calldata for staking module with mutable args", () => {
      const module = hatsModulesClient.getModuleById(STAKING_MODULE_ID) as Module;
      const hatId = BigInt("0x0000000100000000000000000000000000000000000000000000000000000000");
      const immutableArgs = prepareArgs({ args: module.creationArgs.immutable });
      const mutableArgs = prepareArgs({ args: module.creationArgs.mutable });
      const saltNonce = BigInt(12345);

      const result = hatsModulesClient.createNewInstanceCalldata({
        moduleId: STAKING_MODULE_ID,
        hatId,
        immutableArgs,
        mutableArgs,
        saltNonce,
      });

      expect(result.functionName).toBe("createHatsModule");
      expect(result.callData).toMatch(/^0x/);

      const decoded = decodeFunctionData({
        abi: HATS_MODULES_FACTORY_ABI,
        data: result.callData,
      });

      expect(decoded.functionName).toBe("createHatsModule");
      expect(decoded.args?.[0]).toBe(module.implementationAddress);
      expect(decoded.args?.[1]).toBe(hatId);
      expect(decoded.args?.[4]).toBe(saltNonce);
    });

    test("throws error for non-existent module", () => {
      const hatId = BigInt("0x0000000100000000000000000000000000000000000000000000000000000000");

      expect(() =>
        hatsModulesClient.createNewInstanceCalldata({
          moduleId: "0x0000000000000000000000000000000000000000",
          hatId,
          immutableArgs: [],
          mutableArgs: [],
          saltNonce: BigInt(1),
        }),
      ).toThrow("does not exist");
    });
  });

  describe("batchCreateNewInstancesCalldata", () => {
    test("generates valid calldata for multiple modules", () => {
      const erc20Module = hatsModulesClient.getModuleById(ERC20_MODULE_ID) as Module;
      const erc721Module = hatsModulesClient.getModuleById(ERC721_MODULE_ID) as Module;

      const hatId = BigInt("0x0000000100000000000000000000000000000000000000000000000000000000");

      const moduleImplementations: Address[] = [
        erc20Module.implementationAddress as Address,
        erc721Module.implementationAddress as Address,
      ];
      const hatIds = [hatId, hatId];
      const immutableArgsArray = [
        prepareArgs({ args: erc20Module.creationArgs.immutable }),
        prepareArgs({ args: erc721Module.creationArgs.immutable }),
      ];
      const mutableArgsArray = [
        prepareArgs({ args: erc20Module.creationArgs.mutable }),
        prepareArgs({ args: erc721Module.creationArgs.mutable }),
      ];
      const saltNonces = [BigInt(100), BigInt(200)];

      const result = hatsModulesClient.batchCreateNewInstancesCalldata({
        moduleImplementations,
        hatIds,
        immutableArgsArray,
        mutableArgsArray,
        saltNonces,
      });

      expect(result.functionName).toBe("batchCreateHatsModule");
      expect(result.callData).toMatch(/^0x/);

      const decoded = decodeFunctionData({
        abi: HATS_MODULES_FACTORY_ABI,
        data: result.callData,
      });

      expect(decoded.functionName).toBe("batchCreateHatsModule");
      expect(decoded.args?.[0]).toEqual(moduleImplementations);
      expect(decoded.args?.[1]).toEqual(hatIds);
      expect(decoded.args?.[4]).toEqual(saltNonces);
    });

    test("generates valid calldata for single module in batch", () => {
      const stakingModule = hatsModulesClient.getModuleById(STAKING_MODULE_ID) as Module;

      const hatId = BigInt("0x0000000200000000000000000000000000000000000000000000000000000000");

      const result = hatsModulesClient.batchCreateNewInstancesCalldata({
        moduleImplementations: [stakingModule.implementationAddress as Address],
        hatIds: [hatId],
        immutableArgsArray: [prepareArgs({ args: stakingModule.creationArgs.immutable })],
        mutableArgsArray: [prepareArgs({ args: stakingModule.creationArgs.mutable })],
        saltNonces: [BigInt(999)],
      });

      expect(result.functionName).toBe("batchCreateHatsModule");
      expect(result.callData).toMatch(/^0x/);

      const decoded = decodeFunctionData({
        abi: HATS_MODULES_FACTORY_ABI,
        data: result.callData,
      });

      expect(decoded.functionName).toBe("batchCreateHatsModule");
      expect((decoded.args?.[0] as Address[]).length).toBe(1);
      expect((decoded.args?.[1] as bigint[]).length).toBe(1);
    });
  });

  describe("callInstanceWriteFunctionCalldata", () => {
    test("generates valid calldata for allowlist addAccount function", () => {
      const allowlistModule = hatsModulesClient.getModuleById(ALLOWLIST_MODULE_ID) as Module;

      const result = hatsModulesClient.callInstanceWriteFunctionCalldata({
        implementation: allowlistModule.implementationAddress as Address,
        functionName: "addAccount",
        args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      });

      expect(result.functionName).toBe("addAccount");
      expect(result.callData).toMatch(/^0x/);

      const decoded = decodeFunctionData({
        abi: allowlistModule.abi,
        data: result.callData,
      });

      expect(decoded.functionName).toBe("addAccount");
      expect(decoded.args?.[0]).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    });

    test("generates valid calldata for allowlist addAccounts function with array", () => {
      const allowlistModule = hatsModulesClient.getModuleById(ALLOWLIST_MODULE_ID) as Module;

      const accounts = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"];

      const result = hatsModulesClient.callInstanceWriteFunctionCalldata({
        implementation: allowlistModule.implementationAddress as Address,
        functionName: "addAccounts",
        args: [accounts],
      });

      expect(result.functionName).toBe("addAccounts");
      expect(result.callData).toMatch(/^0x/);

      const decoded = decodeFunctionData({
        abi: allowlistModule.abi,
        data: result.callData,
      });

      expect(decoded.functionName).toBe("addAccounts");
      expect(decoded.args?.[0]).toEqual(accounts);
    });

    test("throws error for non-existent module", () => {
      expect(() =>
        hatsModulesClient.callInstanceWriteFunctionCalldata({
          implementation: "0x0000000000000000000000000000000000000000",
          functionName: "someFunction",
          args: [],
        }),
      ).toThrow("does not exist");
    });

    test("throws error for non-existent function", () => {
      const allowlistModule = hatsModulesClient.getModuleById(ALLOWLIST_MODULE_ID) as Module;

      expect(() =>
        hatsModulesClient.callInstanceWriteFunctionCalldata({
          implementation: allowlistModule.implementationAddress as Address,
          functionName: "nonExistentFunction",
          args: [],
        }),
      ).toThrow("does not exist");
    });
  });
});
