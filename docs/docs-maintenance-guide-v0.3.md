# Docs Maintenance Guide v0.3

Status: Phase 27E documentation maintenance guide.

This guide explains how to keep SpecWise documentation navigable without weakening safety boundaries or rewriting project history.

## 1. Purpose

SpecWise has current user guides, workflow references, safety docs, release records, and historical planning docs. The goal is not to make every document short. The goal is to make the correct reading path obvious.

Do not remove safety boundaries when simplifying docs.
Do not hide known limitations.
Do not rewrite historical release records as if they were current work.

简化文档时不要删除安全边界，不要隐藏已知限制，也不要把历史 release 记录改写成当前工作。

## 2. Documentation Audiences

- First-time users need README, Start Here, First-run Guide, Command Decision Tree, Examples Guide, Privacy And Safety, and Known Limitations.
- FDEs and PMs need Full Workflow Guide, Spec Pack Standard, Examples Guide, Human Review Workflow, Manual Apply Plan, and handoff docs.
- Developer reviewers need CLI Reference, test strategy docs, safety boundaries, review/apply-plan docs, and handoff validation docs.
- Contributors need CONTRIBUTING, Docs Index, Docs Status Map, Roadmap, current v0.3 planning docs, and this guide.
- Future maintainers need release records, risk registers, final verification reports, and historical planning docs.

## 3. Canonical Docs Vs Historical Docs

Canonical current docs are the first path for new readers. They should stay concise, linked, and current.

Historical docs are preserved for traceability. Do not delete or rewrite them to sound current. Add a status line or link to the current map when a historical document may confuse readers.

Use [Docs Status Map v0.3](docs-status-map-v0.3.md) to decide where a document belongs.

## 4. When To Update README

Update README when:

- the recommended first-run path changes
- a current capability appears in the public project summary
- a major safety boundary changes
- a new canonical navigation document is added

Do not use README as a full docs index. Link to [Docs Index v0.1](docs-index-v0.1.md) instead.

## 5. When To Update Docs Index

Update [Docs Index v0.1](docs-index-v0.1.md) when:

- adding a new docs file
- moving a document between current, planning, release record, or historical categories
- adding a new workflow family
- introducing a new release lifecycle document

Do not remove links only because a document is old. Move older documents to historical planning or release records.

## 6. When To Update Roadmap

Update [Roadmap v0.1](roadmap-v0.1.md) when:

- a phase completes
- a next phase changes status
- a new future phase is proposed
- boundaries for a completed phase need to remain visible

Do not mark a phase complete before the relevant validation, commit, and push have happened.

## 7. How To Avoid Duplicate Safety Wording

Prefer one short safety summary plus links to canonical safety docs:

- [Privacy And Safety](privacy-and-safety-v0.1.md)
- [Known Limitations](known-limitations-v0.1.md)
- [Extraction Safety Rules](extraction-safety-rules-v0.1.md)
- [Agent Handoff Safety Rules](agent-handoff-safety-rules-v0.1.md)
- [CI Safety v0.3](ci-safety-v0.3.md)

Repeat the most important boundaries where action happens, such as README, first-run paths, CLI docs, release docs, and handoff docs.

## 8. Safety Wording That Must Stay Visible

Keep these boundaries visible in current docs:

- SpecWise does not call real AI providers by default.
- SpecWise does not call coding agents.
- SpecWise does not generate application code.
- SpecWise does not auto-apply patches.
- SpecWise does not generate final spec-packs in the current preview.
- Handoff packs are context only.
- Generated drafts are review-required.
- Do not commit API keys, secrets, local absolute paths, real customer data, real company data, or real employee data.

## 9. Release Docs Lifecycle

Release readiness docs, release notes, decision records, final verification reports, and changelog entries should remain preserved as release records after a preview ships.

After a release:

1. Keep release documents findable from the docs index.
2. Mark follow-up planning docs separately from shipped release records.
3. Link current readers back to Start Here, First-run Guide, Known Limitations, and Privacy And Safety.
4. Do not edit older release records to imply a newer release has already happened.

Phase 27E is docs consolidation only. Phase 27F release readiness has not started.
