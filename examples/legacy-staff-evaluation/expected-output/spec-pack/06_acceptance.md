# 06 Acceptance Criteria

## Permission Acceptance

### AC1: Department Manager scope is enforced
- Priority: high
- Expected behavior: A Department Manager should only see records within their department unless cross-department access is confirmed.
- Test idea: Sign in as a Department Manager and verify evaluation list, employee list, and reports are scoped to the assigned department.
- Related question: `q_department_manager_cross_department_view`
- Needs review: true

### AC2: Export permission is explicit
- Priority: high
- Expected behavior: Only roles confirmed to have export permission can export evaluation records or monthly summaries.
- Test idea: Attempt export as President, Department Manager, Group Leader, Evaluator, and Viewer.
- Related question: `q_export_permission`
- Needs review: true

### AC3: Viewer role remains read-only
- Priority: medium
- Expected behavior: Viewer can view assigned records but cannot create, edit, approve, import, export, or configure permissions.
- Test idea: Verify all mutation actions are unavailable or rejected for Viewer.
- Related question: none
- Needs review: false

## Workflow Acceptance

### AC4: Draft records can be submitted and reviewed
- Priority: high
- Expected behavior: A draft evaluation record can be submitted and then reviewed.
- Test idea: Create draft as Group Leader or Evaluator, submit it, and review it as Department Manager.
- Related question: `q_group_leader_edit_submitted`
- Needs review: true

### AC5: Rejected records do not become final
- Priority: high
- Expected behavior: A rejected record should not become final or appear as approved in reports.
- Test idea: Reject a submitted record and verify it is excluded from final approved-report counts.
- Related question: `q_rejected_return_to_draft`
- Needs review: true

### AC6: Final approval authority is enforced
- Priority: high
- Expected behavior: Only the confirmed approver role can approve reviewed evaluation records.
- Test idea: Attempt approval as each role after review.
- Related question: `q_approval_authority`
- Needs review: true

## Data Acceptance

### AC7: Employee records include required organizational fields
- Priority: high
- Expected behavior: Employee records include company, department, group, role, status, joined date, and supervisor relationship where available.
- Test idea: Import `employees.csv` and verify fields are preserved and nullable supervisor/group values are handled.
- Related question: `q_inactive_employee_reports`
- Needs review: true

### AC8: Evaluation records preserve lifecycle fields
- Priority: high
- Expected behavior: Evaluation records include employee, period, score, status, submitted_by, reviewed_by, submitted_at, and reviewed_at fields.
- Test idea: Import `evaluation_records.csv` and verify draft/unreviewed records can have missing score or reviewer fields.
- Related question: `q_approval_required_final`
- Needs review: true

## Audit Acceptance

### AC9: Evaluation actions retain actor history
- Priority: high
- Expected behavior: The system retains who submitted, reviewed, approved, rejected, or edited an evaluation record.
- Test idea: Perform each workflow action and verify the action appears in the audit log.
- Related question: `q_operation_log_visibility`
- Needs review: true

### AC10: Audit log visibility follows role rules
- Priority: medium
- Expected behavior: Operation logs are visible only to roles confirmed to have audit visibility.
- Test idea: Attempt to view operation logs as each role.
- Related question: `q_operation_log_visibility`
- Needs review: true

## UI Acceptance

### AC11: Dashboard summaries respect active filters
- Priority: low
- Expected behavior: Dashboard cards update when Company, Department, or Evaluation Period filters change.
- Test idea: Change each filter and verify summary counts refresh consistently.
- Related question: `q_dashboard_card_config`
- Needs review: true

