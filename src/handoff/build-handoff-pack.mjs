import fs from "node:fs";
import path from "node:path";
import { loadManualApplyPlan } from "../apply-plan/validate-manual-apply-plan.mjs";
import { HandoffWorkflowError } from "./handoff-errors.mjs";

const HIGH_RISK_TERMS = ["permission", "export", "approve", "approval", "delete", "configure", "cross-department"];
const DEFAULT_TARGET_AGENTS = ["codex", "claude-code", "cursor", "spec-kit"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new HandoffWorkflowError(`${label} is not valid JSON: ${error.message}`);
  }
}

function assertFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new HandoffWorkflowError(`${label} not found: ${filePath}`);
  }
}

function makeSafeSourcePath(inputPath) {
  const resolved = path.resolve(process.cwd(), inputPath);
  const relative = path.relative(process.cwd(), resolved);
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative.startsWith(".") ? relative : `./${relative}`;
  }
  return path.basename(resolved);
}

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "handoff";
}

function projectSlug(specPack) {
  const projectName = specPack.project?.name || specPack.project?.id || specPack.project?.nameZh || "specwise_project";
  return slug(projectName);
}

function hasHighRiskText(value) {
  const text = JSON.stringify(value).toLowerCase();
  return HIGH_RISK_TERMS.some((term) => text.includes(term));
}

function hasHighRiskPermissionQuestions(specPack) {
  const questions = Array.isArray(specPack.openQuestions) ? specPack.openQuestions : [];
  return questions.some((question) => {
    if (question.priority !== "high") return false;
    if (question.category === "permission") return true;
    return hasHighRiskText(question);
  });
}

function buildGates({ specPack, manualApplyPlan }) {
  const score = Number(specPack.buildability?.score ?? 0);
  const openQuestionCount = Array.isArray(specPack.openQuestions) ? specPack.openQuestions.length : 0;
  const blockedItemCount = Array.isArray(manualApplyPlan.blockedItems) ? manualApplyPlan.blockedItems.length : 0;
  const blocksFinalSpec = manualApplyPlan.summary?.blocksFinalSpec === true;
  const highRiskPermissionQuestions = hasHighRiskPermissionQuestions(specPack);

  let handoffType = "implementation_candidate";
  if (score < 60) {
    handoffType = "blocked_handoff";
  } else if (openQuestionCount > 0 || blockedItemCount > 0 || blocksFinalSpec || highRiskPermissionQuestions) {
    handoffType = "discovery_handoff";
  }

  return {
    handoffType,
    implementationAllowed: false,
    blockedByOpenQuestions: openQuestionCount > 0,
    blockedByManualApplyPlan: blockedItemCount > 0 || blocksFinalSpec,
    blockedByLowBuildability: score < 60,
    blockedByHighRiskPermissions: highRiskPermissionQuestions
  };
}

function statusForGate(gates) {
  if (gates.handoffType === "blocked_handoff") return "blocked_handoff";
  if (gates.handoffType === "implementation_candidate") return "implementation_candidate";
  return "review_required";
}

function buildManifest({ specPack, manualApplyPlan, draftSpecPackPath, manualApplyPlanPath, targetAgents, createdAt }) {
  const gates = buildGates({ specPack, manualApplyPlan });
  const sourceStatus = specPack.buildability?.status === "ready_for_ai_coding" ? "review_required" : specPack.buildability?.status ?? "review_required";

  return {
    schemaVersion: "0.1.0",
    mode: "agent_handoff_pack_skeleton",
    packId: `handoff_${projectSlug(specPack)}_001`,
    source: {
      draftSpecPackPath: makeSafeSourcePath(draftSpecPackPath),
      manualApplyPlanPath: makeSafeSourcePath(manualApplyPlanPath),
      specPackStatus: sourceStatus,
      buildabilityScore: Number(specPack.buildability?.score ?? 0),
      hasEvidenceMap: true,
      hasManualApplyPlan: true
    },
    targetAgents,
    safety: {
      noAgentCallsMade: true,
      noAutoImplementation: true,
      noFinalSpecPackGenerated: true,
      openQuestionsMustRemainVisible: true,
      assumptionsMustRemainMarked: true,
      permissionsRequireReview: true
    },
    gates,
    status: statusForGate(gates),
    createdAt
  };
}

export function normalizeTargetAgents(targetText) {
  if (!targetText) return DEFAULT_TARGET_AGENTS;
  const targets = targetText.split(",").map((item) => item.trim()).filter(Boolean);
  const unknown = targets.filter((target) => !DEFAULT_TARGET_AGENTS.includes(target));
  if (unknown.length > 0) {
    throw new HandoffWorkflowError(`Unsupported target agent(s): ${unknown.join(", ")}`);
  }
  return [...new Set(targets)];
}

export function loadHandoffInputs({ draftSpecPackPath, manualApplyPlanPath }) {
  const resolvedDraftPath = path.resolve(process.cwd(), draftSpecPackPath);
  if (!fs.existsSync(resolvedDraftPath) || !fs.statSync(resolvedDraftPath).isDirectory()) {
    throw new HandoffWorkflowError(`Draft spec-pack folder not found: ${draftSpecPackPath}`);
  }

  const specPackPath = path.join(resolvedDraftPath, "spec-pack.json");
  const evidenceMapPath = path.join(resolvedDraftPath, "evidence-map.json");
  const buildabilityReportPath = path.join(resolvedDraftPath, "buildability-report.md");

  assertFileExists(specPackPath, "spec-pack.json");
  assertFileExists(evidenceMapPath, "evidence-map.json");
  assertFileExists(buildabilityReportPath, "buildability-report.md");

  const specPack = readJson(specPackPath, "spec-pack.json");
  const evidenceMap = readJson(evidenceMapPath, "evidence-map.json");
  const manualApplyPlan = loadManualApplyPlan(manualApplyPlanPath);

  if (!isObject(specPack.buildability)) {
    throw new HandoffWorkflowError("spec-pack.json is missing buildability.");
  }

  return {
    resolvedDraftPath,
    specPack,
    evidenceMap,
    manualApplyPlan,
    sourceFiles: {
      specPackPath,
      evidenceMapPath,
      buildabilityReportPath,
      manualApplyPlanPath: path.resolve(process.cwd(), manualApplyPlanPath)
    }
  };
}

export function buildHandoffPack({ draftSpecPackPath, manualApplyPlanPath, targetAgents, createdAt = new Date().toISOString() }) {
  const inputs = loadHandoffInputs({ draftSpecPackPath, manualApplyPlanPath });
  const manifest = buildManifest({
    specPack: inputs.specPack,
    manualApplyPlan: inputs.manualApplyPlan,
    draftSpecPackPath,
    manualApplyPlanPath,
    targetAgents,
    createdAt
  });

  return {
    manifest,
    specPack: inputs.specPack,
    evidenceMap: inputs.evidenceMap,
    manualApplyPlan: inputs.manualApplyPlan,
    sourceFiles: inputs.sourceFiles
  };
}
