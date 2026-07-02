import { ReviewWorkflowError } from "./review-errors.mjs";

const HIGH_RISK_TERMS = ["permission", "export", "approve", "approval", "delete", "configure", "workflow state", "cross-department"];

function countSummary(decisions) {
  return {
    totalCandidates: decisions.length,
    accepted: decisions.filter((item) => item.decision === "accepted").length,
    rejected: decisions.filter((item) => item.decision === "rejected").length,
    needsMoreInfo: decisions.filter((item) => item.decision === "needs_more_info").length,
    deferred: decisions.filter((item) => item.decision === "deferred").length,
    blocksReadiness: decisions.some((item) => item.blocksReadiness)
  };
}

function isHighRiskItem(item) {
  const text = JSON.stringify({
    candidateId: item.candidateId,
    targetSection: item.targetSection,
    summary: item.summary,
    reviewerNote: item.reviewerNote,
    followUpQuestion: item.followUpQuestion
  }).toLowerCase();

  return HIGH_RISK_TERMS.some((term) => text.includes(term));
}

function enrichDecision(decision, queueItem) {
  const item = {
    candidateId: decision.candidateId,
    decision: decision.decision,
    acceptedAs: decision.acceptedAs,
    blocksReadiness: decision.blocksReadiness,
    followUpQuestion: decision.followUpQuestion,
    reviewerNote: decision.reviewerNote,
    type: queueItem.type,
    targetSection: queueItem.targetSection,
    targetId: queueItem.targetId,
    priority: queueItem.priority,
    confidence: queueItem.confidence,
    summary: queueItem.summary
  };
  return {
    ...item,
    highRisk: isHighRiskItem(item)
  };
}

function groupItems(enriched) {
  return {
    safeToCarryForward: enriched.filter((item) => item.decision === "accepted"),
    needsBusinessConfirmation: enriched.filter((item) => item.decision === "needs_more_info"),
    deferredForLater: enriched.filter((item) => item.decision === "deferred"),
    doNotApply: enriched.filter((item) => item.decision === "rejected")
  };
}

function ownerForBlockedItem(item) {
  if (item.decision === "needs_more_info" || item.highRisk) return "business_owner";
  if (item.decision === "deferred") return "review_owner";
  return "review_owner";
}

function buildBlockedReadinessReasons(blockedItems) {
  return blockedItems.map((item) => ({
    candidateId: item.candidateId,
    priority: item.priority,
    targetSection: item.targetSection,
    suggestedOwner: ownerForBlockedItem(item),
    reason: item.reviewerNote || item.followUpQuestion || item.summary || "Review item blocks readiness.",
    followUpQuestion: item.followUpQuestion ?? null,
    highRisk: item.highRisk
  }));
}

function buildNextReviewActions({ acceptedItems, deferredItems, rejectedItems, followUpQuestions, blockedItems }) {
  const actions = [];

  if (followUpQuestions.length > 0) {
    actions.push(`Answer ${followUpQuestions.length} follow-up question(s) before final spec readiness.`);
  }
  if (blockedItems.length > 0) {
    actions.push(`Resolve ${blockedItems.length} blocked readiness item(s) with the suggested owner.`);
  }
  if (acceptedItems.length > 0) {
    actions.push(`Carry ${acceptedItems.length} accepted item(s) into the next manual spec revision by hand.`);
  }
  if (deferredItems.length > 0) {
    actions.push(`Keep ${deferredItems.length} deferred item(s) out of scope until a later review.`);
  }
  if (rejectedItems.length > 0) {
    actions.push(`Keep ${rejectedItems.length} rejected item(s) out of the next spec revision.`);
  }

  actions.push("Do not auto-apply the patch, generate a final spec-pack, or mark the pack ready for AI coding.");
  return actions;
}

export function buildReviewReport({ mergePreview, mergePreviewPath, reviewDecisions, reviewDecisionsPath }) {
  const queueById = new Map(mergePreview.reviewQueue.map((item) => [item.candidateId, item]));
  const missingFromPreview = reviewDecisions.decisions
    .filter((decision) => !queueById.has(decision.candidateId))
    .map((decision) => decision.candidateId);

  if (missingFromPreview.length > 0) {
    throw new ReviewWorkflowError(`Review decisions reference unknown candidate(s): ${missingFromPreview.join(", ")}`);
  }

  const missingDecisions = mergePreview.reviewQueue
    .filter((item) => !reviewDecisions.decisions.some((decision) => decision.candidateId === item.candidateId))
    .map((item) => item.candidateId);

  if (missingDecisions.length > 0) {
    throw new ReviewWorkflowError(`Review decisions missing candidate(s): ${missingDecisions.join(", ")}`);
  }

  const enriched = reviewDecisions.decisions.map((decision) => enrichDecision(decision, queueById.get(decision.candidateId)));
  const acceptedItems = enriched.filter((item) => item.decision === "accepted");
  const rejectedItems = enriched.filter((item) => item.decision === "rejected");
  const deferredItems = enriched.filter((item) => item.decision === "deferred");
  const blockedItems = enriched.filter((item) => item.blocksReadiness);
  const groupedItems = groupItems(enriched);
  const followUpQuestions = enriched
    .filter((item) => item.decision === "needs_more_info")
    .map((item) => ({
      candidateId: item.candidateId,
      targetSection: item.targetSection,
      priority: item.priority,
      question: item.followUpQuestion,
      reviewerNote: item.reviewerNote,
      highRisk: item.highRisk
    }));
  const blockedReadinessReasons = buildBlockedReadinessReasons(blockedItems);
  const nextReviewActions = buildNextReviewActions({
    acceptedItems,
    deferredItems,
    rejectedItems,
    followUpQuestions,
    blockedItems
  });

  return {
    schemaVersion: "0.1.0",
    mode: "human_review_report",
    source: {
      mergePreviewPath,
      reviewDecisionsPath,
      patchId: mergePreview.patchId,
      reviewId: reviewDecisions.reviewId
    },
    summary: countSummary(reviewDecisions.decisions),
    acceptedItems,
    rejectedItems,
    deferredItems,
    blockedItems,
    groupedItems,
    followUpQuestions,
    blockedReadinessReasons,
    nextReviewActions,
    blockedAutoApplyReasons: [
      "SpecWise v0.1 does not auto-apply AI patches.",
      "Human review decisions produce reports and handoff plans only.",
      "No final spec-pack was generated.",
      "Draft spec-pack was not modified."
    ],
    status: "review_required"
  };
}
