import fs from "node:fs";
import path from "node:path";
import { buildReviewReport } from "../../review/build-review-report.mjs";
import { createReviewTemplate, loadMergePreviewFolder, renderReviewDecisionsMarkdown } from "../../review/create-review-template.mjs";
import { ReviewDecisionValidationError, ReviewWorkflowError } from "../../review/review-errors.mjs";
import { renderReviewedHandoffPlan, renderReviewReportMarkdown } from "../../review/render-review-report.mjs";
import { loadReviewDecisions } from "../../review/validate-review-decisions.mjs";
import { isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";

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
    throw new ReviewWorkflowError(`ERROR output path exists and is not a directory: ${outputFolder}`);
  }
  if (isNonEmptyDirectory(resolvedOutputFolder) && !force) {
    throw new ReviewWorkflowError(`ERROR output folder already exists and is not empty: ${outputFolder}. Use --force to overwrite it.`);
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
    console.error("ERROR review init requires <merge-preview-folder>");
    return 1;
  }
  if (!parsed.outputFolder) {
    console.error("ERROR review init requires --out <review-folder>");
    return 1;
  }
  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) console.error(`ERROR ${error}`);
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

    console.log("SpecWise review template created:");
    console.log("- review-decisions.json");
    console.log("- review-decisions.md");
    console.log("");
    console.log("No patch was applied.");
    console.log("All decisions require human review.");
    return 0;
  } catch (error) {
    if (error instanceof ReviewWorkflowError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

function runReviewValidate(args) {
  const decisionsFile = args[0];
  if (!decisionsFile || args.length > 1) {
    console.error("ERROR review validate requires <review-decisions-file>");
    return 1;
  }

  try {
    loadReviewDecisions(decisionsFile);
    console.log(`SpecWise review decisions validation passed: ${decisionsFile}`);
    return 0;
  } catch (error) {
    if (error instanceof ReviewDecisionValidationError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

function runReviewReport(args) {
  const parsed = parseReportArgs(args);
  if (!parsed.mergePreviewFolder) {
    console.error("ERROR review report requires <merge-preview-folder>");
    return 1;
  }
  if (!parsed.decisionsFile) {
    console.error("ERROR review report requires --decisions <review-decisions-file>");
    return 1;
  }
  if (!parsed.outputFolder) {
    console.error("ERROR review report requires --out <output-folder>");
    return 1;
  }
  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) console.error(`ERROR ${error}`);
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

    console.log("SpecWise human review report generated:");
    console.log("- review-report.json");
    console.log("- review-report.md");
    console.log("- reviewed-handoff-plan.md");
    console.log("");
    console.log("No patch was automatically applied.");
    console.log("No final spec-pack was generated.");
    console.log("Status: Review Required");
    return 0;
  } catch (error) {
    if (error instanceof ReviewDecisionValidationError || error instanceof ReviewWorkflowError) {
      console.error(error.message);
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

  console.error("ERROR review requires a subcommand: init, validate, or report");
  return 1;
}
