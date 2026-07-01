# SpecWise Spec Pack Standard v0.1

## 1. Standard Goal

SpecWise is not a system for making AI generate a pile of documents. It defines a standard:

> What kind of business material has been organized enough to hand to an AI coding agent for development?

Spec Pack Standard v0.1 converts messy business material into:

1. Human-reviewable Markdown documents.
2. Machine-readable JSON structures.
3. An evidence map that traces conclusions back to sources.
4. Questions and assumptions that expose uncertainty.
5. A Buildability Score that says whether the pack is ready for development.

## 2. Standard Output Directory

```text
spec-pack/
  01_modules.md
  02_entities.md
  03_permissions.md
  04_workflows.md
  05_questions.md
  06_acceptance.md
  buildability-report.md
  spec-pack.json
  evidence-map.json
  spec-pack.zh-CN.md
  spec-pack.en.md
```

| File | Purpose |
| --- | --- |
| `01_modules.md` | Human-readable modules, pages, navigation, and page purposes. |
| `02_entities.md` | Human-readable business objects, fields, relations, and data sources. |
| `03_permissions.md` | Human-readable roles, data scopes, operations, and boundaries. |
| `04_workflows.md` | Human-readable workflows, states, actions, and approval points. |
| `05_questions.md` | Questions for customers, FDEs, product owners, or developers. |
| `06_acceptance.md` | Acceptance criteria for development completion. |
| `buildability-report.md` | Whether the pack is ready for AI coding. |
| `spec-pack.json` | Machine-readable structured specification. |
| `evidence-map.json` | Machine/human-readable claim-to-evidence mapping. |
| `spec-pack.zh-CN.md` | Chinese business summary. |
| `spec-pack.en.md` | English developer handoff summary. |

## 3. Core Principles

### 3.1 Evidence First

Key conclusions should be bound to source evidence whenever possible.

Weak claim:

```text
Managers can view all employee data.
```

Better claim:

```text
Managers may be able to view employee data for their own group.
Evidence:
- roles.md says "managers are responsible for viewing group data"
- employee-list.png has a department filter
Confidence: medium
Needs review: true
```

### 3.2 Unknowns Are Output, Not Failure

Uncertainty is not failure. Uncertain points must be written to `05_questions.md`.

SpecWise should not pretend all business rules are known.

### 3.3 Assumption Is Not Fact

Inferences must be marked as assumptions. Content without evidence must not be written as confirmed fact.

### 3.4 Human Review Required By Default

v0.1 defaults to:

```text
Status: Review Required
```

A pack should only become:

```text
Status: Ready for AI Coding
```

when evidence coverage, permission clarity, and workflow clarity are strong enough.

### 3.5 Machine-Readable And Human-Readable Together

Markdown alone is not enough. JSON alone is not enough.

SpecWise must support:

- Markdown for customers, FDEs, product owners, and developers.
- JSON for Codex, Claude Code, Cursor, Spec Kit, and similar coding workflows.

### 3.6 Bilingual By Design

SpecWise naturally serves Chinese-English handoff scenarios.

v0.1 output must preserve:

- A Chinese business version for domestic customers, traditional enterprises, and business users.
- An English developer version for GitHub, international developers, and AI coding workflows.

## 4. `spec-pack.json` Structure

`spec-pack.json` uses this top-level structure:

```json
{
  "schemaVersion": "0.1.0",
  "project": {},
  "sourceMaterials": [],
  "modules": [],
  "pages": [],
  "entities": [],
  "fields": [],
  "roles": [],
  "permissions": [],
  "workflows": [],
  "acceptanceCriteria": [],
  "openQuestions": [],
  "assumptions": [],
  "buildability": {},
  "handoff": {},
  "generatedAt": "",
  "generator": {}
}
```

Note: the original v0.1 outline defines page and field records separately. This repository models them as explicit top-level `pages` and `fields` arrays so they can be validated and referenced consistently.

### 4.1 Project

`project` describes the business system being analyzed.

Required fields:

- `name`
- `domain`
- `description`
- `primaryLanguage`
- `targetUsers`
- `status`

Allowed `status` values:

- `review_required`
- `ready_for_ai_coding`
- `needs_discovery`
- `not_buildable_yet`

### 4.2 Source Materials

`sourceMaterials` records the input material inventory.

Supported `type` values:

- `screenshot`
- `markdown`
- `txt`
- `csv`
- `xlsx`

v0.1 does not cover PDF, video, Figma, database, source-code, or browser-session analysis.

### 4.3 Modules And Pages

Modules are functional areas. Pages belong to modules.

Each module must include:

- `id`
- `name`
- `nameZh`
- `description`
- `pages`
- `confidence`
- `evidenceIds`
- `needsReview`

Each page should record:

- page purpose
- main actions
- visible fields
- source evidence
- uncertainty

### 4.4 Entities And Fields

Entities are business objects. Fields belong to entities.

Entities answer:

> What business objects does this system manage?

Field types:

- `string`
- `number`
- `boolean`
- `date`
- `datetime`
- `enum`
- `relation`
- `currency`
- `percentage`
- `text`
- `json`
- `unknown`

`required` supports `true`, `false`, and `unknown`.

### 4.5 Roles And Permissions

Roles are the basis of the permission system.

Common role scopes:

- `global`
- `company`
- `department`
- `group`
- `self`
- `custom`
- `unknown`

Permission actions:

- `view`
- `create`
- `edit`
- `delete`
- `approve`
- `export`
- `import`
- `assign`
- `configure`
- `unknown`

Permission data scopes:

- `all`
- `company`
- `department`
- `group`
- `self`
- `assigned`
- `none`
- `unknown`

### 4.6 Workflows

Workflow records should express:

- who triggers the process
- who participates
- what steps exist
- what states exist
- what remains uncertain

v0.1 workflows do not need to be perfect. Incomplete workflows should be marked with low or medium confidence and connected to open questions.

### 4.7 Acceptance Criteria

Acceptance criteria are used by later development and test work.

Categories:

- `module`
- `entity`
- `permission`
- `workflow`
- `data_import`
- `ui`
- `audit`
- `security`
- `edge_case`

Priorities:

- `high`
- `medium`
- `low`

### 4.8 Open Questions

Open questions are core output, not an afterthought.

Question categories:

- `module`
- `entity`
- `field`
- `permission`
- `workflow`
- `data`
- `ui`
- `integration`
- `audit`
- `security`
- `business_rule`

Suggested owners:

- `business_owner`
- `product_manager`
- `developer`
- `admin`
- `legal_or_compliance`
- `unknown`

### 4.9 Assumptions

Assumptions must stay separate from confirmed specifications.

Each assumption must include:

- `reason`
- `confidence`
- `needsReview`
- `relatedQuestionIds`

## 5. `evidence-map.json` Structure

`evidence-map.json` records where conclusions came from.

```json
{
  "schemaVersion": "0.1.0",
  "evidenceItems": [],
  "claimMappings": [],
  "coverageSummary": {}
}
```

Evidence item types:

- `ui_text`
- `table_header`
- `table_value`
- `sheet_name`
- `business_note`
- `role_description`
- `workflow_note`
- `button_label`
- `menu_label`
- `status_label`
- `inferred_pattern`
- `unknown`

Reliability values:

- `high`
- `medium`
- `low`
- `unknown`

Claim types:

- `module`
- `page`
- `entity`
- `field`
- `permission`
- `workflow`
- `acceptance`
- `assumption`
- `question`

## 6. Confidence Standard

v0.1 uses four confidence levels:

- `high`
- `medium`
- `low`
- `unknown`

High confidence requires direct evidence and no obvious conflict.

Medium confidence has partial evidence and reasonable inference but still needs review.

Low confidence is mostly pattern inference or weak evidence and must be reviewed.

Unknown means there is not enough evidence and the point must become an open question.

## 7. Fact, Assumption, Question

Facts must have evidence, high or medium confidence, and wording that does not exceed the evidence.

Assumptions are reasonable but unconfirmed inferences. They require a reason, confidence, review flag, and related question.

Questions are unsafe-to-infer items. They require priority, category, why-it-matters, blocked items, and suggested owner.

## 8. Markdown Output Standard

Each Markdown file should use the template in `templates/spec-pack/`.

Required files:

- `01_modules.md`
- `02_entities.md`
- `03_permissions.md`
- `04_workflows.md`
- `05_questions.md`
- `06_acceptance.md`
- `buildability-report.md`
- `spec-pack.zh-CN.md`
- `spec-pack.en.md`

## 9. Buildability Score

Total score: 100.

| Dimension | Weight |
| --- | ---: |
| Module Clarity | 15 |
| Entity Clarity | 15 |
| Field Clarity | 15 |
| Permission Clarity | 15 |
| Workflow Clarity | 15 |
| Evidence Coverage | 15 |
| Ambiguity Control | 10 |

Status by score:

| Score | Status | Meaning |
| ---: | --- | --- |
| 80-100 | `ready_for_ai_coding` | Ready for AI coding, with review still recommended. |
| 60-79 | `review_required` | Usable first specification, but key questions need confirmation. |
| 40-59 | `needs_discovery` | More interviews or source material required. |
| 0-39 | `not_buildable_yet` | Not suitable for development yet. |

## 10. AI Coding Handoff

`spec-pack.json` may include:

```json
{
  "handoff": {
    "recommendedNextStep": "human_review_before_implementation",
    "codingAgentReadiness": "review_required",
    "suggestedImplementationOrder": [
      "Define data models",
      "Implement role-based access rules",
      "Build core modules",
      "Build workflows",
      "Add acceptance tests"
    ],
    "blockedByQuestions": []
  }
}
```

## 11. Valid Spec Pack Checklist

- Has project metadata.
- Has source material inventory.
- Has at least one module.
- Has at least one entity.
- Has field definitions.
- Has role or permission section.
- Has workflow or explicitly says workflow unknown.
- Has open questions.
- Has acceptance criteria.
- Has evidence map.
- Has buildability score.
- Has bilingual summary.
- Separates facts, assumptions, and questions.
- Does not claim automatic system reconstruction.

## 12. Non-Goals

Spec Pack Standard v0.1 does not cover:

- automatic code generation
- automatic database design
- full PRD generation
- UI cloning
- automatic login or scraping of legacy systems
- deep PDF understanding
- video or screen-recording understanding
- source-code reverse engineering
- enterprise permission auditing
- multi-tenant SaaS project management

## 13. Summary

A valid Spec Pack does not make AI guesses look polished. It structures what can be confirmed, what needs confirmation, what is only assumed, and where each claim came from.

```text
messy materials
-> structured specs
-> evidence map
-> open questions
-> buildability score
-> AI coding handoff
```

