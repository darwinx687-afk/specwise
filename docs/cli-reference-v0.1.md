# CLI Reference v0.1

Status: Phase 11 release-readiness reference.

All current v0.1 commands are local-first and dependency-free.

No command calls real AI providers. No command calls Codex, Claude Code, Cursor, or Spec Kit.

## Command Summary

| Command | Purpose | Calls AI? | Modifies existing spec-pack? |
| --- | --- | ---: | ---: |
| `specwise --help` | Print CLI help. | No | No |
| `specwise --version` | Print package version. | No | No |
| `specwise doctor` | Check local repo readiness. | No | No |
| `specwise validate` | Validate one or more spec-pack folders. | No | No |
| `specwise init` | Create a blank spec-pack template in an output folder. | No | Creates output folder |
| `specwise inventory` | Scan input materials and write deterministic inventory metadata. | No | Creates output folder |
| `specwise draft` | Generate a review-required deterministic draft spec-pack. | No | Creates output folder |
| `specwise provider list` | List local provider boundary entries. | No | No |
| `specwise provider doctor` | Validate safe provider config shape. | No | No |
| `specwise extract --dry-run` | Create extraction dry-run plans only. | No | Creates output folder |
| `specwise patch validate` | Validate an offline AI patch fixture. | No | No |
| `specwise patch preview` | Create offline merge preview from a draft and patch. | No | Creates output folder |
| `specwise ai-preview prepare` | Prepare local prompt artifacts for human review. | No | Creates output folder |
| `specwise review init` | Create human review decision template. | No | Creates output folder |
| `specwise review validate` | Validate review decisions. | No | No |
| `specwise review report` | Generate human review report from decisions. | No | Creates output folder |
| `specwise apply-plan create` | Generate manual apply plan from review report. | No | Creates output folder |
| `specwise apply-plan validate` | Validate manual apply plan. | No | No |
| `specwise handoff create` | Generate agent handoff pack skeleton. | No | Creates output folder |
| `specwise handoff validate` | Validate handoff pack skeleton. | No | No |

## Global Commands

### `specwise --help`

Purpose: print command usage and safety summary.

Example:

```bash
node bin/specwise.mjs --help
```

Outputs: terminal help text.

Safety notes: no files are written.

### `specwise --version`

Purpose: print package version.

Example:

```bash
node bin/specwise.mjs --version
```

Outputs: version string.

Safety notes: no files are written.

### `specwise doctor`

Purpose: check that local schemas, examples, templates, and command modules exist.

Example:

```bash
node bin/specwise.mjs doctor
```

Outputs: readiness checklist.

Safety notes: no files are written.

## Spec-Pack Commands

### `specwise validate`

Purpose: validate spec-pack folder structure, JSON shape, cross references, evidence coverage, and buildability consistency.

Example:

```bash
node bin/specwise.mjs validate examples/minimal/spec-pack
```

Outputs: validation result.

Safety notes: does not modify the spec-pack.

### `specwise init`

Purpose: create a blank spec-pack template for manual editing.

Example:

```bash
node bin/specwise.mjs init ./tmp/spec-pack --force
```

Outputs: blank spec-pack files in the output folder.

Safety notes: creates or overwrites only the requested output folder when `--force` is used.

### `specwise inventory`

Purpose: scan legacy input materials and write deterministic material metadata.

Example:

```bash
node bin/specwise.mjs inventory examples/legacy-staff-evaluation/input --out ./tmp/inventory-test --force
```

Outputs: `material-inventory.json`, `material-summary.md`.

Safety notes: no AI, OCR, vision, or network calls.

### `specwise draft`

Purpose: generate a review-required deterministic draft spec-pack from input materials.

Example:

```bash
node bin/specwise.mjs draft examples/legacy-staff-evaluation/input --out ./tmp/draft-test --force
```

Outputs: `material-inventory.json`, `material-summary.md`, `spec-pack/`.

Safety notes: heuristic draft only; does not create final spec-pack.

## Provider And Extraction Boundary Commands

### `specwise provider list`

Purpose: list local provider boundary entries.

Example:

```bash
node bin/specwise.mjs provider list
```

Outputs: provider names and boundary status.

Safety notes: no provider is called.

### `specwise provider doctor`

Purpose: validate provider config shape and placeholder guardrails.

Example:

```bash
node bin/specwise.mjs provider doctor --config examples/config/specwise.mock.config.json
```

Outputs: config validation result.

Safety notes: does not read API keys and does not call providers.

### `specwise extract --dry-run`

Purpose: create a deterministic extraction dry-run plan.

Example:

```bash
node bin/specwise.mjs extract examples/legacy-staff-evaluation/input \
  --out ./tmp/extract-dry-run \
  --config examples/config/specwise.mock.config.json \
  --dry-run
```

Outputs: `extraction-plan.json`, `extraction-plan.md`, inventory files.

Safety notes: dry-run only; no AI provider calls and no spec-pack generation.

### `specwise ai-preview prepare`

Purpose: prepare local prompt artifacts for a future explicit AI preview.

Example:

```bash
node bin/specwise.mjs ai-preview prepare examples/legacy-staff-evaluation/input \
  --out ./tmp/ai-preview-prepare \
  --config examples/config/specwise.ai-preview.example.json \
  --force
```

Outputs: deterministic draft folder, prompt package, prompt preview, readiness reports.

Safety notes: prepares files only; does not call providers.

## Patch, Review, And Manual Apply Commands

### `specwise patch validate`

Purpose: validate an offline AI patch JSON fixture.

Example:

```bash
node bin/specwise.mjs patch validate examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json
```

Outputs: validation result.

Safety notes: does not apply the patch.

### `specwise patch preview`

Purpose: generate a merge preview from a draft spec-pack and offline patch.

Example:

```bash
node bin/specwise.mjs patch preview ./tmp/draft-test/spec-pack \
  --patch examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json \
  --out ./tmp/patch-preview \
  --force
```

Outputs: `merge-preview.json`, `merge-preview.md`.

Safety notes: does not modify the draft spec-pack.

### `specwise review init`

Purpose: create a human review decision template from merge preview.

Example:

```bash
node bin/specwise.mjs review init ./tmp/patch-preview --out ./tmp/review --force
```

Outputs: `review-decisions.json`, `review-decisions.md`.

Safety notes: review template only; no patch is applied.

### `specwise review validate`

Purpose: validate review decision JSON.

Example:

```bash
node bin/specwise.mjs review validate examples/reviews/legacy-staff-evaluation.review-decisions.example.json
```

Outputs: validation result.

Safety notes: no files are written.

### `specwise review report`

Purpose: generate human review report from merge preview and decisions.

Example:

```bash
node bin/specwise.mjs review report ./tmp/patch-preview \
  --decisions examples/reviews/legacy-staff-evaluation.review-decisions.example.json \
  --out ./tmp/review-report \
  --force
```

Outputs: `review-report.json`, `review-report.md`, `reviewed-handoff-plan.md`.

Safety notes: does not apply patches and does not generate final spec-pack.

### `specwise apply-plan create`

Purpose: generate manual revision plan from human review report.

Example:

```bash
node bin/specwise.mjs apply-plan create ./tmp/review-report \
  --draft ./tmp/draft-test/spec-pack \
  --out ./tmp/apply-plan \
  --force
```

Outputs: `manual-apply-plan.json`, `manual-apply-plan.md`, `spec-revision-checklist.md`, `blocked-items.md`.

Safety notes: manual plan only; does not edit draft spec-pack.

### `specwise apply-plan validate`

Purpose: validate manual apply plan.

Example:

```bash
node bin/specwise.mjs apply-plan validate examples/apply-plans/legacy-staff-evaluation.manual-apply-plan.example.json
```

Outputs: validation result.

Safety notes: no files are written.

## Handoff Commands

### `specwise handoff create`

Purpose: generate agent handoff pack skeleton from draft spec-pack and manual apply plan.

Example:

```bash
node bin/specwise.mjs handoff create ./tmp/draft-test/spec-pack \
  --apply-plan ./tmp/apply-plan/manual-apply-plan.json \
  --out ./tmp/handoff-pack \
  --target codex,claude-code,cursor,spec-kit \
  --force
```

Outputs: handoff Markdown files, `handoff-manifest.json`, `machine/` source artifacts, and `agent-specific/` boundary notes.

Safety notes: context only; does not call coding agents, generate code, create implementation tasks, or generate final spec-pack.

### `specwise handoff validate`

Purpose: validate generated handoff pack skeleton.

Example:

```bash
node bin/specwise.mjs handoff validate ./tmp/handoff-pack
```

Outputs: validation result.

Safety notes: checks safety flags and required boundary phrases; no files are written.

