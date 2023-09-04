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
  description: string;
  github: {
    owner: string;
    repo: string;
  };
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
  args: {
    immutable: {
      name: string;
      description: string;
      type: string;
      example: unknown;
    }[];
    mutable: {
      name: string;
      description: string;
      type: string;
      example: unknown;
    }[];
  };
  abi: Abi;
};

export type Factory = {
  name: string;
  description: string;
  github: {
    owner: string;
    repo: string;
  };
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
