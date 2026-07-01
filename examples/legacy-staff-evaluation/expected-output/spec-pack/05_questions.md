# 05 Open Questions

## High Priority

### Q1: Can Department Managers view records outside their own department?
- Category: permission
- Why it matters: This determines API filtering, report access, and acceptance tests for department-level roles.
- Blocks: `perm_department_manager_view_department_records`, `ac_department_manager_scope`
- Suggested owner: business_owner
- Related evidence: `ev_roles_department_manager`, `ev_business_notes_scope`, `ev_permission_scopes`

### Q2: Can Group Leaders edit submitted records after review has started?
- Category: workflow
- Why it matters: This changes workflow state transitions, edit permissions, and audit requirements.
- Blocks: `perm_group_leader_edit_draft_records`, `wf_evaluation_review`, `ac_submitted_record_edit_lock`
- Suggested owner: product_manager
- Related evidence: `ev_roles_group_leader`, `ev_workflow_unclear_rules`, `ev_evaluation_actions`

### Q3: Who can approve reviewed evaluation records?
- Category: permission
- Why it matters: Final approval authority affects role design, workflow transitions, and audit logs.
- Blocks: `perm_department_manager_approve_records`, `wf_evaluation_review`, `ac_final_approval_authority`
- Suggested owner: business_owner
- Related evidence: `ev_permission_columns`, `ev_workflow_unclear_rules`, `ev_evaluation_detail_actions`

### Q4: Who can export evaluation records?
- Category: permission
- Why it matters: Export can expose sensitive employee evaluation data and needs strict access control.
- Blocks: `perm_president_export_reports`, `perm_department_manager_export_records`, `ac_export_permission`
- Suggested owner: admin
- Related evidence: `ev_dashboard_export_action`, `ev_evaluation_actions`, `ev_roles_president`, `ev_roles_department_manager`

### Q5: Is approval required before an evaluation record becomes final?
- Category: workflow
- Why it matters: This determines final-state logic, reporting eligibility, and acceptance criteria.
- Blocks: `wf_evaluation_review`, `ac_final_record_state`
- Suggested owner: product_manager
- Related evidence: `ev_workflow_states`, `ev_workflow_unclear_rules`, `ev_evaluation_records_csv_states`

## Medium Priority

### Q6: Can rejected records return to draft?
- Category: workflow
- Why it matters: This affects state machine design and edit permissions after rejection.
- Blocks: `wf_evaluation_review`, `ac_rejected_record_not_final`
- Suggested owner: product_manager
- Related evidence: `ev_workflow_unclear_rules`, `ev_evaluation_status_labels`

### Q7: Are operation logs visible to all roles or only admins?
- Category: audit
- Why it matters: Log visibility affects privacy, compliance, and UI permissions.
- Blocks: `ent_audit_log`, `ac_audit_log_retention`
- Suggested owner: admin
- Related evidence: `ev_evaluation_detail_sections`, `ev_business_notes_audit`

### Q8: Are inactive employees included in evaluation reports?
- Category: business_rule
- Why it matters: Reporting counts and filters may change based on inactive employee inclusion.
- Blocks: `ent_employee`, `ac_employee_required_fields`
- Suggested owner: business_owner
- Related evidence: `ev_employees_csv_status_values`, `ev_departments_csv_missing_manager`

### Q9: Should employee records be soft-deleted or only deactivated?
- Category: audit
- Why it matters: Delete/deactivate behavior affects retention, auditability, and UI actions.
- Blocks: `asm_employee_deactivate_not_delete`, `ac_employee_deactivation`
- Suggested owner: admin
- Related evidence: `ev_employee_row_actions`, `ev_business_notes_audit`

## Low Priority

### Q10: Should Dashboard summary cards be configurable?
- Category: ui
- Why it matters: Configurability affects dashboard settings and admin configuration scope.
- Blocks: `mod_dashboard`
- Suggested owner: product_manager
- Related evidence: `ev_dashboard_summary_cards`

### Q11: Should risk level be manually assigned or calculated from score?
- Category: business_rule
- Why it matters: Risk-level design affects data modeling and evaluation detail behavior.
- Blocks: `asm_risk_level_derivation`
- Suggested owner: product_manager
- Related evidence: `ev_evaluation_detail_fields`, `ev_dashboard_summary_cards`

