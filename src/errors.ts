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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function getModuleFunctionError(err: unknown): never {
  if (err instanceof BaseError) {
    const revertError = err.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";
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
