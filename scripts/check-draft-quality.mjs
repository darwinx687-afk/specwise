#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const tmpRoot = path.resolve("./tmp/draft-quality-check");

const checks = [
  {
    name: "legacy-staff-evaluation",
    input: "examples/legacy-staff-evaluation/input",
    minimumModules: 4,
    requiredEntities: [/EvaluationRecord/i],
    minimumQuestions: 4,
    requiredQuestionText: [/permission|export|approve|权限|导出|审批/i],
    requiredStates: ["draft", "submitted", "reviewed", "approved", "rejected"]
  },
  {
    name: "legacy-crm-follow-up",
    input: "examples/legacy-crm-follow-up/input",
    minimumModules: 5,
    requiredModules: [/reports?/i],
    requiredEntities: [/^Customer$/i, /FollowUpRecord|Follow.*Up/i],
    minimumQuestions: 5,
    requiredQuestionText: [/export/i, /reassign|reassignment/i, /inactive/i, /cross-team|outside.*team/i],
    requiredStates: ["draft", "submitted", "manager_reviewed", "closed", "reopened"]
  }
];

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed\n${result.stdout}${result.stderr}`.trim());
  }

  return result.stdout.trim();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function includesMatching(values, pattern) {
  return values.some((value) => pattern.test(value));
}

function normalizeState(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function checkReadableEvidenceIds(evidenceMap, name) {
  const unreadable = evidenceMap.evidenceItems
    .map((item) => item.id)
    .filter((id) => /^ev_mat_\d+_summary$/.test(id));
  assert(unreadable.length === 0, `${name}: evidence ids should be readable, found ${unreadable.join(", ")}`);
}

function checkDraftQuality(check) {
  const output = path.join(tmpRoot, check.name);
  run("node", ["bin/specwise.mjs", "draft", check.input, "--out", output, "--force"], `${check.name} draft`);
  run("node", ["bin/specwise.mjs", "validate", path.join(output, "spec-pack")], `${check.name} validate`);

  const specPack = readJson(path.join(output, "spec-pack", "spec-pack.json"));
  const evidenceMap = readJson(path.join(output, "spec-pack", "evidence-map.json"));
  const moduleNames = specPack.modules.map((module) => module.name);
  const entityNames = specPack.entities.map((entity) => entity.name);
  const questionText = specPack.openQuestions.map((question) => `${question.category} ${question.question}`);
  const states = new Set(specPack.workflows.flatMap((workflow) => workflow.states).map(normalizeState));

  assert(specPack.buildability.status === "review_required", `${check.name}: buildability.status must remain review_required`);
  assert(specPack.modules.length >= check.minimumModules, `${check.name}: expected at least ${check.minimumModules} modules`);
  for (const pattern of check.requiredModules ?? []) {
    assert(includesMatching(moduleNames, pattern), `${check.name}: missing module matching ${pattern}`);
  }
  for (const pattern of check.requiredEntities) {
    assert(includesMatching(entityNames, pattern), `${check.name}: missing entity matching ${pattern}`);
  }
  assert(specPack.openQuestions.length >= check.minimumQuestions, `${check.name}: expected at least ${check.minimumQuestions} open questions`);
  for (const pattern of check.requiredQuestionText) {
    assert(includesMatching(questionText, pattern), `${check.name}: missing open question matching ${pattern}`);
  }
  for (const state of check.requiredStates) {
    assert(states.has(normalizeState(state)), `${check.name}: missing workflow state ${state}`);
  }
  checkReadableEvidenceIds(evidenceMap, check.name);

  console.log(`[draft-quality] ${check.name} passed`);
}

let ok = false;
try {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  fs.mkdirSync(tmpRoot, { recursive: true });
  for (const check of checks) {
    checkDraftQuality(check);
  }
  ok = true;
  console.log("[draft-quality] all checks passed");
} catch (error) {
  console.error(`[draft-quality] ${error.message}`);
  process.exitCode = 1;
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  if (!ok) {
    console.error("[draft-quality] temporary output cleaned after failure");
  }
}
