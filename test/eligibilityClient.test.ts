import { EligibilityClient } from "../src/index";
import { createPublicClient, createWalletClient, http } from "viem";
import { goerli } from "viem/chains";
import type { PublicClient, WalletClient } from "viem";

describe("Eligibility Client Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let eligibilityClient: EligibilityClient;

  beforeAll(async () => {
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
    });
  }, 30000);

  test("temp", () => {
    expect(1).toBe(1);
  });
});
