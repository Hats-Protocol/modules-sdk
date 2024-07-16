export const HATS_MODULES_FACTORY_ADDRESS: `0x${string}` =
  "0x0a3f85fa597B6a967271286aA0724811acDF5CD9";

export const HATS_ELIGIBILITIES_CHAIN_MODULE_ADDRESS: {
  [chainId: number]: `0x${string}`;
} = {
  11155111: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
  10: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
  1: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
  100: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
  137: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
  42220: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
  42161: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
  8453: "0x8aded513a191e3fee91bb192aba20fcc9c16af2e",
};

export const HATS_TOGGLES_CHAIN_MODULE_ADDRESS: {
  [chainId: number]: `0x${string}`;
} = {
  11155111: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
  10: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
  1: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
  100: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
  137: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
  42220: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
  42161: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
  8453: "0x841Bc396ad88A9C6b78F05b7754a9d22E3fB264b",
};

export const HATS_ELIGIBILITIES_CHAIN_MODULE_ADDRESS_ADDITIONAL =
  "0x83200f1633cdb6c8f28f202cea1b6a9105862d83";

export const HATS_TOGGLES_CHAIN_MODULE_ADDRESS_ADDITIONAL =
  "0x2f1388e095bec051db9f1b226faf222ef5c33f16";

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
      { internalType: "uint256", name: "saltNonce", type: "uint256" },
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
      { internalType: "uint256[]", name: "_saltNonces", type: "uint256[]" },
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
      { internalType: "uint256", name: "_saltNonce", type: "uint256" },
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
      { internalType: "uint256", name: "_saltNonce", type: "uint256" },
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
      { internalType: "uint256", name: "_saltNonce", type: "uint256" },
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

export const CHAIN_ABI = [
  {
    inputs: [],
    name: "CONJUNCTION_CLAUSE_LENGTHS",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
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
] as const;
