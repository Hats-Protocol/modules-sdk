/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const { HatsModulesClient } = require("../dist/modules-sdk.cjs.js");
const { createPublicClient, createWalletClient, http } = require("viem");
const { gnosis } = require("viem/chains");
const { mnemonicToAccount } = require("viem/accounts");

const { MNEMONIC, RPC_URL } = process.env;
if (!MNEMONIC) {
  throw new Error("MNEMONIC is not set");
}
const account = mnemonicToAccount(MNEMONIC);
const chain = gnosis;

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

  const HAT_WEARING_MODULE_ADDRESS = "0x0afb6ac83535fd8634765e1317318458a145f441b27e3766a163df5e03800380";
  // args [hatId]
  const createHatWearingInstanceResult = await hatsModulesClient.createNewInstance({
    account: account.address,
    moduleId: HAT_WEARING_MODULE_ADDRESS,
    hatId: BigInt("0"),
    immutableArgs: [BigInt("2480315504797938382473669724146536744685568975771049426761313431846912")],
    mutableArgs: [],
  });

  // eslint-disable-next-line no-console
  console.log(createHatWearingInstanceResult);
}

main();
