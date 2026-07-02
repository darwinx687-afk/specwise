import fs from "node:fs";
import { fromRoot } from "../../utils/paths.mjs";

export function getPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync(fromRoot("package.json"), "utf8"));
  return packageJson.version;
}

export function printHelp() {
  console.log(`SpecWise v0.1

Business materials to AI-ready specs.

Usage:
  specwise validate <spec-pack-path> [--expect-fail]
  specwise inventory <input-folder> --out <output-folder> [--force]
  specwise draft <input-folder> --out <output-folder> [--force]
  specwise provider list
  specwise provider doctor --config <config-path>
  specwise extract <input-folder> --out <output-folder> --config <config-path> --dry-run
  specwise patch validate <patch-file>
  specwise patch preview <draft-spec-pack-path> --patch <patch-file> --out <output-folder> [--force]
  specwise ai-preview prepare <input-folder> --out <output-folder> --config <config-path> [--force]
  specwise review init <merge-preview-folder> --out <review-folder> [--force]
  specwise review validate <review-decisions-file>
  specwise review report <merge-preview-folder> --decisions <review-decisions-file> --out <output-folder> [--force]
  specwise apply-plan create <review-report-folder> --draft <draft-spec-pack-path> --out <output-folder> [--force]
  specwise apply-plan validate <apply-plan-file>
  specwise handoff create <draft-spec-pack-path> --apply-plan <manual-apply-plan-file> --out <output-folder> [--target codex,claude-code,cursor,spec-kit] [--force]
  specwise handoff validate <handoff-pack-folder>
  specwise init <output-folder> [--force]
  specwise doctor
  specwise --help
  specwise --version

Commands:
  validate    Validate a SpecWise spec-pack folder
  inventory   Scan a legacy business input folder and create a material inventory
  draft       Generate a deterministic draft spec-pack from input materials
  provider    Inspect provider availability and validate safe provider configs
  extract     Generate extraction dry-run plans only; no AI provider calls
  patch       Validate AI candidate patches and generate merge previews; no auto-apply
  ai-preview  Prepare local prompt artifacts for a future explicit AI preview; no provider calls
  review      Create and validate human review decisions for AI patch candidates
  apply-plan  Create and validate manual revision plans; no auto-apply
  handoff     Create and validate agent handoff pack skeletons; no agent calls
  init        Create a blank spec-pack template
  doctor      Check local SpecWise project readiness

SpecWise does not generate application code.
draft does not use AI, OCR, or vision models.
extract supports dry-run planning only. No AI provider calls are made.
handoff prepares context only. No AI coding agents are called.
It prepares reviewable spec packs before AI coding.

First run:
  npm test
  node bin/specwise.mjs draft examples/legacy-crm-follow-up/input --out ./tmp/crm-draft --force
  node bin/specwise.mjs validate ./tmp/crm-draft/spec-pack
  rm -rf ./tmp/crm-draft

DX checks:
  npm run cli:dx`);
}

export function printVersion() {
  console.log(`specwise ${getPackageVersion()}`);
}
