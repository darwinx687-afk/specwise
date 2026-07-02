#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../src/utils/paths.mjs";

const bin = path.join(repoRoot, "bin/specwise.mjs");
const tmpRoot = path.join(repoRoot, "tmp/workflow-inference-quality");

const checks = [
  {
    name: "legacy-staff-evaluation",
    input: "examples/legacy-staff-evaluation/input",
    requiredWorkflowText: [
      /Detected Workflow Signals/i,
      /Status Labels Observed/i,
      /Inferred Transition Candidates/i,
      /Branch \/ Exception Candidates/i,
      /Open Workflow Questions/i,
      /Safety Notes/i,
      /\bdraft\b/i,
      /\bsubmitted\b/i,
      /\b(reviewed|approved)\b/i
    ],
    requiredQuestionText: [
      /approve|approval/i,
      /edit|rejected|review/i
    ]
  },
  {
    name: "legacy-crm-follow-up",
    input: "examples/legacy-crm-follow-up/input",
    requiredWorkflowText: [
      /Detected Workflow Signals/i,
      /Status Labels Observed/i,
      /Inferred Transition Candidates/i,
      /Branch \/ Exception Candidates/i,
      /Open Workflow Questions/i,
      /Safety Notes/i,
      /\bdraft\b/i,
      /\bsubmitted\b/i,
      /manager_reviewed|manager reviewed/i,
      /\bclosed\b/i,
      /\breopened\b/i
    ],
    requiredQuestionText: [
      /reopened/i,
      /reassignment|approval/i
    ]
  }
];

function cleanTmp() {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
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
  console.log(`[workflow-quality] ${label} passed`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertMatchesAll(content, patterns, fileLabel) {
  for (const pattern of patterns) {
    assert(pattern.test(content), `${fileLabel}: missing ${pattern}`);
  }
}

function checkWorkflowQuality(check) {
  const output = path.join(tmpRoot, check.name);
  runCli(`${check.name} draft`, ["draft", check.input, "--out", output, "--force"]);
  runCli(`${check.name} validate`, ["validate", path.join(output, "spec-pack")]);

  const workflowMarkdown = fs.readFileSync(path.join(output, "spec-pack", "04_workflows.md"), "utf8");
  const questionsMarkdown = fs.readFileSync(path.join(output, "spec-pack", "05_questions.md"), "utf8");

  assertMatchesAll(workflowMarkdown, check.requiredWorkflowText, `${check.name} 04_workflows.md`);
  assertMatchesAll(questionsMarkdown, check.requiredQuestionText, `${check.name} 05_questions.md`);
  console.log(`[workflow-quality] ${check.name} markdown checks passed`);
}

try {
  cleanTmp();
  fs.mkdirSync(tmpRoot, { recursive: true });
  for (const check of checks) {
    checkWorkflowQuality(check);
  }
  console.log("[workflow-quality] all checks passed");
} catch (error) {
  console.error(`[workflow-quality] ${error.message}`);
  process.exitCode = 1;
} finally {
  cleanTmp();
}
