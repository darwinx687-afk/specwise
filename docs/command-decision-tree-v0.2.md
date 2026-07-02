# Command Decision Tree v0.2

Status: Phase 22E first-time command guide.

Use this page when you know what you want to do but are not sure which command to run.

No current command calls real AI providers or coding agents.

当前命令不会调用真实 AI provider 或 coding agent。

Current commands also do not generate application code, do not auto-apply patches, and do not generate final spec-packs.

Do not start by reading every document. Use this page to choose a command, then use [CLI Reference v0.1](cli-reference-v0.1.md) for details.

## What command should I run?

## I want to check the project works

Run:

```bash
npm test
```

For a fuller local workflow check, run:

```bash
npm run smoke
```

## I want to generate a draft from example materials

Start with the CRM example:

```bash
node bin/specwise.mjs draft examples/legacy-crm-follow-up/input \
  --out ./tmp/crm-draft \
  --force
```

Then validate the generated draft:

```bash
node bin/specwise.mjs validate ./tmp/crm-draft/spec-pack
rm -rf ./tmp/crm-draft
```

The draft remains review-required. It is not a final spec-pack.

## I want to validate an existing spec-pack

Run:

```bash
node bin/specwise.mjs validate <path-to-spec-pack-folder>
```

Example:

```bash
node bin/specwise.mjs validate examples/legacy-crm-follow-up/expected-output/spec-pack
```

## I want to inspect AI patch review flow

Use the offline review path after creating a draft spec-pack:

```text
patch preview -> review report -> apply-plan create
```

The commands are:

```bash
node bin/specwise.mjs patch preview ./tmp/draft-test/spec-pack \
  --patch examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json \
  --out ./tmp/patch-preview \
  --force

node bin/specwise.mjs review report ./tmp/patch-preview \
  --decisions examples/reviews/legacy-staff-evaluation.review-decisions.example.json \
  --out ./tmp/review-report \
  --force

node bin/specwise.mjs apply-plan create ./tmp/review-report \
  --draft ./tmp/draft-test/spec-pack \
  --out ./tmp/apply-plan \
  --force
```

This path uses offline fixtures and manual review artifacts. It does not call a real AI provider and does not apply changes to a spec-pack.

For the complete runnable sequence, see [Full Workflow Guide](full-workflow-guide-v0.1.md).

## I want to prepare agent context

Use:

```text
handoff create -> handoff validate
```

The handoff pack is context only. It does not call Codex, Claude Code, Cursor, Spec Kit, or any other coding agent.

For the complete runnable sequence, see [Full Workflow Guide](full-workflow-guide-v0.1.md).

## I want real AI extraction

Not available in v0.1/v0.2 baseline.

Current extraction-related commands are dry-run or prompt-preparation boundaries only. They do not call real providers.

## More Detail

- [First-run Guide v0.2](first-run-guide-v0.2.md)
- [CLI Reference](cli-reference-v0.1.md)
- [Known Limitations](known-limitations-v0.1.md)
- [Docs Status Map v0.3](docs-status-map-v0.3.md)
