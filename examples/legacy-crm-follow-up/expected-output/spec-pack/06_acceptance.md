# 06 Acceptance Criteria

## Permission Acceptance

### AC1: Manager customer scope is enforced

- Priority: high
- Expected behavior: A Sales Manager sees only customers within the confirmed manager scope.
- Test idea: Sign in as a manager and verify customer list, detail, dashboard, and follow-up records follow the confirmed scope.
- Related question: `q_manager_cross_team_visibility`
- Needs review: true

### AC2: Export permission follows confirmed roles

- Priority: high
- Expected behavior: Export buttons are available only for roles confirmed to export customer and follow-up records.
- Test idea: Verify export visibility and API authorization for Sales Director, Sales Manager, Sales Rep, and Viewer.
- Related question: `q_export_permission`
- Needs review: true

## Workflow Acceptance

### AC3: Follow-up lifecycle uses confirmed states

- Priority: high
- Expected behavior: Follow-up records move through draft, submitted, manager_reviewed, closed, and reopened states according to confirmed transitions.
- Test idea: Attempt valid and invalid transitions for each role.
- Related question: `q_reopened_behavior`
- Needs review: true

### AC4: Submitted follow-up edit behavior is controlled

- Priority: high
- Expected behavior: Sales Rep edit access after submission follows the confirmed business rule.
- Test idea: Attempt editing as Sales Rep after submit and after manager review.
- Related question: `q_sales_rep_edit_submitted`
- Needs review: true

## Data Acceptance

### AC5: Customer assignment rules are visible and reviewable

- Priority: medium
- Expected behavior: Unassigned, Segment A, VIP, and overdue customers appear in the expected queue or assignment rule view.
- Test idea: Use synthetic customers with owner missing, VIP segment, overdue due date, and inactive status.
- Related question: `q_reassignment_approval`
- Needs review: true

## Safety Acceptance

### AC6: Mock data remains synthetic

- Priority: high
- Expected behavior: Example fixtures contain no real customer, employee, company, phone, email, or private business data.
- Test idea: Review fixture data before commit.
- Related question: none
- Needs review: false
