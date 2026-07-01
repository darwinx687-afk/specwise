import fs from "node:fs";
import path from "node:path";
import { createMergePreview, writeMergePreview } from "../../patches/merge-preview.mjs";
import { PatchPreviewError, PatchValidationError } from "../../patches/patch-errors.mjs";
import { loadAiPatch } from "../../patches/validate-ai-patch.mjs";
import { isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";

function getOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : null;
}

function parsePreviewArgs(args) {
  const parsed = {
    draftSpecPackPath: null,
    patchFile: null,
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

    if (arg === "--patch" || arg === "--out") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        parsed.errors.push(`Missing value for ${arg}`);
      } else if (arg === "--patch") {
        parsed.patchFile = value;
        index += 1;
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

    if (!parsed.draftSpecPackPath) {
      parsed.draftSpecPackPath = arg;
    } else {
      parsed.errors.push(`Unexpected argument: ${arg}`);
    }
  }

  return parsed;
}

function runPatchValidate(args) {
  const patchFile = args[0];
  if (!patchFile || args.length > 1) {
    console.error("ERROR patch validate requires <patch-file>");
    return 1;
  }

  try {
    loadAiPatch(patchFile);
    console.log(`SpecWise AI patch validation passed: ${patchFile}`);
    return 0;
  } catch (error) {
    if (error instanceof PatchValidationError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

function assertDraftSpecPackExists(draftSpecPackPath) {
  const resolvedPath = path.resolve(process.cwd(), draftSpecPackPath);
  if (!pathExists(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
    throw new PatchPreviewError(`Draft spec-pack folder not found: ${draftSpecPackPath}`);
  }

  const specPackJsonPath = path.join(resolvedPath, "spec-pack.json");
  if (!pathExists(specPackJsonPath)) {
    throw new PatchPreviewError(`Draft spec-pack folder is missing spec-pack.json: ${draftSpecPackPath}`);
  }
}

function runPatchPreview(args) {
  const parsed = parsePreviewArgs(args);

  if (!parsed.draftSpecPackPath) {
    console.error("ERROR patch preview requires <draft-spec-pack-path>");
    return 1;
  }
  if (!parsed.patchFile) {
    console.error("ERROR patch preview requires --patch <patch-file>");
    return 1;
  }
  if (!parsed.outputFolder) {
    console.error("ERROR patch preview requires --out <output-folder>");
    return 1;
  }
  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) console.error(`ERROR ${error}`);
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
    assertDraftSpecPackExists(parsed.draftSpecPackPath);
    const patch = loadAiPatch(parsed.patchFile);

    if (parsed.force && pathExists(outputFolder)) {
      fs.rmSync(outputFolder, { recursive: true, force: true });
    }

    const preview = createMergePreview({
      draftSpecPackPath: parsed.draftSpecPackPath,
      patch
    });
    writeMergePreview(preview, outputFolder);

    console.log("SpecWise AI patch merge preview generated:");
    console.log("- merge-preview.json");
    console.log("- merge-preview.md");
    console.log("");
    console.log("No patch was automatically applied.");
    console.log("Status: Review Required");
    return 0;
  } catch (error) {
    if (error instanceof PatchPreviewError || error instanceof PatchValidationError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

export function runPatch(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === "validate") {
    return runPatchValidate(rest);
  }

  if (subcommand === "preview") {
    return runPatchPreview(rest);
  }

  console.error("ERROR patch requires a subcommand: validate or preview");
  return 1;
}
