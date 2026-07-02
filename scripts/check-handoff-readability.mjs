#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../src/utils/paths.mjs";

const bin = path.join(repoRoot, "bin/specwise.mjs");
const outputs = {
  draft: path.join(repoRoot, "tmp/handoff-readability-draft"),
  patchPreview: path.join(repoRoot, "tmp/handoff-readability-patch-preview"),
  report: path.join(repoRoot, "tmp/handoff-readability-review-report"),
  plan: path.join(repoRoot, "tmp/handoff-readability-apply-plan"),
  pack: path.join(repoRoot, "tmp/handoff-readability-pack")
};

function cleanTmp() {
  for (const folder of Object.values(outputs)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  try {
    fs.rmdirSync(path.join(repoRoot, "tmp"));
  } catch {
    // Other checks may own tmp outputs.
  }
}

function runCli(label, args) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? 1}\n${output}`);
  }
  console.log(`[handoff-quality] ${label} passed`);
  return output;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertFileExists(filePath) {
  assert(fs.existsSync(filePath), `Expected file to exist: ${path.relative(repoRoot, filePath)}`);
}

function assertIncludes(filePath, phrase) {
  assertFileExists(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  assert(
    content.includes(phrase),
    `Expected ${path.relative(repoRoot, filePath)} to include "${phrase}"`
  );
}

try {
  cleanTmp();

  runCli("draft", [
    "draft",
    "examples/legacy-staff-evaluation/input",
    "--out",
    "./tmp/handoff-readability-draft",
    "--force"
  ]);

  runCli("patch preview", [
    "patch",
    "preview",
    "./tmp/handoff-readability-draft/spec-pack",
    "--patch",
    "examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json",
    "--out",
    "./tmp/handoff-readability-patch-preview",
    "--force"
  ]);

  runCli("review report", [
    "review",
    "report",
    "./tmp/handoff-readability-patch-preview",
    "--decisions",
    "examples/reviews/legacy-staff-evaluation.review-decisions.example.json",
    "--out",
    "./tmp/handoff-readability-review-report",
    "--force"
  ]);

  runCli("apply-plan create", [
    "apply-plan",
    "create",
    "./tmp/handoff-readability-review-report",
    "--draft",
    "./tmp/handoff-readability-draft/spec-pack",
    "--out",
    "./tmp/handoff-readability-apply-plan",
    "--force"
  ]);

  runCli("handoff create", [
    "handoff",
    "create",
    "./tmp/handoff-readability-draft/spec-pack",
    "--apply-plan",
    "./tmp/handoff-readability-apply-plan/manual-apply-plan.json",
    "--out",
    "./tmp/handoff-readability-pack",
    "--target",
    "codex,claude-code,cursor,spec-kit",
    "--force"
  ]);

  runCli("handoff validate", [
    "handoff",
    "validate",
    "./tmp/handoff-readability-pack"
  ]);

  assertIncludes(path.join(outputs.pack, "README.md"), "What This Pack Is Not");
  assertIncludes(path.join(outputs.pack, "00_agent-instructions.md"), "Non-negotiable Boundaries");
  assertIncludes(path.join(outputs.pack, "07_open-questions.md"), "High Priority Permission");
  assertIncludes(path.join(outputs.pack, "09_implementation-boundaries.md"), "Implementation is not authorized");
  assertIncludes(path.join(outputs.pack, "10_manual-apply-plan-summary.md"), "Business Confirmation Required");
  assertIncludes(path.join(outputs.pack, "agent-specific/codex.md"), "not an instruction to implement");
  assertIncludes(path.join(outputs.pack, "agent-specific/spec-kit.md"), "not a generated Spec Kit task list");
  assertIncludes(path.join(outputs.pack, "machine/README.md"), "not generated application code");

  console.log("[handoff-quality] all checks passed");
} catch (error) {
  console.error(`[handoff-quality] ${error.message}`);
  process.exitCode = 1;
} finally {
  cleanTmp();
}
