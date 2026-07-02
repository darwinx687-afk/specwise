# Legacy CRM Follow-up Example Scenario

This example simulates a messy legacy CRM follow-up admin system.

The input materials are synthetic and intentionally incomplete. The expected output shows how SpecWise separates confirmed structure, assumptions, open questions, evidence, permissions, workflows, and buildability.

这个示例模拟一个旧版客户跟进后台系统，所有客户、销售人员、分层和跟进记录均为 mock 数据。

## What This Example Simulates

A fictional internal CRM admin system manages customers, sales reps, customer segments, follow-up records, assignment rules, and manager review.

There is no formal PRD. The available materials are a mix of mock screenshot descriptions, CSV exports, role notes, workflow notes, and bilingual business comments.

## Input Materials

The `input/` directory contains privacy-safe mock materials:

- `screenshots/*.mock.txt` - text stand-ins for legacy admin screens.
- `data/customers.csv` - synthetic customer records with owner, segment, status, risk level, and follow-up dates.
- `data/follow_up_records.csv` - synthetic follow-up lifecycle records.
- `data/sales_reps.csv` - synthetic sales rep and team records.
- `data/customer_segments.csv` - synthetic segment configuration data.
- `notes/business-notes.md` - messy bilingual business context.
- `notes/roles.md` - role and permission notes with unresolved export and visibility rules.
- `notes/workflow-notes.md` - workflow states plus unclear transition rules.

All data is synthetic. Do not replace it with real customer, employee, company, phone, email, or private business data.

## Expected Spec Pack

The `expected-output/spec-pack/` directory demonstrates the curated target SpecWise output:

- modules and pages
- entities, fields, and relationships
- role permissions and data scopes
- customer follow-up workflow
- high-priority open questions
- acceptance criteria
- `spec-pack.json` for structured handoff
- `evidence-map.json` for claim-to-source traceability
- Chinese and English summaries

The expected output is the curated target pack.

The deterministic draft is a generated baseline and may require review.

## Why The Score Is 70 / 100

```text
Buildability Score: 70 / 100
Status: Review Required
```

The score is intentionally not higher. The materials support the main modules, entities, workflow states, and role list. They do not fully settle high-risk business rules.

Main blockers:

- Manager cross-team visibility is unclear.
- Export permission by role is unclear.
- Customer reassignment approval is unclear.
- Customer inactive marking authority is unclear.
- Reopened follow-up behavior is unclear.

## Why Status Is `review_required`

The expected pack is useful as first-pass implementation planning context, but it should not be treated as final implementation truth.

Before implementation, a business owner or product owner should confirm cross-team visibility, export permission, reassignment approval, inactive customer rules, and reopened follow-up transitions.

## Validate This Example

Run from the repository root:

```bash
node bin/specwise.mjs validate examples/legacy-crm-follow-up/expected-output/spec-pack
```

Or run the full project validation:

```bash
npm test
```

## Run Deterministic Draft

Run:

```bash
node bin/specwise.mjs draft examples/legacy-crm-follow-up/input \
  --out ./tmp/crm-draft \
  --force

node bin/specwise.mjs validate ./tmp/crm-draft/spec-pack

rm -rf ./tmp/crm-draft
```

The deterministic draft should validate, but it is still a generated baseline. The curated expected output remains the review target.
