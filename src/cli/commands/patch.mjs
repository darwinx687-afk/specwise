import fs from "node:fs";
import path from "node:path";
import { createMergePreview, writeMergePreview } from "../../patches/merge-preview.mjs";
import { PatchPreviewError, PatchValidationError } from "../../patches/patch-errors.mjs";
import { loadAiPatch } from "../../patches/validate-ai-patch.mjs";
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
    printMissingArgument("<patch-file>", USAGE["patch validate"], "Provide a patch file, for example:\nnode bin/specwise.mjs patch validate examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json");
    return 1;
  }

  const resolvedPatchFile = path.resolve(process.cwd(), patchFile);
  if (!pathExists(resolvedPatchFile)) {
    printPathNotFound(patchFile);
    return 1;
  }

  try {
    loadAiPatch(patchFile);
    console.log(`SpecWise AI patch validation passed: ${patchFile}`);
    return 0;
  } catch (error) {
    if (error instanceof PatchValidationError) {
      printError(error.message, {
        nextAction: "Fix the patch file and try again."
      });
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
    printMissingArgument("<draft-spec-pack-path>", USAGE["patch preview"], "Provide a draft spec-pack folder.");
    return 1;
  }
  if (!parsed.patchFile) {
    printMissingOption("--patch", USAGE["patch preview"], "Add --patch <patch-file>.");
    return 1;
  }
  if (!parsed.outputFolder) {
    printMissingOption("--out", USAGE["patch preview"], "Add --out <output-folder>.");
    return 1;
  }
  if (parsed.errors.length > 0) {
    printParseErrors(parsed.errors, USAGE["patch preview"]);
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
    if (!pathExists(path.resolve(process.cwd(), parsed.patchFile))) {
      printPathNotFound(parsed.patchFile);
      return 1;
    }
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

    printSuccess("SpecWise AI patch merge preview generated:", {
      items: ["merge-preview.json", "merge-preview.md"],
      lines: [
        "No patch was automatically applied.",
        "Status: Review Required"
      ]
    });
    return 0;
  } catch (error) {
    if (error instanceof PatchPreviewError || error instanceof PatchValidationError) {
      printError(error.message, {
        nextAction: "Check the draft spec-pack folder, patch file, and --out folder."
      });
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

  printError("Missing or unknown patch subcommand", {
    nextAction: "Use one of: patch validate <patch-file>, patch preview <draft-spec-pack-path> --patch <patch-file> --out <output-folder>."
  });
  return 1;
}
