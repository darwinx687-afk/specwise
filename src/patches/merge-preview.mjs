import fs from "node:fs";
import path from "node:path";
import { renderMergePreviewMarkdown } from "./render-merge-preview.mjs";

function countCandidatesByType(candidates, type) {
  return candidates.filter((candidate) => candidate.type === type).length;
}

function getReviewAction(candidate) {
  if (candidate.type === "question_candidate") return "answer_or_assign_owner";
  if (candidate.type === "assumption_candidate") return "confirm_revise_or_reject";
  if (candidate.type === "conflict_candidate") return "resolve_conflict";
  return "confirm_or_reject";
}

function getPriority(candidate) {
  if (candidate.proposal?.priority) return candidate.proposal.priority;
  if (candidate.type === "conflict_candidate" || candidate.type === "question_candidate") return "high";
  return "medium";
}

export function createMergePreview({ draftSpecPackPath, patch }) {
  const candidates = patch.candidates;

  return {
    schemaVersion: "0.1.0",
    mode: "merge_preview_only",
    draftSpecPackPath,
    patchId: patch.patchId,
    summary: {
      totalCandidates: candidates.length,
      confirmedCandidates: countCandidatesByType(candidates, "confirmed_candidate"),
      assumptionCandidates: countCandidatesByType(candidates, "assumption_candidate"),
      questionCandidates: countCandidatesByType(candidates, "question_candidate"),
      conflictCandidates: countCandidatesByType(candidates, "conflict_candidate"),
      requiresHumanReview: true
    },
    reviewQueue: candidates.map((candidate) => ({
      candidateId: candidate.id,
      type: candidate.type,
      targetSection: candidate.targetSection,
      targetId: candidate.targetId,
      operation: candidate.operation,
      priority: getPriority(candidate),
      reviewAction: getReviewAction(candidate),
      summary: candidate.title,
      confidence: candidate.confidence,
      needsReview: candidate.needsReview,
      rationale: candidate.rationale
    })),
    blockedAutoApplyReasons: [
      "SpecWise v0.1 does not auto-apply AI patches.",
      "All AI candidates require human review.",
      "Conflicting or unsupported claims must remain questions or assumptions.",
      "No silent overwrite is allowed."
    ],
    status: "review_required"
  };
}

export function writeMergePreview(preview, outputFolder) {
  fs.mkdirSync(outputFolder, { recursive: true });
  fs.writeFileSync(path.join(outputFolder, "merge-preview.json"), `${JSON.stringify(preview, null, 2)}\n`);
  fs.writeFileSync(path.join(outputFolder, "merge-preview.md"), renderMergePreviewMarkdown(preview));
}
