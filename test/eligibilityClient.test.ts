import { EligibilityClient } from "../src/index";
import { createPublicClient, createWalletClient, http } from "viem";
import { goerli } from "viem/chains";
import { createAnvil } from "@viem/anvil";
import { privateKeyToAccount } from "viem/accounts";
import type {
  PublicClient,
  WalletClient,
  Address,
  PrivateKeyAccount,
} from "viem";
import type { Anvil } from "@viem/anvil";
import "dotenv/config";

describe("Eligibility Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let eligibilityClient: EligibilityClient;
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
    eligibilityClient = new EligibilityClient({
      publicClient,
      walletClient,
      chainId: "5",
    });
  }, 30000);

  test("Test create new instance", async () => {
    const modules = eligibilityClient.getAllModules();
    const moduleIds = Object.keys(modules);
    console.log("moduleIds", moduleIds);

    const res = await eligibilityClient.createNewInstance({
      account: deployerAccount,
      moduleId: moduleIds[0],
      hatId: BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000"
      ),
      immutableArgs: [],
      mutableArgs: [
        1690803340n,
        1n,
        BigInt(
          "0x0000000100000000000000000000000000000000000000000000000000000000"
        ),
      ],
    });
    console.log("instance:", res.newInstance);
    expect(1).toBe(1);
  });

  afterAll(async () => {
    await anvil.stop();
  }, 30000);
});
