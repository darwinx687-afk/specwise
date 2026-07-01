import fs from "node:fs";
import path from "node:path";
import { copyDirectory, isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";
import { fromRoot } from "../../utils/paths.mjs";

export function runInit(args) {
  const force = args.includes("--force");
  const positional = args.filter((arg) => arg !== "--force");
  const outputFolder = positional[0];

  if (!outputFolder) {
    console.error("ERROR init requires <output-folder>");
    console.error("Usage: specwise init <output-folder> [--force]");
    return 1;
  }

  const templateDir = fromRoot("templates/spec-pack");
  const targetDir = path.resolve(process.cwd(), outputFolder);

  if (!pathExists(templateDir)) {
    console.error("ERROR templates/spec-pack is missing");
    return 1;
  }

  if (isNonEmptyDirectory(targetDir) && !force) {
    console.error(`ERROR output folder already exists and is not empty: ${outputFolder}`);
    console.error("Use --force to overwrite it.");
    return 1;
  }

  if (force && pathExists(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  copyDirectory(templateDir, targetDir);
  console.log(`Created blank SpecWise spec-pack template: ${outputFolder}`);
  console.log(`Next: edit the files and run \`specwise validate ${outputFolder}\``);
  return 0;
}

