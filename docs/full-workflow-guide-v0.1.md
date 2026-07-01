# Full Workflow Guide v0.1

Status: Phase 11 safe local workflow guide.

This workflow does not call AI providers.

This workflow does not call coding agents.

This workflow does not generate application code.

This workflow does not generate a final spec-pack.

## Workflow Table

| Step | Command | Calls AI? | Modifies spec-pack? | Output |
| --- | --- | ---: | ---: | --- |
| 1 | `draft` | No | No existing spec-pack modified; creates output folder | draft spec-pack |
| 2 | `patch preview` | No | No | merge preview |
| 3 | `review report` | No | No | human review report |
| 4 | `apply-plan create` | No | No | manual apply plan |
| 5 | `handoff create` | No | No | handoff pack skeleton |
| 6 | `handoff validate` | No | No | validation result |

## Safe Smoke Workflow

```bash
node bin/specwise.mjs draft examples/legacy-staff-evaluation/input --out ./tmp/draft-test --force

node bin/specwise.mjs patch preview ./tmp/draft-test/spec-pack \
  --patch examples/ai-patches/legacy-staff-evaluation.mock-ai-patch.json \
  --out ./tmp/patch-preview \
  --force

node bin/specwise.mjs review report ./tmp/patch-preview \
  --decisions examples/reviews/legacy-staff-evaluation.review-decisions.example.json \
  --out ./tmp/review-report \
  --force

node bin/specwise.mjs apply-plan create ./tmp/review-report \
  --draft ./tmp/draft-test/spec-pack \
  --out ./tmp/apply-plan \
  --force

node bin/specwise.mjs handoff create ./tmp/draft-test/spec-pack \
  --apply-plan ./tmp/apply-plan/manual-apply-plan.json \
  --out ./tmp/handoff-pack \
  --target codex,claude-code,cursor,spec-kit \
  --force

node bin/specwise.mjs handoff validate ./tmp/handoff-pack

rm -rf ./tmp/draft-test ./tmp/patch-preview ./tmp/review-report ./tmp/apply-plan ./tmp/handoff-pack
```

## Expected Result

The final validation command should print:

```text
SpecWise handoff pack validation passed: ./tmp/handoff-pack
```

The handoff pack should remain a review context package. It is not a coding task list and not an implementation instruction.

