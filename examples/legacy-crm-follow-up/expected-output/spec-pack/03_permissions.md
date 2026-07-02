# 03 Permissions

## Summary

- Detected roles: System Admin, Sales Director, Sales Manager, Sales Rep, Viewer
- Permission confidence: medium
- Main blockers: export permission, cross-team visibility, inactive marking, and reassignment approval are unclear.

## Role: System Admin

- Can configure roles and permission settings.
- Evidence: `ev_screenshot_permission_roles`, `ev_notes_roles_scope`
- Needs review: false

## Role: Sales Director

- Can view all customers.
- Likely can export customer and follow-up records.
- Evidence: `ev_screenshot_permission_roles`, `ev_notes_export_unclear`
- Needs review: true

## Role: Sales Manager

- Can view team customers and review submitted follow-up records.
- Cross-team visibility is unresolved.
- Export permission is unresolved.
- Evidence: `ev_screenshot_permission_roles`, `ev_notes_roles_scope`, `ev_notes_export_unclear`
- Needs review: true

## Role: Sales Rep

- Can view assigned customers, create drafts, and submit follow-up records.
- Submitted-record edit behavior is unresolved.
- Evidence: `ev_screenshot_permission_roles`, `ev_workflow_notes_states`
- Needs review: true

## Role: Viewer

- Can view reports only.
- Should not edit customer or follow-up records.
- Evidence: `ev_screenshot_permission_roles`, `ev_notes_roles_scope`
- Needs review: false

## High-risk permission questions

- Can Sales Managers view customers outside their team?
- Which roles can export customer and follow-up records?
- Who can mark a customer inactive?
- Does customer reassignment require manager approval?
