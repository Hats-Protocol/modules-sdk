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
