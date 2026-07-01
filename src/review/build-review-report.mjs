import { ReviewWorkflowError } from "./review-errors.mjs";

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

function enrichDecision(decision, queueItem) {
  return {
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
  const followUpQuestions = enriched
    .filter((item) => item.decision === "needs_more_info")
    .map((item) => ({
      candidateId: item.candidateId,
      targetSection: item.targetSection,
      priority: item.priority,
      question: item.followUpQuestion,
      reviewerNote: item.reviewerNote
    }));

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
    followUpQuestions,
    blockedAutoApplyReasons: [
      "SpecWise v0.1 does not auto-apply AI patches.",
      "Human review decisions produce reports and handoff plans only.",
      "No final spec-pack was generated.",
      "Draft spec-pack was not modified."
    ],
    status: "review_required"
  };
}
