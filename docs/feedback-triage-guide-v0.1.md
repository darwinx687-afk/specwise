# Feedback Triage Guide v0.1

Status: Phase 19 feedback operations guide. This is not an implementation plan.

## 1. Triage Goals

Use feedback triage to turn early public signals into reviewable planning inputs.

Goals:

- collect feedback without losing source context
- separate bugs, questions, docs confusion, and feature ideas
- identify repeated confusion before changing direction
- prepare Phase 20 v0.2 scope selection
- keep sensitive business material out of public artifacts

Do not implement feedback immediately.

First classify, de-duplicate, and look for repeated signals.

Do not turn one user's opinion into the v0.2 roadmap without review.

不要收到反馈后立刻开发。先分类、去重、识别重复信号。不要把单个用户意见直接变成 v0.2 路线。

## 2. Issue Label Usage

Use labels to make feedback searchable:

- `type:bug`: reproducible behavior that appears wrong
- `type:feature`: request for a new workflow, field, command, or artifact
- `type:docs`: unclear or missing documentation
- `type:feedback`: general early-user reaction
- `type:question`: clarification or usage question
- `area:cli`: terminal commands and CLI workflow
- `area:schemas`: JSON schema and validation contracts
- `area:examples`: example materials and expected outputs
- `area:docs`: documentation structure or wording
- `area:handoff`: handoff skeleton and reader experience
- `area:safety`: safety boundaries, sensitive data, and public sharing
- `area:ai-preview`: future explicit AI preview boundaries
- `priority:high`: blocks evaluation or creates meaningful confusion
- `priority:medium`: important but not blocking
- `priority:low`: backlog or nice-to-have signal
- `v0.2 candidate`: repeated or strategically important future-scope signal
- `needs clarification`: cannot be triaged without more detail
- `good first issue`: small docs or example task suitable for newcomers

## 3. Feedback Categories

Use these categories in tracking docs and weekly reports:

- CLI
- Docs
- Examples
- Safety boundary
- AI preview
- Review workflow
- Handoff pack
- v0.2 feature
- Other

## 4. Duplicate Detection

Before creating a new planning item:

1. Search existing open and closed issues.
2. Check whether the same source of confusion already appears in feedback tracking.
3. Link related issues instead of copying sensitive details.
4. Close exact duplicates only after pointing to the canonical issue.
5. Keep near-duplicates open when they contain distinct evidence or workflow context.

Duplicate does not mean "unimportant." A duplicate can increase frequency evidence for v0.2 scoring.

## 5. Repeated Confusion Detection

Mark repeated confusion when the same question or misunderstanding appears across:

- two or more GitHub issues
- one issue plus social comments
- multiple social comments in different channels
- repeated direct questions from different people

Examples:

- users misunderstand whether SpecWise calls real AI providers
- users cannot tell which CLI command to run first
- users expect screenshot-to-code behavior
- users miss the review-required boundary
- users ask for the same example domain

## 6. v0.2 Candidate Selection Rules

Only mark a feedback item as `v0.2 candidate` when at least one is true:

- it appears repeatedly across sources
- it fits the local-first and review-required positioning
- it clarifies the core workflow for many users
- it improves safety or reduces confusing claims
- it can be scoped without adding hidden provider calls or agent calls

Do not mark a candidate only because it is interesting, large, or technically appealing.

Use `docs/v0.2-candidate-scoring-v0.1.md` before recommending Phase 20 scope.

## 7. What Not To Implement Immediately

Do not immediately implement:

- one-off opinions without repeated signal
- requests that require real AI provider calls
- requests that imply coding agent calls
- screenshot-to-code or OCR/vision behavior
- automatic code generation
- final spec-pack generation
- hidden auto-apply patch behavior
- broad v0.2 work without a reviewed scope decision

Docs fixes may be prepared when the confusion is clear and the change stays within the current boundary.

## 8. Weekly Triage Checklist

- [ ] Review new GitHub issues.
- [ ] Review public comments and replies.
- [ ] Check for sensitive data and ask reporters to remove it when needed.
- [ ] Apply type, area, and priority labels.
- [ ] Mark duplicates and repeated confusion.
- [ ] Update `feedback-tracking-v0.1.md`.
- [ ] Score repeated v0.2 candidates.
- [ ] Prepare `weekly-feedback-report-template-v0.1.md`.
- [ ] Keep implementation out of Phase 19.
