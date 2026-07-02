# First-run Guide v0.2

Status: Phase 22D first-run CLI guide.

This guide is for someone opening the SpecWise repo for the first time.

SpecWise does not call AI providers by default.
SpecWise does not call coding agents.
SpecWise does not generate application code.

SpecWise 默认不调用 AI provider，也不会调用 coding agent 或生成应用代码。

## 1. What To Run First

Start with the local test suite:

```bash
npm test
```

This validates examples, the expected invalid fixture, deterministic draft quality, CSV field inference, and CLI DX checks.

Then check the CLI surface:

```bash
node bin/specwise.mjs --help
node bin/specwise.mjs doctor
```

## 2. Five-minute Path

Run a deterministic draft from the CRM example:

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
