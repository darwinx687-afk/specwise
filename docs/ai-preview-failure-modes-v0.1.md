# AI Preview Failure Modes v0.1

Status: Phase 8B design only. Real AI provider preview is not implemented.

Deterministic draft must remain available even if AI preview fails.

## Failure Matrix

| Failure Mode | Expected Behavior |
| --- | --- |
| Missing opt-in flag | fail before provider call |
| Network not allowed | fail before provider call |
| Placeholder provider used | fail |
| Missing API key env name | fail |
| API key env missing | fail without printing key |
| Provider timeout | fail, keep deterministic draft |
| Invalid JSON response | fail, save invalid-response report |
| Patch schema invalid | fail, no merge preview |
| Patch tries overwrite/delete | fail |
| Confirmed candidate lacks evidence | fail |
| Provider outputs final spec-pack | fail |
| Local path appears in output | fail or redact |
| High-risk permission treated as fact | downgrade to question or fail |
| Bilingual meaning drift | flag for review |

## Failure Handling Principles

Failures should be explicit and recoverable.

Rules:

- keep deterministic draft intact
- keep AI preview output separate
- never auto-apply partial results
- write a small failure report when useful
- avoid printing secrets
- do not retry provider calls silently
- preserve enough metadata for audit

## Invalid Response Handling

If provider response is not valid JSON:

```text
fail
save invalid-response report
do not validate as patch
do not merge
```

If provider response is valid JSON but not a valid AI patch:

```text
fail
save patch validation errors
do not generate merge preview
do not auto-apply
```

## High-risk Candidate Handling

High-risk permission, export, approve, delete, configure, and cross-scope claims require strict handling.

If a provider treats a high-risk item as final fact without sufficient evidence, SpecWise should either:

- downgrade it to `question_candidate`, or
- fail validation and require a corrected patch

The safer default is failure until a review workflow exists.

## Local Path and Secret Handling

If local absolute paths or secrets appear in provider output:

```text
fail or redact
record the redaction
do not merge
require human review
```

API key values must never appear in reports, markdown, JSON artifacts, or CLI output.
