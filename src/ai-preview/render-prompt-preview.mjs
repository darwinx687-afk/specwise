export function renderPromptPreview(promptPackage) {
  const lines = [
    "# SpecWise AI Prompt Preview",
    "",
    "This preview was generated locally.",
    "No AI provider was called.",
    "No network calls were made.",
    "No API key was read.",
    "",
    "本 preview 只用于人工检查未来可能发送给 AI 的内容，当前没有调用任何 AI provider。",
    "",
    "## Purpose",
    "",
    "The future provider must return AI patch candidates only.",
    "It must not return a final spec-pack.",
    "",
    "## Input Summary",
    "",
    `- Input folder: ${promptPackage.input.inputFolder}`,
    `- Total files: ${promptPackage.inventorySummary.totalFiles}`,
    `- Supported files: ${promptPackage.inventorySummary.supportedFiles}`,
    `- Unsupported files: ${promptPackage.inventorySummary.unsupportedFiles}`,
    "",
    "## Deterministic Draft Summary",
    "",
    `- Detected modules: ${promptPackage.deterministicDraftSummary.moduleCount}`,
    `- Detected entities: ${promptPackage.deterministicDraftSummary.entityCount}`,
    `- Detected roles: ${promptPackage.deterministicDraftSummary.roleCount}`,
    `- Open questions: ${promptPackage.deterministicDraftSummary.openQuestionCount}`,
    `- Buildability status: ${promptPackage.deterministicDraftSummary.buildabilityStatus}`,
    `- Buildability score: ${promptPackage.deterministicDraftSummary.buildabilityScore}`,
    "",
    "## Provider Config Summary",
    "",
    `- Provider: ${promptPackage.provider.configProvider}`,
    `- Mode: ${promptPackage.provider.configMode}`,
    `- Design only: ${promptPackage.provider.designOnly}`,
    `- Network calls made: ${promptPackage.provider.networkCallsMade}`,
    `- API key read: ${promptPackage.provider.apiKeyRead}`,
    "",
    "## Required Output",
    "",
    "The model must output a valid SpecWise AI patch.",
    "",
    "Allowed:",
    "- confirmed_candidate",
    "- assumption_candidate",
    "- question_candidate",
    "- conflict_candidate",
    "",
    "Not allowed:",
    "- final spec-pack",
    "- auto-apply patch",
    "- delete / overwrite operation",
    "- ready_for_ai_coding status",
    "",
    "## Safety Rules",
    ""
  ];

  for (const rule of promptPackage.safetyRules) {
    lines.push(`- ${rule}`);
  }

  lines.push(
    "",
    "## Materials Included",
    "",
    "| ID | Type | Path |",
    "|---|---|---|"
  );

  for (const material of promptPackage.materials) {
    lines.push(`| ${material.id} | ${material.type} | ${material.path} |`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}
