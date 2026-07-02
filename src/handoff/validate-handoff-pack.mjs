import fs from "node:fs";
import path from "node:path";
import { loadManualApplyPlan } from "../apply-plan/validate-manual-apply-plan.mjs";
import { HandoffValidationError } from "./handoff-errors.mjs";

const ALLOWED_STATUSES = new Set(["review_required", "discovery_handoff", "blocked_handoff", "implementation_candidate"]);
const ALLOWED_HANDOFF_TYPES = new Set(["blocked_handoff", "discovery_handoff", "implementation_candidate"]);
const ALLOWED_TARGETS = new Set(["codex", "claude-code", "cursor", "spec-kit"]);
const REQUIRED_ROOT_FILES = [
  "README.md",
  "handoff-manifest.json",
  "00_agent-instructions.md",
  "01_project-context.md",
  "02_modules-and-pages.md",
  "03_entities-and-fields.md",
  "04_permissions-and-scopes.md",
  "05_workflows-and-states.md",
  "06_acceptance-criteria.md",
  "07_open-questions.md",
  "08_evidence-map-summary.md",
  "09_implementation-boundaries.md",
  "10_manual-apply-plan-summary.md"
];
const REQUIRED_MACHINE_FILES = [
  "machine/README.md",
  "machine/spec-pack.json",
  "machine/evidence-map.json",
  "machine/buildability-report.md",
  "machine/manual-apply-plan.json"
];
const COMMON_SAFETY_PHRASE_CHECKS = [
  ["README.md", "not an implementation request"],
  ["00_agent-instructions.md", "Do not implement unresolved business rules"],
  ["07_open-questions.md", "must not be converted into implementation facts"],
  ["09_implementation-boundaries.md", "Implementation is not authorized"],
  ["10_manual-apply-plan-summary.md", "No patch was automatically applied"],
  ["machine/README.md", "not generated application code"]
];
const AGENT_SAFETY_PHRASE_CHECKS = {
  "codex": [["agent-specific/codex.md", "not an instruction to implement"]],
  "claude-code": [["agent-specific/claude-code.md", "not an instruction to implement"]],
  "cursor": [["agent-specific/cursor.md", "not an instruction to implement"]],
  "spec-kit": [["agent-specific/spec-kit.md", "not a generated Spec Kit task list"]]
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function fileExists(folder, relativePath) {
  return fs.existsSync(path.join(folder, relativePath));
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new HandoffValidationError(`${label} is not valid JSON: ${error.message}`);
  }
}

function fileContains(folder, relativePath, phrase) {
  const filePath = path.join(folder, relativePath);
  if (!fs.existsSync(filePath)) return false;
  return fs.readFileSync(filePath, "utf8").includes(phrase);
}

function collectSafetyPhraseErrors(folder, checks) {
  const errors = [];
  for (const [relativePath, phrase] of checks) {
    if (!fileContains(folder, relativePath, phrase)) {
      errors.push(`${relativePath} must contain safety phrase: ${phrase}`);
    }
  }
  return errors;
}

export function validateHandoffManifestDocument(manifest) {
  const errors = [];

  if (!isObject(manifest)) {
    throw new HandoffValidationError("Handoff manifest must be a JSON object.");
  }

  if (manifest.schemaVersion !== "0.1.0") errors.push("schemaVersion must be 0.1.0");
  if (manifest.mode !== "agent_handoff_pack_skeleton") errors.push("mode must be agent_handoff_pack_skeleton");
  if (!hasText(manifest.packId)) errors.push("packId is required");

  if (!isObject(manifest.source)) {
    errors.push("source is required");
  } else {
    if (!hasText(manifest.source.draftSpecPackPath)) errors.push("source.draftSpecPackPath is required");
    if (!hasText(manifest.source.manualApplyPlanPath)) errors.push("source.manualApplyPlanPath is required");
    if (!hasText(manifest.source.specPackStatus)) errors.push("source.specPackStatus is required");
    if (manifest.source.specPackStatus === "ready_for_ai_coding") errors.push("source.specPackStatus must not be ready_for_ai_coding");
    if (typeof manifest.source.buildabilityScore !== "number") errors.push("source.buildabilityScore must be a number");
    if (manifest.source.hasEvidenceMap !== true) errors.push("source.hasEvidenceMap must be true");
    if (manifest.source.hasManualApplyPlan !== true) errors.push("source.hasManualApplyPlan must be true");
  }

  if (!Array.isArray(manifest.targetAgents) || manifest.targetAgents.length === 0) {
    errors.push("targetAgents must be a non-empty array");
  } else {
    for (const target of manifest.targetAgents) {
      if (!ALLOWED_TARGETS.has(target)) errors.push(`Unsupported target agent: ${target}`);
    }
  }

  if (!isObject(manifest.safety)) {
    errors.push("safety is required");
  } else {
    if (manifest.safety.noAgentCallsMade !== true) errors.push("safety.noAgentCallsMade must be true");
    if (manifest.safety.noAutoImplementation !== true) errors.push("safety.noAutoImplementation must be true");
    if (manifest.safety.noFinalSpecPackGenerated !== true) errors.push("safety.noFinalSpecPackGenerated must be true");
    if (manifest.safety.openQuestionsMustRemainVisible !== true) errors.push("safety.openQuestionsMustRemainVisible must be true");
    if (manifest.safety.assumptionsMustRemainMarked !== true) errors.push("safety.assumptionsMustRemainMarked must be true");
    if (manifest.safety.permissionsRequireReview !== true) errors.push("safety.permissionsRequireReview must be true");
  }

  if (!isObject(manifest.gates)) {
    errors.push("gates is required");
  } else {
    if (!ALLOWED_HANDOFF_TYPES.has(manifest.gates.handoffType)) errors.push("gates.handoffType is not supported");
    if (manifest.gates.implementationAllowed !== false) errors.push("gates.implementationAllowed must be false");
    for (const field of ["blockedByOpenQuestions", "blockedByManualApplyPlan"]) {
      if (typeof manifest.gates[field] !== "boolean") errors.push(`gates.${field} must be a boolean`);
    }
  }

  if (!ALLOWED_STATUSES.has(manifest.status)) {
    errors.push("status is not supported");
  }
  if (manifest.status === "ready_for_ai_coding") {
    errors.push("status must not be ready_for_ai_coding");
  }

  if (errors.length > 0) {
    throw new HandoffValidationError(errors);
  }

  return true;
}

export function loadHandoffManifest(manifestFile) {
  if (!manifestFile) {
    throw new HandoffValidationError("Handoff manifest file path is required.");
  }
  if (!fs.existsSync(manifestFile)) {
    throw new HandoffValidationError(`handoff-manifest.json not found: ${manifestFile}`);
  }
  const manifest = readJson(manifestFile, "handoff-manifest.json");
  validateHandoffManifestDocument(manifest);
  return manifest;
}

export function validateHandoffPackFolder(handoffPackFolder) {
  const resolvedFolder = path.resolve(process.cwd(), handoffPackFolder);
  const errors = [];

  if (!fs.existsSync(resolvedFolder) || !fs.statSync(resolvedFolder).isDirectory()) {
    throw new HandoffValidationError(`Handoff pack folder not found: ${handoffPackFolder}`);
  }

  for (const file of REQUIRED_ROOT_FILES) {
    if (!fileExists(resolvedFolder, file)) errors.push(`${file} is required`);
  }
  for (const file of REQUIRED_MACHINE_FILES) {
    if (!fileExists(resolvedFolder, file)) errors.push(`${file} is required`);
  }

  if (errors.length > 0) {
    throw new HandoffValidationError(errors);
  }

  const manifest = loadHandoffManifest(path.join(resolvedFolder, "handoff-manifest.json"));

  for (const target of manifest.targetAgents) {
    const targetFile = path.join("agent-specific", `${target}.md`);
    if (!fileExists(resolvedFolder, targetFile)) errors.push(`${targetFile} is required`);
  }

  errors.push(...collectSafetyPhraseErrors(resolvedFolder, COMMON_SAFETY_PHRASE_CHECKS));
  for (const target of manifest.targetAgents) {
    errors.push(...collectSafetyPhraseErrors(resolvedFolder, AGENT_SAFETY_PHRASE_CHECKS[target] || []));
  }

  try {
    loadManualApplyPlan(path.join(resolvedFolder, "machine", "manual-apply-plan.json"));
  } catch (error) {
    errors.push(error.message.replace(/^ERROR /, ""));
  }

  if (errors.length > 0) {
    throw new HandoffValidationError(errors);
  }

  return manifest;
}
