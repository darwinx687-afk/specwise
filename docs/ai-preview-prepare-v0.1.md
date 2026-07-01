# AI Preview Prepare v0.1

Status: Phase 8C local scaffold. No provider calls.

`ai-preview prepare` creates local prompt artifacts for human review before any future explicit AI provider preview.

It does not:

- call AI providers
- read API keys
- make network calls
- generate AI patches
- generate a final spec-pack
- auto-apply patches

## Command

```bash
node bin/specwise.mjs ai-preview prepare examples/legacy-staff-evaluation/input \
  --out ./tmp/ai-preview-prepare \
  --config examples/config/specwise.ai-preview.example.json \
  --force
```

## Output Artifacts

```text
ai-preview-prepare/
  material-inventory.json
  material-summary.md
  deterministic-draft/
    spec-pack/
  prompt-package.json
  prompt-preview.md
  ai-preview-readiness.json
  ai-preview-readiness.md
```

## Prompt Preview Review Workflow

`prompt-preview.md` is for human review.

Reviewers should inspect:

- input summary
- deterministic draft summary
- required patch-only output
- safety rules
- included material list
- provider config mode

The prompt preview must not include local absolute paths, API keys, or env var values.

## Readiness Report

`ai-preview-readiness.json` and `ai-preview-readiness.md` intentionally mark the future AI call as blocked.

Expected status:

```text
status: not_executed_design_only
readyForPromptReview: true
readyForFutureAiPreview: false
readyForAiCall: false
```

## Future Transition

A future phase may add an explicit runtime gate after prompt review. That future gate must still require:

- `--enable-ai`
- `--allow-network`
- `--emit-patch-only`
- `--review-required`

Even then, provider output must become AI patch candidates and pass merge-preview review boundaries.
