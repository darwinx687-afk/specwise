# AI Patch Contract v0.1

Status: Phase 8A offline contract. Real AI extraction is not implemented.

Phase 8A defines the safe output shape for future AI-assisted extraction. AI output is not final truth. AI output is a set of candidate patches that require human review.

Phase 8B keeps this rule for future explicit AI provider preview: model output must be patch-only, never final spec-pack output.

## Why Patch, Not Final Truth

The deterministic draft is the safety baseline.

Future AI extraction may suggest improvements, questions, assumptions, conflicts, and reviewable acceptance criteria. It must not silently overwrite the draft or generate a final spec-pack.

Rules:

- deterministic draft = safety baseline
- AI output = candidate patches
- candidate patches = review required
- no silent overwrite
- conflicts become questions or conflict candidates
- unsupported claims become assumptions or question candidates
- final spec-pack still needs validation

## Candidate Types

Allowed candidate types:

```text
confirmed_candidate
assumption_candidate
question_candidate
conflict_candidate
```

`confirmed_candidate` means the proposal has direct evidence, but still requires review.

`assumption_candidate` means the proposal is plausible but not proven.

`question_candidate` means the output is an unresolved question.

`conflict_candidate` means the materials contain inconsistent or unresolved signals.

## Operations

Allowed operations:

```text
add
update
add_question
add_assumption
flag_conflict
rescore
```

Unsupported operations in v0.1:

```text
delete
overwrite
```

SpecWise v0.1 does not allow AI patches to delete content or overwrite deterministic draft content.

## Evidence Requirements

Every important candidate should include `evidenceIds`.

Rules:

- `confirmed_candidate` must include `evidenceIds`.
- `confirmed_candidate` cannot use `low` or `unknown` confidence.
- candidates without `evidenceIds` can only be `assumption_candidate` or `question_candidate`.
- evidence IDs must refer to reviewable source materials.

## Confidence Requirements

Allowed confidence values:

```text
high
medium
low
unknown
```

Low or unknown confidence cannot produce confirmed candidates.

Low-confidence items should become assumptions or questions.

## Permission Safety Rules

Permissions are high-risk.

Permission, export, approve, delete, and configure candidates must remain review-required.

Rules:

- do not infer global access from role names
- do not confirm export scope without direct evidence
- do not confirm approval authority without explicit evidence
- unresolved cross-department or cross-company access becomes a high-priority question
- visible buttons are action candidates, not role authorization proof

## Review Requirement

All candidates must include:

```json
{
  "needsReview": true
}
```

SpecWise v0.1 does not auto-apply AI patches.

## Future AI Preview Requirement

Future explicit AI preview must validate provider output against this contract before any merge preview.

If provider output is not a valid AI patch:

```text
fail
do not merge
do not auto-apply
keep deterministic draft intact
```
