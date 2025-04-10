import { createPublicClient, createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { HatsModulesClient } from "../src";

const { MNEMONIC, RPC_URL } = process.env;
if (!MNEMONIC) {
  throw new Error("MNEMONIC is not set");
}
const account = mnemonicToAccount(MNEMONIC);
const chain = baseSepolia;

const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account: account.address,
  chain,
  transport: http(RPC_URL),
});

async function main() {
  const hatsModulesClient = new HatsModulesClient({
    publicClient,
    walletClient,
  });
  await hatsModulesClient.prepare();

  const CLAIMS_HATTER_MODULE_ADDRESS = "0xa6736b79820695b7014d72937d271224ac9cd523d067bc271c5238cacfa8d16c";
  const createInstanceResult = await hatsModulesClient.createNewInstance({
    account: account.address,
    moduleId: CLAIMS_HATTER_MODULE_ADDRESS,
    hatId: BigInt("4556231398137151659071009449976284802028718985925527868590404038295552"),
    immutableArgs: [],
    mutableArgs: [
      [
        BigInt("4556231398137151659071009449976284802028718985925527868590404038295552"),
        BigInt("4556231398130874557335622769212449012605511319509425513145940003782656"),
      ], // initial Hat IDs to be claimable
      [2, 1], // initial claimability types (1 = claimable by, 2 = claimable for)
    ],
  });

  // eslint-disable-next-line no-console
  console.log(createInstanceResult);
}

main();
