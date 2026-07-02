# 01 Modules

## Summary

- Detected modules: Dashboard, Customer Management, Follow-up Records, Assignment Rules, Reports, Permission Settings
- Confidence: medium to high
- Main risks: export permission, cross-team visibility, reassignment approval, and inactive customer rules are unresolved.

## Module: Dashboard

- Purpose: Show CRM follow-up summary widgets and manager attention queues.
- Pages: CRM Dashboard
- Main actions: view, filter
- Evidence: `ev_screenshot_dashboard_navigation`, `ev_screenshot_dashboard_widgets`
- Confidence: high
- Needs review: false

## Module: Customer Management

- Purpose: Manage customers, owner assignment, customer detail, risk flags, and inactive status.
- Pages: Customer List, Customer Detail
- Main actions: view detail, assign owner, export selected, mark inactive
- Evidence: `ev_screenshot_customer_list_columns`, `ev_screenshot_customer_detail_sections`, `ev_csv_customers_headers`
- Confidence: high
- Needs review: true

## Module: Follow-up Records

- Purpose: Create, submit, review, close, reopen, and export follow-up records.
- Pages: Follow-up Records
- Main actions: create follow-up, submit follow-up, manager review, reopen, export records
- Evidence: `ev_screenshot_follow_up_statuses`, `ev_screenshot_follow_up_actions`, `ev_csv_follow_up_headers`
- Confidence: high
- Needs review: true

## Module: Assignment Rules

- Purpose: Configure or review customer assignment and reassignment rules.
- Pages: Assignment Rules
- Main actions: create rule, edit rule, disable rule, preview affected customers
- Evidence: `ev_screenshot_assignment_rules`, `ev_notes_reassignment_unclear`
- Confidence: medium
- Needs review: true

## Module: Reports

- Purpose: View CRM reports and follow-up completion summaries.
- Pages: Reports
- Main actions: view reports, export reports
- Evidence: `ev_screenshot_dashboard_navigation`, `ev_notes_export_unclear`
- Confidence: medium
- Needs review: true

## Module: Permission Settings

- Purpose: Configure role permissions and data scopes.
- Pages: Permission Settings
- Main actions: view, configure
- Evidence: `ev_screenshot_permission_roles`, `ev_screenshot_permission_unclear`
- Confidence: high
- Needs review: true
