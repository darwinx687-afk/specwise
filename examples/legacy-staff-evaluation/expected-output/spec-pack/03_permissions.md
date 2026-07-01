# 03 Permissions

## Summary
- Detected roles: President, Company Admin, Department Manager, Group Leader, Evaluator, Viewer
- Permission confidence: medium overall because roles and scopes are visible, but export, approval, and submitted-edit rules are unclear.
- Main blockers: cross-department view access, export authority, final approval authority, submitted-record edit behavior

## Role: President
- Data scope: all
- Can view: all company, department, group, employee, and evaluation records
- Can create: unknown
- Can edit: unclear; should not necessarily edit every record directly
- Can approve: unknown
- Can export: maybe; requires confirmation
- Evidence: `ev_permission_roles`, `ev_permission_scopes`, `ev_roles_president`, `ev_business_notes_scope`
- Needs review: true

## Role: Company Admin
- Data scope: company
- Can view: records within own company
- Can create: employee data and records within own company, inferred
- Can edit: records within own company, inferred
- Can approve: unknown
- Can export: unknown
- Can import/configure: may import employee data and configure company-level roles
- Evidence: `ev_roles_company_admin`, `ev_permission_columns`, `ev_permission_scopes`, `ev_business_notes_scope`
- Needs review: true

## Role: Department Manager
- Data scope: department
- Can view: department records, but cross-department access is unclear
- Can create: unknown
- Can edit: unknown
- Can approve: final approval authority unclear
- Can review: usually reviews evaluation records within own department
- Can export: unclear
- Evidence: `ev_roles_department_manager`, `ev_permission_scopes`, `ev_evaluation_actions`, `ev_workflow_states`
- Needs review: true

## Role: Group Leader
- Data scope: group
- Can view: group member records, inferred
- Can create: evaluation records for group members
- Can edit: draft records before submission
- Can approve: no evidence
- Can export: unknown
- Evidence: `ev_roles_group_leader`, `ev_workflow_states`, `ev_evaluation_actions`
- Needs review: true

## Role: Evaluator
- Data scope: assigned or group, unclear
- Can view: assigned records, inferred
- Can create: evaluation records
- Can edit: draft records, inferred
- Can submit: records for review
- Can approve: unclear
- Can export: unknown
- Evidence: `ev_roles_evaluator`, `ev_permission_scopes`, `ev_workflow_states`
- Needs review: true

## Role: Viewer
- Data scope: assigned or self
- Can view: assigned records
- Can create: no
- Can edit: no
- Can approve: no
- Can export: no
- Can import/configure: no
- Evidence: `ev_roles_viewer`, `ev_permission_columns`, `ev_permission_scopes`
- Needs review: false

