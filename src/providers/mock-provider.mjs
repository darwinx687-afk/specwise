import { createProviderRuntimeDescriptor } from "./provider-runtime-contract.mjs";

const PLANNED_STAGES = [
  {
    id: "module_extraction",
    name: "Module Extraction",
    input: ["material-inventory.json", "deterministic draft modules"],
    output: ["module candidates", "page candidates", "evidence links"],
    safetyRules: [
      "Do not invent modules without source evidence",
      "Mark ambiguous modules as needsReview"
    ]
  },
  {
    id: "entity_field_extraction",
    name: "Entity & Field Extraction",
    input: ["material-inventory.json", "deterministic draft entities", "CSV headers"],
    output: ["entity candidates", "field candidates", "relation candidates"],
    safetyRules: [
      "Do not treat sample rows as full business rules",
      "Keep inferred requiredness as unknown unless evidence confirms it"
    ]
  },
  {
    id: "permission_extraction",
    name: "Permission Extraction",
    input: ["role notes", "permission mock screens", "deterministic draft permissions"],
    output: ["role/action/scope candidates", "permission open questions"],
    safetyRules: [
      "Do not infer global access without explicit evidence",
      "Export, configure, approve, and delete default to needsReview"
    ]
  },
  {
    id: "workflow_extraction",
    name: "Workflow Extraction",
    input: ["workflow notes", "status labels", "deterministic draft workflows"],
    output: ["state candidates", "transition candidates", "workflow questions"],
    safetyRules: [
      "Status labels do not prove full workflow order",
      "Approval authority must not be invented"
    ]
  },
  {
    id: "open_question_extraction",
    name: "Open Question Extraction",
    input: ["unclear notes", "low-confidence claims", "conflicting claims"],
    output: ["categorized open questions", "blocked item references"],
    safetyRules: [
      "Unknowns are output, not failure",
      "Do not answer questions without evidence"
    ]
  },
  {
    id: "acceptance_extraction",
    name: "Acceptance Criteria Extraction",
    input: ["modules", "entities", "permissions", "workflows", "open questions"],
    output: ["review-required acceptance criteria", "test ideas"],
    safetyRules: [
      "Do not convert unresolved assumptions into final acceptance truth",
      "Keep related questions attached"
    ]
  },
  {
    id: "evidence_mapping",
    name: "Evidence Mapping",
    input: ["source materials", "candidate claims"],
    output: ["evidenceItems", "claimMappings", "coverageSummary"],
    safetyRules: [
      "Evidence IDs must point to existing source materials",
      "Unsupported claims cannot become facts"
    ]
  },
  {
    id: "buildability_rescoring",
    name: "Buildability Re-scoring",
    input: ["draft buildability", "evidence coverage", "open questions"],
    output: ["dimension score candidates", "blockers", "next actions"],
    safetyRules: [
      "Do not mark ready_for_ai_coding while high-priority questions remain",
      "Do not inflate scores to appear polished"
    ]
  },
  {
    id: "bilingual_summary_generation",
    name: "Bilingual Summary Generation",
    input: ["structured spec pack", "evidence map", "source language metadata"],
    output: ["Chinese business summary", "English developer summary"],
    safetyRules: [
      "Preserve uncertainty in both languages",
      "Do not change role scope through translation"
    ]
  }
];

export function createMockProvider(config) {
  return {
    describe() {
      const runtime = createProviderRuntimeDescriptor("mock", config);
      return {
        name: "mock",
        mode: config.mode,
        model: config.model,
        status: runtime.status,
        networkCalls: false,
        runtime,
        description: "Mock provider for Phase 7B dry-run planning only."
      };
    },

    getRuntimeDescriptor() {
      return createProviderRuntimeDescriptor("mock", config);
    },

    getCapabilities() {
      return this.getRuntimeDescriptor().capabilities;
    },

    planExtraction(inputSummary) {
      return {
        provider: "mock",
        mode: "dry_run",
        networkCalls: false,
        inputSummary,
        plannedStages: PLANNED_STAGES,
        safety: {
          evidenceFirst: true,
          reviewRequiredByDefault: true,
          noSilentOverwrite: true
        }
      };
    }
  };
}
