import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../src/utils/paths.mjs";

const tmpPaths = [
  "tmp/draft-test",
  "tmp/patch-preview",
  "tmp/review-report",
  "tmp/apply-plan",
  "tmp/handoff-pack"
];

function removeTmpOutputs() {
  for (const relativePath of tmpPaths) {
    fs.rmSync(path.join(repoRoot, relativePath), { recursive: true, force: true });
  }
  try {
    fs.rmdirSync(path.join(repoRoot, "tmp"));
  } catch {
    // tmp may not exist or may contain caller-owned files.
  }
}

function runStep(label, args) {
  console.log(`\n[smoke] ${label}`);
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

try {
  removeTmpOutputs();

  runStep("draft", [
    "bin/specwise.mjs",
    "draft",
    "examples/legacy-staff-evaluation/input",
    "--out",
    "./tmp/draft-test",
    "--force"
  ]);

  runStep("patch preview", [
    "bin/specwise.mjs",
    "patch",
    "preview",
    "./tmp/draft-test/spec-pack",
    "--patch",
    "examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json",
    "--out",
    "./tmp/patch-preview",
    "--force"
  ]);

  runStep("review report", [
    "bin/specwise.mjs",
    "review",
    "report",
    "./tmp/patch-preview",
    "--decisions",
    "examples/reviews/legacy-staff-evaluation.review-decisions.example.json",
    "--out",
    "./tmp/review-report",
    "--force"
  ]);

  runStep("apply plan", [
    "bin/specwise.mjs",
    "apply-plan",
    "create",
    "./tmp/review-report",
    "--draft",
    "./tmp/draft-test/spec-pack",
    "--out",
    "./tmp/apply-plan",
    "--force"
  ]);

  runStep("handoff create", [
    "bin/specwise.mjs",
    "handoff",
    "create",
    "./tmp/draft-test/spec-pack",
    "--apply-plan",
    "./tmp/apply-plan/manual-apply-plan.json",
    "--out",
    "./tmp/handoff-pack",
    "--target",
    "codex,claude-code,cursor,spec-kit",
    "--force"
  ]);

  runStep("handoff validate", [
    "bin/specwise.mjs",
    "handoff",
    "validate",
    "./tmp/handoff-pack"
  ]);

  console.log("\nSpecWise local smoke test passed.");
  console.log("No AI providers were called.");
  console.log("No coding agents were called.");
  console.log("No application code or final spec-pack was generated.");
} catch (error) {
  console.error(`\nERROR ${error.message}`);
  process.exitCode = 1;
} finally {
  removeTmpOutputs();
}
