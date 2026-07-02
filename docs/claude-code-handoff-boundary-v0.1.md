# Claude Code Handoff Boundary v0.1

Status: Phase 27C readability-polished skeleton boundary. No Claude Code integration is implemented.

## 1. Claude Code Use Case

A future Claude Code handoff pack may provide reviewed SpecWise docs as context for a coding session.

Claude Code may use the pack to:

- read reviewed project context
- plan implementation steps
- identify missing business information
- draft code only after explicit user instruction
- use acceptance criteria as test planning input

## 2. Keep Open Questions Visible

Open questions must stay visible in the handoff context.

Claude Code instructions should require reading:

```text
07_open-questions.md
09_implementation-boundaries.md
06_acceptance-criteria.md
```

Unresolved questions should not be converted into implementation facts.

## 3. Do Not Convert Assumptions To Implementation

Assumptions may guide discovery and planning, but they should not become product behavior unless confirmed.

Claude Code must not:

- implement unclear permission scopes
- implement unresolved workflow transitions
- remove uncertainty labels
- treat inferred fields as confirmed data requirements

## 4. Preserve Evidence Links

Evidence links should remain attached to claims.

If evidence conflicts, the conflict should become an implementation blocker or a follow-up question.

## 5. Future Claude Code Handoff File

The future agent-specific file is:

```text
agent-specific/claude-code.md
```

Phase 10B may generate this file as boundary notes inside a handoff skeleton. It does not call Claude Code and does not create Claude Code execution commands.

## 6. Phase 10C Template Polish

Phase 10C generates `agent-specific/claude-code.md` from a static template and shared safety notes.

The generated file includes:

- suggested context reading order
- safe uses for confirmed context, evidence-linked summaries, and draft test ideas after user approval
- do-not boundaries for assumptions, open questions, permission inference, and unresolved specs
- evidence handling rules
- implementation blocker summaries from open questions and manual apply plan blocked items

It does not include Claude Code commands and does not create automatic task language.

## 7. Phase 27C Readability Polish

Phase 27C keeps the Claude Code-specific file context-only while requiring clearer sections:

- `Read First`
- `Safe Uses`
- `Do Not`
- `Blocker Awareness`
- `Permission Safety`

The generated file explicitly says it is not an instruction to implement and must not be treated as authorization to code.
