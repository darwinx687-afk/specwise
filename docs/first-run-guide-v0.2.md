# First-run Guide v0.2

Status: Phase 22E first-run guide, refined after Phase 22D CLI error polish.

This guide is for someone opening the SpecWise repo for the first time.

SpecWise does not call AI providers by default.
SpecWise does not call coding agents.
SpecWise does not generate application code.

SpecWise 默认不调用 AI provider，也不会调用 coding agent 或生成应用代码。

For the shortest docs map, see [Start Here v0.2](start-here-v0.2.md). If you are unsure which command to run, see [Command Decision Tree v0.2](command-decision-tree-v0.2.md). If you are trying to understand current vs historical docs, see [Docs Status Map v0.3](docs-status-map-v0.3.md).

Do not start by reading every document. Run this guide first, then use the docs map to go deeper.

## 1. Five-minute Path

Run the CRM example first:

```bash
npm test

node bin/specwise.mjs draft examples/legacy-crm-follow-up/input --out ./tmp/crm-draft --force

node bin/specwise.mjs validate ./tmp/crm-draft/spec-pack

rm -rf ./tmp/crm-draft
```

Expected state:

- the draft command prints `Status: Review Required`
- no AI provider is called
- no coding agent is called
- no application code is generated

## 2. Local Health Checks

If you only want to check that the project works, run:

```bash
npm test
```

This validates examples, the expected invalid fixture, deterministic draft quality, CSV field inference, and CLI DX checks.

Then inspect the CLI surface:

```bash
node bin/specwise.mjs --help
node bin/specwise.mjs doctor
```

## 3. Full Workflow Path

Run the full local smoke workflow:

```bash
npm run smoke
```

This exercises draft generation, offline patch preview, human review report, manual apply plan, handoff pack skeleton creation, and handoff validation.

## 4. What Outputs To Inspect

For a generated draft folder, inspect:

- `material-inventory.json`
- `material-summary.md`
- `spec-pack/spec-pack.json`
- `spec-pack/01_modules.md`
- `spec-pack/02_entities.md`
- `spec-pack/05_questions.md`
- `spec-pack/buildability-report.md`

For the full smoke workflow, inspect the terminal summary first. The script cleans its temporary outputs at the end.

## 5. Common Errors

These errors reflect the Phase 22D CLI error polish: messages should name the problem, show the command shape when useful, and suggest a next action without exposing local absolute paths.

### Missing `--out`

Example:

```bash
node bin/specwise.mjs draft examples/legacy-crm-follow-up/input
```

Fix:

```bash
node bin/specwise.mjs draft examples/legacy-crm-follow-up/input --out ./tmp/crm-draft --force
```

### Output Folder Exists

If the output folder already exists and is not empty, SpecWise does not overwrite it automatically.

Fix:

```bash
node bin/specwise.mjs draft examples/legacy-crm-follow-up/input --out ./tmp/crm-draft --force
```

Or choose a different `--out` folder.

### Path Not Found

Example:

```bash
node bin/specwise.mjs validate ./does-not-exist
```

Fix: check the path and try again. Prefer relative paths in commands.

### Expected Invalid Fixture Failure

This command is expected to fail validation internally and still exit successfully because `--expect-fail` is present:

```bash
node bin/specwise.mjs validate examples/invalid/missing-buildability/spec-pack --expect-fail
```

It proves the validator catches a missing buildability block.

## 6. Safety Boundaries

- No real AI provider call is made by default.
- No prompt runner is executed.
- No OCR or vision model is used.
- No Web UI is included.
- No coding agent is called.
- No application code is generated.
- No patch is auto-applied.
- No final spec-pack is generated in v0.1.
- Review-required output is intentional.
