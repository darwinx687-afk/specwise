#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../src/utils/paths.mjs";

const bin = path.join(repoRoot, "bin/specwise.mjs");
const tmpRoot = path.join(repoRoot, "tmp");
const tmpExisting = path.join(tmpRoot, "cli-dx-existing");

function cleanTmp() {
  fs.rmSync(tmpExisting, { recursive: true, force: true });
  try {
    fs.rmdirSync(tmpRoot);
  } catch {
    // The caller may own other tmp outputs.
  }
}

function runCli(args) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(output, phrase, label) {
  assert(output.includes(phrase), `${label}: expected output to include "${phrase}"\n${output}`);
}

function assertNoStack(output, label) {
  assert(!/\n\s+at\s+.*\.mjs/.test(output), `${label}: output includes a stack trace\n${output}`);
}

function checkFails(label, args, phrases) {
  const result = runCli(args);
  assert(result.status !== 0, `${label}: expected non-zero exit code`);
  assertNoStack(result.output, label);
  assertIncludes(result.output, "SpecWise error:", label);
  assertIncludes(result.output, "Next action:", label);
  for (const phrase of phrases) {
    assertIncludes(result.output, phrase, label);
  }
  console.log(`[cli-dx] ${label} passed`);
}

function checkSucceeds(label, args, phrases) {
  const result = runCli(args);
  assert(result.status === 0, `${label}: expected exit code 0\n${result.output}`);
  assertNoStack(result.output, label);
  for (const phrase of phrases) {
    assertIncludes(result.output, phrase, label);
  }
  console.log(`[cli-dx] ${label} passed`);
}

try {
  cleanTmp();

  checkFails("unknown command", ["unknown"], [
    "Unknown command \"unknown\"",
    "Available commands:",
    "node bin/specwise.mjs --help"
  ]);

  checkFails("validate missing argument", ["validate"], [
    "Missing required argument <spec-pack-path>",
    "specwise validate <spec-pack-path> [--expect-fail]"
  ]);

  checkFails("validate missing path", ["validate", "./does-not-exist"], [
    "Path not found: ./does-not-exist",
    "Check the path and try again."
  ]);

  checkFails("init missing argument", ["init"], [
    "Missing required argument <output-folder>",
    "specwise init <output-folder> [--force]"
  ]);

  checkFails("inventory missing argument", ["inventory"], [
    "Missing required argument <input-folder>",
    "specwise inventory <input-folder> --out <output-folder> [--force]"
  ]);

  checkFails("draft missing --out", ["draft", "examples/legacy-crm-follow-up/input"], [
    "Missing required option --out",
    "specwise draft <input-folder> --out <output-folder> [--force]"
  ]);

  fs.mkdirSync(tmpExisting, { recursive: true });
  fs.writeFileSync(path.join(tmpExisting, "keep.txt"), "caller-owned\n");
  checkFails("output folder exists", [
    "draft",
    "examples/legacy-crm-follow-up/input",
    "--out",
    "./tmp/cli-dx-existing"
  ], [
    "Output folder already exists and is not empty.",
    "Re-run with --force to overwrite, or choose a different --out folder."
  ]);

  checkFails("patch validate missing file", ["patch", "validate", "./missing-patch.json"], [
    "Path not found: ./missing-patch.json",
    "Check the path and try again."
  ]);

  checkFails("patch preview missing --patch", ["patch", "preview", "./tmp/missing"], [
    "Missing required option --patch",
    "specwise patch preview <draft-spec-pack-path> --patch <patch-file> --out <output-folder> [--force]"
  ]);

  checkFails("ai-preview prepare missing --out", ["ai-preview", "prepare", "examples/legacy-crm-follow-up/input"], [
    "Missing required option --out",
    "specwise ai-preview prepare <input-folder> --out <output-folder> --config <config-path> [--force]"
  ]);

  checkFails("review init missing argument", ["review", "init"], [
    "Missing required argument <merge-preview-folder>",
    "specwise review init <merge-preview-folder> --out <review-folder> [--force]"
  ]);

  checkFails("review validate missing file", ["review", "validate", "./missing-review.json"], [
    "Path not found: ./missing-review.json",
    "Check the path and try again."
  ]);

  checkFails("review report missing --decisions", ["review", "report", "./tmp/missing"], [
    "Missing required option --decisions",
    "specwise review report <merge-preview-folder> --decisions <review-decisions-file> --out <output-folder> [--force]"
  ]);

  checkFails("apply-plan create missing argument", ["apply-plan", "create"], [
    "Missing required argument <review-report-folder>",
    "specwise apply-plan create <review-report-folder> --draft <draft-spec-pack-path> --out <output-folder> [--force]"
  ]);

  checkFails("apply-plan validate missing file", ["apply-plan", "validate", "./missing-apply-plan.json"], [
    "Path not found: ./missing-apply-plan.json",
    "Check the path and try again."
  ]);

  checkFails("handoff create missing argument", ["handoff", "create"], [
    "Missing required argument <draft-spec-pack-path>",
    "specwise handoff create <draft-spec-pack-path> --apply-plan <manual-apply-plan-file> --out <output-folder> [--target codex,claude-code,cursor,spec-kit] [--force]"
  ]);

  checkFails("handoff validate missing folder", ["handoff", "validate", "./missing-handoff"], [
    "Path not found: ./missing-handoff",
    "Check the path and try again."
  ]);

  checkFails("provider doctor missing --config", ["provider", "doctor"], [
    "Missing required option --config",
    "specwise provider doctor --config <config-path>"
  ]);

  checkFails("extract missing --dry-run", ["extract"], [
    "extract only supports dry-run planning",
    "specwise extract <input-folder> --out <output-folder> --config <config-path> --dry-run"
  ]);

  checkFails("extract missing input folder", ["extract", "--dry-run"], [
    "Missing required argument <input-folder>",
    "specwise extract <input-folder> --out <output-folder> --config <config-path> --dry-run"
  ]);

  checkSucceeds("--help", ["--help"], [
    "validate",
    "draft",
    "handoff",
    "First run:"
  ]);

  checkSucceeds("doctor", ["doctor"], [
    "SpecWise doctor",
    "Status: ready for local validation"
  ]);

  console.log("[cli-dx] all checks passed");
} catch (error) {
  console.error(`[cli-dx] ${error.message}`);
  process.exitCode = 1;
} finally {
  cleanTmp();
}
