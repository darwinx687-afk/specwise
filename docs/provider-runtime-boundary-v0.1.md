# Provider Runtime Boundary v0.1

Status: Phase 7B runtime boundary preview. This is not AI extraction.

Phase 7B defines a provider runtime contract, capability metadata, and safe refusal paths for future provider work. It does not call OpenAI, Claude, Gemini, or any other real AI provider.

## Phase Boundary

Phase 7B is a boundary preview only.

It does not implement:

- real AI provider calls
- HTTP model calls
- API key reads
- prompt runner
- AI extraction results
- OCR, screenshot parsing, or vision models
- Web UI
- handoff pack generation

## Providers

`mock` is the only executable provider.

```text
provider: mock
mode: dry_run
status: available
networkCalls: false
dryRunPlanning: true
```

`openai-compatible-placeholder` is planned but not callable.

```text
provider: openai-compatible-placeholder
mode: disabled
status: planned_not_callable
networkCalls: false
dryRunPlanning: false
```

## Runtime Contract

The provider runtime descriptor uses contract version `0.1.0`.

It reports:

- provider name
- mode
- runtime status
- capability metadata
- safety defaults

Capabilities are explicit and conservative:

```json
{
  "networkCalls": false,
  "textExtraction": false,
  "visionExtraction": false,
  "structuredOutput": false,
  "dryRunPlanning": true
}
```

For the placeholder provider, `dryRunPlanning` is `false`.

## Safety Defaults

Required defaults:

- evidence-first behavior
- review required by default
- no silent overwrite
- no network calls
- no local absolute paths in generated outputs

Phase 7B rejects configs that enable network calls.

## API Key Boundary

Provider config may contain a future-looking `apiKeyEnv` string for shape validation. Phase 7B does not read that environment variable, does not load credentials, and does not print secrets.

Placeholder config must use a non-real `.invalid` base URL such as:

```text
https://example.invalid/v1
```

## Runtime Refusal

If extraction attempts to use `openai-compatible-placeholder`, SpecWise must fail before producing artifacts:

```text
openai-compatible-placeholder is not callable in Phase 7B. Use the mock provider with --dry-run.
```

## Future Phase 8B/8C

Phase 8B designs an explicit opt-in AI-assisted provider preview. It does not implement provider calls.

Future Phase 8C may scaffold the explicit opt-in flow, but it must still preserve fail-closed behavior:

- local-first by default
- no provider call without explicit flags
- patch-only output
- review required
- no auto-apply
