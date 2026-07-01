# 01 Modules

## Summary
- Detected modules: Dashboard, Staff Management, Evaluation Records, Review Reports, Permission Settings
- Confidence: high for most modules; Review Reports is medium because it is visible in navigation but has no dedicated mock screen.
- Main risks: Export, approval authority, and cross-scope access rules require business review.

## Module: Dashboard
- Purpose: Provide company and department-level evaluation summaries and quick access to pending reviews.
- Pages: Dashboard
- Main actions: view summary metrics, filter by company/department/period, view pending reviews, export monthly summary
- Evidence: `ev_dashboard_navigation`, `ev_dashboard_summary_cards`, `ev_dashboard_filters`, `ev_dashboard_export_action`
- Confidence: high
- Needs review: false

## Module: Staff Management
- Purpose: Manage employee records, organizational scopes, supervisors, status, import, and export.
- Pages: Employee List
- Main actions: view, filter, create, edit, deactivate, import, export
- Evidence: `ev_employee_list_title`, `ev_employee_list_filters`, `ev_employee_table_columns`, `ev_employee_row_actions`, `ev_employee_top_actions`, `ev_employees_csv_headers`
- Confidence: high
- Needs review: false

## Module: Evaluation Records
- Purpose: Create, submit, review, and track employee evaluation records.
- Pages: Evaluation Records, Evaluation Detail
- Main actions: view, filter, edit, submit, review, approve, reject, export
- Evidence: `ev_evaluation_records_title`, `ev_evaluation_records_columns`, `ev_evaluation_status_labels`, `ev_evaluation_actions`, `ev_evaluation_detail_sections`, `ev_evaluation_detail_actions`
- Confidence: high
- Needs review: true

## Module: Review Reports
- Purpose: Support report review and monthly evaluation reporting.
- Pages: Review Reports
- Main actions: view reports, review report status, export report summaries
- Evidence: `ev_dashboard_navigation`, `ev_dashboard_export_action`, `ev_business_notes_scope`
- Confidence: medium
- Needs review: true

## Module: Permission Settings
- Purpose: Configure role-based action permissions and data scopes.
- Pages: Permission Settings
- Main actions: view roles, configure permissions, configure role scopes
- Evidence: `ev_permission_roles`, `ev_permission_columns`, `ev_permission_scopes`, `ev_business_notes_scope`
- Confidence: high
- Needs review: true

