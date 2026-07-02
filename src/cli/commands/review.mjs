import fs from "node:fs";
import path from "node:path";
import { buildReviewReport } from "../../review/build-review-report.mjs";
import { createReviewTemplate, loadMergePreviewFolder, renderReviewDecisionsMarkdown } from "../../review/create-review-template.mjs";
import { ReviewDecisionValidationError, ReviewWorkflowError } from "../../review/review-errors.mjs";
import { renderReviewedHandoffPlan, renderReviewReportMarkdown } from "../../review/render-review-report.mjs";
import { loadReviewDecisions } from "../../review/validate-review-decisions.mjs";
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

function parseInitArgs(args) {
  const parsed = {
    mergePreviewFolder: null,
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

    if (!parsed.mergePreviewFolder) {
      parsed.mergePreviewFolder = arg;
    } else {
      parsed.errors.push(`Unexpected argument: ${arg}`);
    }
  }

  return parsed;
}

function parseReportArgs(args) {
  const parsed = {
    mergePreviewFolder: null,
    decisionsFile: null,
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

    if (arg === "--decisions" || arg === "--out") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        parsed.errors.push(`Missing value for ${arg}`);
      } else if (arg === "--decisions") {
        parsed.decisionsFile = value;
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

    if (!parsed.mergePreviewFolder) {
      parsed.mergePreviewFolder = arg;
    } else {
      parsed.errors.push(`Unexpected argument: ${arg}`);
    }
  }

  return parsed;
}

function assertWritableOutputFolder(outputFolder, force) {
  const resolvedOutputFolder = path.resolve(process.cwd(), outputFolder);
  if (pathExists(resolvedOutputFolder) && !fs.statSync(resolvedOutputFolder).isDirectory()) {
    throw new ReviewWorkflowError(`Output path exists and is not a directory: ${outputFolder}`);
  }
  if (isNonEmptyDirectory(resolvedOutputFolder) && !force) {
    throw new ReviewWorkflowError("Output folder already exists and is not empty.");
  }
  if (force && pathExists(resolvedOutputFolder)) {
    fs.rmSync(resolvedOutputFolder, { recursive: true, force: true });
  }
  return resolvedOutputFolder;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runReviewInit(args) {
  const parsed = parseInitArgs(args);
  if (!parsed.mergePreviewFolder) {
    printMissingArgument("<merge-preview-folder>", USAGE["review init"], "Provide a merge preview folder.");
    return 1;
  }
  if (!parsed.outputFolder) {
    printMissingOption("--out", USAGE["review init"], "Add --out <review-folder>.");
    return 1;
  }
  if (parsed.errors.length > 0) {
    printParseErrors(parsed.errors, USAGE["review init"]);
    return 1;
  }

  if (!pathExists(path.resolve(process.cwd(), parsed.mergePreviewFolder))) {
    printPathNotFound(parsed.mergePreviewFolder);
    return 1;
  }

  try {
    const outputFolder = assertWritableOutputFolder(parsed.outputFolder, parsed.force);
    const mergePreview = loadMergePreviewFolder(parsed.mergePreviewFolder);
    const reviewDecisions = createReviewTemplate({
      mergePreview,
      mergePreviewPath: parsed.mergePreviewFolder
    });

    fs.mkdirSync(outputFolder, { recursive: true });
    writeJson(path.join(outputFolder, "review-decisions.json"), reviewDecisions);
    fs.writeFileSync(
      path.join(outputFolder, "review-decisions.md"),
      renderReviewDecisionsMarkdown({ reviewDecisions, mergePreview })
    );

    printSuccess("SpecWise review template created:", {
      items: ["review-decisions.json", "review-decisions.md"],
      lines: [
        "No patch was applied.",
        "All decisions require human review."
      ]
    });
    return 0;
  } catch (error) {
    if (error instanceof ReviewWorkflowError) {
      if (error.message === "Output folder already exists and is not empty.") {
        printOutputFolderExists();
      } else if (/^Output path exists/.test(error.message)) {
        printOutputPathNotDirectory(parsed.outputFolder);
      } else {
        printError(error.message, {
          nextAction: "Check the merge preview folder and --out folder."
        });
      }
      return 1;
    }
    throw error;
  }
}

function runReviewValidate(args) {
  const decisionsFile = args[0];
  if (!decisionsFile || args.length > 1) {
    printMissingArgument("<review-decisions-file>", USAGE["review validate"], "Provide a review decisions file.");
    return 1;
  }

  if (!pathExists(path.resolve(process.cwd(), decisionsFile))) {
    printPathNotFound(decisionsFile);
    return 1;
  }

  try {
    loadReviewDecisions(decisionsFile);
    console.log(`SpecWise review decisions validation passed: ${decisionsFile}`);
    return 0;
  } catch (error) {
    if (error instanceof ReviewDecisionValidationError) {
      printError(error.message, {
        nextAction: "Fix the review decisions file and try again."
      });
      return 1;
    }
    throw error;
  }
}

function runReviewReport(args) {
  const parsed = parseReportArgs(args);
  if (!parsed.mergePreviewFolder) {
    printMissingArgument("<merge-preview-folder>", USAGE["review report"], "Provide a merge preview folder.");
    return 1;
  }
  if (!parsed.decisionsFile) {
    printMissingOption("--decisions", USAGE["review report"], "Add --decisions <review-decisions-file>.");
    return 1;
  }
  if (!parsed.outputFolder) {
    printMissingOption("--out", USAGE["review report"], "Add --out <output-folder>.");
    return 1;
  }
  if (parsed.errors.length > 0) {
    printParseErrors(parsed.errors, USAGE["review report"]);
    return 1;
  }

  if (!pathExists(path.resolve(process.cwd(), parsed.mergePreviewFolder))) {
    printPathNotFound(parsed.mergePreviewFolder);
    return 1;
  }

  if (!pathExists(path.resolve(process.cwd(), parsed.decisionsFile))) {
    printPathNotFound(parsed.decisionsFile);
    return 1;
  }

  try {
    const outputFolder = assertWritableOutputFolder(parsed.outputFolder, parsed.force);
    const mergePreview = loadMergePreviewFolder(parsed.mergePreviewFolder);
    const reviewDecisions = loadReviewDecisions(parsed.decisionsFile);
    const report = buildReviewReport({
      mergePreview,
      mergePreviewPath: parsed.mergePreviewFolder,
      reviewDecisions,
      reviewDecisionsPath: parsed.decisionsFile
    });

    fs.mkdirSync(outputFolder, { recursive: true });
    writeJson(path.join(outputFolder, "review-report.json"), report);
    fs.writeFileSync(path.join(outputFolder, "review-report.md"), renderReviewReportMarkdown(report));
    fs.writeFileSync(path.join(outputFolder, "reviewed-handoff-plan.md"), renderReviewedHandoffPlan(report));

    printSuccess("SpecWise human review report generated:", {
      items: ["review-report.json", "review-report.md", "reviewed-handoff-plan.md"],
      lines: [
        "No patch was automatically applied.",
        "No final spec-pack was generated.",
        "Status: Review Required"
      ]
    });
    return 0;
  } catch (error) {
    if (error instanceof ReviewDecisionValidationError || error instanceof ReviewWorkflowError) {
      if (error.message === "Output folder already exists and is not empty.") {
        printOutputFolderExists();
      } else if (/^Output path exists/.test(error.message)) {
        printOutputPathNotDirectory(parsed.outputFolder);
      } else {
        printError(error.message, {
          nextAction: "Check the merge preview folder, decisions file, and --out folder."
        });
      }
      return 1;
    }
    throw error;
  }
}

export function runReview(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === "init") {
    return runReviewInit(rest);
  }

  if (subcommand === "validate") {
    return runReviewValidate(rest);
  }

  if (subcommand === "report") {
    return runReviewReport(rest);
  }

  printError("Missing or unknown review subcommand", {
    nextAction: "Use one of: review init, review validate, review report."
  });
  return 1;
}
