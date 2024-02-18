export const HATS_MODULES_FACTORY_ADDRESS: `0x${string}` =
  "0xfE661c01891172046feE16D3a57c3Cf456729efA";

export const HATS_ELIGIBILITIES_CHAIN_MODULE_ADDRESS: {
  [chainId: number]: `0x${string}`;
} = {
  5: "0x83200f1633cDb6C8f28F202CEA1B6a9105862D83",
  11155111: "0x83200f1633cDb6C8f28F202CEA1B6a9105862D83",
  10: "0x83200f1633cDb6C8f28F202CEA1B6a9105862D83",
};

export const HATS_TOGGLES_CHAIN_MODULE_ADDRESS: {
  [chainId: number]: `0x${string}`;
} = {
  5: "0x2f1388e095bec051db9f1b226faf222ef5c33f16",
  11155111: "0x2f1388e095bec051db9f1b226faf222ef5c33f16",
};

export const HATS_TOGGLES_CHAIN_MODULE_ABI = [
  {
    inputs: [{ internalType: "string", name: "_version", type: "string" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [],
    name: "CONJUNCTION_CLAUSE_LENGTHS",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "HATS",
    outputs: [{ internalType: "contract IHats", name: "", type: "address" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "IMPLEMENTATION",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "MODULES",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "NUM_CONJUNCTION_CLAUSES",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_hatId", type: "uint256" }],
    name: "getHatStatus",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hatId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "_initData", type: "bytes" }],
    name: "setUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version_",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const HATS_ELIGIBILITIES_CHAIN_MODULE_ABI = [
  {
    inputs: [{ internalType: "string", name: "_version", type: "string" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [],
    name: "CONJUNCTION_CLAUSE_LENGTHS",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "HATS",
    outputs: [{ internalType: "contract IHats", name: "", type: "address" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "IMPLEMENTATION",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "MODULES",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "NUM_CONJUNCTION_CLAUSES",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_wearer", type: "address" },
      { internalType: "uint256", name: "_hatId", type: "uint256" },
    ],
    name: "getWearerStatus",
    outputs: [
      { internalType: "bool", name: "eligible", type: "bool" },
      { internalType: "bool", name: "standing", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hatId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "_initData", type: "bytes" }],
    name: "setUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version_",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const HATS_MODULES_FACTORY_ABI = [
  {
    inputs: [
      { internalType: "contract IHats", name: "_hats", type: "address" },
      { internalType: "string", name: "_version", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "BatchArrayLengthMismatch", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "implementation", type: "address" },
      { internalType: "uint256", name: "hatId", type: "uint256" },
      { internalType: "bytes", name: "otherImmutableArgs", type: "bytes" },
    ],
    name: "HatsModuleFactory_ModuleAlreadyDeployed",
    type: "error",
  },
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
  {
    inputs: [],
    name: "HATS",
    outputs: [{ internalType: "contract IHats", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_implementations",
        type: "address[]",
      },
      { internalType: "uint256[]", name: "_hatIds", type: "uint256[]" },
      {
        internalType: "bytes[]",
        name: "_otherImmutableArgsArray",
        type: "bytes[]",
      },
      { internalType: "bytes[]", name: "_initDataArray", type: "bytes[]" },
    ],
    name: "batchCreateHatsModule",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_implementation", type: "address" },
      { internalType: "uint256", name: "_hatId", type: "uint256" },
      { internalType: "bytes", name: "_otherImmutableArgs", type: "bytes" },
      { internalType: "bytes", name: "_initData", type: "bytes" },
    ],
    name: "createHatsModule",
    outputs: [{ internalType: "address", name: "_instance", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_implementation", type: "address" },
      { internalType: "uint256", name: "_hatId", type: "uint256" },
      { internalType: "bytes", name: "_otherImmutableArgs", type: "bytes" },
    ],
    name: "deployed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_implementation", type: "address" },
      { internalType: "uint256", name: "_hatId", type: "uint256" },
      { internalType: "bytes", name: "_otherImmutableArgs", type: "bytes" },
    ],
    name: "getHatsModuleAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const HATS_MODULE_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_version",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [],
    name: "HATS",
    outputs: [
      {
        internalType: "contract IHats",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "IMPLEMENTATION",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "hatId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_initData",
        type: "bytes",
      },
    ],
    name: "setUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version_",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
