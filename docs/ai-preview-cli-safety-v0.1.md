# AI Preview CLI Safety v0.1

Status: Phase 8B design only. No runtime provider call is implemented.

## 1. Default Safety

All current SpecWise commands default to:

```text
no network
no API key
no provider calls
no AI extraction
```

This includes:

- `inventory`
- `draft`
- `extract --dry-run`
- `provider doctor`
- `patch validate`
- `patch preview`

SpecWise remains local-first and deterministic by default.

## 2. Required Fail-Closed Behavior

Future real AI preview must fail closed:

```text
missing --enable-ai -> fail
missing --allow-network -> fail
missing --emit-patch-only -> fail
missing --review-required -> fail
invalid config -> fail
missing env var name -> fail
invalid provider response -> fail
patch validation failed -> fail
provider tries to return final spec-pack -> fail
```

Every failure above must happen before any merge or auto-apply step.

## 3. Config Boundary

Future config may reference an environment variable name:

```json
{
  "provider": "openai-compatible",
  "apiKeyEnv": "SPECWISE_API_KEY"
}
```

Config rules:

- never commit API keys
- never print API keys
- never include API keys in artifacts
- only the environment variable name may appear in config
- Phase 8B does not read environment variables

## 4. Network Boundary

Future real network calls must require all of:

```text
allowNetworkCalls: true
--allow-network
provider not placeholder
mode explicitly ai_preview
--enable-ai
--emit-patch-only
--review-required
```

Phase 8B does not implement this runtime.

## 5. Artifact Boundary

AI preview artifacts must not contain:

```text
local absolute paths
API keys
raw sensitive env values
unredacted secrets
final spec-pack marked ready_for_ai_coding
```

Artifacts should preserve:

- relative source paths
- prompt package metadata
- patch validation result
- merge preview review queue
- blocked auto-apply reasons

## 6. Failure Messages

Future CLI errors should name the missing safety gate directly.

Examples:

```text
AI preview requires --enable-ai.
AI preview requires --allow-network.
AI preview requires --emit-patch-only.
AI preview requires --review-required.
```

Errors must not include API key values or raw provider credentials.
