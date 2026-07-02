import { spawnSync } from "node:child_process";
import path from "node:path";
import { printMissingArgument, printPathNotFound, USAGE } from "../cli-format.mjs";
import { pathExists } from "../../utils/fs.mjs";
import { fromRoot } from "../../utils/paths.mjs";

export function runValidate(args) {
  const packArgs = args.filter((arg) => arg !== "--expect-fail");
  if (packArgs.length === 0) {
    printMissingArgument("<spec-pack-path>", USAGE.validate, "Provide a spec-pack folder, for example:\nnode bin/specwise.mjs validate examples/minimal/spec-pack");
    return 1;
  }

  for (const packPath of packArgs) {
    const resolvedPath = path.resolve(process.cwd(), packPath);
    if (!pathExists(resolvedPath)) {
      printPathNotFound(packPath);
      return 1;
    }
  }

  const result = spawnSync(process.execPath, [fromRoot("scripts/validate-spec-pack.mjs"), ...args], {
    cwd: process.cwd(),
    stdio: "inherit"
  });

  return result.status ?? 1;
}
