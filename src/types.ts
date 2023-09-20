import type { Abi } from "abitype";

export interface TransactionResult {
  status: "success" | "reverted";
  transactionHash: `0x${string}`;
}

export interface CreateInstanceResult extends TransactionResult {
  newInstance: `0x${string}`;
}

export interface BatchCreateInstancesResult extends TransactionResult {
  newInstances: Array<`0x${string}`>;
}

export type Module = {
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
  implementationAddress: string;
  deployments: {
    chainId: string;
    block: string;
  }[];
  creationArgs: ModuleCreationArgs;
  abi: Abi;
};

export type Factory = {
  name: string;
  details: string;
  links: {
    label: string;
    link: string;
  }[];
  implementationAddress: string;
  deployments: {
    chainId: string;
    block: string;
  }[];
  abi: Abi;
};

export type ChainModule = {
  name: string;
  details: string;
  links: {
    label: string;
    link: string;
  }[];
  implementationAddress: string;
  deployments: {
    chainId: string;
    block: string;
  }[];
  abi: Abi;
};

export type FunctionInfo = {
  name: string;
  type: "write" | "read";
  inputs: { name: string | undefined; type: string }[];
};

export type ModuleParameter = {
  label: string;
  value: unknown;
  solidityType: string;
  displayType: string;
};

export type Registry = {
  factory: Factory;
  eligibilitiesChain: ChainModule;
  togglesChain: ChainModule;
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
};

export type ModuleCreationArgs = {
  useHatId: boolean;
  immutable: ModuleCreationArg[];
  mutable: ModuleCreationArg[];
};
