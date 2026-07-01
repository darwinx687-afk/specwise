function summarizeDraft(specPack) {
  return {
    moduleCount: specPack.modules.length,
    entityCount: specPack.entities.length,
    roleCount: specPack.roles.length,
    openQuestionCount: specPack.openQuestions.length,
    buildabilityStatus: specPack.buildability.status,
    buildabilityScore: specPack.buildability.score
  };
}

function mapMaterial(material) {
  return {
    id: material.id,
    path: material.path,
    type: material.type,
    summary: material.summary,
    signals: material.signals ?? {},
    warnings: material.warnings ?? []
  };
}

function mapByFields(items, fields) {
  return items.map((item) => {
    const mapped = {};
    for (const field of fields) {
      mapped[field] = item[field];
    }
    return mapped;
  });
}

export function buildPromptPackage({ config, inventory, draft, inputFolder }) {
  const specPack = draft.specPack;

  return {
    schemaVersion: "0.1.0",
    mode: "ai_preview_prompt_package",
    provider: {
      configProvider: config.provider ?? "unknown",
      configMode: config.mode ?? "unknown",
      apiKeyEnvName: config.apiKeyEnv ?? null,
      networkCallsMade: false,
      apiKeyRead: false,
      designOnly: String(config.mode ?? "").includes("design_only")
    },
    project: {
      name: specPack.project.name,
      status: specPack.project.status
    },
    input: {
      inputFolder,
      localAbsolutePathsIncluded: false
    },
    inventorySummary: inventory.summary,
    deterministicDraftSummary: summarizeDraft(specPack),
    allowedOutput: "ai_patch_only",
    requiredOutputSchema: "schemas/ai-patch.schema.json",
    safetyRules: [
      "Do not output final spec-pack.",
      "Output candidate patches only.",
      "All candidates must require human review.",
      "Do not silently overwrite deterministic draft findings.",
      "Unsupported claims become assumptions or questions.",
      "High-risk permissions must remain needsReview.",
      "Do not mark the project ready_for_ai_coding."
    ],
    materials: inventory.materials.map(mapMaterial),
    draftContext: {
      modules: mapByFields(specPack.modules, ["id", "name", "nameZh", "confidence", "needsReview", "evidenceIds"]),
      entities: mapByFields(specPack.entities, ["id", "name", "nameZh", "confidence", "needsReview", "evidenceIds"]),
      roles: mapByFields(specPack.roles, ["id", "name", "nameZh", "scope", "confidence", "needsReview", "evidenceIds"]),
      openQuestions: mapByFields(specPack.openQuestions, ["id", "question", "category", "priority", "blockedItems", "evidenceIds"]),
      buildability: specPack.buildability
    }
  };
}
