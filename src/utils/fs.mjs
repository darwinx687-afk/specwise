import fs from "node:fs";
import path from "node:path";

export function pathExists(targetPath) {
  return fs.existsSync(targetPath);
}

export function isNonEmptyDirectory(targetPath) {
  if (!fs.existsSync(targetPath)) return false;
  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) return false;
  return fs.readdirSync(targetPath).length > 0;
}

export function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

