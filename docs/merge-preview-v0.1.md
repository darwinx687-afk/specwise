# Merge Preview v0.1

Status: Phase 8A offline preview. No auto-apply.

Merge preview turns an AI patch fixture into a human review queue. It does not modify the deterministic draft and does not generate a final spec-pack.

Phase 8B designs how a future explicit AI provider preview would feed the same merge preview step. The preview remains review-only.

## Purpose

The preview helps reviewers inspect what a future AI-assisted extraction layer might propose before anything is applied.

Inputs:

- deterministic draft spec-pack folder
- AI patch JSON
- output folder

Outputs:

```text
merge-preview.json
merge-preview.md
```

## No Auto-Apply

SpecWise v0.1 does not auto-apply AI patches.

Preview generation:

- reads the draft spec-pack
- validates the patch contract
- creates a review queue
- records blocked auto-apply reasons
- leaves the draft unchanged
- does not generate a final spec-pack

## Review Queue

Each review queue item includes:

- candidate ID
- candidate type
- target section
- target ID
- operation
- priority
- confidence
- review action
- rationale

Review actions are intentionally human-facing:

```text
confirm_or_reject
confirm_revise_or_reject
answer_or_assign_owner
resolve_conflict
```

## Blocked Auto-Apply Reasons

The preview always records why automatic application is blocked:

- SpecWise v0.1 does not auto-apply AI patches.
- All AI candidates require human review.
- Conflicting or unsupported claims must remain questions or assumptions.
- No silent overwrite is allowed.

## Future Direction

Future review workflow phases may let users accept, revise, reject, or annotate candidates. That workflow should still preserve evidence-first behavior, validation, and explicit human confirmation.

Future AI provider preview must still produce merge previews through this review-only boundary. Provider output cannot skip directly to final spec-pack generation.

## Human Review Workflow

Phase 9A consumes `merge-preview.json` to generate a human review template:

```bash
specwise review init <merge-preview-folder> --out <review-folder>
```

The review workflow keeps the same safety boundary:

- no auto-apply
- no draft spec-pack modification
- no final spec-pack generation
- accepted decisions become planning inputs only
