import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json" with { type: "json" };

const input = "src/index.ts";
// eslint-disable-next-line no-constant-binary-expression
const external = [...Object.keys({ ...pkg.dependencies, viem: "" } || {})];

export default [
  {
    input,
    external,
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [json(), typescript({ clean: true })],
  },
];
