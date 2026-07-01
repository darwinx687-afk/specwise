# Explicit AI Preview Design v0.1

Status: Phase 8B design plus Phase 8C local prompt scaffold. Real AI provider calls are not implemented.

## 1. Positioning

Phase 8B designs an explicit opt-in AI provider preview.
It does not implement provider calls.
SpecWise remains local-first and deterministic by default.

Phase 8B 只设计显式开启的 AI provider preview，不实现真实调用。SpecWise 默认仍然是本地优先和确定性执行。

The current working baseline remains:

```text
inventory -> deterministic draft -> patch validation -> merge preview
```

Future AI preview must enhance this baseline without replacing it.

Phase 8C adds `ai-preview prepare`, which builds local prompt artifacts and readiness reports only. It does not implement the provider call step.

## 2. Future Command Shape

Phase 8B does not add this command. A future command may look like:

```bash
specwise extract-ai <input-folder> \
  --out <output-folder> \
  --config specwise.ai.config.json \
  --enable-ai \
  --allow-network \
  --emit-patch-only \
  --review-required
```

If SpecWise later extends the existing `extract` command, the same gates should apply:

```bash
specwise extract <input-folder> \
  --out <output-folder> \
  --config specwise.ai.config.json \
  --enable-ai \
  --allow-network \
  --emit-patch-only \
  --review-required
```

Required future behavior:

- missing `--enable-ai` must fail before provider call
- missing `--allow-network` must fail before provider call
- missing `--emit-patch-only` must fail before provider call
- missing `--review-required` must fail before provider call
- final spec-pack generation is not allowed
- auto-apply is not allowed
- output must be candidate patch plus auditable artifacts only

Phase 8C implements a local-only preparation command:

```bash
specwise ai-preview prepare <input-folder> \
  --out <output-folder> \
  --config specwise.ai.config.json
```

This command prepares prompt artifacts for review. It does not accept `--enable-ai` or call providers.

## 3. Required Future Safety Flags

Required flags:

- `--enable-ai`: explicit user consent to leave deterministic-only mode
- `--allow-network`: explicit consent for a provider network call
- `--emit-patch-only`: confirms model output must be an AI patch, not a final spec-pack
- `--review-required`: confirms every candidate remains human-review required

Optional flags:

- `--save-prompt`: save the packaged prompt context as an audit artifact
- `--save-raw-response`: save raw provider response for debugging or audit, with secret redaction
- `--redact-local-paths`: force output artifacts to remove local absolute paths
- `--max-input-chars`: cap prompt context size before provider call
- `--max-output-chars`: cap response size before parsing

These flags make data movement visible and avoid accidental provider calls from ordinary local commands.

## 4. Future Output Artifacts

A future AI preview output folder may look like:

```text
ai-preview/
  material-inventory.json
  material-summary.md
  deterministic-draft/
  prompt-package.json
  prompt-preview.md
  provider-response.raw.json
  ai-patch.json
  ai-patch-validation.json
  merge-preview/
    merge-preview.json
    merge-preview.md
```

Phase 8C currently emits:

```text
ai-preview-prepare/
  material-inventory.json
  material-summary.md
  deterministic-draft/
  prompt-package.json
  prompt-preview.md
  ai-preview-readiness.json
  ai-preview-readiness.md
```

Artifact rules:

- `ai-patch.json` must conform to `schemas/ai-patch.schema.json`
- `provider-response.raw.json` should be optional and must never contain API keys
- `prompt-preview.md` must not contain local absolute paths
- no final spec-pack is generated
- no deterministic draft is modified
- merge preview is review-only

## 5. Future User Flow

Future explicit AI preview flow:

1. Run inventory.
2. Run deterministic draft.
3. Build prompt package.
4. User inspects prompt preview.
5. User explicitly enables AI preview.
6. Provider call happens only if all flags and config pass.
7. Provider response is parsed as AI patch only.
8. Validate provider response against the AI patch contract.
9. Generate merge preview.
10. Human review is required before any later workflow can accept or revise candidates.

Phase 8C stops after step 4 and records `readyForAiCall: false`.

## 6. Non-goals

Phase 8B does not include:

- production AI extraction
- provider runtime implementation
- prompt runner
- auto-apply patches
- final spec generation
- OCR
- vision
- Web UI
- handoff pack

## 7. Deterministic Baseline Protection

The deterministic draft must remain available even if AI preview fails.

Future AI preview output must live in a separate output folder. It must not overwrite deterministic draft artifacts or make `ready_for_ai_coding` claims without validation and human review.
