# 06 Acceptance Criteria

## Permission Acceptance

### AC1: Manager data scope is enforced
- Priority: high
- Expected behavior: A manager sees only records within the confirmed manager scope.
- Test idea: Sign in as a manager and verify employee list filtering follows the confirmed scope.
- Related question: `q_manager_cross_department_access`
- Needs review: true

## Workflow Acceptance

### AC2: Employee status changes follow confirmed states
- Priority: medium
- Expected behavior: Employee status values and transitions match confirmed business rules.
- Test idea: Attempt each valid and invalid status transition.
- Related question: `q_employee_status_workflow`
- Needs review: true

## Data Acceptance

### AC3: Employee status values are validated
- Priority: medium
- Expected behavior: The system accepts only confirmed status values.
- Test idea: Create or edit an employee with an invalid status value and verify rejection.
- Related question: `q_employee_status_enum`
- Needs review: true

## UI Acceptance

