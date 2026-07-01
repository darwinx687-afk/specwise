import fs from "node:fs";
import path from "node:path";
import { ApplyPlanWorkflowError } from "./apply-plan-errors.mjs";

const HIGH_RISK_TERMS = ["permission", "export", "approve", "approval", "delete", "configure", "cross-department"];

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "item";
}

function targetFileFor(item) {
  const section = item.targetSection;
  if (section === "acceptanceCriteria") return "06_acceptance.md";
  if (section === "entities" || section === "fields" || section === "assumptions") return "02_entities.md";
  if (section === "roles" || section === "permissions") return "03_permissions.md";
  if (section === "workflows") return "04_workflows.md";
  if (section === "openQuestions") return "05_questions.md";
  if (section === "buildability") return "buildability-report.md";
  if (section === "bilingualSummary") return "spec-pack.zh-CN.md / spec-pack.en.md";
  return "spec-pack.json";
}

function isHighRisk(item) {
  const text = JSON.stringify({
    candidateId: item.candidateId,
    targetSection: item.targetSection,
    summary: item.summary,
    reviewerNote: item.reviewerNote,
    followUpQuestion: item.followUpQuestion
  }).toLowerCase();

  return HIGH_RISK_TERMS.some((term) => text.includes(term));
}

function actionFor(item) {
  if (item.decision === "needs_more_info") return "keep_blocked";
  if (item.decision === "deferred") return "defer";
  if (item.decision === "rejected") return "do_not_apply";
  if (item.acceptedAs === "assumption") return "convert_to_assumption";
  if (item.acceptedAs === "question") return "convert_to_question";
  if (item.acceptedAs === "acceptance_criterion") return "manually_add";
  return "manually_update";
}

function describeStep(item, action) {
  if (action === "keep_blocked") return `Keep blocked until reviewed owner answers: ${item.followUpQuestion || item.reviewerNote || item.summary}`;
  if (action === "defer") return `Defer this candidate until a later manual review: ${item.reviewerNote || item.summary}`;
  if (action === "do_not_apply") return `Do not apply this candidate: ${item.reviewerNote || item.summary}`;
  if (action === "convert_to_assumption") return `Add as a review-required assumption in the next manual spec revision: ${item.summary}`;
  if (action === "convert_to_question") return `Add as a review-required open question in the next manual spec revision: ${item.summary}`;
  if (action === "manually_add") return `Manually add this reviewed item in the next spec revision: ${item.summary}`;
  return `Manually update the next spec revision with this reviewed item: ${item.summary}`;
}

function buildManualStep(item) {
  const action = actionFor(item);
  const highRisk = isHighRisk(item);
  const requiresBusinessConfirmation = item.decision === "needs_more_info" || item.decision === "deferred" || (highRisk && item.decision !== "accepted");

  return {
    id: `step_${slug(action)}_${slug(item.candidateId)}`,
    sourceCandidateId: item.candidateId,
    decision: item.decision,
    acceptedAs: item.acceptedAs ?? null,
    targetFile: targetFileFor(item),
    targetSection: item.targetSection,
    action,
    description: describeStep(item, action),
    requiresBusinessConfirmation,
    requiresDeveloperReview: true,
    autoApplyAllowed: false
  };
}

function buildBlockedItems(report, manualSteps) {
  const byId = new Map(manualSteps.map((step) => [step.sourceCandidateId, step]));

  return report.blockedItems.map((item) => {
    const step = byId.get(item.candidateId);
    return {
      sourceCandidateId: item.candidateId,
      priority: item.priority,
      reason: item.reviewerNote || item.followUpQuestion || item.summary || "Review item blocks readiness.",
      requiredOwner: step?.requiresBusinessConfirmation ? "business_owner" : "review_owner",
      suggestedFollowUpQuestion: item.followUpQuestion ?? null
    };
  });
}

function checklistItem(id, group, text) {
  return { id, group, text, checked: false };
}

function buildRevisionChecklist(report, manualSteps) {
  const safeSteps = manualSteps.filter((step) => ["manually_add", "manually_update", "convert_to_assumption", "convert_to_question"].includes(step.action));
  const blockedSteps = manualSteps.filter((step) => step.requiresBusinessConfirmation);
  const checklist = [];

  for (const step of safeSteps) {
    checklist.push(checklistItem(
      `check_${slug(step.sourceCandidateId)}`,
      "safe_manual_updates",
      `${step.description} Target: ${step.targetFile}.`
    ));
  }

  if (blockedSteps.length > 0) {
    checklist.push(checklistItem(
      "check_business_confirmation_items",
      "requires_business_confirmation",
      `Resolve ${blockedSteps.length} business confirmation item(s) before final spec readiness.`
    ));
  }

  checklist.push(
    checklistItem("check_target_files_before_editing", "developer_review_required", "Confirm target files and sections before editing."),
    checklistItem("check_validate_after_manual_revision", "developer_review_required", "Re-run specwise validate after manual revision."),
    checklistItem("check_no_ready_for_ai_coding", "do_not_auto_apply", "Do not mark project as ready_for_ai_coding."),
    checklistItem("check_no_silent_overwrite", "do_not_auto_apply", "Do not silently overwrite deterministic draft findings.")
  );

  if (report.rejectedItems.length > 0) {
    checklist.push(checklistItem("check_rejected_items_excluded", "do_not_auto_apply", "Keep rejected items out of the next spec revision."));
  }

  return checklist;
}

function makePlanId(report) {
  return `apply_plan_${slug(report.source?.reviewId ?? report.source?.patchId ?? "review")}`;
}

export function loadReviewReportFolder(reviewReportFolder) {
  const resolvedFolder = path.resolve(process.cwd(), reviewReportFolder);
  const reportPath = path.join(resolvedFolder, "review-report.json");
  const reportMarkdownPath = path.join(resolvedFolder, "review-report.md");
  const handoffPath = path.join(resolvedFolder, "reviewed-handoff-plan.md");

  if (!fs.existsSync(reportPath)) {
    throw new ApplyPlanWorkflowError(`review-report.json not found in: ${reviewReportFolder}`);
  }
  if (!fs.existsSync(reportMarkdownPath)) {
    throw new ApplyPlanWorkflowError(`review-report.md not found in: ${reviewReportFolder}`);
  }
  if (!fs.existsSync(handoffPath)) {
    throw new ApplyPlanWorkflowError(`reviewed-handoff-plan.md not found in: ${reviewReportFolder}`);
  }

  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch (error) {
    throw new ApplyPlanWorkflowError(`review-report.json is not valid JSON: ${error.message}`);
  }
}

export function buildManualApplyPlan({ reviewReport, reviewReportPath, draftSpecPackPath, createdAt = new Date().toISOString() }) {
  const sourceItems = [
    ...reviewReport.acceptedItems,
    ...reviewReport.followUpQuestions.map((item) => ({
      ...item,
      decision: "needs_more_info",
      acceptedAs: null,
      blocksReadiness: true,
      confidence: "unknown",
      summary: item.question
    })),
    ...reviewReport.deferredItems,
    ...reviewReport.rejectedItems
  ];

  const manualSteps = sourceItems.map(buildManualStep);
  const blockedItems = buildBlockedItems(reviewReport, manualSteps);
  const revisionChecklist = buildRevisionChecklist(reviewReport, manualSteps);

  return {
    schemaVersion: "0.1.0",
    planId: makePlanId(reviewReport),
    mode: "manual_apply_plan_only",
    source: {
      reviewReportPath,
      draftSpecPackPath
    },
    summary: {
      totalReviewedItems: reviewReport.summary.totalCandidates,
      safeToApplyManually: manualSteps.filter((step) => ["manually_add", "manually_update", "convert_to_assumption", "convert_to_question"].includes(step.action)).length,
      needsBusinessConfirmation: manualSteps.filter((step) => step.requiresBusinessConfirmation && step.action !== "defer").length,
      deferred: manualSteps.filter((step) => step.action === "defer").length,
      doNotApply: manualSteps.filter((step) => step.action === "do_not_apply").length,
      blocksFinalSpec: reviewReport.summary.blocksReadiness
    },
    manualSteps,
    blockedItems,
    revisionChecklist,
    status: reviewReport.summary.blocksReadiness ? "blocked" : "manual_revision_required",
    createdAt
  };
}
