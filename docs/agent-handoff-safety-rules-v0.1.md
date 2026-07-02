# Agent Handoff Safety Rules v0.1

Status: Phase 27C safety rules for generated skeletons. No agent calls are made.

## 1. No Silent Assumptions

Future handoff packs must not turn assumptions into facts.

If a rule, permission, workflow, or field is inferred, it must remain marked as inferred, assumed, or needing review.

## 2. Open Questions Stay Visible

Any unresolved question must remain visible in:

```text
07_open-questions.md
00_agent-instructions.md
handoff-manifest.json
```

Open questions are not implementation backlog items by default. They are blockers or discovery prompts until a human resolves them.

## 3. Permission Safety

Permission ambiguity is high-risk.

Future handoff packs must preserve these rules:

```text
- Never let coding agents infer global admin rights.
- Export / approve / delete / configure must remain explicit.
- Cross-company / cross-department access must require confirmation.
- If unclear, generate guardrails, not implementation truth.
```

## 4. Evidence Safety

Implementation facts need evidence.

```text
- Claims without evidence cannot be implementation facts.
- Evidence IDs should remain linked.
- Conflicting evidence must become implementation blocker or question.
```

Evidence summaries may simplify language, but they must not remove traceability.

## 5. Agent Instruction Safety

Future agent-specific instructions must include:

```text
Do not implement unresolved business rules.
Do not turn assumptions into facts.
Do not remove review_required labels.
Do not bypass permission questions.
Do not generate production-ready claims from incomplete materials.
```

These instructions should appear before implementation guidance.

Phase 10B writes these boundaries into generated skeleton files. They remain context notes, not authorization to implement.

Phase 10C adds shared safety templates so every generated agent-specific file starts with the same warning:

```text
This is a SpecWise handoff context file.
It is not an instruction to implement.
Do not start coding unless the user explicitly asks.
Do not turn unresolved questions or assumptions into implementation facts.
```

## 6. No Auto Implementation

Agent handoff pack prepares context.

It does not authorize implementation without human review.

The pack should help an AI coding agent understand reviewed context, plan responsibly, and identify missing information. It should not become a silent approval mechanism.

Phase 10B must keep `noAgentCallsMade`, `noAutoImplementation`, and `noFinalSpecPackGenerated` true in `handoff-manifest.json`.

Phase 10C validation fails if required safety phrases are missing from generated handoff files.

Phase 27C also requires generated handoff packs to keep these safety phrases visible:

- README: `not an implementation request`
- agent instructions: `Do not implement unresolved business rules`
- open questions: `must not be converted into implementation facts`
- implementation boundaries: `Implementation is not authorized`
- manual apply plan summary: `No patch was automatically applied`
- machine README: `not generated application code`

These checks protect readability polish from becoming implementation authorization.
