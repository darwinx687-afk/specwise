import fs from "node:fs";
import path from "node:path";
import { ManualApplyPlanValidationError } from "./apply-plan-errors.mjs";

const ALLOWED_ACTIONS = new Set([
  "manually_add",
  "manually_update",
  "convert_to_question",
  "convert_to_assumption",
  "keep_blocked",
  "defer",
  "do_not_apply"
]);

const ALLOWED_STATUSES = new Set(["manual_revision_required", "blocked"]);
const FORBIDDEN_OUTPUT_KEYS = ["finalSpecPackPath", "appliedSpecPackPath", "outputSpecPackPath", "readyForAiCodingPath"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStep(step, index) {
  const errors = [];
  const label = step?.id || `manualStep at index ${index}`;

  if (!isObject(step)) {
    return [`${label} must be an object`];
  }

  for (const field of ["id", "action", "description", "autoApplyAllowed"]) {
    if (step[field] === undefined || step[field] === null || step[field] === "") {
      errors.push(`${label} missing ${field}`);
    }
  }

  if (!ALLOWED_ACTIONS.has(step.action)) {
    errors.push(`${label} action is not supported: ${step.action}`);
  }
  if (step.action === "auto_apply") {
    errors.push(`${label} must not use auto_apply`);
  }
  if (step.autoApplyAllowed !== false) {
    errors.push(`${label} autoApplyAllowed must be false`);
  }

  return errors;
}

function detectForbiddenOutputs(value, pathParts = []) {
  const errors = [];
  if (!isObject(value) && !Array.isArray(value)) return errors;

  if (Array.isArray(value)) {
    value.forEach((item, index) => errors.push(...detectForbiddenOutputs(item, [...pathParts, String(index)])));
    return errors;
  }

  for (const [key, child] of Object.entries(value)) {
    const currentPath = [...pathParts, key].join(".");
    if (FORBIDDEN_OUTPUT_KEYS.includes(key)) {
      errors.push(`${currentPath} is not allowed in a manual apply plan`);
    }
    errors.push(...detectForbiddenOutputs(child, [...pathParts, key]));
  }

  return errors;
}

export function validateManualApplyPlanDocument(plan) {
  const errors = [];

  if (!isObject(plan)) {
    throw new ManualApplyPlanValidationError("Manual apply plan must be a JSON object.");
  }

  if (!hasText(plan.schemaVersion)) errors.push("schemaVersion is required");
  if (!hasText(plan.planId)) errors.push("planId is required");
  if (plan.mode !== "manual_apply_plan_only") errors.push("mode must be manual_apply_plan_only");
  if (!ALLOWED_STATUSES.has(plan.status)) errors.push("status must be manual_revision_required or blocked");

  if (!isObject(plan.source)) {
    errors.push("source is required");
  } else {
    if (!hasText(plan.source.reviewReportPath)) errors.push("source.reviewReportPath is required");
    if (!hasText(plan.source.draftSpecPackPath)) errors.push("source.draftSpecPackPath is required");
  }

  if (!Array.isArray(plan.manualSteps)) {
    errors.push("manualSteps must be an array");
  } else {
    plan.manualSteps.forEach((step, index) => errors.push(...validateStep(step, index)));
  }

  errors.push(...detectForbiddenOutputs(plan));

  if (errors.length > 0) {
    throw new ManualApplyPlanValidationError(errors);
  }

  return true;
}

export function loadManualApplyPlan(planFile) {
  if (!planFile) {
    throw new ManualApplyPlanValidationError("Manual apply plan file path is required.");
  }

  const resolvedPath = path.resolve(process.cwd(), planFile);
  if (!fs.existsSync(resolvedPath)) {
    throw new ManualApplyPlanValidationError(`Manual apply plan file not found: ${planFile}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new ManualApplyPlanValidationError(`Manual apply plan file is not valid JSON: ${error.message}`);
  }

  validateManualApplyPlanDocument(parsed);
  return parsed;
}
