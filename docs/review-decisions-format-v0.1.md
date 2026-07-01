# Review Decisions Format v0.1

Status: Phase 9A schema and validation format.

## Schema Overview

Review decisions are stored in:

```text
review-decisions.json
```

Top-level shape:

```json
{
  "schemaVersion": "0.1.0",
  "reviewId": "review_legacy_staff_eval_001",
  "source": {
    "mergePreviewPath": "./tmp/patch-preview",
    "patchId": "patch_legacy_staff_eval_mock_001"
  },
  "reviewer": {
    "name": "manual-reviewer",
    "role": "human_reviewer"
  },
  "decisions": [],
  "summary": {
    "accepted": 0,
    "rejected": 0,
    "needsMoreInfo": 0,
    "deferred": 0
  },
  "status": "draft_review",
  "createdAt": "2026-07-01T00:00:00.000Z"
}
```

## Decision Types

Allowed `decision` values:

```text
accepted
rejected
needs_more_info
deferred
```

## Accepted As

Allowed `acceptedAs` values:

```text
fact
assumption
question
acceptance_criterion
null
```

Only `accepted` decisions may use a non-null `acceptedAs`.

## Required Fields

Each decision must include:

```json
{
  "candidateId": "cand_permission_export_scope_001",
  "decision": "needs_more_info",
  "reviewerNote": "Business owner must confirm export scope before implementation.",
  "acceptedAs": null,
  "blocksReadiness": true,
  "followUpQuestion": "Can Department Managers export all department records, or only assigned records?"
}
```

## Validation Rules

Rules:

- `schemaVersion` is required.
- `reviewId` is required.
- `decisions` must be an array.
- every decision must have `candidateId`.
- decision must be one of the allowed values.
- `accepted` requires `acceptedAs`.
- non-accepted decisions must use `acceptedAs: null`.
- `rejected` requires `reviewerNote`.
- `needs_more_info` requires `followUpQuestion`.
- `deferred` requires `reviewerNote`.
- `blocksReadiness` must be boolean.
- summary counts must match decision counts.

## Examples

Accepted:

```json
{
  "candidateId": "cand_acceptance_audit_log_actor_001",
  "decision": "accepted",
  "reviewerNote": "Accept as review-required acceptance criterion for the next spec revision.",
  "acceptedAs": "acceptance_criterion",
  "blocksReadiness": false,
  "followUpQuestion": null
}
```

Needs more info:

```json
{
  "candidateId": "cand_permission_export_scope_001",
  "decision": "needs_more_info",
  "reviewerNote": "Business owner must confirm export scope before implementation.",
  "acceptedAs": null,
  "blocksReadiness": true,
  "followUpQuestion": "Can Department Managers export all department records, or only assigned records?"
}
```

## Boundary

Validated review decisions do not apply patches. They only support review reports and future manual revision planning.
