# Feedback Guide v0.1

Status: Phase 17 public feedback guide.

SpecWise v0.1.0-preview.0 is available as a GitHub pre-release:

- Repo: https://github.com/darwinx687-afk/specwise
- Release: https://github.com/darwinx687-afk/specwise/releases/tag/v0.1.0-preview.0

## What Feedback Is Useful

Useful feedback is specific, reproducible, and tied to the current local-first workflow.

- CLI commands that were confusing.
- Validation errors that were hard to understand.
- Spec-pack fields or safety labels that need clearer wording.
- Example materials that would make the workflow easier to evaluate.
- Documentation sections that felt incomplete or ambiguous.
- Handoff pack content that was helpful or not helpful.
- v0.2 ideas that preserve review-required and evidence-first behavior.

## How To Report CLI Issues

Open a GitHub issue and include:

- the exact command you ran
- the input type, such as notes, CSV files, screenshot text fixtures, or a spec-pack
- expected behavior
- actual behavior
- relevant terminal output after redacting sensitive data
- your Node version and operating system if relevant

Use labels such as `type:bug`, `area:cli`, `area:schemas`, or `needs clarification` when they fit.

## How To Report Confusing Docs

Open a GitHub issue and include:

- the document or section that was unclear
- what you expected to find
- the wording or example that would have helped
- the related command or workflow step, if any

Use labels such as `type:docs`, `area:docs`, `area:examples`, or `area:safety` when they fit.

## How To Suggest v0.2 Features

Describe the use case first, then the feature shape.

Helpful questions:

- Which workflow step would this improve?
- Would it require real AI provider calls, OCR, vision, Web UI, or coding agent calls?
- How should SpecWise keep assumptions, open questions, and review-required status visible?
- Can this be solved with deterministic local behavior first?

Use `v0.2 candidate` for ideas that may belong in future planning.

## What Not To Share Publicly

Do not upload real sensitive business materials to public issues.

Do not share API keys, internal screenshots, employee data, customer data, or private company documents.

请不要在公开 issue 中上传真实敏感业务材料、API key、内部截图、员工数据、客户数据或公司私密文档。

## Safety Reminder

SpecWise v0.1.0-preview.0 does not call real AI providers, does not call coding agents, does not generate application code, and does not generate final spec-packs.

Keep feedback focused on the local-first preview boundary unless a proposal explicitly says it needs future opt-in behavior.
