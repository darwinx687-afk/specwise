# CI Safety v0.3

Status: Phase 27A CI safety note.

## 1. Purpose

SpecWise CI provides local-first validation on pull requests and pushes to `main`.

The workflow is intentionally minimal. It validates the repository using the same local commands maintainers run before commit and release-readiness reviews.

## 2. What CI Runs

The CI workflow runs:

```bash
node --version
npm --version
find bin src scripts -name "*.mjs" -print0 | xargs -0 -n1 node --check
node scripts/check-cli-dx.mjs
node scripts/check-field-inference.mjs
node scripts/check-draft-quality.mjs
npm test
npm run smoke
```

The workflow uses:

- `actions/checkout@v4`
- `actions/setup-node@v4`
- Node.js 20
- read-only repository contents permission

## 3. What CI Does Not Do

CI does not call AI providers.
CI does not call coding agents.
CI does not publish npm.
CI does not create tags or GitHub releases.
CI does not use secrets.

CI 不调用 AI provider，不调用 coding agent，不发布 npm，不创建 tag 或 GitHub release，也不使用 secrets。

CI also does not:

- install dependencies
- cache `node_modules`
- upload artifacts
- deploy
- run release automation
- run scheduled jobs
- run provider, agent, OCR, vision, Web UI, or publish tests

## 4. No Secrets Policy

The workflow does not reference `secrets.*`.

SpecWise preview workflows must not require API keys, provider credentials, deploy keys, npm tokens, or release tokens.

## 5. No Publish / No Release Policy

The workflow does not run:

- `npm publish`
- `git tag`
- `gh release create`
- release asset upload
- deploy commands

Any future release automation requires a separate owner-approved phase.

## 6. No AI / No Agent Policy

The workflow only runs local validation commands.

It does not call real AI providers, Codex, Claude Code, Cursor, Spec Kit, or coding agents.

It does not generate application code, auto-apply patches, or generate final spec-packs.

## 7. Required Local Parity Commands

Before pushing CI-related changes, run:

```bash
find bin src scripts -name "*.mjs" -print0 | xargs -0 -n1 node --check
node scripts/check-cli-dx.mjs
node scripts/check-field-inference.mjs
node scripts/check-draft-quality.mjs
npm test
npm run smoke
node bin/specwise.mjs --help
node bin/specwise.mjs doctor
```
