# Human Review Workflow v0.1

Status: Phase 9A skeleton with Phase 9B manual apply planning. No auto-apply and no final spec-pack generation.

## Why Human Review Exists

SpecWise treats AI patch candidates as review-required suggestions. Human review exists so business owners, analysts, or implementers can decide which candidates are safe to carry into a future manual spec revision.

The workflow does not modify the deterministic draft.

## Relationship To Patch Preview

The Phase 8A merge preview creates a review queue from AI patch candidates.

Phase 9A starts from that queue:

```text
merge-preview
-> review template
-> reviewer decisions
-> decision validation
-> decision report
-> reviewed handoff plan
```

## Review Queue

The review queue comes from `merge-preview.json.reviewQueue`.

Each item includes:

- candidate ID
- candidate type
- target section
- priority
- confidence
- summary
- rationale

## Decisions

Reviewers can choose:

```text
accepted
rejected
needs_more_info
deferred
```

Accepted decisions must say what they are accepted as:

```text
fact
assumption
question
acceptance_criterion
```

Default generated decisions are conservative:

- `question_candidate` -> `needs_more_info`
- `assumption_candidate` -> `deferred`
- `conflict_candidate` -> `needs_more_info`
- `confirmed_candidate` -> `deferred`

SpecWise does not default any candidate to accepted.

## Report

`review report` generates:

```text
review-report.json
review-report.md
reviewed-handoff-plan.md
```

The report summarizes accepted items, follow-up questions, deferred items, rejected items, and readiness blockers.

## Handoff Plan

The reviewed handoff plan organizes decisions into:

- safe to include in next spec revision
- needs business confirmation
- do not apply yet
- recommended next actions

It is not a final spec-pack.

## Manual Apply Plan

Phase 9B consumes the review report and creates:

```text
manual-apply-plan.json
manual-apply-plan.md
spec-revision-checklist.md
blocked-items.md
```

The manual apply plan tells humans how to revise the next spec-pack version. It does not edit the draft and does not create a final spec-pack.

## Boundaries

Phase 9A does not:

- auto-apply AI patches
- modify draft spec-pack files
- generate a final spec-pack
- call AI providers
- create a Web UI
- create an agent handoff pack
