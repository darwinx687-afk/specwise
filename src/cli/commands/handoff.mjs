import fs from "node:fs";
import path from "node:path";
import { buildHandoffPack, normalizeTargetAgents } from "../../handoff/build-handoff-pack.mjs";
import { HandoffValidationError, HandoffWorkflowError } from "../../handoff/handoff-errors.mjs";
import {
  renderAcceptanceCriteria,
  renderAgentInstructions,
  renderAgentSpecific,
  renderEntitiesAndFields,
  renderEvidenceMapSummary,
  renderImplementationBoundaries,
  renderManualApplyPlanSummary,
  renderModulesAndPages,
  renderOpenQuestions,
  renderPackReadme,
  renderPermissionsAndScopes,
  renderProjectContext,
  renderWorkflowsAndStates
} from "../../handoff/render-handoff-pack.mjs";
import { validateHandoffPackFolder } from "../../handoff/validate-handoff-pack.mjs";
import { isNonEmptyDirectory, pathExists } from "../../utils/fs.mjs";

function parseCreateArgs(args) {
  const parsed = {
    draftSpecPackPath: null,
    manualApplyPlanPath: null,
    outputFolder: null,
    targetText: null,
    force: false,
    errors: []
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--force") {
      parsed.force = true;
      continue;
    }

    if (arg === "--apply-plan" || arg === "--out" || arg === "--target") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        parsed.errors.push(`Missing value for ${arg}`);
      } else if (arg === "--apply-plan") {
        parsed.manualApplyPlanPath = value;
        index += 1;
      } else if (arg === "--out") {
        parsed.outputFolder = value;
        index += 1;
      } else {
        parsed.targetText = value;
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

function printHandoffHelp() {
  console.log(`SpecWise handoff

Usage:
  specwise handoff create <draft-spec-pack-path> --apply-plan <manual-apply-plan-file> --out <output-folder> [--target codex,claude-code,cursor,spec-kit] [--force]
  specwise handoff validate <handoff-pack-folder>

Safety:
  handoff creates context-only skeletons.
  No coding agents are called.
  No application code or final spec-pack is generated.`);
}

function printHandoffCreateHelp() {
  console.log(`SpecWise handoff create

Usage:
  specwise handoff create <draft-spec-pack-path> --apply-plan <manual-apply-plan-file> --out <output-folder> [--target codex,claude-code,cursor,spec-kit] [--force]

Creates an agent handoff pack skeleton for human review and future agent context.
No coding agents are called.`);
}

function printHandoffValidateHelp() {
  console.log(`SpecWise handoff validate

Usage:
  specwise handoff validate <handoff-pack-folder>

Validates handoff manifest, machine artifacts, required files, agent-specific boundary notes, and safety phrases.
No files are modified.`);
}

function assertWritableOutputFolder(outputFolder, force) {
  const resolvedOutputFolder = path.resolve(process.cwd(), outputFolder);
  if (pathExists(resolvedOutputFolder) && !fs.statSync(resolvedOutputFolder).isDirectory()) {
    throw new HandoffWorkflowError(`ERROR output path exists and is not a directory: ${outputFolder}`);
  }
  if (isNonEmptyDirectory(resolvedOutputFolder) && !force) {
    throw new HandoffWorkflowError(`ERROR output folder already exists and is not empty: ${outputFolder}. Use --force to overwrite it.`);
  }
  if (force && pathExists(resolvedOutputFolder)) {
    fs.rmSync(resolvedOutputFolder, { recursive: true, force: true });
  }
  return resolvedOutputFolder;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function copySourceArtifacts({ pack, outputFolder }) {
  const machineFolder = path.join(outputFolder, "machine");
  fs.mkdirSync(machineFolder, { recursive: true });
  fs.copyFileSync(pack.sourceFiles.specPackPath, path.join(machineFolder, "spec-pack.json"));
  fs.copyFileSync(pack.sourceFiles.evidenceMapPath, path.join(machineFolder, "evidence-map.json"));
  fs.copyFileSync(pack.sourceFiles.buildabilityReportPath, path.join(machineFolder, "buildability-report.md"));
  fs.copyFileSync(pack.sourceFiles.manualApplyPlanPath, path.join(machineFolder, "manual-apply-plan.json"));
}

function writeHandoffPack({ pack, outputFolder }) {
  fs.mkdirSync(outputFolder, { recursive: true });
  fs.mkdirSync(path.join(outputFolder, "agent-specific"), { recursive: true });

  writeJson(path.join(outputFolder, "handoff-manifest.json"), pack.manifest);
  fs.writeFileSync(path.join(outputFolder, "README.md"), renderPackReadme({ manifest: pack.manifest }));
  fs.writeFileSync(path.join(outputFolder, "00_agent-instructions.md"), renderAgentInstructions());
  fs.writeFileSync(path.join(outputFolder, "01_project-context.md"), renderProjectContext({ specPack: pack.specPack, manifest: pack.manifest }));
  fs.writeFileSync(path.join(outputFolder, "02_modules-and-pages.md"), renderModulesAndPages({ specPack: pack.specPack }));
  fs.writeFileSync(path.join(outputFolder, "03_entities-and-fields.md"), renderEntitiesAndFields({ specPack: pack.specPack }));
  fs.writeFileSync(path.join(outputFolder, "04_permissions-and-scopes.md"), renderPermissionsAndScopes({ specPack: pack.specPack }));
  fs.writeFileSync(path.join(outputFolder, "05_workflows-and-states.md"), renderWorkflowsAndStates({ specPack: pack.specPack }));
  fs.writeFileSync(path.join(outputFolder, "06_acceptance-criteria.md"), renderAcceptanceCriteria({ specPack: pack.specPack }));
  fs.writeFileSync(path.join(outputFolder, "07_open-questions.md"), renderOpenQuestions({ specPack: pack.specPack, manualApplyPlan: pack.manualApplyPlan }));
  fs.writeFileSync(path.join(outputFolder, "08_evidence-map-summary.md"), renderEvidenceMapSummary({ evidenceMap: pack.evidenceMap }));
  fs.writeFileSync(path.join(outputFolder, "09_implementation-boundaries.md"), renderImplementationBoundaries({ manifest: pack.manifest }));
  fs.writeFileSync(path.join(outputFolder, "10_manual-apply-plan-summary.md"), renderManualApplyPlanSummary({ manualApplyPlan: pack.manualApplyPlan }));

  for (const target of pack.manifest.targetAgents) {
    fs.writeFileSync(path.join(outputFolder, "agent-specific", `${target}.md`), renderAgentSpecific({
      target,
      specPack: pack.specPack,
      manualApplyPlan: pack.manualApplyPlan
    }));
  }

  copySourceArtifacts({ pack, outputFolder });
}

function runHandoffCreate(args) {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    printHandoffCreateHelp();
    return 0;
  }

  const parsed = parseCreateArgs(args);
  if (!parsed.draftSpecPackPath) {
    console.error("ERROR handoff create requires <draft-spec-pack-path>");
    return 1;
  }
  if (!parsed.manualApplyPlanPath) {
    console.error("ERROR handoff create requires --apply-plan <manual-apply-plan-file>");
    return 1;
  }
  if (!parsed.outputFolder) {
    console.error("ERROR handoff create requires --out <output-folder>");
    return 1;
  }
  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) console.error(`ERROR ${error}`);
    return 1;
  }

  try {
    const targetAgents = normalizeTargetAgents(parsed.targetText);
    const outputFolder = assertWritableOutputFolder(parsed.outputFolder, parsed.force);
    const pack = buildHandoffPack({
      draftSpecPackPath: parsed.draftSpecPackPath,
      manualApplyPlanPath: parsed.manualApplyPlanPath,
      targetAgents
    });
    writeHandoffPack({ pack, outputFolder });
    validateHandoffPackFolder(outputFolder);

    console.log("SpecWise agent handoff pack skeleton created:");
    console.log("- README.md");
    console.log("- handoff-manifest.json");
    console.log("- agent instruction files");
    console.log("- machine-readable source artifacts");
    console.log("");
    console.log("No agent was called.");
    console.log("No implementation tasks were created.");
    console.log("No final spec-pack was generated.");
    console.log("Status: Review Required");
    return 0;
  } catch (error) {
    if (error instanceof HandoffWorkflowError || error instanceof HandoffValidationError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

function runHandoffValidate(args) {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    printHandoffValidateHelp();
    return 0;
  }

  const handoffPackFolder = args[0];
  if (!handoffPackFolder || args.length > 1) {
    console.error("ERROR handoff validate requires <handoff-pack-folder>");
    return 1;
  }

  try {
    validateHandoffPackFolder(handoffPackFolder);
    console.log(`SpecWise handoff pack validation passed: ${handoffPackFolder}`);
    return 0;
  } catch (error) {
    if (error instanceof HandoffValidationError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

export function runHandoff(args) {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    printHandoffHelp();
    return 0;
  }

  if (subcommand === "create") {
    return runHandoffCreate(rest);
  }

  if (subcommand === "validate") {
    return runHandoffValidate(rest);
  }

  console.error("ERROR handoff requires a subcommand: create or validate");
  return 1;
}
