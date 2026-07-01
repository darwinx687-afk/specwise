# 04 Workflows

## Summary
- Detected workflows: Employee status maintenance
- Confirmed states: none
- Inferred states: active, inactive, pending
- Main risks: Status transitions and approval points are not confirmed.

## Workflow: Employee Status Maintenance
- Trigger: A manager edits an employee record.
- Actors: Manager
- Steps:
  1. Manager opens the employee list.
  2. Manager edits an employee record.
  3. Employee status may change.
- States: active, inactive, pending
- Approval points: unknown
- Exceptions: unknown
- Evidence: `ev_employee_table_columns`, `ev_employee_edit_button`
- Open questions: `q_employee_status_enum`, `q_employee_status_workflow`

