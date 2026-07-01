# GitHub Public Repo Setup v0.1

Status: Phase 13A local preparation. This is not a push, tag, release, npm publish, or license decision.

## Purpose

This note prepares the public GitHub repository metadata and first-push procedure for SpecWise v0.1.

It is intentionally local-only. Do not create a remote, push commits, create tags, create a GitHub release, publish to npm, or add a license until the user explicitly confirms the GitHub owner, repository URL, and requested action.

## Repository Metadata Draft

- Repository name: `specwise`
- Owner: pending user confirmation as `<GITHUB_OWNER>`
- Visibility: public, pending user confirmation
- Default branch: `main`
- Website: not set
- Package publish status: npm publish disabled; `package.json` is intentionally `private: true`
- License: pending user confirmation; no `LICENSE` file is added in Phase 13A

Description:

```text
Turn messy legacy business materials into reviewable, evidence-based spec packs for AI coding agents.
```

Chinese description:

```text
把旧系统截图、表格和混乱业务说明整理成可审查、有证据链、可交给 AI coding agent 的开发规格包。
```

Recommended topics:

- `ai-coding`
- `spec-driven-development`
- `legacy-systems`
- `requirements-engineering`
- `developer-tools`
- `local-first`
- `cli`
- `evidence-based`
- `ai-agents`

## Remote Setup Options

Use one of these only after the user confirms the GitHub owner/repository target and explicitly authorizes creating the remote.

### Option A: GitHub CLI

```bash
gh repo create <GITHUB_OWNER>/specwise \
  --public \
  --description "Turn messy legacy business materials into reviewable, evidence-based spec packs for AI coding agents." \
  --source . \
  --remote origin
```

This creates the GitHub repository and configures `origin`. Do not add `--push` unless the user explicitly authorizes the first push.

### Option B: Manual GitHub Repository

After creating an empty public repository in GitHub:

```bash
git remote add origin git@github.com:<GITHUB_OWNER>/specwise.git
git remote -v
```

## First Push Checklist

Before pushing:

- [ ] User confirmed `<GITHUB_OWNER>` and repository URL.
- [ ] User explicitly authorized configuring `origin`.
- [ ] User explicitly authorized first push.
- [ ] User confirmed the public commit author/email shown by `git show --format=fuller --no-patch HEAD`, or amended it before push.
- [ ] `git branch --show-current` returns `main`.
- [ ] `git status --short` is clean.
- [ ] `git remote -v` shows the expected `origin`.
- [ ] `git tag --list` is empty unless a later release task explicitly creates a tag.
- [ ] `npm test` passes.
- [ ] `npm run smoke` passes.
- [ ] README, `package.json`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, and release readiness docs have been checked.

Only after those conditions are true:

```bash
git push -u origin main
```

## Post-Push Checklist

After the first push:

- [ ] Confirm GitHub renders the README first screen clearly.
- [ ] Confirm repository description matches the metadata draft.
- [ ] Confirm topics were added.
- [ ] Confirm the repository is public only if the user approved public visibility.
- [ ] Confirm no tag or GitHub release was created by this step.
- [ ] Confirm no npm publication occurred.
- [ ] Confirm the license decision remains pending unless the user explicitly chose one.

## Stop Rules

Stop and ask for explicit confirmation before any of the following:

- Creating or changing a Git remote.
- Pushing to GitHub.
- Creating a tag.
- Creating a GitHub release.
- Publishing to npm.
- Adding or choosing a license.
- Calling a real AI provider, prompt runner, OCR, vision service, Web UI, coding agent, or external integration.

Phase 13A prepares the public repo path. Phase 13B may configure the remote and perform the first push only after the user provides the missing GitHub target and permission.
