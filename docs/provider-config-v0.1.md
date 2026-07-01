# Provider Config v0.1

Status: Phase 7B provider runtime boundary preview. Real provider calls are not implemented.

SpecWise Phase 7B adds provider config validation, provider runtime metadata, placeholder validation, provider doctor, and extraction dry-run planning. It does not call real AI providers.

## Mock Provider Config

Example:

```json
{
  "schemaVersion": "0.1.0",
  "provider": "mock",
  "mode": "dry_run",
  "model": "mock-specwise-extractor",
  "temperature": 0,
  "safety": {
    "evidenceFirst": true,
    "reviewRequiredByDefault": true,
    "allowNetworkCalls": false,
    "allowLocalAbsolutePathsInOutput": false
  }
}
```

The repo includes this example at:

```text
examples/config/specwise.mock.config.json
```

## OpenAI-compatible Placeholder Config

Example:

```json
{
  "schemaVersion": "0.1.0",
  "provider": "openai-compatible-placeholder",
  "mode": "disabled",
  "model": "future-openai-compatible-model",
  "apiKeyEnv": "SPECWISE_API_KEY",
  "baseUrl": "https://example.invalid/v1",
  "temperature": 0.1,
  "safety": {
    "evidenceFirst": true,
    "reviewRequiredByDefault": true,
    "allowNetworkCalls": false,
    "allowLocalAbsolutePathsInOutput": false
  }
}
```

The repo includes this example at:

```text
examples/config/specwise.openai-compatible.placeholder.json
```

`apiKeyEnv` is only a future-looking string in Phase 7B. SpecWise does not read it.

`baseUrl` must use a non-real `.invalid` host and must not be called.

## Provider List

Phase 7B providers:

```text
Available:
- mock
  status: available
  runtime: dry-run only
  network: false

Planned:
- openai-compatible-placeholder
  status: planned_not_callable
  runtime: disabled
  network: false
```

Only `mock` is callable. The placeholder exists to document future shape, not to perform runtime extraction.

## Dry-run Only Rule

Phase 7B extraction is dry-run only.

```bash
node bin/specwise.mjs extract examples/legacy-staff-evaluation/input \
  --out ./tmp/extract-dry-run \
  --config examples/config/specwise.mock.config.json \
  --dry-run
```

If `--dry-run` is omitted, the command must fail.

## Safety Defaults

Required safety defaults:

- `evidenceFirst: true`
- `reviewRequiredByDefault: true`
- `allowNetworkCalls: false`
- `allowLocalAbsolutePathsInOutput: false`

Phase 7B rejects configs that enable network calls.

## No API Keys In Repo

Provider config must not contain real keys or secrets.

Phase 7B does not read environment variables and does not load provider credentials.

## OpenAI-compatible Placeholder Boundary

Future provider config may eventually support an OpenAI-compatible provider shape. In Phase 7B, `openai-compatible-placeholder` is legal config shape but cannot be used for runtime extraction.

Provider doctor should explain:

```text
Provider: openai-compatible-placeholder
Status: planned_not_callable
Runtime: disabled
Network calls: false
This provider cannot be used for extraction in Phase 7B.
```

Extract must fail before producing artifacts:

```text
openai-compatible-placeholder is not callable in Phase 7B. Use the mock provider with --dry-run.
```

## What Extract Dry-run Produces

Dry-run extract produces:

```text
material-inventory.json
material-summary.md
extraction-plan.json
extraction-plan.md
```

It does not generate a spec-pack and does not modify deterministic draft behavior.
