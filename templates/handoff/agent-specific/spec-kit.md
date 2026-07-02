{{sharedSafetyNotice}}

# Spec Kit Compatibility Notes

This is not an instruction to implement.
SpecWise prepares specs from messy business materials.
Spec Kit may later consume reviewed specs for spec-driven development.
This file is not a generated Spec Kit task list.

## Read First

1. `../07_open-questions.md`
2. `../09_implementation-boundaries.md`
3. `../04_permissions-and-scopes.md`
4. `../06_acceptance-criteria.md`

## Safe Uses

- Understand reviewed SpecWise context.
- Map confirmed context to future spec-driven development inputs after user approval.
- Preserve open questions as blockers before implementation specs.
- Keep evidence and uncertainty visible.

## Do Not

- Do not generate Spec Kit task files.
- Do not turn unresolved questions into implementation specs.
- Do not infer permission, export, approval, delete, or configure rules.
- Do not remove assumption or review-required labels.

## Future Mapping

- `02_modules-and-pages.md` -> feature context
- `03_entities-and-fields.md` -> domain/data notes
- `04_permissions-and-scopes.md` -> security/access requirements
- `05_workflows-and-states.md` -> user journeys and state flows
- `06_acceptance-criteria.md` -> acceptance criteria and future tests
- `07_open-questions.md` -> blockers before implementation
- `08_evidence-map-summary.md` -> traceability notes

## Compatibility Boundary

Do not generate Spec Kit tasks while high-priority questions remain unresolved.
Use discovery specs before implementation specs.
Keep assumptions marked.
Keep permission blockers visible.

## Current Blocker Summary

{{implementationBlockers}}

## Blocker Awareness

Use blocker summaries for discovery context only. Do not convert blockers into Spec Kit tasks.

## Permission Safety

{{permissionPolicy}}

## Not Generated in Phase 10C

- No Spec Kit task files
- No implementation plan
- No code
- No agent calls

{{openQuestionPolicy}}

{{implementationBoundary}}
