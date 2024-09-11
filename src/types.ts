import type { Abi } from "viem";

export interface TransactionResult {
  status: "success" | "reverted";
  transactionHash: `0x${string}`;
}

export interface CallInstanceWriteFunctionResult extends TransactionResult {}

export interface CreateInstanceResult extends TransactionResult {
  newInstance: `0x${string}`;
}

export interface BatchCreateInstancesResult extends TransactionResult {
  newInstances: Array<`0x${string}`>;
}

export type Module = {
  id: string;
  version: string;
  name: string;
  details: string[];
  links: {
    label: string;
    link: string;
  }[];
  parameters: {
    label: string;
    functionName: string;
    displayType: string;
  }[];
  type: {
    eligibility: boolean;
    toggle: boolean;
    hatter: boolean;
  };
  tags: {
    description: string;
    label: string;
    value: string;
  }[];
  implementationAddress: string;
  deployments: {
    chainId: string;
    block: string;
  }[];
  creationArgs: ModuleCreationArgs;
  customRoles: Role[];
  writeFunctions: WriteFunction[];
  abi: Abi;
};

export type Role = {
  id: string;
  name: string;
  criteria: string;
  hatAdminsFallback?: boolean;
};

export type WriteFunction = {
  roles: string[];
  functionName: string;
  label: string;
  description: string;
  primary?: boolean;
  args: WriteFunctionArg[];
};

export type WriteFunctionArg = {
  name: string;
  description: string;
  type: string;
  displayType: string;
  optional?: boolean;
};

export type ModuleParameter = {
  label: string;
  value: unknown;
  solidityType: string;
  displayType: string;
};

export type Registry = {
  modules: Module[];
};

export type ArgumentTsType =
  | "number"
  | "bigint"
  | "string"
  | "boolean"
  | "number[]"
  | "bigint[]"
  | "string[]"
  | "boolean[]"
  | "unknown";

export type ModuleCreationArg = {
  name: string;
  description: string;
  type: string;
  example: unknown;
  displayType: string;
  optional?: boolean;
};

export type ModuleCreationArgs = {
  useHatId: boolean;
  immutable: ModuleCreationArg[];
  mutable: ModuleCreationArg[];
};

export type Ruleset = {
  module: Module;
  address: `0x${string}`;
  liveParams?: ModuleParameter[];
}[];

export type GetRulesetsConfig = {
  includeLiveParams?: boolean;
};
