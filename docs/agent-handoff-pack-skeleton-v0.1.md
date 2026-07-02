# Agent Handoff Pack Skeleton v0.1

Status: Phase 27C readability-polished skeleton. No agent calls and no implementation.

## Purpose

Agent Handoff Pack Skeleton packages reviewed SpecWise context for future AI coding agents.

It prepares context only.

It does not call Codex, Claude Code, Cursor, Spec Kit, or any AI provider.

It does not generate application code, implementation tasks, or a final spec-pack.

## Required Inputs

`handoff create` requires:

- a draft spec-pack folder
- `spec-pack.json`
- `evidence-map.json`
- `buildability-report.md`
- a valid `manual-apply-plan.json`

The manual apply plan is the bridge between human review and any future handoff. Blocked items and business confirmation items must stay visible.

## CLI

```bash
node bin/specwise.mjs handoff create <draft-spec-pack-path> \
  --apply-plan <manual-apply-plan-file> \
  --out <output-folder> \
  --target codex,claude-code,cursor,spec-kit \
  --force

node bin/specwise.mjs handoff validate <handoff-pack-folder>
```

## Generated Files

`handoff create` generates:

```text
handoff-pack/
  README.md
  handoff-manifest.json
  00_agent-instructions.md
  01_project-context.md
  02_modules-and-pages.md
  03_entities-and-fields.md
  04_permissions-and-scopes.md
  05_workflows-and-states.md
  06_acceptance-criteria.md
  07_open-questions.md
  08_evidence-map-summary.md
  09_implementation-boundaries.md
  10_manual-apply-plan-summary.md
  machine/
    spec-pack.json
    evidence-map.json
    buildability-report.md
    manual-apply-plan.json
  agent-specific/
    codex.md
    claude-code.md
    cursor.md
    spec-kit.md
```

The `machine/` files are copied source artifacts. The draft spec-pack is not modified.

Phase 10C generates the `agent-specific/` files from `templates/handoff/agent-specific/` plus shared safety templates under `templates/handoff/shared/`.

Phase 27C adds `machine/README.md` so copied source artifacts are clearly described as traceability inputs, not generated application code or final implementation instructions.

## Handoff Gate

Phase 10B computes a conservative gate:

```text
If Buildability Score < 60:
  handoffType = blocked_handoff
  implementationAllowed = false

If open questions exist:
  handoffType = discovery_handoff
  implementationAllowed = false

If manual apply plan has blockedItems or blocksFinalSpec:
  handoffType = discovery_handoff
  implementationAllowed = false

If high-risk permission questions exist:
  handoffType = discovery_handoff
  implementationAllowed = false

If no blockers and explicit human status exists:
  handoffType = implementation_candidate
  implementationAllowed = false in Phase 10B
```

Even `implementation_candidate` does not authorize implementation in Phase 10B.

## Safety Boundary

The generated manifest must keep:

- `noAgentCallsMade: true`
- `noAutoImplementation: true`
- `noFinalSpecPackGenerated: true`
- `implementationAllowed: false`
- open questions visible
- assumptions marked
- permissions requiring review

`ready_for_ai_coding` must not be written by the handoff skeleton.

`handoff validate` also checks that generated boundary files preserve key safety phrases, including `not an instruction to implement`, `not a generated Spec Kit task list`, and `Do not implement unresolved business rules`.

Phase 27C strengthens validation so README, open questions, implementation boundaries, manual apply plan summary, machine README, and agent-specific notes must retain context-only safety language.

## Relationship To Manual Apply Plan

The manual apply plan remains a human revision guide.

The handoff skeleton summarizes it for context, but does not convert it into coding tasks.

Unresolved blocked items should prevent implementation handoff. If a pack is still useful, it should be treated as discovery context.

## Phase 10C Template Polish

Phase 10C improves the generated agent-specific notes:

- Codex: read-first order, safe uses, do-not boundaries, implementation blockers, acceptance planning, permission safety
- Claude Code: context reading order, safe uses, do-not boundaries, evidence handling, blocker summary
- Cursor: files to pin/open first, context drift warnings, safe uses, data-scope boundaries
- Spec Kit: future mapping, compatibility boundary, explicit no task-list generation

These files are context and safety notes only. They are not agent commands and do not authorize implementation.

## Phase 27C Readability Polish

Phase 27C improves generated handoff packs with:

- root README status summary and start-here navigation
- `00_agent-instructions.md` non-negotiable boundaries
- grouped `07_open-questions.md`
- clearer `09_implementation-boundaries.md`
- grouped `10_manual-apply-plan-summary.md`
- `machine/README.md`
- dependency-free `npm run handoff:quality`

It does not call agents, generate implementation tasks, generate application code, auto-apply patches, or generate final spec-packs.
