import { ParametersLengthsMismatchError, InvalidParamError } from "./errors";
import { verify } from "./schemas";
import { encodePacked, encodeAbiParameters, decodeEventLog } from "viem";
import type { Module } from "./types";
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
  encodedImmutableArgs: "" | `0x${string}`;
  encodedMutableArgs: "" | `0x${string}`;
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
      : "";
  const encodedImmutableArgs =
    immutableArgs.length > 0
      ? encodePacked(immutableArgsTypes, immutableArgs)
      : "";

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
      "Immutable args array length doesn't match the module's schema"
    );
  }

  for (let i = 0; i < immutableArgs.length; i++) {
    const val = immutableArgs[i];
    const type = module.creationArgs.immutable[i].type;
    if (!verify(val, type)) {
      throw new InvalidParamError(`Invalid immutable argument at index ${i}`);
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
      "Mutable args array length doesn't match the module's schema"
    );
  }

  for (let i = 0; i < mutableArgs.length; i++) {
    const val = mutableArgs[i];
    const type = module.creationArgs.mutable[i].type;
    if (!verify(val, type)) {
      throw new InvalidParamError(`Invalid mutable argument at index ${i}`);
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
