# Prompt and Response Artifacts v0.1

Status: Phase 8B design plus Phase 8C local prompt package generation. Provider calls are not implemented.

## 1. Prompt Package Shape

Future AI preview may build a prompt package like:

```json
{
  "schemaVersion": "0.1.0",
  "mode": "ai_preview_prompt_package",
  "project": {},
  "inventorySummary": {},
  "deterministicDraftSummary": {},
  "allowedOutput": "ai_patch_only",
  "safetyRules": [
    "Do not output final spec-pack",
    "All candidates require human review",
    "Unsupported claims become assumptions or questions"
  ],
  "materials": []
}
```

Phase 8C writes this local artifact as `prompt-package.json`.

Required Phase 8C safety fields:

```json
{
  "allowedOutput": "ai_patch_only",
  "provider": {
    "networkCallsMade": false,
    "apiKeyRead": false
  },
  "input": {
    "localAbsolutePathsIncluded": false
  }
}
```

Prompt package rules:

- use relative paths only
- include summaries before raw source excerpts
- cap input size with a future `--max-input-chars`
- mark every output requirement as patch-only
- include safety rules in machine-readable form

## 2. Prompt Preview Markdown

`prompt-preview.md` is a human-readable review of what would be sent to a provider.

User should inspect `prompt-preview.md` before enabling AI.

用户应该在开启 AI 前检查 `prompt-preview.md`。

The preview should show:

- project summary
- material inventory summary
- deterministic draft summary
- source snippets selected for prompt context
- safety rules
- allowed output shape
- redaction and path-safety status

The preview must not include local absolute paths or secrets.

Phase 8C generates this preview locally and stops there. Users can inspect it, but SpecWise does not send it to a provider.

## 3. Response Shape

Future provider response must be parsed as:

```text
AI patch candidate object
```

If the response is not a valid AI patch:

```text
fail
save invalid-response report
do not merge
```

The invalid-response report should describe parse or schema errors without exposing secrets.

## 4. Patch-only Rule

The model must output candidate patches only.
The model must not output final spec-pack files.
The model must not claim `ready_for_ai_coding`.

The only acceptable future provider output is an object that can be validated against:

```text
schemas/ai-patch.schema.json
```

## 5. Raw Response Artifact

`provider-response.raw.json` may be useful for debugging, but it should be optional.

If saved, it must:

- be stored under the AI preview output folder
- avoid API keys and env values
- be redacted before display
- never be treated as final spec content

## 6. Validation Artifact

`ai-patch-validation.json` should record:

- whether JSON parsing passed
- whether patch schema validation passed
- candidate counts
- rejected operation counts
- evidence-rule failures
- final status

Validation failure blocks merge preview.
