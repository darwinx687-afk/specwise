# Spec Revision Checklist v0.1

Status: Phase 9B manual checklist. Not an automatic editor.

## How To Use

Use `spec-revision-checklist.md` when preparing the next manual spec-pack revision.

The checklist is generated from a human review report and manual apply plan. It helps a reviewer decide what to edit by hand and what must remain blocked.

This checklist is also a future handoff gate. Manual spec revision should happen before any agent handoff pack is considered.

## Safe Manual Updates

Safe manual updates are accepted review decisions that can be considered for the next manual spec revision.

Examples:

- add an audit log acceptance criterion to `06_acceptance.md`
- add a deactivation assumption to `02_entities.md` or a future assumptions section
- update bilingual summaries to preserve uncertainty

These are still manual edits. SpecWise does not apply them.

## Business Confirmation Items

Business confirmation items must be answered before final readiness.

Examples:

- confirm Department Manager export scope
- confirm cross-department visibility
- confirm who approves reviewed records
- confirm edit-after-submit behavior
- resolve reviewed versus approved status semantics

Unresolved blocked items should prevent implementation handoff. If unresolved questions remain useful for agent context, they should stay labeled as discovery items rather than implementation facts.

## Developer Review Items

Developer or FDE review should confirm:

- target files and sections before editing
- whether accepted assumptions belong in entities, questions, or summaries
- whether buildability changes are still blocked
- whether new text preserves evidence and uncertainty

## Validation After Manual Edits

After any manual spec revision:

```bash
node bin/specwise.mjs validate path/to/spec-pack
```

Validation does not prove the business is fully understood, but it checks structure, references, and schema consistency.

## What Not To Do

Do not:

- auto-apply AI patches
- silently overwrite deterministic draft findings
- mark the project `ready_for_ai_coding`
- generate a final spec-pack from the plan
- generate an agent handoff pack from unresolved blocked items
- include blocked or deferred items as facts
