# AI Extraction Pipeline Design v0.1

Status: design plus Phase 8A offline patch contract. Real AI extraction is not implemented.

SpecWise v0.1 currently supports deterministic inventory and deterministic draft generation. Future AI extraction should enhance that baseline, not replace it.

Phase 8A defines a safe AI patch contract and offline mock merge preview. It does not call real AI providers and does not generate final AI extraction results.

## 1. Pipeline Positioning

Future AI extraction should sit after deterministic inventory and deterministic draft generation:

```text
Input materials
-> material inventory
-> deterministic draft
-> AI-assisted extraction layer
-> evidence-aware merge
-> review-required spec-pack
-> validation
```

The deterministic draft remains the safety baseline.

AI extraction may enrich, reorganize, or clarify findings, but it must not silently overwrite evidence, questions, or assumptions.

deterministic draft 是安全基线。AI 可以增强提取，但不能静默覆盖证据、不确定问题和假设。

The output remains `review_required` by default. AI output is treated as candidate structured interpretation, not final truth.

## 1.1 Phase 8A Patch Boundary

Future AI output must be represented as candidate patches, not a final spec-pack.

Allowed patch candidate types:

- `confirmed_candidate`
- `assumption_candidate`
- `question_candidate`
- `conflict_candidate`

Patch candidates require review and cannot silently overwrite deterministic draft content.

SpecWise v0.1 can preview the review queue for an offline mock patch fixture. It cannot auto-apply that patch.

## 2. Proposed AI Extraction Stages

### 2.1 Module Extraction

Input:
- `material-inventory.json`
- deterministic draft modules and pages
- mock screenshot text
- navigation labels
- Markdown headings

Output:
- module candidates
- page candidates
- navigation relationships
- module-related evidence mappings

What AI may do:
- group related pages into modules
- normalize bilingual module names
- clarify page purpose from visible labels and notes

What AI must not do:
- invent modules without source material
- remove deterministic modules silently
- claim a module is complete without evidence

Evidence requirements:
- every module candidate should include `evidenceIds`
- inferred navigation should reference the source material that exposed it

Failure mode:
- if module grouping is unclear, keep separate candidates and create an open question

Human review requirement:
- module grouping remains review-required until confirmed by product or business owners

### 2.2 Entity & Field Extraction

Input:
- deterministic draft entities and fields
- CSV headers and row counts
- mock screenshot table columns
- Markdown notes

Output:
- entity candidates
- field candidates
- field type candidates
- relation candidates

What AI may do:
- map CSV tables to business entities
- infer likely field types from labels and examples
- suggest relations such as employee -> department

What AI must not do:
- treat sample rows as complete business rules
- expose excessive sample personal data in summaries
- infer required fields unless evidence supports requiredness

Evidence requirements:
- field claims should reference CSV headers, table columns, or source notes
- relation claims should include confidence and review flags

Failure mode:
- ambiguous fields become open questions or assumptions

Human review requirement:
- entity names, field meaning, requiredness, and relations require human review

### 2.3 Permission Extraction

Input:
- material inventory
- deterministic draft permissions
- role notes
- permission mock screens
- visible roles, actions, and data scopes

Output:
- role candidates
- action candidates
- data scope candidates
- permission open questions

What AI may do:
- identify role/action/scope candidates
- detect unclear permission boundaries
- propose open questions for export, configure, approve, delete, or cross-scope access

What AI must not do:
- mark unclear permissions as confirmed
- invent admin powers without evidence
- remove existing open questions silently
- infer global access from role names alone

Evidence requirements:
- every permission claim needs direct evidence or must remain low confidence
- export/configure/approve/delete claims default to `needsReview: true`

Failure mode:
- conflicting permission signals become high-priority open questions

Human review requirement:
- permission output is review-required until a business owner confirms role scope and action scope

### 2.4 Workflow Extraction

Input:
- deterministic draft workflows
- workflow notes
- visible status labels
- action labels
- CSV status values

Output:
- workflow candidates
- state candidates
- transition candidates
- unresolved workflow questions

What AI may do:
- identify likely workflow states
- propose transition candidates from explicit notes
- separate supported states from inferred transitions

What AI must not do:
- assume status labels prove a full state machine
- invent approval authority
- decide edit-after-submit rules without evidence

Evidence requirements:
- transitions require explicit note evidence or must be marked low confidence
- approval steps must include the source of actor evidence

Failure mode:
- partial workflow evidence produces a state list plus open questions, not a complete workflow

Human review requirement:
- workflow transitions and actor authority require human confirmation

### 2.5 Open Question Extraction

Input:
- deterministic open questions
- notes containing unclear language
- low-confidence AI candidates
- conflicting claims

Output:
- categorized questions
- priority estimates
- blocked item references
- suggested owners

What AI may do:
- turn unclear notes into explicit questions
- group duplicate questions
- propose priority based on risk area

What AI must not do:
- answer questions without evidence
- delete deterministic questions silently
- downgrade high-risk permission questions without review

Evidence requirements:
- questions should reference source evidence when possible
- if a question comes from missing evidence, that absence should be explained

Failure mode:
- unclear items that cannot be phrased safely remain as review notes

Human review requirement:
- unresolved high-priority questions block readiness

### 2.6 Acceptance Criteria Extraction

Input:
- modules
- entities
- permissions
- workflows
- open questions
- deterministic acceptance criteria

Output:
- conservative acceptance criteria
- test ideas
- related questions and modules

What AI may do:
- convert confirmed or likely requirements into reviewable acceptance criteria
- add test ideas for permission and workflow behavior

What AI must not do:
- convert unresolved assumptions into final acceptance truth
- hide related questions
- imply production readiness

Evidence requirements:
- criteria should reference related modules, questions, and evidence where possible

Failure mode:
- uncertain criteria remain `needsReview: true`

Human review requirement:
- acceptance criteria are drafts until reviewed by product, business, or engineering owners

### 2.7 Evidence Mapping

Input:
- all source materials
- deterministic evidence map
- AI candidate claims

Output:
- evidence items
- claim mappings
- coverage summary

What AI may do:
- propose evidence links for candidate claims
- summarize why a source supports a claim

What AI must not do:
- create evidence IDs that do not exist
- cite unsupported sources
- overstate evidence reliability

Evidence requirements:
- each important claim should map to evidence or remain low confidence

Failure mode:
- claims with no evidence become assumptions or questions

Human review requirement:
- reviewers should inspect evidence coverage before accepting a pack

### 2.8 Buildability Re-scoring

Input:
- deterministic buildability score
- AI-enriched modules, entities, permissions, workflows, questions, and evidence coverage

Output:
- proposed dimension scores
- proposed status
- blocker list
- next actions

What AI may do:
- propose score adjustments based on clarity and evidence coverage
- identify new blockers

What AI must not do:
- mark `ready_for_ai_coding` while high-priority questions remain unresolved
- inflate scores to make output look polished

Evidence requirements:
- score changes should explain which dimensions changed and why

Failure mode:
- if score confidence is low, preserve deterministic score or lower it

Human review requirement:
- buildability status remains review-required until human confirmation

### 2.9 Bilingual Summary Generation

Input:
- structured spec pack
- evidence map
- source language metadata
- deterministic summaries

Output:
- Chinese business summary
- English developer summary

What AI may do:
- improve readability
- produce parallel business and developer summaries
- preserve uncertainty labels in both languages

What AI must not do:
- change role scope through translation
- soften warnings
- translate uncertain claims into confirmed statements

Evidence requirements:
- summaries must reflect structured data and open questions

Failure mode:
- bilingual meaning drift triggers review notes or open questions

Human review requirement:
- bilingual summaries require review by someone who understands the business language context

## 3. Merge Strategy

The merge must be deterministic-first:

- deterministic-first merge
- AI suggestions as candidate patches
- no silent overwrite
- preserve evidenceIds
- preserve openQuestions
- conflicting claims become questions
- low confidence claims become assumptions

AI output should be represented as one of three candidate types:

```text
confirmed_candidate
assumption_candidate
question_candidate
```

Definitions:

- `confirmed_candidate`: AI proposes that evidence directly supports a claim, but the merge still keeps review metadata.
- `assumption_candidate`: AI proposes a reasonable inference without enough evidence.
- `question_candidate`: AI identifies an unknown, conflict, or missing business rule.

Merge rules:

1. Existing deterministic claims remain unless a reviewer accepts an explicit candidate patch.
2. Existing evidence IDs are preserved.
3. Existing open questions are preserved unless a reviewer marks them resolved.
4. AI cannot turn assumptions into facts without evidence.
5. Conflicting claims become open questions.
6. High-risk permission and workflow claims require explicit review even when evidence exists.

## 4. Review Model

SpecWise remains review-first:

- `review_required` by default
- human confirmation needed before `ready_for_ai_coding`
- unresolved high-priority questions block readiness
- AI-generated assumptions must remain marked

Readiness can only improve when:

- evidence coverage is strong
- permission scope is clear
- workflow transitions are clear
- high-priority questions are resolved
- assumptions are reviewed or removed

## 5. Failure Modes

| Risk | Mitigation |
| --- | --- |
| Hallucinated permission rules | Default permission claims to `needsReview: true`; require evidence for role/action/scope. |
| Overconfident workflow inference | Treat status labels as states, not complete transitions. |
| Missing evidence links | Reject or downgrade claims without evidence. |
| Bilingual meaning drift | Preserve original role labels and review bilingual summaries. |
| Treating examples as real data | Label examples as mock and prevent example-specific facts from becoming general rules. |
| Leaking local paths | Store relative paths only and keep `absolutePathIncluded: false`. |
| Generating implementation instructions too early | Keep extraction output as specs, questions, assumptions, and acceptance criteria, not code tasks. |

## 6. Non-goals

Phase 6 design does not include:

- provider implementation
- prompt execution
- OCR
- vision
- app code generation
- SaaS
- handoff pack
