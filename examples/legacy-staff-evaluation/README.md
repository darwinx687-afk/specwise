# Legacy Staff Evaluation Example Scenario

This example simulates a messy legacy staff evaluation admin system.

The input materials are intentionally incomplete and ambiguous. The expected output shows how SpecWise separates facts, assumptions, questions, evidence, and buildability instead of hiding uncertainty behind confident prose.

这个示例故意保留权限、导出、审批、提交后编辑等不确定点，用来展示 SpecWise 如何把未知问题显性化，而不是让 AI 编造答案。

## What This Example Simulates

A fictional operations company has an old internal admin system for employee evaluation records, review reports, organizational scopes, role permissions, and audit-like workflow tracking.

There is no formal PRD. The available materials are a realistic mix of mock screenshot descriptions, CSV exports, role notes, workflow notes, and bilingual business comments.

## Input Materials

The `input/` directory contains privacy-safe mock materials:

- `screenshots/*.mock.txt` - text stand-ins for legacy admin screens.
- `data/employees.csv` - employee sample data with company, department, group, role, status, joined date, and supervisor relationship.
- `data/departments.csv` - department sample data with manager and status fields.
- `data/evaluation_records.csv` - evaluation lifecycle data with draft/submitted/reviewed/approved/rejected states.
- `notes/business-notes.md` - messy bilingual business context.
- `notes/roles.md` - role and access notes with unresolved permissions.
- `notes/workflow-notes.md` - workflow states plus unclear transition rules.

No file contains real private data.

## Expected Spec Pack

The `expected-output/spec-pack/` directory demonstrates the target SpecWise output:

- modules, pages, and navigation
- entities, fields, and relationships
- role permissions and data scopes
- evaluation review workflow
- high/medium/low priority open questions
- acceptance criteria
- `spec-pack.json` for structured handoff
- `evidence-map.json` for claim-to-source traceability
- Chinese and English summaries

The pack does not claim to reconstruct the legacy system automatically. It captures enough structure for review and future implementation planning.

## Why The Score Is 72 / 100

```text
Buildability Score: 72 / 100
Status: Review Required
```

The score is intentionally not higher. The materials clearly support the main modules, entities, workflow states, and role list. They do not fully settle high-risk rules.

Main blockers:

- Department Manager cross-department visibility is unclear.
- Export permission is not clearly defined.
- Final approval authority is unclear.
- Submitted-record edit behavior is unclear.
- Audit log visibility is unclear.

## Why Status Is `review_required`

The expected pack is useful as first-pass AI coding context, but it should not be treated as final implementation truth.

Before implementation, a business owner or product owner should confirm role data scopes, export authority, final approval rules, submitted-record edit behavior, and operation-log visibility.

## Validate This Example

Run from the repository root:

```bash
npm run validate:pack -- examples/legacy-staff-evaluation/expected-output/spec-pack
```

Or run the full project validation:

```bash
npm test
```

The full test command validates this example, the minimal valid example, and the invalid missing-buildability fixture.

