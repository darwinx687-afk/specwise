# SpecWise

SpecWise turns messy legacy business materials into reviewable, evidence-based spec packs for AI coding agents.

SpecWise 把旧系统截图、表格和混乱业务说明整理成可审查、有证据链、可交给 AI coding agent 的开发规格包。

> Public preview status: SpecWise v0.1 is local-first, dependency-free, and does not call real AI providers or coding agents.
>
> 公开预览状态：SpecWise v0.1 默认本地运行、无依赖，不调用真实 AI provider 或 coding agent。

## What Is SpecWise?

SpecWise is a local-first pre-coding specification toolkit. It helps teams turn ambiguous legacy-system materials into structured Spec Packs that humans can review and future coding agents can read.

The core idea: before asking an AI coding agent to build, separate facts, assumptions, open questions, evidence, permissions, workflows, and acceptance criteria.

## What It Is Not

SpecWise does not generate application code.

SpecWise does not clone legacy systems automatically.

SpecWise does not call AI providers by default.

SpecWise does not call Codex, Claude Code, Cursor, or Spec Kit.

SpecWise does not auto-apply AI patches.

SpecWise does not generate final spec-packs in v0.1.

SpecWise 不负责自动生成业务系统代码。

SpecWise 不承诺一键复刻旧系统。

SpecWise 默认不调用 AI provider。

SpecWise 不会调用 Codex、Claude Code、Cursor 或 Spec Kit。

SpecWise 不会自动应用 AI patch。

SpecWise v0.1 不生成最终 spec-pack。

## Why It Exists

Legacy business systems often come with screenshots, exports, mixed-language notes, and unclear permissions instead of clean PRDs. If those materials are handed directly to an AI coding agent, the agent may fill gaps with guesses.

SpecWise makes uncertainty explicit. A useful pack should show what is known, what is inferred, what needs review, and where each claim came from.

## Start Here

Start here if you are new:

1. Read: [What Is SpecWise?](#what-is-specwise) and [What It Is Not](#what-it-is-not)
2. Run: the 5-minute CRM example below
3. Inspect: `./tmp/crm-draft/spec-pack`
4. Continue: [Full Workflow Guide](docs/full-workflow-guide-v0.1.md)
5. Review: [Privacy And Safety](docs/privacy-and-safety-v0.1.md) and [Known Limitations](docs/known-limitations-v0.1.md)

5-minute CRM example:

```bash
npm test

node bin/specwise.mjs draft examples/legacy-crm-follow-up/input \
  --out ./tmp/crm-draft \
  --force

node bin/specwise.mjs validate ./tmp/crm-draft/spec-pack

rm -rf ./tmp/crm-draft
```

This does not call AI providers.

This does not call coding agents.

This does not generate application code.

这不会调用 AI provider，不会调用 coding agent，也不会生成应用代码。

For the full safe workflow:

```bash
npm run smoke
```

The smoke workflow does not call AI providers, does not call coding agents, does not generate application code, and cleans temporary outputs.

For a first-time docs map, see [Start Here v0.2](docs/start-here-v0.2.md). For command selection, see [Command Decision Tree v0.2](docs/command-decision-tree-v0.2.md). For first-run details and common CLI errors, see [First-run Guide v0.2](docs/first-run-guide-v0.2.md).

## Core Workflow

The full v0.1 local workflow is:

1. inventory
2. draft
3. patch preview
4. review report
5. apply plan
6. handoff pack skeleton

| Step | Command | Calls AI? | Modifies spec-pack? | Output |
| --- | --- | ---: | ---: | --- |
| 1 | `inventory` | No | No | material inventory |
| 2 | `draft` | No | No existing spec-pack modified; creates output folder | review-required draft |
| 3 | `patch preview` | No | No | offline merge preview |
| 4 | `review report` | No | No | human review report |
| 5 | `apply-plan create` | No | No | manual revision plan |
| 6 | `handoff create` | No | No | context-only handoff skeleton |

See [Full Workflow Guide](docs/full-workflow-guide-v0.1.md).

## CLI Commands

Run:

```bash
node bin/specwise.mjs --help
node bin/specwise.mjs doctor
```

Current commands:

- `validate`
- `init`
- `inventory`
- `draft`
- `provider list`
- `provider doctor`
- `extract --dry-run`
- `patch validate`
- `patch preview`
- `ai-preview prepare`
- `review init`
- `review validate`
- `review report`
- `apply-plan create`
- `apply-plan validate`
- `handoff create`
- `handoff validate`

See [CLI Reference](docs/cli-reference-v0.1.md).

## Examples

- [Minimal Spec Pack](examples/minimal/spec-pack/) - smallest valid fixture.
- [Legacy Staff Evaluation Example](examples/legacy-staff-evaluation/README.md) - realistic mock legacy-system scenario.
- [Legacy CRM Follow-up Example](examples/legacy-crm-follow-up/README.md) - second realistic mock business scenario for CRM follow-up admin.
- [Invalid Missing Buildability Fixture](examples/invalid/missing-buildability/spec-pack/) - proves validation failure behavior.
- [Mock AI Patch](examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json) - offline fixture, not provider output.
- [Review Decisions](examples/reviews/legacy-staff-evaluation.review-decisions.example.json) - human review fixture.
- [Manual Apply Plan](examples/apply-plans/legacy-staff-evaluation.manual-apply-plan.example.json) - manual revision plan fixture.
- [Handoff Manifest](examples/handoff/legacy-staff-evaluation.handoff-manifest.example.json) - context-only handoff manifest fixture.
- [Config Examples](examples/config/) - mock and placeholder config fixtures.

See [Examples Guide](docs/examples-guide-v0.1.md).

## Safety Boundaries

SpecWise v0.1 is local-first.

Current v0.1 commands do not call AI providers.

Current v0.1 commands do not make network calls.

Current v0.1 commands do not call Codex, Claude Code, Cursor, or Spec Kit.

Handoff packs prepare context only. They do not authorize implementation, generate code, create implementation tasks, or generate final spec-packs.

Mock examples contain synthetic data. Do not commit API keys or real sensitive business data.

See [Privacy And Safety](docs/privacy-and-safety-v0.1.md) and [Known Limitations](docs/known-limitations-v0.1.md).

## Current Status

SpecWise v0.1 currently includes:

- Spec Pack Standard v0.1
- JSON schemas and validator
- local CLI
- material inventory
- deterministic draft generator
- mock provider and dry-run extraction boundary
- explicit AI preview scaffold without provider calls
- offline AI patch contract and merge preview
- human review workflow
- manual apply plan
- agent handoff pack skeleton
- polished agent-specific boundary notes
- release readiness docs and local smoke test
- public preview docs and community templates
- synthetic Legacy CRM Follow-up example pack
- deterministic draft heuristic polish and draft quality smoke checks
- CSV field inference polish and field quality smoke checks
- CLI error and first-run DX polish with CLI DX smoke checks
- first-time docs simplification with a Start Here map and command decision tree

AI extraction is not implemented yet. Real provider calls and real coding agent calls remain outside the current boundary.

License: MIT.

许可证：MIT。`package.json` 仍保持 `private: true`，npm package 尚未发布。

Release marker: `v0.1.0-preview.0`.

SpecWise v0.1.0-preview.0 is now available as a GitHub pre-release.

SpecWise v0.1.0-preview.0 已作为 GitHub pre-release 发布。欢迎通过 GitHub Issues 提交早期反馈，但请不要在公开 issue 中分享敏感业务数据或私密截图。

SpecWise v0.2.0-preview.0 is available as a GitHub pre-release.

The v0.2 preview release marker is `v0.2.0-preview.0`.

SpecWise v0.2.0-preview.0 已作为 GitHub pre-release 发布。

Post-v0.2 feedback tracking is now documented.

v0.3 scope selection is now documented. The proposed direction prioritizes reliability, review usability, handoff readability, deterministic workflow inference, and public repo maintainability before real AI provider calls.

v0.3 implementation planning is now documented. The proposed v0.3 work remains focused on reliability, review usability, handoff readability, deterministic workflow inference, and docs consolidation.

v0.2 发布后的反馈追踪文档已加入。v0.3 范围选择已记录。当前建议优先增强可靠性、审查体验、handoff 可读性、确定性 workflow 推断和公开仓库维护能力，而不是过早接入真实 AI provider。

v0.3 实施规划已记录。当前建议仍聚焦可靠性、审查体验、handoff 可读性、确定性 workflow 推断和文档收束。

Early feedback is welcome through GitHub Issues. Please do not share sensitive business data or private screenshots in public issues.

Public announcement pack:
[docs/public-announcement-execution-pack-v0.1.md](docs/public-announcement-execution-pack-v0.1.md)

首轮公开发布文案包见 [docs/public-announcement-execution-pack-v0.1.md](docs/public-announcement-execution-pack-v0.1.md)。

Feedback triage docs:

- [Feedback Triage Guide](docs/feedback-triage-guide-v0.1.md)
- [GitHub Issue Triage Playbook](docs/github-issue-triage-playbook-v0.1.md)
- [v0.2 Candidate Scoring](docs/v0.2-candidate-scoring-v0.1.md)
- [Weekly Feedback Report Template](docs/weekly-feedback-report-template-v0.1.md)

反馈分流和 v0.2 候选评估文档已加入，用于首轮公开发布后的反馈整理。

v0.2 scope selection is now tracked in [docs/v0.2-scope-selection-v0.1.md](docs/v0.2-scope-selection-v0.1.md).

The proposed v0.2 direction focuses on examples, deterministic quality, and developer experience before real AI provider calls.

v0.2 范围选择已记录在 [docs/v0.2-scope-selection-v0.1.md](docs/v0.2-scope-selection-v0.1.md)。当前建议优先改进示例、确定性草案质量和开发者体验，而不是过早接入真实 AI provider。

Legacy CRM Follow-up example is now available as a second realistic mock scenario.

新增 Legacy CRM Follow-up 示例，作为第二个更真实的 mock 业务场景。

Phase 22B improves deterministic draft heuristics and adds draft quality smoke checks while keeping SpecWise dependency-free and AI-free by default.

Phase 22B 改进 deterministic draft heuristics，并加入 draft quality smoke checks，同时继续保持无依赖、默认不调用 AI。

Phase 22C improves CSV field inference for entity names, field types, relationship hints, and observed enum/status values while keeping XLSX parsing out of scope for now.

Phase 22C 改进 CSV 字段推断，包括实体命名、字段类型、关系提示和 observed enum/status values；XLSX 解析暂不进入当前范围。

Phase 22D improves first-run CLI errors and adds CLI DX smoke checks.

Phase 22D 改进首次使用时的 CLI 错误提示，并加入 CLI DX smoke checks。

Phase 22E simplifies first-time documentation only. It adds the Start Here map, command decision tree, clearer example selection, and v0.1/v0.2 status callouts.

Phase 22E 只做首次使用文档简化，新增 Start Here、命令选择指引、示例选择说明和 v0.1/v0.2 状态边界说明。

v0.2 implementation planning is now available:

- [v0.2 Implementation Plan](docs/v0.2-implementation-plan.md)
- [v0.2 Phase Breakdown](docs/v0.2-phase-breakdown.md)
- [v0.2 Acceptance Criteria](docs/v0.2-acceptance-criteria.md)
- [v0.2 Test Strategy](docs/v0.2-test-strategy.md)
- [v0.2 Risk Register](docs/v0.2-risk-register.md)

v0.2 实施规划已加入，包括阶段拆解、验收标准、测试策略和风险清单。

## Documentation

Start with [Start Here v0.2](docs/start-here-v0.2.md). Use [Docs Index](docs/docs-index-v0.1.md) when you want the full map.

Key docs:

- [Start Here v0.2](docs/start-here-v0.2.md)
- [Command Decision Tree v0.2](docs/command-decision-tree-v0.2.md)
- [CLI Reference](docs/cli-reference-v0.1.md)
- [First-run Guide v0.2](docs/first-run-guide-v0.2.md)
- [Examples Guide](docs/examples-guide-v0.1.md)
- [Full Workflow Guide](docs/full-workflow-guide-v0.1.md)
- [Release Readiness Checklist](docs/release-readiness-checklist-v0.1.md)
- [License Decision](docs/license-decision-v0.1.md)
- [v0.1 Preview Tag Plan](docs/v0.1-preview-tag-plan.md)
- [Release Notes Draft](docs/release-notes-draft-v0.1.md)
- [Public Announcement Execution Pack](docs/public-announcement-execution-pack-v0.1.md)
- [Feedback Guide](docs/feedback-guide-v0.1.md)
- [First Feedback Loop](docs/first-feedback-loop-v0.1.md)
- [Feedback Tracking](docs/feedback-tracking-v0.1.md)
- [Feedback Triage Guide](docs/feedback-triage-guide-v0.1.md)
- [GitHub Issue Triage Playbook](docs/github-issue-triage-playbook-v0.1.md)
- [v0.2 Candidate Scoring](docs/v0.2-candidate-scoring-v0.1.md)
- [Weekly Feedback Report Template](docs/weekly-feedback-report-template-v0.1.md)
- [GitHub Issue Query Cheatsheet](docs/github-issue-query-cheatsheet-v0.1.md)
- [v0.2 Planning Draft](docs/v0.2-planning-draft.md)
- [v0.2 Scope Selection](docs/v0.2-scope-selection-v0.1.md)
- [v0.2 Scope Decision Record](docs/v0.2-scope-decision-record.md)
- [v0.2 Implementation Planning Checklist](docs/v0.2-implementation-planning-checklist.md)
- [v0.2 Implementation Plan](docs/v0.2-implementation-plan.md)
- [v0.2 Phase Breakdown](docs/v0.2-phase-breakdown.md)
- [v0.2 Acceptance Criteria](docs/v0.2-acceptance-criteria.md)
- [v0.2 Test Strategy](docs/v0.2-test-strategy.md)
- [v0.2 Risk Register](docs/v0.2-risk-register.md)
- [v0.2 Codex Loop Plan](docs/v0.2-codex-loop-plan.md)
- [v0.2 Release Readiness Checklist](docs/v0.2-release-readiness-checklist.md)
- [v0.2 Release Notes Draft](docs/v0.2-release-notes-draft.md)
- [v0.2 Release Decision Record](docs/v0.2-release-decision-record.md)
- [v0.2 Final Verification Report](docs/v0.2-final-verification-report.md)
- [v0.2 Final Verification Report Template](docs/v0.2-final-verification-report-template.md)
- [Post-v0.2 Feedback Report](docs/post-v0.2-feedback-report-v0.1.md)
- [v0.3 Planning Input](docs/v0.3-planning-input-v0.1.md)
- [v0.3 Scope Selection](docs/v0.3-scope-selection-v0.1.md)
- [v0.3 Scope Decision Record](docs/v0.3-scope-decision-record.md)
- [v0.3 Implementation Prerequisites](docs/v0.3-implementation-prerequisites.md)
- [v0.3 Risk Register](docs/v0.3-risk-register.md)
- [v0.3 Implementation Plan](docs/v0.3-implementation-plan.md)
- [v0.3 Phase Breakdown](docs/v0.3-phase-breakdown.md)
- [v0.3 Acceptance Criteria](docs/v0.3-acceptance-criteria.md)
- [v0.3 Test Strategy](docs/v0.3-test-strategy.md)
- [v0.3 Codex Loop Plan](docs/v0.3-codex-loop-plan.md)
- [Post-v0.2 Announcement Follow-up](docs/post-v0.2-announcement-follow-up-v0.1.md)
- [Privacy And Safety](docs/privacy-and-safety-v0.1.md)
- [Known Limitations](docs/known-limitations-v0.1.md)
- [Roadmap](docs/roadmap-v0.1.md)
- [Changelog](CHANGELOG.md)

## Roadmap

Completed through Phase 26 v0.3 implementation planning.

Next candidate phase:

- Phase 27A: CI / reliability, pending owner approval

Phase 27A has not started.

The `v0.1.0-preview.0` preview keeps npm publishing out of scope.

The `v0.2.0-preview.0` preview also keeps npm publishing out of scope.

## Release Readiness

This repo is prepared for a v0.1 preview-readiness review.

Before npm publication:

- keep `package.json` private until npm publication is explicitly approved
- review package metadata
- rerun `npm test`
- rerun `npm run smoke`
- inspect known limitations
- confirm no sensitive data or local paths are committed
- decide whether and when to publish npm
- review public announcement copy

Phase 16 does not publish npm packages, add dependencies, call real AI providers, call coding agents, or generate application code.
