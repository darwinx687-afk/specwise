export function checkAiPreviewReadiness({ promptPackage, patchSchemaAvailable, deterministicDraftGenerated }) {
  const checks = [
    {
      id: "deterministic_draft_exists",
      status: deterministicDraftGenerated ? "passed" : "blocked",
      message: deterministicDraftGenerated ? "Deterministic draft was generated." : "Deterministic draft was not generated."
    },
    {
      id: "patch_schema_available",
      status: patchSchemaAvailable ? "passed" : "blocked",
      message: patchSchemaAvailable ? "AI patch schema is available." : "AI patch schema is missing."
    },
    {
      id: "prompt_package_created",
      status: promptPackage ? "passed" : "blocked",
      message: promptPackage ? "Prompt package was created for human review." : "Prompt package was not created."
    },
    {
      id: "explicit_ai_flags_missing",
      status: "blocked",
      message: "Phase 8C does not execute AI preview."
    },
    {
      id: "provider_runtime_not_implemented",
      status: "blocked",
      message: "Real AI provider calls are not implemented."
    }
  ];

  return {
    schemaVersion: "0.1.0",
    status: "not_executed_design_only",
    readyForPromptReview: Boolean(promptPackage && deterministicDraftGenerated && patchSchemaAvailable),
    readyForFutureAiPreview: false,
    readyForAiCall: false,
    networkCallsMade: false,
    apiKeyRead: false,
    checks,
    blockedReasons: [
      "Phase 8C only prepares local prompt artifacts.",
      "Real AI provider calls are not implemented.",
      "Human review is required before any future AI preview.",
      "Future AI preview must explicitly require --enable-ai, --allow-network, --emit-patch-only, and --review-required."
    ]
  };
}
