# Provider Boundary v0.1

Status: design with Phase 7B runtime boundary preview.

This document defines future AI provider boundaries for SpecWise. Phase 7B adds local provider runtime metadata and placeholder validation, but it still does not add prompt execution, API key loading, HTTP model calls, or real AI extraction.

## 1. Provider Philosophy

SpecWise should remain local-first and provider-agnostic.

Principles:

- provider-agnostic
- OpenAI-compatible first
- local/private model friendly later
- no hardcoded provider assumptions
- no API keys in repo

AI extraction should be explicit opt-in. The default workflow remains:

```text
inventory -> draft -> validate
```

## 2. Phase 7B Provider Boundary

Phase 7B supports:

- `mock` provider in `dry_run` mode
- `openai-compatible-placeholder` config in `disabled` mode
- runtime capability metadata
- safe refusal before placeholder extraction can produce artifacts

Phase 7B does not support:

- real provider calls
- API key reads
- prompt runners
- AI-generated spec packs
- OCR or vision extraction

`provider doctor` may inspect placeholder config because it is a valid future shape. `extract` must refuse it because it is not callable.

## 3. Future Provider Config Shape

Future config may look like this:

```json
{
  "provider": "openai-compatible-placeholder",
  "baseUrl": "https://example.invalid/v1",
  "model": "example-model",
  "apiKeyEnv": "SPECWISE_API_KEY",
  "temperature": 0.1,
  "mode": "disabled"
}
```

Design rules:

- Do not put a real API key in config.
- Config may reference an environment variable name only.
- AI mode is disabled by default.
- CLI must explicitly enable AI mode.
- Provider config must not change deterministic inventory, draft, or validation behavior.
- Provider responses must be merged as candidate patches, not final truth.

## 4. Future CLI Design

Possible future command:

```bash
specwise extract <input-folder> --out <output-folder> --config specwise.config.json
```

Relationship to existing commands:

```text
inventory = deterministic input scan
draft = deterministic baseline
extract = future AI-assisted extraction
validate = schema validation
```

Expected future behavior:

1. Run inventory or consume an existing inventory.
2. Build or consume deterministic draft.
3. Run provider-backed extraction only when explicitly requested.
4. Produce candidate patches.
5. Merge through evidence-aware review rules.
6. Validate final review-required spec pack.

Real provider-backed extraction is not implemented in v0.1.

## 5. Privacy / Data Safety

User materials may contain sensitive business information.

Safety principles:

- AI mode must be explicit opt-in.
- Local-first remains default.
- Generated outputs must not include local absolute paths.
- Examples must remain mock data only.
- Provider config must not contain secrets.
- Logs should avoid printing source material content by default.
- Users should be able to inspect what would be sent before provider execution.

Future provider integration should make data movement visible and intentional.
