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

export type CreateInstanceArg = {
  name: string;
  description: string;
  type: string;
};

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
  creationArgs: {
    immutable: {
      name: string;
      description: string;
      type: string;
      example: unknown;
      displayType: string;
    }[];
    mutable: {
      name: string;
      description: string;
      type: string;
      example: unknown;
      displayType: string;
    }[];
  };
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
