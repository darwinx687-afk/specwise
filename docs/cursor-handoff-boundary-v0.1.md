# Cursor Handoff Boundary v0.1

Status: Phase 10C polished skeleton boundary. No Cursor integration is implemented.

## 1. Cursor Use Case

A future Cursor handoff pack may provide reviewed SpecWise docs as project context inside an editor workflow.

Cursor may use the pack to:

- keep business context close to code changes
- compare proposed implementation against acceptance criteria
- surface unresolved questions during planning
- help draft tests after explicit user instruction

## 2. Files To Open First

Future Cursor instructions should recommend opening or pinning:

```text
00_agent-instructions.md
07_open-questions.md
09_implementation-boundaries.md
06_acceptance-criteria.md
08_evidence-map-summary.md
```

Open questions and boundaries should be visible before code generation starts.

## 3. Avoid Context Drift

Cursor chat context must not override evidence.

Future instructions should say:

- use reviewed handoff docs as the source of context
- keep evidence IDs attached to implementation claims
- preserve `review_required`, `needsReview`, and blocker labels
- ask for human confirmation when chat context conflicts with handoff docs

## 4. Cursor Must Not

Cursor must not:

- infer missing permission rules
- implement unresolved workflows
- treat assumptions as confirmed behavior
- remove open questions from context
- create final readiness claims without explicit human confirmation

## 5. Future Cursor Handoff File

The future agent-specific file is:

```text
agent-specific/cursor.md
```

Phase 10B may generate this file as boundary notes inside a handoff skeleton. It does not call Cursor and does not create Cursor tasks.

## 6. Phase 10C Template Polish

Phase 10C generates `agent-specific/cursor.md` from a static template and shared safety notes.

The generated file includes:

- files to pin or open first
- context drift warnings
- safe uses for planning context and acceptance-criteria comparison
- do-not boundaries for unresolved behavior, inferred data scopes, uncertain fields, and production-ready code
- implementation blocker summaries from open questions and manual apply plan blocked items

It does not include Cursor commands and does not create Cursor tasks.
