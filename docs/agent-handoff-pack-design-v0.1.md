# Agent Handoff Pack Design v0.1

Status: Phase 10A design foundation. Phase 10B adds skeleton generation only.

## Positioning

Agent Handoff Pack is a future artifact that packages reviewed SpecWise outputs for AI coding agents.

It is not generated in Phase 10A.

Phase 10B can generate an Agent Handoff Pack Skeleton for human review and agent context preparation.

It must not be created from unreviewed AI patches.

It must not bypass human review.

Agent Handoff Pack 是用于把经过审查的 SpecWise 输出交给未来 AI coding agent 的交付包。Phase 10A 只做设计；Phase 10B 可以生成 skeleton，但仍不能调用 agent，也不能绕过人工审查。

## Current Boundary

Phase 10A documents the future shape of an agent handoff pack. Phase 10B adds a local skeleton generator.

The current boundary still does not:

- call Codex, Claude Code, Cursor, or Spec Kit
- call AI providers
- run prompt execution
- auto-apply AI patches
- generate a final spec-pack
- generate application code
- create real development task files

## Intended Flow

The future handoff flow should remain review-first:

```text
deterministic draft
  -> patch preview
  -> human review report
  -> manual apply plan
  -> future reviewed spec revision
  -> agent handoff pack
```

A handoff pack should come from human-reviewed usable specs. It should not come directly from a raw AI patch, raw draft, or unreviewed merge preview.

## Handoff Source Requirements

A future handoff pack should require:

- validated spec-pack
- `evidence-map.json`
- `buildability-report.md`
- unresolved open questions
- `review-report.json` if an AI patch was used
- `manual-apply-plan.json` if reviewed patches exist
- status `review_required` or `implementation_candidate`

It should not accept:

- raw AI response
- unvalidated patch
- unreviewed merge preview
- unreviewed assumptions
- `ready_for_ai_coding` without manual confirmation

## Future Pack Structure

The following directory is a future design shape only. Phase 10A does not create it.

```text
agent-handoff-pack/
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

## Future File Content Rules

`00_agent-instructions.md` should tell the agent not to skip open questions.

`01_project-context.md` should describe project context without local machine paths.

`02_modules-and-pages.md` should summarize modules and pages.

`03_entities-and-fields.md` should summarize entities and fields.

`04_permissions-and-scopes.md` should preserve permission uncertainty and `needsReview` markers.

`05_workflows-and-states.md` should mark uncertain transitions.

`06_acceptance-criteria.md` should provide testable acceptance criteria.

`07_open-questions.md` should keep unresolved questions in a prominent location.

`08_evidence-map-summary.md` should summarize evidence without breaking evidence IDs.

`09_implementation-boundaries.md` should list boundaries that agents must not infer past.

`10_manual-apply-plan-summary.md` should summarize the human-reviewed manual revision plan without turning it into coding tasks.

## Future Manifest Shape

The following JSON was the Phase 10A design shape. Phase 10B uses `mode: agent_handoff_pack_skeleton` and validates it with `schemas/handoff-manifest.schema.json`.

```json
{
  "schemaVersion": "0.1.0",
  "mode": "agent_handoff_pack_skeleton",
  "source": {
    "specPackStatus": "review_required",
    "hasEvidenceMap": true,
    "hasManualApplyPlan": true,
    "hasHumanReviewReport": true
  },
  "targetAgents": ["codex", "claude-code", "cursor", "spec-kit"],
  "safety": {
    "noAgentCallsMade": true,
    "noAutoImplementation": true,
    "noFinalSpecPackGenerated": true,
    "openQuestionsMustRemainVisible": true,
    "assumptionsMustRemainMarked": true,
    "permissionsRequireReview": true
  },
  "gates": {
    "handoffType": "discovery_handoff",
    "implementationAllowed": false
  },
  "status": "review_required"
}
```

## Buildability Gate

Future handoff generation should use a buildability gate:

```text
If Buildability Score < 60:
  Handoff pack should be blocked.

If high-priority permission questions exist:
  Handoff pack may be generated only as discovery handoff, not implementation handoff.

If status is review_required:
  Agent instructions must say: do not implement unresolved rules.

If status is ready_for_ai_coding:
  must require explicit human confirmation.
```

The current project must not automatically write `ready_for_ai_coding`. Phase 10B keeps `implementationAllowed` false even when a pack is an implementation candidate.
