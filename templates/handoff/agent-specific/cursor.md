{{sharedSafetyNotice}}

# Cursor Boundary Notes

This file prepares reviewed SpecWise context for a future Cursor workspace.
It is not an instruction to implement.

## Pin or Open First

- `../07_open-questions.md`
- `../09_implementation-boundaries.md`
- `../04_permissions-and-scopes.md`
- `../06_acceptance-criteria.md`

## Context Drift Warnings

- Do not let chat context override evidence.
- Do not let generated code imply unconfirmed permissions.
- Do not collapse assumptions into requirements.
- Do not hide blocked items from future prompts.

## Safe Uses

- Keep confirmed context available while planning.
- Compare implementation ideas against acceptance criteria.
- Keep permission and workflow blockers visible.

## Do Not

- Do not implement unresolved behavior.
- Do not infer data scopes.
- Do not generate final database rules from uncertain fields.
- Do not create production-ready code until blockers are resolved.

## Current Blocker Summary

{{implementationBlockers}}

{{openQuestionPolicy}}

{{permissionPolicy}}

{{implementationBoundary}}
