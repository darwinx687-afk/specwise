import { fileURLToPath } from "node:url";
import path from "node:path";

export const repoRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

export function fromRoot(...segments) {
  return path.join(repoRoot, ...segments);
}

