import { BaseError, ContractFunctionRevertedError } from "viem";

export class ChainIdMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChainIdMismatchError";
  }
}

export class MissingPublicClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingPublicClientError";
  }
}

export class MissingWalletClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingWalletClientError";
  }
}

export class TransactionRevertedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionRevertedError";
  }
}

export class ModuleNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleNotAvailableError";
  }
}

export class InvalidParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidParamError";
  }
}

export class ClientNotPreparedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientNotPreparedError";
  }
}

export class ParametersLengthsMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParametersLengthsMismatchError";
  }
}

export class ModulesRegistryFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModulesRegistryFetchError";
  }
}

export class ModuleParameterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleParameterError";
  }
}

export class ModuleFunctionRevertedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleFunctionRevertedError";
  }
}

// AllowList Eligibility Errors
export class AllowlistEligibility_NotOwnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_NotOwnerError";
  }
}

export class AllowlistEligibility_NotArbitratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_NotArbitratorError";
  }
}

export class AllowlistEligibility_ArrayLengthMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_ArrayLengthMismatchError";
  }
}

export class AllowlistEligibility_NotWearerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_NotWearerError";
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function getModuleFunctionError(err: unknown, moduleId: string): never {
  if (err instanceof BaseError) {
    const revertError = err.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";

      // AllowList Eligibility error
      if (moduleId === "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5") {
        switch (errorName) {
          case "AllowlistEligibility_NotOwner": {
            throw new AllowlistEligibility_NotOwnerError(
              `Error: the caller does not wear the module's Owner Hat`
            );
          }
          case "AllowlistEligibility_NotArbitrator": {
            throw new AllowlistEligibility_NotArbitratorError(
              `Error: the caller does not wear the module's Arbitrator Hat`
            );
          }
          case "AllowlistEligibility_ArrayLengthMismatch": {
            throw new AllowlistEligibility_NotArbitratorError(
              `Error: array arguments are not of the same length`
            );
          }
          case "AllowlistEligibility_NotWearer": {
            throw new AllowlistEligibility_NotWearerError(
              `Error: Attempting to burn a hat that an account is not wearing`
            );
          }
          default: {
            throw err;
          }
        }
      }

      throw new ModuleFunctionRevertedError(
        `Error: module function reverted with error name ${errorName}`
      );
    }
  } else {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Unexpected error occured");
    }
  }
}
