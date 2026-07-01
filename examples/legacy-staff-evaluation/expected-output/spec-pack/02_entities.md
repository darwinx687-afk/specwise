# 02 Entities

## Summary
- Detected entities: Employee, Department, Group, EvaluationRecord, Role, Permission, User/Account, AuditLog
- High-confidence entities: Employee, Department, EvaluationRecord, Role, Permission
- Entities needing review: Group, User/Account, AuditLog

## Entity: Employee
- Description: A staff member included in evaluation and organizational management.
- Fields: employee_id, name, company, department, group, role, status, joined_at, supervisor_id, latest_evaluation_date
- Relations: belongs to Department and Group; reports to another Employee through supervisor_id.
- Evidence: `ev_employee_table_columns`, `ev_employees_csv_headers`, `ev_employees_csv_supervisor`, `ev_employees_csv_status_values`
- Confidence: high
- Open questions: `q_inactive_employee_reports`, `q_employee_deletion_behavior`

## Entity: Department
- Description: A company-level organizational unit with a manager and status.
- Fields: department_id, company, name, manager_id, status
- Relations: belongs to Company; managed by Employee/User; contains Employees and Groups.
- Evidence: `ev_departments_csv_headers`, `ev_employee_list_filters`, `ev_departments_csv_missing_manager`
- Confidence: high
- Open questions: `q_department_manager_cross_department_view`

## Entity: Group
- Description: A department-level team scope used for filtering and group leader responsibilities.
- Fields: group_name, department, company, leader_id
- Relations: belongs to Department; contains Employees.
- Evidence: `ev_employee_list_filters`, `ev_employee_table_columns`, `ev_employees_csv_headers`
- Confidence: medium
- Open questions: none

## Entity: EvaluationRecord
- Description: A performance or inspection record for an employee during an evaluation period.
- Fields: record_id, employee_id, evaluation_period, score, status, risk_level, submitted_by, reviewed_by, submitted_at, reviewed_at, review_comment
- Relations: belongs to Employee; submitted/reviewed/approved/rejected by User/Account.
- Evidence: `ev_evaluation_records_columns`, `ev_evaluation_records_csv_headers`, `ev_evaluation_records_csv_states`, `ev_evaluation_detail_fields`
- Confidence: high
- Open questions: `q_group_leader_edit_submitted`, `q_approval_authority`, `q_approval_required_final`, `q_rejected_return_to_draft`

## Entity: Role
- Description: A named access profile such as President, Company Admin, Department Manager, Group Leader, Evaluator, or Viewer.
- Fields: role_id, name, nameZh, scope
- Relations: has many Permissions; assigned to User/Account.
- Evidence: `ev_permission_roles`, `ev_roles_president`, `ev_roles_company_admin`, `ev_roles_department_manager`, `ev_roles_group_leader`, `ev_roles_evaluator`, `ev_roles_viewer`
- Confidence: high
- Open questions: none

## Entity: Permission
- Description: A role/action/data-scope rule controlling what users may do.
- Fields: permission_id, role_id, resource_type, action, data_scope, condition
- Relations: belongs to Role.
- Evidence: `ev_permission_columns`, `ev_permission_scopes`, `ev_roles_department_manager`, `ev_roles_group_leader`
- Confidence: high
- Open questions: `q_export_permission`, `q_approval_authority`

## Entity: User / Account
- Description: A login account or actor associated with employees, submitters, reviewers, and approvers.
- Fields: account_id, employee_id, role_id, company, department, group, status
- Relations: may map to Employee; has Role; performs workflow actions.
- Evidence: `ev_roles_president`, `ev_roles_company_admin`, `ev_evaluation_records_csv_headers`, `ev_business_notes_scope`
- Confidence: medium
- Open questions: `q_approval_authority`

## Entity: AuditLog
- Description: A record of who submitted, reviewed, approved, rejected, or edited an evaluation record.
- Fields: audit_log_id, record_id, actor_id, action, action_at, previous_state, next_state
- Relations: belongs to EvaluationRecord; performed by User/Account.
- Evidence: `ev_evaluation_detail_sections`, `ev_evaluation_detail_actions`, `ev_business_notes_audit`
- Confidence: medium
- Open questions: `q_operation_log_visibility`

