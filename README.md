# Hats-Protocol Modules SDK

## Documentation

Detailed documentation can be found [here](https://docs.hatsprotocol.xyz/for-developers/hats-modules/modules-sdk)

## Contributing

Tests are run with Jest via `pnpm test`.

To run a specific test file, update the test script in `package.json` to include the test file name.

`pnpm jest eligibilitiesChain.test.ts -i`

To run a specific test, update the test script in `package.json` to include the test file name and the test name with the `-t` flag.

`pnpm jest withRegistry.test.ts -t 'Eligibility Client Tests Test create all modules' -i`

## Actions

Accepted contributions need to match the passing tests. The action is run on PR branches to ensure this.
