# GitHub Issue Query Cheatsheet v0.1

Status: Phase 19 GitHub CLI reference. These commands are examples for reading issue metadata.

These commands read issue metadata only.

Do not post automated replies without human review.

这些命令只读取 issue 信息。不要未经人工审查自动回复。

## Basic Lists

```bash
gh issue list --repo darwinx687-afk/specwise
```

```bash
gh issue list --repo darwinx687-afk/specwise --state all
```

## By Type

```bash
gh issue list --repo darwinx687-afk/specwise --label "type:feedback"
```

```bash
gh issue list --repo darwinx687-afk/specwise --label "type:bug"
```

```bash
gh issue list --repo darwinx687-afk/specwise --label "type:docs"
```

## By Planning Status

```bash
gh issue list --repo darwinx687-afk/specwise --label "v0.2 candidate"
```

```bash
gh issue list --repo darwinx687-afk/specwise --label "needs clarification"
```

## By Area

```bash
gh issue list --repo darwinx687-afk/specwise --label "area:cli"
```

```bash
gh issue list --repo darwinx687-afk/specwise --label "area:safety"
```

```bash
gh issue list --repo darwinx687-afk/specwise --label "area:handoff"
```

## Review-Friendly JSON

```bash
gh issue list --repo darwinx687-afk/specwise --state all --json number,title,state,labels,createdAt,updatedAt,url
```

## Notes

- Prefer read-only review before any issue reply.
- Do not paste sensitive issue content into docs or public replies.
- Do not bulk-close or bulk-label without human review.
- Use `docs/github-issue-triage-playbook-v0.1.md` for label decisions.
