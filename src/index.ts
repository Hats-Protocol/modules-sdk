import { HatsModulesClient } from "./client";
import { verify, getSchema, solidityToTypescriptType } from "./schemas";
import {
  checkAndEncodeArgs,
  checkImmutableArgs,
  checkMutableArgs,
  getNewInstancesFromReceipt,
} from "./utils";
import {
  HATS_MODULES_FACTORY_ABI,
  HATS_MODULES_FACTORY_ADDRESS,
  HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
  HATS_ELIGIBILITIES_CHAIN_MODULE_ADDRESS,
  HATS_TOGGLES_CHAIN_MODULE_ABI,
  HATS_TOGGLES_CHAIN_MODULE_ADDRESS,
  HATS_MODULE_ABI,
} from "./constants";
import type {
  Module,
  Registry,
  ModuleParameter,
  ArgumentTsType,
  ModuleCreationArg,
  ModuleCreationArgs,
  Role,
  WriteFunction,
  WriteFunctionArg,
  Ruleset,
} from "./types";

export {
  HatsModulesClient,
  verify,
  getSchema,
  solidityToTypescriptType,
  checkAndEncodeArgs,
  checkImmutableArgs,
  checkMutableArgs,
  getNewInstancesFromReceipt,
  HATS_MODULES_FACTORY_ABI,
  HATS_MODULES_FACTORY_ADDRESS,
  HATS_ELIGIBILITIES_CHAIN_MODULE_ABI,
  HATS_ELIGIBILITIES_CHAIN_MODULE_ADDRESS,
  HATS_TOGGLES_CHAIN_MODULE_ABI,
  HATS_TOGGLES_CHAIN_MODULE_ADDRESS,
  HATS_MODULE_ABI,
};
export type {
  Module,
  Registry,
  ModuleParameter,
  ArgumentTsType,
  ModuleCreationArg,
  ModuleCreationArgs,
  Role,
  WriteFunction,
  WriteFunctionArg,
  Ruleset,
};
