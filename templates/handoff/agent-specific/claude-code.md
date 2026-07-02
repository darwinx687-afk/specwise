{{sharedSafetyNotice}}

# Claude Code Boundary Notes

This is not an instruction to implement.
This file prepares reviewed SpecWise context for a future Claude Code workspace.
It is not an instruction to implement.

## Read First

1. `../01_project-context.md`
2. `../07_open-questions.md`
3. `../09_implementation-boundaries.md`
4. `../06_acceptance-criteria.md`
5. `../08_evidence-map-summary.md`

## Safe Uses

- Summarize confirmed context.
- Turn confirmed acceptance criteria into draft test ideas after user approval.
- Identify missing business decisions.
- Keep evidence links visible.
- Propose implementation phases only after unresolved blockers are reviewed.

## Do Not

- Do not convert assumptions into code requirements.
- Do not bypass open questions.
- Do not infer approval/export/delete/configure rules.
- Do not remove `review_required`.
- Do not generate final implementation tasks from unresolved specs.

## Evidence Handling

Claims without evidence should remain assumptions or questions.
Conflicting evidence should become a blocker, not an implementation decision.

## Blocker Awareness

{{implementationBlockers}}

{{openQuestionPolicy}}

## Permission Safety

{{permissionPolicy}}

{{implementationBoundary}}
