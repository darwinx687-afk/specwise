export function renderMergePreviewMarkdown(preview) {
  const lines = [
    "# SpecWise AI Patch Merge Preview",
    "",
    "This is a review preview only.",
    "No AI patch was automatically applied.",
    "No final spec-pack was generated.",
    "",
    "本预览不会自动应用 AI patch，只用于人工审查。",
    "",
    "## Summary",
    "",
    `- Patch: ${preview.patchId}`,
    `- Draft spec-pack: ${preview.draftSpecPackPath}`,
    `- Total candidates: ${preview.summary.totalCandidates}`,
    `- Questions: ${preview.summary.questionCandidates}`,
    `- Assumptions: ${preview.summary.assumptionCandidates}`,
    `- Conflicts: ${preview.summary.conflictCandidates}`,
    `- Confirmed candidates: ${preview.summary.confirmedCandidates}`,
    "- Status: Review Required",
    "",
    "## Review Queue",
    ""
  ];

  for (const item of preview.reviewQueue) {
    lines.push(
      `### ${item.candidateId}`,
      "",
      `- Type: ${item.type}`,
      `- Target: ${item.targetSection}`,
      `- Priority: ${item.priority}`,
      `- Confidence: ${item.confidence}`,
      `- Review action: ${item.reviewAction}`,
      `- Summary: ${item.summary}`,
      `- Rationale: ${item.rationale}`,
      ""
    );
  }

  lines.push(
    "## Blocked Auto-Apply Reasons",
    ""
  );

  for (const reason of preview.blockedAutoApplyReasons) {
    lines.push(`- ${reason}`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}
