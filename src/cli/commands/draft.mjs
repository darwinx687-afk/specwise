import fs from "node:fs";
import path from "node:path";
import { buildDraftSpecPack } from "../../draft/build-draft-spec-pack.mjs";
import { writeDraftSpecPack } from "../../draft/render-draft-spec-pack.mjs";
import { createInventoryDocument, writeInventoryOutput } from "../../inventory/render-inventory.mjs";
import { scanInputFolder } from "../../inventory/scan-input-folder.mjs";
import { isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";

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
    console.error("ERROR draft requires <input-folder>");
    console.error("Usage: specwise draft <input-folder> --out <output-folder> [--force]");
    return 1;
  }

  if (!parsed.outputFolder) {
    console.error("ERROR draft requires --out <output-folder>");
    console.error("Usage: specwise draft <input-folder> --out <output-folder> [--force]");
    return 1;
  }

  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) {
      console.error(`ERROR ${error}`);
    }
    return 1;
  }

  const inputFolder = path.resolve(process.cwd(), parsed.inputFolder);
  if (!pathExists(inputFolder) || !fs.statSync(inputFolder).isDirectory()) {
    console.error(`Input folder not found: ${parsed.inputFolder}`);
    return 1;
  }

  const outputFolder = path.resolve(process.cwd(), parsed.outputFolder);
  if (pathExists(outputFolder) && !fs.statSync(outputFolder).isDirectory()) {
    console.error(`ERROR output path exists and is not a directory: ${parsed.outputFolder}`);
    return 1;
  }

  if (isNonEmptyDirectory(outputFolder) && !parsed.force) {
    console.error(`ERROR output folder already exists and is not empty: ${parsed.outputFolder}`);
    console.error("Use --force to overwrite it.");
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

    console.log("SpecWise draft spec-pack generated:");
    console.log("- material-inventory.json");
    console.log("- material-summary.md");
    console.log("- spec-pack/");
    console.log("");
    console.log(`Input: ${scan.inputFolder}`);
    console.log(`Output: ${parsed.outputFolder}`);
    console.log("Status: Review Required");
    return 0;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

