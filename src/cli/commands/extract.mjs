import fs from "node:fs";
import path from "node:path";
import { createDryRunExtractionPlan, writeDryRunExtractionPlan } from "../../extraction/dry-run-extraction-plan.mjs";
import { createInventoryDocument, writeInventoryOutput } from "../../inventory/render-inventory.mjs";
import { scanInputFolder } from "../../inventory/scan-input-folder.mjs";
import { loadProviderConfig } from "../../providers/provider-config.mjs";
import { ProviderConfigError, ProviderRuntimeError, ProviderUnavailableError } from "../../providers/provider-errors.mjs";
import { assertProviderRuntimeAllowed } from "../../providers/provider-runtime-contract.mjs";
import { getProvider } from "../../providers/provider-registry.mjs";
import { isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";

function parseExtractArgs(args) {
  const parsed = {
    inputFolder: null,
    outputFolder: null,
    configPath: null,
    dryRun: false,
    force: false,
    errors: []
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }
    if (arg === "--force") {
      parsed.force = true;
      continue;
    }
    if (arg === "--out" || arg === "--config") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        parsed.errors.push(`Missing value for ${arg}`);
      } else if (arg === "--out") {
        parsed.outputFolder = value;
        index += 1;
      } else {
        parsed.configPath = value;
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

export function runExtract(args) {
  const parsed = parseExtractArgs(args);

  if (!parsed.dryRun) {
    console.error("Phase 7B only supports extraction dry-run. Use --dry-run.");
    return 1;
  }
  if (!parsed.inputFolder) {
    console.error("ERROR extract requires <input-folder>");
    return 1;
  }
  if (!parsed.outputFolder) {
    console.error("ERROR extract requires --out <output-folder>");
    return 1;
  }
  if (!parsed.configPath) {
    console.error("ERROR extract requires --config <config-path>");
    return 1;
  }
  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) console.error(`ERROR ${error}`);
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
    const config = loadProviderConfig(parsed.configPath);
    assertProviderRuntimeAllowed(config);
    const provider = getProvider(config.provider, config);
    const scan = scanInputFolder(parsed.inputFolder);
    const inventory = createInventoryDocument(scan);
    writeInventoryOutput(inventory, outputFolder);
    const plan = createDryRunExtractionPlan({ provider, inventory });
    writeDryRunExtractionPlan(plan, outputFolder);

    console.log("SpecWise extraction dry-run plan generated:");
    console.log("- material-inventory.json");
    console.log("- material-summary.md");
    console.log("- extraction-plan.json");
    console.log("- extraction-plan.md");
    console.log("");
    console.log("No AI provider was called.");
    console.log("No network calls were made.");
    return 0;
  } catch (error) {
    if (error instanceof ProviderConfigError || error instanceof ProviderRuntimeError || error instanceof ProviderUnavailableError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}
