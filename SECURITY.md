# Security

SpecWise v0.1 is local-first.

Current v0.1 commands do not call AI providers, coding agents, or external services.

Future provider support must remain explicit opt-in and review-required.

## Reporting

Do not report real secrets, API keys, tokens, passwords, or sensitive business data in public issues.

A dedicated security contact will be added before public release.

## Secret Handling

- Never commit API keys.
- Never commit real provider URLs with credentials.
- Keep `.env` files out of git.
- Keep examples synthetic.
- Review generated output before sharing it.

## Current Boundary

SpecWise v0.1 does not implement real AI extraction, prompt execution, OCR, vision, Web UI, coding agent calls, auto-apply patches, or final spec-pack generation.

