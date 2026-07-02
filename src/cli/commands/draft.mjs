import fs from "node:fs";
import path from "node:path";
import { buildDraftSpecPack } from "../../draft/build-draft-spec-pack.mjs";
import { writeDraftSpecPack } from "../../draft/render-draft-spec-pack.mjs";
import { createInventoryDocument, writeInventoryOutput } from "../../inventory/render-inventory.mjs";
import { scanInputFolder } from "../../inventory/scan-input-folder.mjs";
import { isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";
import {
  printError,
  printMissingArgument,
  printMissingOption,
  printOutputFolderExists,
  printOutputPathNotDirectory,
  printParseErrors,
  printPathNotFound,
  printSuccess,
  USAGE
} from "../cli-format.mjs";

function parseDraftArgs(args) {
  const parsed = {
    inputFolder: null,
    outputFolder: null,
    force: false,
    errors: []
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--force") {
      parsed.force = true;
      continue;
    }

    if (arg === "--out") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        parsed.errors.push("Missing value for --out");
      } else {
        parsed.outputFolder = value;
        index += 1;
      }
      continue;
    }

    if (arg.startsWith("--")) {
      parsed.errors.push(`Unknown option: ${arg}`);
      continue;
    }

    if (!parsed.inputFolder) {
      parsed.inputFolder = arg;
    } else {
      parsed.errors.push(`Unexpected argument: ${arg}`);
    }
  }

  return parsed;
}

export function runDraft(args) {
  const parsed = parseDraftArgs(args);

  if (!parsed.inputFolder) {
    printMissingArgument("<input-folder>", USAGE.draft, "Provide an input folder, for example:\nnode bin/specwise.mjs draft examples/legacy-crm-follow-up/input --out ./tmp/crm-draft --force");
    return 1;
  }

  if (!parsed.outputFolder) {
    printMissingOption("--out", USAGE.draft, "Add --out <output-folder>.");
    return 1;
  }

  if (parsed.errors.length > 0) {
    printParseErrors(parsed.errors, USAGE.draft);
    return 1;
  }

  const inputFolder = path.resolve(process.cwd(), parsed.inputFolder);
  if (!pathExists(inputFolder) || !fs.statSync(inputFolder).isDirectory()) {
    printPathNotFound(parsed.inputFolder);
    return 1;
  }

  const outputFolder = path.resolve(process.cwd(), parsed.outputFolder);
  if (pathExists(outputFolder) && !fs.statSync(outputFolder).isDirectory()) {
    printOutputPathNotDirectory(parsed.outputFolder);
    return 1;
  }

  if (isNonEmptyDirectory(outputFolder) && !parsed.force) {
    printOutputFolderExists();
    return 1;
  }

  if (parsed.force && pathExists(outputFolder)) {
    fs.rmSync(outputFolder, { recursive: true, force: true });
  }

  try {
    const scan = scanInputFolder(parsed.inputFolder);
    const inventory = createInventoryDocument(scan);
    writeInventoryOutput(inventory, outputFolder);

    const draft = buildDraftSpecPack({ inventory, inputFolder: parsed.inputFolder });
    writeDraftSpecPack(draft, outputFolder);

    printSuccess("SpecWise draft generated:", {
      items: ["material-inventory.json", "material-summary.md", "spec-pack/"],
      lines: [
        `Input: ${scan.inputFolder}`,
        `Output: ${parsed.outputFolder}`,
        "Status: Review Required",
        "No AI provider was called."
      ]
    });
    return 0;
  } catch (error) {
    printError(error.message, {
      nextAction: "Check the input folder and try again."
    });
    return 1;
  }
}
