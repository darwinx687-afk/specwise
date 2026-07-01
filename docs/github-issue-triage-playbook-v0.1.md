# GitHub Issue Triage Playbook v0.1

Status: Phase 19 GitHub issue operations guide.

## How To Triage New Issues

1. Read the issue fully.
2. Check for sensitive data.
3. Apply a type label.
4. Apply an area label.
5. Apply a priority label.
6. Ask clarification if needed.
7. Link to a v0.2 candidate if relevant.
8. Close duplicates carefully.

## Sensitive Data Check

If an issue contains secrets, API keys, real employee/customer data, internal screenshots, or private company documents, ask the reporter to remove them and avoid quoting the sensitive content.

如果 issue 包含密钥、API key、真实员工/客户数据、内部截图或公司私密文档，应提醒对方删除，不要在回复中重复引用敏感内容。

Suggested response:

```text
Thanks for the report. This issue appears to include sensitive or private material. Please edit the issue to remove that content. I will avoid quoting it here.
```

## Type Labels

- `type:bug`: reproducible behavior that appears wrong
- `type:feature`: requested capability or workflow improvement
- `type:docs`: unclear, missing, or misleading documentation
- `type:feedback`: general early feedback
- `type:question`: usage or clarification question

Use exactly one type label when possible. Use two only when the issue clearly spans both.

## Area Labels

- `area:cli`: commands, flags, local workflow, terminal output
- `area:schemas`: JSON schemas, validation messages, required fields
- `area:examples`: example materials, fixtures, expected output packs
- `area:docs`: README, guides, public docs, launch docs
- `area:handoff`: handoff skeleton and target-reader instructions
- `area:safety`: safety boundaries, sensitive data, public sharing
- `area:ai-preview`: explicit future AI preview planning and boundaries

Use area labels to route the discussion, not to imply work has started.

## Priority Labels

- `priority:high`: blocks evaluation, creates safety risk, or repeatedly confuses users
- `priority:medium`: useful signal that should be reviewed soon
- `priority:low`: lower urgency, unclear impact, or future backlog

Priority is triage priority, not implementation commitment.

## Planning Labels

- `v0.2 candidate`: possible v0.2 planning input after repeated or strong signal
- `needs clarification`: missing details required for triage
- `good first issue`: small, well-bounded docs/example task suitable for newcomers

## Clarification Prompts

Use short, specific questions:

- Which command did you run?
- Which doc section was unclear?
- What input shape were you testing?
- What did you expect to happen?
- What happened instead?
- Can you share a redacted example that contains no sensitive business material?

## Duplicate Handling

Before closing an issue as duplicate:

1. Link the earlier issue.
2. Explain that the feedback still counts as another signal.
3. Avoid copying sensitive details.
4. Keep the issue open if it adds new evidence or a different workflow context.

Suggested close comment:

```text
Thanks. I am linking this to an existing issue so the signal is counted in one place. Closing as duplicate for tracking only.
```

## v0.2 Candidate Linkage

Link an issue to v0.2 planning only when it:

- is repeated by multiple sources
- fits SpecWise's local-first, evidence-first, review-required boundary
- can be discussed without starting implementation
- does not require hidden AI provider calls, agent calls, OCR/vision, Web UI, or code generation in Phase 19

Use `docs/v0.2-candidate-scoring-v0.1.md` before recommending it for Phase 20 scope.
