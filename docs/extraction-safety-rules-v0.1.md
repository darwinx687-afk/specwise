# Extraction Safety Rules v0.1

Status: design plus Phase 8A offline patch contract. Applies to future AI-assisted extraction.

These rules preserve the core SpecWise principle: unknowns are output, not failure.

Phase 8A applies these rules through AI candidate patches and merge previews. It does not call real AI providers and does not auto-apply patches.

## 1. Fact / Assumption / Question Rules

Fact requires evidence.

Assumption requires reason and `needsReview: true`.

Question captures unknowns.

Unknowns are output, not failure.

Rules:

- A fact must have evidence and must not exceed what the evidence supports.
- An assumption must be clearly separated from confirmed spec content.
- A question should explain why the unknown matters and what it blocks.
- AI output cannot convert a question into a fact without evidence and review.
- AI output must appear as candidate patches, not final truth.
- All AI patch candidates require `needsReview: true`.

## 2. Confidence Rules

Allowed confidence values:

```text
high
medium
low
unknown
```

High confidence is allowed only when:

- direct evidence exists
- evidence maps to a real source material
- no conflicting source is present
- the claim does not require hidden business knowledge

Medium confidence:

- partial evidence exists
- some inference is required
- no direct conflict is detected
- human review remains required

Low confidence:

- weak evidence exists or the claim is mostly pattern-based
- business impact may be high
- the claim should usually become an assumption or question

Unknown:

- evidence is missing or insufficient
- the item should become an open question

## 3. Evidence Rules

Evidence-first rules:

- every important claim should reference `evidenceIds`
- unsupported claims cannot become facts
- conflicting evidence becomes an open question
- generated evidence cannot point to nonexistent source
- evidence reliability should not be overstated
- source locations should use relative paths and avoid local absolute paths

If evidence is weak, the claim should be:

```text
low confidence
needsReview: true
assumption or open question
```

## 4. Permission Safety Rules

Permissions are high-risk.

Rules:

- never infer global admin rights without explicit evidence
- export/configure/approve/delete must default to `needsReview: true`
- cross-department or cross-company access must become a high-priority question if unclear
- role names alone do not prove data scope
- visible buttons do not prove every role can use those buttons
- permission conflicts become open questions, not silent decisions
- AI patch operations cannot delete or overwrite permission rules in v0.1

Examples:

- A visible Export button means export exists as an action candidate.
- It does not prove which roles can export.
- If a role note says "may export", the claim remains review-required.

## 5. Workflow Safety Rules

Workflow inference is also high-risk.

Rules:

- status labels do not prove full workflow order
- approval authority must not be invented
- edit-after-submit rules require confirmation
- rejected return paths require confirmation
- visible actions are action candidates, not full transition rules
- workflow transitions need explicit evidence or low confidence

If only status labels are visible, output states and questions instead of a complete workflow.

## 6. Bilingual Safety Rules

SpecWise often works with bilingual business materials.

Rules:

- Chinese and English summaries must preserve meaning
- do not translate role names in a way that changes scope
- keep original role labels when available
- preserve uncertainty markers in both languages
- avoid turning tentative Chinese notes into confirmed English facts
- bilingual summaries should be reviewed by someone who understands the business context

Role labels such as `Department Manager / 部门主管` should keep both forms when available.

## 7. Patch Preview Safety Rules

SpecWise v0.1 merge preview is review-only.

Rules:

- validate the AI patch before preview
- do not modify the deterministic draft
- do not generate a final spec-pack
- do not auto-apply any candidate
- keep conflicts as conflict candidates
- keep unsupported claims as assumptions or questions
- preserve blocked auto-apply reasons in preview output
