# Manual Apply Plan v0.1

Status: Phase 9B skeleton. No auto-apply and no final spec-pack generation.

## Why Manual Apply Plan Exists

Human review decisions identify which AI patch candidates are accepted, blocked, deferred, or rejected. A manual apply plan turns those decisions into a conservative checklist for the next manual spec revision.

It does not modify draft spec-pack files.

The manual apply plan is the bridge before any future agent handoff pack. It tells a human reviewer what can be revised, what remains blocked, and what must not be treated as implementation-ready.

## Relationship To Review Report

Phase 9A produces:

```text
review-report.json
review-report.md
reviewed-handoff-plan.md
```

Phase 9B consumes those files and a draft spec-pack path:

```bash
specwise apply-plan create <review-report-folder> \
  --draft <draft-spec-pack-path> \
  --out <output-folder>
```

## Manual Steps

`manualSteps` are instructions for humans.

Allowed actions:

```text
manually_add
manually_update
convert_to_question
convert_to_assumption
keep_blocked
defer
do_not_apply
```

Every step must include:

- source candidate ID
- decision
- acceptedAs value or null
- target file
- target section
- action
- description
- business confirmation requirement
- developer review requirement
- `autoApplyAllowed: false`

## Blocked Items

Blocked items come from review decisions that block readiness, unresolved high-risk questions, deferred permission/workflow items, and unresolved conflicts.

Each blocked item should identify:

- source candidate
- priority
- reason
- required owner
- suggested follow-up question

Unresolved blocked items should prevent implementation handoff. A future handoff pack may still support discovery, but it should not ask an AI coding agent to implement unresolved rules.

## No Auto-Apply

SpecWise v0.1 never applies manual steps automatically.

The plan is a guide for a future manual revision. It does not create or overwrite spec-pack files.

## No Final Spec-Pack

`apply-plan create` outputs:

```text
manual-apply-plan.json
manual-apply-plan.md
spec-revision-checklist.md
blocked-items.md
```

It does not output:

```text
spec-pack/
final-spec-pack/
applied-spec-pack/
```

Because no final spec-pack is generated, there is also no current handoff pack source. Future handoff packs should start only from reviewed, manually revised, validated specs.

## Validation Rules

`apply-plan validate` checks:

- `schemaVersion` exists
- `planId` exists
- `mode` is `manual_apply_plan_only`
- `manualSteps` is an array
- every step has `id`, `action`, `description`, and `autoApplyAllowed`
- `autoApplyAllowed` is always `false`
- `action` is allowed
- `status` is `manual_revision_required` or `blocked`
- no final spec-pack output path is declared
- no step uses `auto_apply`
