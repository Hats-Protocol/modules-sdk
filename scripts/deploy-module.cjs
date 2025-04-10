require("dotenv").config();
const { HatsModulesClient } = require("../dist/modules-sdk.cjs.js");
const { createPublicClient, createWalletClient, http } = require("viem");
const { baseSepolia } = require("viem/chains");
const { mnemonicToAccount } = require("viem/accounts");
const fs = require("fs");

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

async function deployModule() {
  const hatsModulesClient = new HatsModulesClient({
    publicClient,
    walletClient,
  });

  const modulesFile = new URL("../test/modules.json", require("url").pathToFileURL(__filename).toString());
  const data = fs.readFileSync(modulesFile, "utf-8");
  const registryModules = JSON.parse(data);
  console.log("registryModules", registryModules);

  await hatsModulesClient.prepare(registryModules);
  console.log("hatsModulesClient", hatsModulesClient.getModules());

  const ERC20_ELIGIBILITY_MODULE_ADDRESS = "0xbA5b218e6685D0607139c06f81442681a32a0EC3";
  // args ["0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6", BigInt("100000000000")]
  const createInstanceResult = await hatsModulesClient.createNewInstance({
    account: account.address,
    moduleId: ERC20_ELIGIBILITY_MODULE_ADDRESS,
    hatId: BigInt("4556231398137151659071009449976284802028718985925527868590404038295552"),
    immutableArgs: ["0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6", BigInt("100000000000")],
    mutableArgs: [],
  });

  // eslint-disable-next-line no-console
  console.log(createInstanceResult);
}

deployModule();
