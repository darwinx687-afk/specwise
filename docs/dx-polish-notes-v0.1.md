# DX Polish Notes v0.1

Status: Phase 11 developer-experience notes.

## Goals

- Keep the repo dependency-free.
- Keep local commands predictable.
- Keep example workflows reproducible.
- Keep safety boundaries visible in CLI output and docs.
- Keep tmp outputs easy to clean.

## Command Consistency

Common command shape:

```text
specwise <command> <input> --out <output> [--force]
```

Validation commands should avoid writing files.

Generation commands should write only to explicit output folders.

## Local Smoke

Use:

```bash
npm run smoke
```

The smoke script runs the safe workflow and cleans temporary outputs before and after execution.

## Documentation Shape

README stays short enough for first-time users.

Detailed command usage lives in `docs/cli-reference-v0.1.md`.

Full workflow instructions live in `docs/full-workflow-guide-v0.1.md`.

## Safety Copy

Release-facing docs should continue to say:

- no real AI provider calls
- no coding agent calls
- no application code generation
- no final spec-pack generation
- no auto-apply AI patch

