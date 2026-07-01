import { spawnSync } from "node:child_process";
import { fromRoot } from "../../utils/paths.mjs";

export function runValidate(args) {
  const packArgs = args.filter((arg) => arg !== "--expect-fail");
  if (packArgs.length === 0) {
    console.error("ERROR validate requires <spec-pack-path>");
    console.error("Usage: specwise validate <spec-pack-path> [--expect-fail]");
    return 1;
  }

  const result = spawnSync(process.execPath, [fromRoot("scripts/validate-spec-pack.mjs"), ...args], {
    cwd: process.cwd(),
    stdio: "inherit"
  });

  return result.status ?? 1;
}

