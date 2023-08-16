export interface TransactionResult {
  status: "success" | "reverted";
  transactionHash: `0x${string}`;
}

export interface CreateInstanceResult extends TransactionResult {
  newInstance: `0x${string}`;
}

export type SupportedChain = "1" | "5";

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
    immutable: { name: string; description: string; type: string }[];
    mutable: { name: string; description: string; type: string }[];
  };
  abi: any;
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
  abi: any;
};
