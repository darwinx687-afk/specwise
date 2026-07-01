# Roadmap v0.1

This roadmap is directional. Later phases are not implemented until explicitly built.

## Completed

- Phase 1: Spec Pack Standard, JSON Schemas, validator, minimal example
- Phase 2: realistic legacy staff evaluation example
- Phase 2.5: repo readiness polish
- Phase 3: local CLI skeleton
- Phase 4: material inventory
- Phase 5: deterministic draft spec-pack generator
- Phase 6: AI extraction pipeline design
- Phase 7A: provider config and mock extraction dry-run scaffold
- Phase 7B: provider runtime boundary preview and placeholder guard
- Phase 8A: AI patch contract and offline mock merge preview
- Phase 8B: Explicit opt-in AI provider preview design
- Phase 8C: Explicit opt-in AI preview scaffold and prompt artifact preparation
- Phase 9A: Human review workflow skeleton
- Phase 9B: Manual apply plan skeleton
- Phase 10A: Agent handoff pack design
- Phase 10B: Agent handoff pack skeleton
- Phase 10C: Agent-specific handoff templates polish
- Phase 11: Release readiness and DX polish
- Phase 12: local root commit for SpecWise v0.1 preview
- Phase 13A: GitHub public repository setup preparation

## Next

- Phase 13B: remote configuration and first push, only after user confirms the GitHub owner, repository URL, and push permission

## Current Boundary

SpecWise v0.1 currently supports deterministic inventory, draft spec-pack generation, mock provider dry-run planning, offline AI patch merge preview, local AI preview prompt artifact preparation, human review workflow reports, manual apply plans, agent handoff pack design documentation, agent handoff pack skeleton generation, polished agent-specific boundary notes, release readiness docs, and local smoke testing.

AI extraction is not implemented yet. Phase 9B adds manual revision planning, not real provider calls, not auto-apply, and not final spec-pack generation.

Phase 10A adds design documentation only. It does not generate handoff packs, call Codex, call Claude Code, call Cursor, call Spec Kit, or create implementation task files.

Phase 10B adds a local handoff skeleton generator and validator. It does not call agents, generate code, create implementation tasks, auto-apply patches, or generate final spec-packs.

Phase 10C polishes generated Codex, Claude Code, Cursor, and Spec Kit boundary notes. It does not implement agent integrations.

Phase 11 adds release-readiness documentation, README polish, local smoke script, changelog, privacy and safety notes, examples guide, CLI reference, and known limitations. It does not publish, tag, release, or add runtime features.

Phase 12 creates the local root commit only. It does not configure a remote, push, tag, release, publish to npm, or choose a license.

Phase 13A prepares GitHub public repository metadata and remote setup instructions only. It does not configure a remote, push, tag, release, publish to npm, choose a license, call a real AI provider, call a coding agent, or generate final spec-packs.
