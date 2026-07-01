import fs from "node:fs";
import path from "node:path";
import { buildPromptPackage } from "../../ai-preview/build-prompt-package.mjs";
import { checkAiPreviewReadiness } from "../../ai-preview/check-ai-preview-readiness.mjs";
import { AiPreviewPrepareError } from "../../ai-preview/ai-preview-errors.mjs";
import { renderAiPreviewReadiness } from "../../ai-preview/render-ai-preview-readiness.mjs";
import { renderPromptPreview } from "../../ai-preview/render-prompt-preview.mjs";
import { buildDraftSpecPack } from "../../draft/build-draft-spec-pack.mjs";
import { writeDraftSpecPack } from "../../draft/render-draft-spec-pack.mjs";
import { createInventoryDocument, writeInventoryOutput } from "../../inventory/render-inventory.mjs";
import { scanInputFolder } from "../../inventory/scan-input-folder.mjs";
import { isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";
import { fromRoot } from "../../utils/paths.mjs";

function parsePrepareArgs(args) {
  const parsed = {
    inputFolder: null,
    outputFolder: null,
    configPath: null,
    force: false,
    errors: []
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

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

function loadDesignOnlyConfig(configPath) {
  if (!configPath) {
    throw new AiPreviewPrepareError("AI preview prepare requires --config <config-path>.");
  }

  const resolvedPath = path.resolve(process.cwd(), configPath);
  if (!pathExists(resolvedPath)) {
    throw new AiPreviewPrepareError(`AI preview config not found: ${configPath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new AiPreviewPrepareError(`AI preview config is not valid JSON: ${error.message}`);
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runAiPreviewPrepare(args) {
  const parsed = parsePrepareArgs(args);

  if (!parsed.inputFolder) {
    console.error("ERROR ai-preview prepare requires <input-folder>");
    return 1;
  }
  if (!parsed.outputFolder) {
    console.error("ERROR ai-preview prepare requires --out <output-folder>");
    return 1;
  }
  if (!parsed.configPath) {
    console.error("ERROR ai-preview prepare requires --config <config-path>");
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

  try {
    const config = loadDesignOnlyConfig(parsed.configPath);

    if (parsed.force && pathExists(outputFolder)) {
      fs.rmSync(outputFolder, { recursive: true, force: true });
    }

    const scan = scanInputFolder(parsed.inputFolder);
    const inventory = createInventoryDocument(scan);
    writeInventoryOutput(inventory, outputFolder);

    const draft = buildDraftSpecPack({ inventory, inputFolder: parsed.inputFolder });
    const deterministicDraftFolder = path.join(outputFolder, "deterministic-draft");
    writeDraftSpecPack(draft, deterministicDraftFolder);

    const promptPackage = buildPromptPackage({
      config,
      inventory,
      draft,
      inputFolder: inventory.inputFolder
    });
    writeJson(path.join(outputFolder, "prompt-package.json"), promptPackage);
    fs.writeFileSync(path.join(outputFolder, "prompt-preview.md"), renderPromptPreview(promptPackage));

    const readiness = checkAiPreviewReadiness({
      promptPackage,
      deterministicDraftGenerated: true,
      patchSchemaAvailable: pathExists(fromRoot("schemas/ai-patch.schema.json"))
    });
    writeJson(path.join(outputFolder, "ai-preview-readiness.json"), readiness);
    fs.writeFileSync(path.join(outputFolder, "ai-preview-readiness.md"), renderAiPreviewReadiness(readiness));

    console.log("SpecWise AI preview artifacts prepared:");
    console.log("- material-inventory.json");
    console.log("- material-summary.md");
    console.log("- deterministic-draft/");
    console.log("- prompt-package.json");
    console.log("- prompt-preview.md");
    console.log("- ai-preview-readiness.json");
    console.log("- ai-preview-readiness.md");
    console.log("");
    console.log("No AI provider was called.");
    console.log("No network calls were made.");
    console.log("No API key was read.");
    return 0;
  } catch (error) {
    if (error instanceof AiPreviewPrepareError) {
      console.error(error.message);
      return 1;
    }
    console.error(error.message);
    return 1;
  }
}

export function runAiPreview(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === "prepare") {
    return runAiPreviewPrepare(rest);
  }

  console.error("ERROR ai-preview requires a subcommand: prepare");
  return 1;
}
