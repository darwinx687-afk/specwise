# Contributing

SpecWise is an early preview project.

Before opening a change, run:

```bash
npm test
npm run smoke
```

## Safety Rules

- Do not add real AI provider calls without an explicit safety design.
- Do not add prompt runners without review gates.
- Do not call Codex, Claude Code, Cursor, Spec Kit, or other coding agents from the CLI.
- Do not commit secrets, API keys, tokens, passwords, or real provider URLs.
- Keep examples synthetic.
- Keep generated artifacts out of commits unless they are intentional fixtures.
- Preserve review-required labels, open questions, assumptions, and permission blockers.

## Dependencies

SpecWise v0.1 is dependency-free. Avoid adding npm dependencies unless a future phase explicitly approves it.

## Local Outputs

Use `./tmp/...` for local experiments. The repo `.gitignore` excludes `tmp/`.

