{{sharedSafetyNotice}}

# Codex Boundary Notes

This is not an instruction to implement.
This file prepares reviewed SpecWise context for a future Codex session.
It is not an instruction to implement.

## Read First

1. `../07_open-questions.md`
2. `../09_implementation-boundaries.md`
3. `../06_acceptance-criteria.md`
4. `../04_permissions-and-scopes.md`

## Safe Uses

- Understand the reviewed business context.
- Identify missing information before coding.
- Draft an implementation plan only after explicit user instruction.
- Propose tests from confirmed acceptance criteria.
- Keep unresolved permission/workflow questions visible.

## Do Not

- Do not implement unresolved business rules.
- Do not infer missing permissions.
- Do not treat assumptions as facts.
- Do not mark the project `ready_for_ai_coding`.
- Do not overwrite SpecWise source artifacts.
- Do not create production-ready claims from incomplete materials.

## Blocker Awareness

{{implementationBlockers}}

## Acceptance Planning Notes

Use `06_acceptance-criteria.md` as planning context only.
Do not create tests for unresolved behavior unless explicitly marked as pending/blocked.

{{openQuestionPolicy}}

## Permission Safety

Export, approve, delete, configure, cross-company, and cross-department access require explicit confirmation.

{{permissionPolicy}}

{{implementationBoundary}}
