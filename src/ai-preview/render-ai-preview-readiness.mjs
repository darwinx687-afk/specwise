export function renderAiPreviewReadiness(readiness) {
  const lines = [
    "# SpecWise AI Preview Readiness",
    "",
    "This readiness report was generated locally.",
    "No AI provider was called.",
    "No network calls were made.",
    "No API key was read.",
    "",
    "## Status",
    "",
    `- Status: ${readiness.status}`,
    `- Ready for prompt review: ${readiness.readyForPromptReview}`,
    `- Ready for future AI preview: ${readiness.readyForFutureAiPreview}`,
    `- Ready for AI call: ${readiness.readyForAiCall}`,
    `- Network calls made: ${readiness.networkCallsMade}`,
    `- API key read: ${readiness.apiKeyRead}`,
    "",
    "## Checks",
    ""
  ];

  for (const check of readiness.checks) {
    lines.push(`- ${check.id}: ${check.status} - ${check.message}`);
  }

  lines.push(
    "",
    "## Blocked Reasons",
    ""
  );

  for (const reason of readiness.blockedReasons) {
    lines.push(`- ${reason}`);
  }

  lines.push(
    "",
    "## Boundary",
    "",
    "Phase 8C prepares local prompt artifacts only. It does not execute AI preview and does not produce AI patches."
  );

  return `${lines.join("\n")}\n`;
}
