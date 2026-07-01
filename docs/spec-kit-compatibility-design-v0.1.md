# Spec Kit Compatibility Design v0.1

Status: Phase 10C polished skeleton compatibility notes. No Spec Kit integration is implemented.

## 1. Positioning

SpecWise does not replace Spec Kit.

```text
SpecWise prepares specs from messy business materials.
Spec Kit may consume reviewed specs for spec-driven development.
```

SpecWise focuses on evidence, uncertainty, open questions, permissions, workflows, and buildability before coding begins.

## 2. Future Mapping

A future compatibility layer may map reviewed SpecWise outputs into spec-driven development context:

```text
SpecWise 01_modules.md -> Spec Kit feature context
SpecWise 02_entities.md -> data/domain model notes
SpecWise 03_permissions.md -> security and access requirements
SpecWise 04_workflows.md -> user journeys / state flows
SpecWise 05_questions.md -> blockers before implementation
SpecWise 06_acceptance.md -> acceptance criteria / tests
SpecWise evidence-map.json -> traceability notes
```

This mapping should preserve uncertainty and evidence references.

## 3. Compatibility Boundary

SpecWise should not generate Spec Kit tasks until high-priority questions are resolved.

SpecWise may generate discovery specs before implementation specs.

Future compatibility should distinguish:

- discovery context for unresolved systems
- implementation context for reviewed and confirmed behavior
- test planning context from acceptance criteria
- traceability context from evidence maps

## 4. Current Non-Goals

Phase 10A does not:

- generate Spec Kit files
- call Spec Kit tools
- create implementation tasks
- mark a pack as ready for spec-driven development
- bypass manual review or blocked-item resolution

Phase 10B may generate `agent-specific/spec-kit.md` as boundary notes inside a handoff skeleton. It does not generate Spec Kit tasks.

## 5. Phase 10C Template Polish

Phase 10C generates `agent-specific/spec-kit.md` from a static template and shared safety notes.

The generated file includes:

- future mapping from SpecWise handoff files to spec-driven development context
- compatibility boundary for unresolved high-priority questions
- discovery-before-implementation language
- explicit blocker and permission safety notes
- a `Not Generated in Phase 10C` section

The file must say it is not a generated Spec Kit task list. It does not generate Spec Kit tasks, implementation plans, code, or agent calls.
