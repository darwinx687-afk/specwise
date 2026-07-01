import fs from "node:fs";
import path from "node:path";
import { ReviewDecisionValidationError } from "./review-errors.mjs";

const ALLOWED_DECISIONS = new Set(["accepted", "rejected", "needs_more_info", "deferred"]);
const ALLOWED_ACCEPTED_AS = new Set(["fact", "assumption", "question", "acceptance_criterion"]);
const HIGH_RISK_TERMS = ["permission", "export", "approve", "delete", "configure"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function countSummary(decisions) {
  return {
    accepted: decisions.filter((item) => item.decision === "accepted").length,
    rejected: decisions.filter((item) => item.decision === "rejected").length,
    needsMoreInfo: decisions.filter((item) => item.decision === "needs_more_info").length,
    deferred: decisions.filter((item) => item.decision === "deferred").length
  };
}

function isHighRiskDecision(decision) {
  const text = JSON.stringify({
    candidateId: decision.candidateId,
    reviewerNote: decision.reviewerNote,
    followUpQuestion: decision.followUpQuestion
  }).toLowerCase();

  return HIGH_RISK_TERMS.some((term) => text.includes(term));
}

function validateDecision(decision, index) {
  const errors = [];
  const label = decision?.candidateId || `decision at index ${index}`;

  if (!isObject(decision)) {
    return [`${label} must be an object`];
  }

  if (!hasText(decision.candidateId)) errors.push(`${label} candidateId is required`);
  if (!ALLOWED_DECISIONS.has(decision.decision)) errors.push(`${label} decision is not supported: ${decision.decision}`);
  if (typeof decision.blocksReadiness !== "boolean") errors.push(`${label} blocksReadiness must be boolean`);

  if (decision.acceptedAs !== null && decision.acceptedAs !== undefined && !ALLOWED_ACCEPTED_AS.has(decision.acceptedAs)) {
    errors.push(`${label} acceptedAs is not supported: ${decision.acceptedAs}`);
  }

  if (decision.decision === "accepted" && !ALLOWED_ACCEPTED_AS.has(decision.acceptedAs)) {
    errors.push(`${label} accepted decision requires acceptedAs`);
  }

  if (decision.decision !== "accepted" && decision.acceptedAs !== null) {
    errors.push(`${label} non-accepted decision must use acceptedAs null`);
  }

  if (decision.decision === "rejected" && !hasText(decision.reviewerNote)) {
    errors.push(`${label} rejected decision requires reviewerNote`);
  }

  if (decision.decision === "needs_more_info" && !hasText(decision.followUpQuestion)) {
    errors.push(`${label} needs_more_info decision requires followUpQuestion`);
  }

  if (decision.decision === "deferred" && !hasText(decision.reviewerNote)) {
    errors.push(`${label} deferred decision requires reviewerNote`);
  }

  if (isHighRiskDecision(decision) && !["accepted", "rejected", "needs_more_info", "deferred"].includes(decision.decision)) {
    errors.push(`${label} high-risk permission decision must be accepted, rejected, needs_more_info, or deferred`);
  }

  return errors;
}

export function validateReviewDecisionsDocument(document) {
  const errors = [];

  if (!isObject(document)) {
    throw new ReviewDecisionValidationError("Review decisions must be a JSON object.");
  }

  if (!hasText(document.schemaVersion)) errors.push("schemaVersion is required");
  if (!hasText(document.reviewId)) errors.push("reviewId is required");

  if (!isObject(document.source)) {
    errors.push("source is required");
  } else {
    if (!hasText(document.source.mergePreviewPath)) errors.push("source.mergePreviewPath is required");
    if (!hasText(document.source.patchId)) errors.push("source.patchId is required");
  }

  if (!isObject(document.reviewer)) {
    errors.push("reviewer is required");
  } else {
    if (!hasText(document.reviewer.name)) errors.push("reviewer.name is required");
    if (!hasText(document.reviewer.role)) errors.push("reviewer.role is required");
  }

  if (!Array.isArray(document.decisions)) {
    errors.push("decisions must be an array");
  } else {
    const seen = new Set();
    document.decisions.forEach((decision, index) => {
      if (decision?.candidateId) {
        if (seen.has(decision.candidateId)) errors.push(`${decision.candidateId} is duplicated`);
        seen.add(decision.candidateId);
      }
      errors.push(...validateDecision(decision, index));
    });
  }

  if (!isObject(document.summary)) {
    errors.push("summary is required");
  } else if (Array.isArray(document.decisions)) {
    const expected = countSummary(document.decisions);
    for (const [key, value] of Object.entries(expected)) {
      if (document.summary[key] !== value) {
        errors.push(`summary.${key} must equal ${value}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ReviewDecisionValidationError(errors);
  }

  return true;
}

export function loadReviewDecisions(decisionsFile) {
  if (!decisionsFile) {
    throw new ReviewDecisionValidationError("Review decisions file path is required.");
  }

  const resolvedPath = path.resolve(process.cwd(), decisionsFile);
  if (!fs.existsSync(resolvedPath)) {
    throw new ReviewDecisionValidationError(`Review decisions file not found: ${decisionsFile}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new ReviewDecisionValidationError(`Review decisions file is not valid JSON: ${error.message}`);
  }

  validateReviewDecisionsDocument(parsed);
  return parsed;
}
