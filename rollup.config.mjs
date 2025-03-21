import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import pkg from "./package.json" with { type: "json" };

const input = "src/index.ts";
const external = [...Object.keys({ ...pkg.dependencies, viem: '' } || {})];

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
