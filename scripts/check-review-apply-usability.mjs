#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../src/utils/paths.mjs";

const bin = path.join(repoRoot, "bin/specwise.mjs");
const outputs = {
  draft: path.join(repoRoot, "tmp/review-apply-draft"),
  patchPreview: path.join(repoRoot, "tmp/review-apply-patch-preview"),
  report: path.join(repoRoot, "tmp/review-apply-report"),
  plan: path.join(repoRoot, "tmp/review-apply-plan")
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
  console.log(`[review-quality] ${label} passed`);
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
    "./tmp/review-apply-draft",
    "--force"
  ]);

  runCli("patch preview", [
    "patch",
    "preview",
    "./tmp/review-apply-draft/spec-pack",
    "--patch",
    "examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json",
    "--out",
    "./tmp/review-apply-patch-preview",
    "--force"
  ]);

  runCli("review report", [
    "review",
    "report",
    "./tmp/review-apply-patch-preview",
    "--decisions",
    "examples/reviews/legacy-staff-evaluation.review-decisions.example.json",
    "--out",
    "./tmp/review-apply-report",
    "--force"
  ]);

  runCli("apply-plan create", [
    "apply-plan",
    "create",
    "./tmp/review-apply-report",
    "--draft",
    "./tmp/review-apply-draft/spec-pack",
    "--out",
    "./tmp/review-apply-plan",
    "--force"
  ]);

  runCli("apply-plan validate", [
    "apply-plan",
    "validate",
    "./tmp/review-apply-plan/manual-apply-plan.json"
  ]);

  assertIncludes(path.join(outputs.report, "review-report.md"), "No patch was automatically applied");
  assertIncludes(path.join(outputs.report, "review-report.md"), "Follow-up Questions");
  assertIncludes(path.join(outputs.report, "review-report.md"), "Blocked Readiness");
  assertFileExists(path.join(outputs.report, "reviewed-handoff-plan.md"));
  assertIncludes(path.join(outputs.plan, "manual-apply-plan.md"), "Auto-apply allowed: false");
  assertIncludes(path.join(outputs.plan, "manual-apply-plan.md"), "Business Confirmation");
  assertIncludes(path.join(outputs.plan, "spec-revision-checklist.md"), "Before Editing");
  assertFileExists(path.join(outputs.plan, "blocked-items.md"));

  console.log("[review-quality] all checks passed");
} catch (error) {
  console.error(`[review-quality] ${error.message}`);
  process.exitCode = 1;
} finally {
  cleanTmp();
}
