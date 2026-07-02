import fs from "node:fs";
import path from "node:path";
import { buildManualApplyPlan, loadReviewReportFolder } from "../../apply-plan/build-manual-apply-plan.mjs";
import { ApplyPlanWorkflowError, ManualApplyPlanValidationError } from "../../apply-plan/apply-plan-errors.mjs";
import {
  renderBlockedItemsMarkdown,
  renderManualApplyPlanMarkdown,
  renderSpecRevisionChecklist
} from "../../apply-plan/render-manual-apply-plan.mjs";
import { loadManualApplyPlan, validateManualApplyPlanDocument } from "../../apply-plan/validate-manual-apply-plan.mjs";
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

function parseCreateArgs(args) {
  const parsed = {
    reviewReportFolder: null,
    draftSpecPackPath: null,
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

    if (arg === "--draft" || arg === "--out") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        parsed.errors.push(`Missing value for ${arg}`);
      } else if (arg === "--draft") {
        parsed.draftSpecPackPath = value;
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

    if (!parsed.reviewReportFolder) {
      parsed.reviewReportFolder = arg;
    } else {
      parsed.errors.push(`Unexpected argument: ${arg}`);
    }
  }

  return parsed;
}

function assertDraftSpecPackExists(draftSpecPackPath) {
  const resolvedPath = path.resolve(process.cwd(), draftSpecPackPath);
  if (!pathExists(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
    throw new ApplyPlanWorkflowError(`Draft spec-pack folder not found: ${draftSpecPackPath}`);
  }
  if (!pathExists(path.join(resolvedPath, "spec-pack.json"))) {
    throw new ApplyPlanWorkflowError(`Draft spec-pack folder is missing spec-pack.json: ${draftSpecPackPath}`);
  }
}

function assertWritableOutputFolder(outputFolder, force) {
  const resolvedOutputFolder = path.resolve(process.cwd(), outputFolder);
  if (pathExists(resolvedOutputFolder) && !fs.statSync(resolvedOutputFolder).isDirectory()) {
    throw new ApplyPlanWorkflowError(`Output path exists and is not a directory: ${outputFolder}`);
  }
  if (isNonEmptyDirectory(resolvedOutputFolder) && !force) {
    throw new ApplyPlanWorkflowError("Output folder already exists and is not empty.");
  }
  if (force && pathExists(resolvedOutputFolder)) {
    fs.rmSync(resolvedOutputFolder, { recursive: true, force: true });
  }
  return resolvedOutputFolder;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runApplyPlanCreate(args) {
  const parsed = parseCreateArgs(args);
  if (!parsed.reviewReportFolder) {
    printMissingArgument("<review-report-folder>", USAGE["apply-plan create"], "Provide a review report folder.");
    return 1;
  }
  if (!parsed.draftSpecPackPath) {
    printMissingOption("--draft", USAGE["apply-plan create"], "Add --draft <draft-spec-pack-path>.");
    return 1;
  }
  if (!parsed.outputFolder) {
    printMissingOption("--out", USAGE["apply-plan create"], "Add --out <output-folder>.");
    return 1;
  }
  if (parsed.errors.length > 0) {
    printParseErrors(parsed.errors, USAGE["apply-plan create"]);
    return 1;
  }

  if (!pathExists(path.resolve(process.cwd(), parsed.reviewReportFolder))) {
    printPathNotFound(parsed.reviewReportFolder);
    return 1;
  }

  if (!pathExists(path.resolve(process.cwd(), parsed.draftSpecPackPath))) {
    printPathNotFound(parsed.draftSpecPackPath);
    return 1;
  }

  try {
    assertDraftSpecPackExists(parsed.draftSpecPackPath);
    const outputFolder = assertWritableOutputFolder(parsed.outputFolder, parsed.force);
    const reviewReport = loadReviewReportFolder(parsed.reviewReportFolder);
    const plan = buildManualApplyPlan({
      reviewReport,
      reviewReportPath: parsed.reviewReportFolder,
      draftSpecPackPath: parsed.draftSpecPackPath
    });
    validateManualApplyPlanDocument(plan);

    fs.mkdirSync(outputFolder, { recursive: true });
    writeJson(path.join(outputFolder, "manual-apply-plan.json"), plan);
    fs.writeFileSync(path.join(outputFolder, "manual-apply-plan.md"), renderManualApplyPlanMarkdown(plan));
    fs.writeFileSync(path.join(outputFolder, "spec-revision-checklist.md"), renderSpecRevisionChecklist(plan));
    fs.writeFileSync(path.join(outputFolder, "blocked-items.md"), renderBlockedItemsMarkdown(plan));

    printSuccess("SpecWise manual apply plan created:", {
      items: ["manual-apply-plan.json", "manual-apply-plan.md", "spec-revision-checklist.md", "blocked-items.md"],
      lines: [
        `Status: ${plan.status === "blocked" ? "Blocked" : "Manual Revision Required"}`,
        "No patch was automatically applied.",
        "No final spec-pack was generated."
      ]
    });
    return 0;
  } catch (error) {
    if (error instanceof ApplyPlanWorkflowError || error instanceof ManualApplyPlanValidationError) {
      if (error.message === "Output folder already exists and is not empty.") {
        printOutputFolderExists();
      } else if (/^Output path exists/.test(error.message)) {
        printOutputPathNotDirectory(parsed.outputFolder);
      } else {
        printError(error.message, {
          nextAction: "Check the review report folder, draft spec-pack folder, and --out folder."
        });
      }
      return 1;
    }
    throw error;
  }
}

function runApplyPlanValidate(args) {
  const planFile = args[0];
  if (!planFile || args.length > 1) {
    printMissingArgument("<apply-plan-file>", USAGE["apply-plan validate"], "Provide a manual apply plan file.");
    return 1;
  }

  if (!pathExists(path.resolve(process.cwd(), planFile))) {
    printPathNotFound(planFile);
    return 1;
  }

  try {
    loadManualApplyPlan(planFile);
    console.log(`SpecWise manual apply plan validation passed: ${planFile}`);
    return 0;
  } catch (error) {
    if (error instanceof ManualApplyPlanValidationError) {
      printError(error.message, {
        nextAction: "Fix the manual apply plan file and try again."
      });
      return 1;
    }
    throw error;
  }
}

export function runApplyPlan(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === "create") {
    return runApplyPlanCreate(rest);
  }

  if (subcommand === "validate") {
    return runApplyPlanValidate(rest);
  }

  printError("Missing or unknown apply-plan subcommand", {
    nextAction: "Use one of: apply-plan create, apply-plan validate."
  });
  return 1;
}
