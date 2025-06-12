import { Address } from "viem";

import { solidityToTypescriptType } from "../src/schemas";
import type { Module, ModuleCreationArg, Ruleset } from "../src/types";

export type ModuleChain = {
  modules: ExtendedModule[];
  instances: Address[];
  numClauses: number;
  clausesLengths: number[];
  rulesets: ExtendedModule[][];
};

export type ExtendedModule = Module & {
  instance?: Address;
};

export function prepareArgs({ args, timestamp }: { args: ModuleCreationArg[]; timestamp?: bigint }) {
  const newArgs: unknown[] = [];
  for (let i = 0; i < args.length; i++) {
    let arg: unknown;
    const exampleArg = args[i].example;
    const tsType = solidityToTypescriptType(args[i].type);
    if (tsType === "bigint") {
      arg = BigInt(exampleArg as string);
    } else if (tsType === "bigint[]") {
      arg = (exampleArg as Array<string>).map((val) => BigInt(val));
    } else if (args[i].displayType === "timestamp" && timestamp) {
      // replace example timestamps that are likely in the past
      const newDate = new Date(Number(timestamp) * 1000);
      newDate.setHours(newDate.getHours() + 1); // might need to handle other cases besides 1 hour in the future
      arg = newDate.getTime() / 1000;
    } else {
      arg = exampleArg;
    }

    newArgs.push(arg);
  }

  return newArgs;
}

export function checkRuleset({
  ruleset,
  numClauses,
  instances,
  modules,
}: {
  ruleset: Ruleset;
  numClauses: number;
  instances: Address[];
  modules: Module[];
}) {
  expect(ruleset.length).toBe(numClauses);
  for (let i = 0; i < ruleset.length; i++) {
    expect(instances).toContain(ruleset[i].address);
    expect(modules.map((m) => m.name)).toContain(ruleset[i].module.name);
  }
}
