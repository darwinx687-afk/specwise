import { pathExists } from "../../utils/fs.mjs";
import { fromRoot } from "../../utils/paths.mjs";

const CHECKS = [
  ["package.json found", "package.json"],
  ["schemas found", "schemas"],
  ["templates/spec-pack found", "templates/spec-pack"],
  ["minimal example found", "examples/minimal/spec-pack"],
  ["legacy staff evaluation example found", "examples/legacy-staff-evaluation/expected-output/spec-pack"],
  ["validator available", "scripts/validate-spec-pack.mjs"],
  ["inventory command available", "src/cli/commands/inventory.mjs"],
  ["draft command available", "src/cli/commands/draft.mjs"],
  ["provider config support available", "src/providers/provider-config.mjs"],
  ["provider runtime contract available", "src/providers/provider-runtime-contract.mjs"],
  ["mock provider available", "src/providers/mock-provider.mjs"],
  ["openai-compatible placeholder guarded", "src/providers/openai-compatible-placeholder-provider.mjs"],
  ["extraction dry-run scaffold available", "src/cli/commands/extract.mjs"],
  ["AI patch contract available", "schemas/ai-patch.schema.json"],
  ["merge preview available", "src/patches/merge-preview.mjs"],
  ["AI preview prompt package scaffold available", "src/ai-preview/build-prompt-package.mjs"],
  ["AI preview readiness checker available", "src/ai-preview/check-ai-preview-readiness.mjs"],
  ["human review workflow available", "src/review/create-review-template.mjs"],
  ["review decisions validation available", "src/review/validate-review-decisions.mjs"],
  ["manual apply plan workflow available", "src/apply-plan/build-manual-apply-plan.mjs"],
  ["manual apply plan validation available", "src/apply-plan/validate-manual-apply-plan.mjs"],
  ["agent handoff pack skeleton available", "src/handoff/build-handoff-pack.mjs"],
  ["handoff manifest validation available", "src/handoff/validate-handoff-pack.mjs"]
];

export function runDoctor() {
  console.log("SpecWise doctor\n");

  let ok = true;
  for (const [label, relativePath] of CHECKS) {
    if (pathExists(fromRoot(relativePath))) {
      console.log(`✓ ${label}`);
    } else {
      console.log(`✗ ${label}`);
      ok = false;
    }
  }

  console.log("");
  if (ok) {
    console.log("Status: ready for local validation");
    return 0;
  }

  console.log("Status: missing required local project files");
  return 1;
}
