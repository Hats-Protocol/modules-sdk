import { ParametersLengthsMismatchError, InvalidParamError } from "./errors";
import { verify } from "./schemas";
import { encodePacked, encodeAbiParameters, decodeEventLog } from "viem";
import type { Module, WriteFunction } from "./types";
import type { TransactionReceipt } from "viem";

/**
 * Check and encode the immutable and mutable arguments for module creation.
 *
 * @param module - The module object of the module that will be created.
 * @param immutableArgs - The module's immutable arguments.
 * @param mutableArgs - The module's mutable arguments.
 * @returns An object containing the encoded immutable and mutable arguments.
 *
 * @throws InvalidParamError
 * Thrown if one of the immutable/mutable args is invalid.
 *
 * @throws ParametersLengthsMismatchError
 * Thrown if one of the immutable/mutable args array's length doens't match the module's schema.
 */
export const checkAndEncodeArgs = ({
  module,
  immutableArgs,
  mutableArgs,
}: {
  module: Module;
  immutableArgs: unknown[];
  mutableArgs: unknown[];
}): {
  encodedImmutableArgs: `0x${string}`;
  encodedMutableArgs: `0x${string}`;
} => {
  checkImmutableArgs({ module, immutableArgs });
  checkMutableArgs({ module, mutableArgs });

  const mutableArgsTypes = module.creationArgs.mutable.map((arg) => {
    return { type: arg.type };
  });
  const immutableArgsTypes = module.creationArgs.immutable.map((arg) => {
    return arg.type;
  });

  const encodedMutableArgs =
    mutableArgs.length > 0
      ? encodeAbiParameters(mutableArgsTypes, mutableArgs)
      : "0x";
  const encodedImmutableArgs =
    immutableArgs.length > 0
      ? encodePacked(immutableArgsTypes, immutableArgs)
      : "0x";

  return { encodedImmutableArgs, encodedMutableArgs };
};

/**
 * Check the immutable arguments for module creation.
 *
 * @param module - The module object of the module that will be created.
 * @param immutableArgs - The module's immutable arguments.
 *
 * @throws InvalidParamError
 * Thrown if one of the immutable args is invalid.
 *
 * @throws ParametersLengthsMismatchError
 * Thrown if the immutable args array's length doens't match the module's schema.
 */
export const checkImmutableArgs = ({
  module,
  immutableArgs,
}: {
  module: Module;
  immutableArgs: unknown[];
}) => {
  if (immutableArgs.length !== module.creationArgs.immutable.length) {
    throw new ParametersLengthsMismatchError(
      "Error: not all creation arguments were provided"
    );
  }

  for (let i = 0; i < immutableArgs.length; i++) {
    const val = immutableArgs[i];
    const type = module.creationArgs.immutable[i].type;
    if (!verify(val, type)) {
      throw new InvalidParamError(
        `Error: received an invalid value for parameter '${module.creationArgs.immutable[i].name}'`
      );
    }
  }
};

/**
 * Check the mutable arguments for module creation.
 *
 * @param module - The module object of the module that will be created.
 * @param mutableArgs - The module's mutable arguments.
 *
 * @throws InvalidParamError
 * Thrown if one of the mutable args is invalid.
 *
 * @throws ParametersLengthsMismatchError
 * Thrown if the mutable args array's length doens't match the module's schema.
 */
export const checkMutableArgs = ({
  module,
  mutableArgs,
}: {
  module: Module;
  mutableArgs: unknown[];
}) => {
  if (mutableArgs.length !== module.creationArgs.mutable.length) {
    throw new ParametersLengthsMismatchError(
      "Error: not all creation arguments were provided"
    );
  }

  for (let i = 0; i < mutableArgs.length; i++) {
    const val = mutableArgs[i];
    const type = module.creationArgs.mutable[i].type;
    if (!verify(val, type)) {
      throw new InvalidParamError(
        `Error: received an invalid value for parameter '${module.creationArgs.mutable[i].name}'`
      );
    }
  }
};

export const checkWriteFunctionArgs = ({
  func,
  args,
}: {
  func: WriteFunction;
  args: unknown[];
}) => {
  if (args.length !== func.args.length) {
    throw new ParametersLengthsMismatchError(
      "Error: not all function arguments were provided"
    );
  }

  for (let i = 0; i < args.length; i++) {
    const val = args[i];
    const type = func.args[i].type;
    if (!verify(val, type)) {
      throw new InvalidParamError(
        `Error: received an invalid value for parameter '${func.args[i].name}'`
      );
    }
  }
};

/**
 * Get the addresses of newly created module instances from the creation transaction receipt.
 *
 * @param receipt - The transaction receipt as a TransactionReceipt Viem object.
 */
export const getNewInstancesFromReceipt = (
  receipt: TransactionReceipt
): `0x${string}`[] => {
  const instances: `0x${string}`[] = [];
  for (let eventIndex = 0; eventIndex < receipt.logs.length; eventIndex++) {
    try {
      const event: any = decodeEventLog({
        abi: [
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: "address",
                name: "implementation",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "instance",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "hatId",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "bytes",
                name: "otherImmutableArgs",
                type: "bytes",
              },
              {
                indexed: false,
                internalType: "bytes",
                name: "initData",
                type: "bytes",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "saltNonce",
                type: "uint256",
              },
            ],
            name: "HatsModuleFactory_ModuleDeployed",
            type: "event",
          },
        ],
        eventName: "HatsModuleFactory_ModuleDeployed",
        data: receipt.logs[eventIndex].data,
        topics: receipt.logs[eventIndex].topics,
      });

      instances.push(event.args.instance);
      continue;
    } catch (err) {
      // continue
    }

    try {
      const event: any = decodeEventLog({
        abi: [
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: "address",
                name: "implementation",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "instance",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "hatId",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "bytes",
                name: "otherImmutableArgs",
                type: "bytes",
              },
              {
                indexed: false,
                internalType: "bytes",
                name: "initData",
                type: "bytes",
              },
            ],
            name: "HatsModuleFactory_ModuleDeployed",
            type: "event",
          },
        ],
        eventName: "HatsModuleFactory_ModuleDeployed",
        data: receipt.logs[eventIndex].data,
        topics: receipt.logs[eventIndex].topics,
      });

      instances.push(event.args.instance);
    } catch (err) {
      // continue
    }
  }

  return instances;
};
