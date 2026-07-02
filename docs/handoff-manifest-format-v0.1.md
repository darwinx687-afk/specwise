# Handoff Manifest Format v0.1

Status: Phase 27C skeleton manifest and validation notes. No agent calls.

## Purpose

`handoff-manifest.json` records the source, safety flags, target agent context files, and gate state for an Agent Handoff Pack Skeleton.

It is not an implementation authorization.

## Required Fields

- `schemaVersion`: must be `0.1.0`
- `mode`: must be `agent_handoff_pack_skeleton`
- `packId`: stable pack identifier
- `source`: source draft spec-pack and manual apply plan references
- `targetAgents`: selected context targets
- `safety`: fail-closed safety flags
- `gates`: handoff readiness gate
- `status`: review status
- `createdAt`: timestamp

## Source Fields

`source` contains:

- `draftSpecPackPath`
- `manualApplyPlanPath`
- `specPackStatus`
- `buildabilityScore`
- `hasEvidenceMap`
- `hasManualApplyPlan`

Source paths should be local review references, not machine-specific absolute paths.

## Safety Fields

The following fields must be true:

- `noAgentCallsMade`
- `noAutoImplementation`
- `noFinalSpecPackGenerated`
- `openQuestionsMustRemainVisible`
- `assumptionsMustRemainMarked`
- `permissionsRequireReview`

## Gate Fields

`gates` contains:

- `handoffType`: `blocked_handoff`, `discovery_handoff`, or `implementation_candidate`
- `implementationAllowed`: always false in Phase 10B
- `blockedByOpenQuestions`
- `blockedByManualApplyPlan`
- `blockedByLowBuildability`
- `blockedByHighRiskPermissions`

## Target Agents

Allowed target agents:

```text
codex
claude-code
cursor
spec-kit
```

These names only control generated boundary notes under `agent-specific/`. They do not call the agents.

## Validation Rules

`handoff validate` checks:

- `handoff-manifest.json` exists
- `mode` is `agent_handoff_pack_skeleton`
- safety fields are true
- `implementationAllowed` is false
- status is allowed
- required Markdown files exist
- required `machine/` artifacts exist
- selected `agent-specific/` files exist
- `machine/README.md` exists and explains copied source artifacts
- copied manual apply plan is still valid
- required context-only safety phrases remain visible in generated Markdown

## Example

```json
{
  "schemaVersion": "0.1.0",
  "mode": "agent_handoff_pack_skeleton",
  "packId": "handoff_legacy_staff_evaluation_001",
  "source": {
    "draftSpecPackPath": "./tmp/draft-test/spec-pack",
    "manualApplyPlanPath": "./tmp/apply-plan/manual-apply-plan.json",
    "specPackStatus": "review_required",
    "buildabilityScore": 72,
    "hasEvidenceMap": true,
    "hasManualApplyPlan": true
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
    "implementationAllowed": false,
    "blockedByOpenQuestions": true,
    "blockedByManualApplyPlan": true,
    "blockedByLowBuildability": false,
    "blockedByHighRiskPermissions": true
  },
  "status": "review_required",
  "createdAt": "2026-07-01T00:00:00.000Z"
}
```
