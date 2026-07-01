import fs from "node:fs";
import path from "node:path";
import { PatchValidationError } from "./patch-errors.mjs";

const ALLOWED_CANDIDATE_TYPES = new Set([
  "confirmed_candidate",
  "assumption_candidate",
  "question_candidate",
  "conflict_candidate"
]);

const ALLOWED_TARGET_SECTIONS = new Set([
  "modules",
  "entities",
  "fields",
  "roles",
  "permissions",
  "workflows",
  "acceptanceCriteria",
  "openQuestions",
  "assumptions",
  "buildability",
  "bilingualSummary"
]);

const ALLOWED_OPERATIONS = new Set([
  "add",
  "update",
  "add_question",
  "add_assumption",
  "flag_conflict",
  "rescore"
]);

const UNSUPPORTED_OPERATIONS = new Set(["delete", "overwrite"]);
const ALLOWED_CONFIDENCE = new Set(["high", "medium", "low", "unknown"]);
const HIGH_RISK_TERMS = ["permission", "export", "approve", "delete", "configure"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasEvidence(candidate) {
  return Array.isArray(candidate.evidenceIds) && candidate.evidenceIds.length > 0;
}

function getCandidateLabel(candidate, index) {
  return candidate?.id || `candidate at index ${index}`;
}

function isHighRiskCandidate(candidate) {
  const text = JSON.stringify({
    id: candidate.id,
    targetSection: candidate.targetSection,
    targetId: candidate.targetId,
    operation: candidate.operation,
    title: candidate.title,
    proposal: candidate.proposal
  }).toLowerCase();

  return HIGH_RISK_TERMS.some((term) => text.includes(term));
}

function validateCandidate(candidate, index) {
  const errors = [];
  const label = getCandidateLabel(candidate, index);

  if (!isObject(candidate)) {
    return [`${label} must be an object`];
  }

  for (const field of ["id", "type", "targetSection", "targetId", "operation", "title", "proposal", "confidence", "needsReview", "rationale"]) {
    if (candidate[field] === undefined || candidate[field] === null || candidate[field] === "") {
      errors.push(`${label} missing ${field}`);
    }
  }

  if (candidate.proposal !== undefined && !isObject(candidate.proposal)) {
    errors.push(`${label} proposal must be an object`);
  }

  if (!ALLOWED_CANDIDATE_TYPES.has(candidate.type)) {
    errors.push(`${label} type is not supported: ${candidate.type}`);
  }

  if (!ALLOWED_TARGET_SECTIONS.has(candidate.targetSection)) {
    errors.push(`${label} targetSection is not supported: ${candidate.targetSection}`);
  }

  if (UNSUPPORTED_OPERATIONS.has(candidate.operation)) {
    errors.push(`${label} operation is not supported in v0.1: ${candidate.operation}`);
  } else if (!ALLOWED_OPERATIONS.has(candidate.operation)) {
    errors.push(`${label} operation is not supported: ${candidate.operation}`);
  }

  if (!ALLOWED_CONFIDENCE.has(candidate.confidence)) {
    errors.push(`${label} confidence must be high, medium, low, or unknown`);
  }

  if (candidate.needsReview !== true) {
    errors.push(`${label} needsReview must be true`);
  }

  if (candidate.evidenceIds !== undefined) {
    if (!Array.isArray(candidate.evidenceIds)) {
      errors.push(`${label} evidenceIds must be an array when provided`);
    } else if (candidate.evidenceIds.some((evidenceId) => typeof evidenceId !== "string" || evidenceId.length === 0)) {
      errors.push(`${label} evidenceIds must contain non-empty strings`);
    }
  }

  if (candidate.type === "confirmed_candidate" && !hasEvidence(candidate)) {
    errors.push(`${label} confirmed_candidate must have evidenceIds`);
  }

  if (candidate.type === "confirmed_candidate" && (candidate.confidence === "low" || candidate.confidence === "unknown")) {
    errors.push(`${label} confirmed_candidate cannot use low or unknown confidence`);
  }

  if (!hasEvidence(candidate) && !["assumption_candidate", "question_candidate"].includes(candidate.type)) {
    errors.push(`${label} without evidenceIds must be assumption_candidate or question_candidate`);
  }

  if (isHighRiskCandidate(candidate) && candidate.needsReview !== true && candidate.proposal?.priority !== "high") {
    errors.push(`${label} permission/export/approve/delete/configure candidates must remain needsReview or high priority`);
  }

  return errors;
}

export function validateAiPatchDocument(patch) {
  const errors = [];

  if (!isObject(patch)) {
    throw new PatchValidationError("AI patch must be a JSON object.");
  }

  if (!patch.schemaVersion) errors.push("schemaVersion is required");
  if (!patch.patchId) errors.push("patchId is required");

  if (!isObject(patch.source)) {
    errors.push("source is required");
  } else {
    if (patch.source.networkCalls !== false) {
      errors.push("source.networkCalls must be false");
    }
  }

  if (!isObject(patch.safety)) {
    errors.push("safety is required");
  } else {
    if (patch.safety.reviewRequired !== true) errors.push("safety.reviewRequired must be true");
    if (patch.safety.noSilentOverwrite !== true) errors.push("safety.noSilentOverwrite must be true");
    if (patch.safety.evidenceFirst !== true) errors.push("safety.evidenceFirst must be true");
  }

  if (!Array.isArray(patch.candidates) || patch.candidates.length === 0) {
    errors.push("candidates must be a non-empty array");
  } else {
    patch.candidates.forEach((candidate, index) => {
      errors.push(...validateCandidate(candidate, index));
    });
  }

  if (errors.length > 0) {
    throw new PatchValidationError(errors);
  }

  return true;
}

export function loadAiPatch(patchFile) {
  if (!patchFile) {
    throw new PatchValidationError("AI patch file path is required.");
  }

  const resolvedPath = path.resolve(process.cwd(), patchFile);
  if (!fs.existsSync(resolvedPath)) {
    throw new PatchValidationError(`AI patch file not found: ${patchFile}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new PatchValidationError(`AI patch file is not valid JSON: ${error.message}`);
  }

  validateAiPatchDocument(parsed);
  return parsed;
}
