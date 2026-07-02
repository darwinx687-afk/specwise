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
    printMissingArgument("<input-folder>", USAGE["ai-preview prepare"], "Provide an input folder.");
    return 1;
  }
  if (!parsed.outputFolder) {
    printMissingOption("--out", USAGE["ai-preview prepare"], "Add --out <output-folder>.");
    return 1;
  }
  if (!parsed.configPath) {
    printMissingOption("--config", USAGE["ai-preview prepare"], "Add --config <config-path>.");
    return 1;
  }
  if (parsed.errors.length > 0) {
    printParseErrors(parsed.errors, USAGE["ai-preview prepare"]);
    return 1;
  }

  const inputFolder = path.resolve(process.cwd(), parsed.inputFolder);
  if (!pathExists(inputFolder) || !fs.statSync(inputFolder).isDirectory()) {
    printPathNotFound(parsed.inputFolder);
    return 1;
  }

  const configPath = path.resolve(process.cwd(), parsed.configPath);
  if (!pathExists(configPath)) {
    printPathNotFound(parsed.configPath);
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

    printSuccess("SpecWise AI preview artifacts prepared:", {
      items: [
        "material-inventory.json",
        "material-summary.md",
        "deterministic-draft/",
        "prompt-package.json",
        "prompt-preview.md",
        "ai-preview-readiness.json",
        "ai-preview-readiness.md"
      ],
      lines: [
        "No AI provider was called.",
        "No network calls were made.",
        "No API key was read."
      ]
    });
    return 0;
  } catch (error) {
    if (error instanceof AiPreviewPrepareError) {
      printError(error.message, {
        nextAction: "Check the input folder, config file, and --out folder."
      });
      return 1;
    }
    printError(error.message, {
      nextAction: "Check the command inputs and try again."
    });
    return 1;
  }
}

export function runAiPreview(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === "prepare") {
    return runAiPreviewPrepare(rest);
  }

  printError("Missing or unknown ai-preview subcommand", {
    nextAction: "Use ai-preview prepare <input-folder> --out <output-folder> --config <config-path>."
  });
  return 1;
}
