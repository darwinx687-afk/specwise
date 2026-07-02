import fs from "node:fs";
import path from "node:path";
import {
  printError,
  printMissingArgument,
  printOutputFolderExists,
  printOutputPathNotDirectory,
  printSuccess,
  USAGE
} from "../cli-format.mjs";
import { copyDirectory, isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";
import { fromRoot } from "../../utils/paths.mjs";

export function runInit(args) {
  const force = args.includes("--force");
  const positional = args.filter((arg) => arg !== "--force");
  const outputFolder = positional[0];

  if (!outputFolder) {
    printMissingArgument("<output-folder>", USAGE.init, "Provide an output folder, for example:\nnode bin/specwise.mjs init ./tmp/spec-pack --force");
    return 1;
  }

  const templateDir = fromRoot("templates/spec-pack");
  const targetDir = path.resolve(process.cwd(), outputFolder);

  if (!pathExists(templateDir)) {
    printError("Template folder is missing: templates/spec-pack", {
      nextAction: "Run node bin/specwise.mjs doctor to check local project files."
    });
    return 1;
  }

  if (pathExists(targetDir) && !fs.statSync(targetDir).isDirectory()) {
    printOutputPathNotDirectory(outputFolder);
    return 1;
  }

  if (isNonEmptyDirectory(targetDir) && !force) {
    printOutputFolderExists();
    return 1;
  }

  if (force && pathExists(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  copyDirectory(templateDir, targetDir);
  printSuccess("SpecWise blank spec-pack template created:", {
    items: ["spec-pack template files"],
    lines: [
      `Output: ${outputFolder}`,
      `Next action: edit the files and run node bin/specwise.mjs validate ${outputFolder}`
    ]
  });
  return 0;
}
