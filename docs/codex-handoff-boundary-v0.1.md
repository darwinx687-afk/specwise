# Codex Handoff Boundary v0.1

Status: Phase 27C readability-polished skeleton boundary. No Codex integration is implemented.

## 1. Codex Use Case

A future Codex handoff pack may be used for:

- reading reviewed spec context
- planning implementation tasks
- identifying missing information
- drafting code only after explicit user instruction
- generating tests based on acceptance criteria

The handoff pack should be treated as reviewed context, not as final business truth.

## 2. Codex Must Not

Codex must not:

```text
- assume missing permissions
- implement unresolved workflows
- ignore open questions
- mark project ready_for_ai_coding
- overwrite SpecWise source artifacts
```

Codex should preserve review labels and ask for confirmation when business rules are unresolved.

## 3. Future Codex Handoff File

The future agent-specific file is:

```text
agent-specific/codex.md
```

Phase 10B may generate this file as boundary notes inside a handoff skeleton. It does not call Codex and does not instruct Codex to implement.

Suggested future content:

```markdown
# Codex Handoff Instructions

You are receiving a SpecWise handoff pack.
Use this as reviewed context, not as final business truth.

## Must Read First

1. 07_open-questions.md
2. 09_implementation-boundaries.md
3. 06_acceptance-criteria.md

## Do Not Implement

- unresolved high-priority questions
- unclear permission scopes
- unconfirmed approval workflows
```

## 4. Boundary With SpecWise Artifacts

Codex should not rewrite SpecWise source artifacts unless the user explicitly asks for a manual spec revision.

The future handoff pack should give Codex context and constraints. It should not grant authority to close questions, approve assumptions, or create a final spec-pack.

## 5. Phase 10C Template Polish

Phase 10C generates `agent-specific/codex.md` from a static template and shared safety notes.

The generated file includes:

- read-first order for open questions, implementation boundaries, acceptance criteria, and permissions
- safe uses for understanding context and planning only after explicit user instruction
- do-not boundaries for unresolved rules, inferred permissions, assumptions, and `ready_for_ai_coding`
- implementation blocker summaries from open questions and the manual apply plan
- acceptance planning notes that keep unresolved behavior pending or blocked
- permission safety notes for export, approve, delete, configure, cross-company, and cross-department access

It does not include Codex commands and does not ask Codex to implement.

## 6. Phase 27C Readability Polish

Phase 27C keeps the Codex-specific file context-only while requiring clearer sections:

- `Read First`
- `Safe Uses`
- `Do Not`
- `Blocker Awareness`
- `Permission Safety`

The generated file explicitly says it is not an instruction to implement and must not be treated as authorization to code.
