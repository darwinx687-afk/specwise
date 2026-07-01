import fs from "node:fs";
import path from "node:path";
import { ReviewWorkflowError } from "./review-errors.mjs";

function countSummary(decisions) {
  return {
    accepted: decisions.filter((item) => item.decision === "accepted").length,
    rejected: decisions.filter((item) => item.decision === "rejected").length,
    needsMoreInfo: decisions.filter((item) => item.decision === "needs_more_info").length,
    deferred: decisions.filter((item) => item.decision === "deferred").length
  };
}

function makeReviewId(patchId) {
  return `review_${String(patchId).replace(/^patch_/, "").replace(/[^a-zA-Z0-9_]+/g, "_")}`;
}

function createDefaultDecision(item) {
  if (item.type === "question_candidate" || item.type === "conflict_candidate") {
    return {
      candidateId: item.candidateId,
      decision: "needs_more_info",
      reviewerNote: "Business owner must answer this before implementation.",
      acceptedAs: null,
      blocksReadiness: true,
      followUpQuestion: item.summary
    };
  }

  if (item.type === "assumption_candidate") {
    return {
      candidateId: item.candidateId,
      decision: "deferred",
      reviewerNote: "Review this assumption before including it in a future spec revision.",
      acceptedAs: null,
      blocksReadiness: item.priority === "high",
      followUpQuestion: null
    };
  }

  return {
    candidateId: item.candidateId,
    decision: "deferred",
    reviewerNote: "Confirm evidence and business impact before accepting this candidate.",
    acceptedAs: null,
    blocksReadiness: item.priority === "high",
    followUpQuestion: null
  };
}

export function loadMergePreviewFolder(mergePreviewFolder) {
  const resolvedFolder = path.resolve(process.cwd(), mergePreviewFolder);
  const previewPath = path.join(resolvedFolder, "merge-preview.json");
  const markdownPath = path.join(resolvedFolder, "merge-preview.md");

  if (!fs.existsSync(previewPath)) {
    throw new ReviewWorkflowError(`merge-preview.json not found in: ${mergePreviewFolder}`);
  }
  if (!fs.existsSync(markdownPath)) {
    throw new ReviewWorkflowError(`merge-preview.md not found in: ${mergePreviewFolder}`);
  }

  try {
    return JSON.parse(fs.readFileSync(previewPath, "utf8"));
  } catch (error) {
    throw new ReviewWorkflowError(`merge-preview.json is not valid JSON: ${error.message}`);
  }
}

export function createReviewTemplate({ mergePreview, mergePreviewPath, createdAt = new Date().toISOString() }) {
  const decisions = mergePreview.reviewQueue.map(createDefaultDecision);

  return {
    schemaVersion: "0.1.0",
    reviewId: makeReviewId(mergePreview.patchId),
    source: {
      mergePreviewPath,
      patchId: mergePreview.patchId
    },
    reviewer: {
      name: "manual-reviewer",
      role: "human_reviewer"
    },
    decisions,
    summary: countSummary(decisions),
    status: "draft_review",
    createdAt
  };
}

export function renderReviewDecisionsMarkdown({ reviewDecisions, mergePreview }) {
  const queueById = new Map(mergePreview.reviewQueue.map((item) => [item.candidateId, item]));
  const lines = [
    "# SpecWise Review Decisions Template",
    "",
    "This file is a human review template.",
    "No AI patch has been applied.",
    "",
    "本文件只是人工审查模板，不会自动应用 AI patch。",
    "",
    "## Review Summary",
    "",
    `- Review ID: ${reviewDecisions.reviewId}`,
    `- Source patch: ${reviewDecisions.source.patchId}`,
    `- Total candidates: ${reviewDecisions.decisions.length}`,
    `- Default status: ${reviewDecisions.status}`,
    "",
    "## Decisions",
    ""
  ];

  for (const decision of reviewDecisions.decisions) {
    const item = queueById.get(decision.candidateId) ?? {};
    lines.push(
      `### ${decision.candidateId}`,
      "",
      `- Candidate type: ${item.type ?? "unknown"}`,
      `- Target section: ${item.targetSection ?? "unknown"}`,
      `- Priority: ${item.priority ?? "unknown"}`,
      `- Confidence: ${item.confidence ?? "unknown"}`,
      `- Suggested decision: ${decision.decision}`,
      `- Reviewer note: ${decision.reviewerNote ?? ""}`,
      `- Follow-up question: ${decision.followUpQuestion ?? ""}`,
      `- Blocks readiness: ${decision.blocksReadiness}`,
      ""
    );
  }

  lines.push(
    "## Reminder",
    "",
    "Accepted decisions are not automatically applied in SpecWise v0.1.",
    ""
  );

  return lines.join("\n");
}
