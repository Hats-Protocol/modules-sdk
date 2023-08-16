import { HatsModulesClient } from "../src/index";
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
import type { Module } from "../src/types";
import "dotenv/config";

describe("Eligibility Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.GOERLI_RPC,
      forkBlockNumber: 9428126n,
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

    // init jokerace eligibility and hats clients
    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
      chainId: "5",
    });

    await hatsModulesClient.prepare();
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test create new jokerace instance", async () => {
    const jokeraceId =
      "0x27ed8ea37bc9ab5183ee6b34a3ea9a0d48fd68cd2069f01925617060c467d51e";
    const module = hatsModulesClient.getModuleById(jokeraceId) as Module;
    const adminHat = BigInt(
      "0x0000000100000000000000000000000000000000000000000000000000000000"
    );
    const underlyingContest = "0x0000000000000000000000000000000000000001";
    const termEnd = 1690803340n;
    const topK = 1n;

    const res = await hatsModulesClient.createNewInstance({
      account: deployerAccount,
      moduleId: jokeraceId,
      hatId: adminHat,
      immutableArgs: [adminHat],
      mutableArgs: [underlyingContest, termEnd, topK],
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
    expect(adminHatResult).toBe(adminHat);
    expect(underlyingContestResult).toBe(underlyingContest);
    expect(termEndResult).toBe(termEnd);
    expect(topKResult).toBe(topK);
  });
});
