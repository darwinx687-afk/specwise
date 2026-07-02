# 04 Workflows

## Summary

- Detected workflows: Customer follow-up lifecycle, customer assignment and reassignment
- Confirmed states: draft, submitted, manager_reviewed, closed, reopened
- Main risks: reopened behavior, submitted edit behavior, inactive customer behavior, and reassignment approval are unresolved.

## Workflow: Customer Follow-up Lifecycle

```text
new_customer
-> assigned
-> follow_up_draft
-> submitted
-> manager_reviewed
-> closed
↘ reopened
```

- Trigger: a new customer needs follow-up or an existing customer reaches next action due.
- Actors: Sales Rep, Sales Manager
- Evidence: `ev_screenshot_follow_up_statuses`, `ev_screenshot_follow_up_actions`, `ev_workflow_notes_states`
- Open questions: `q_sales_rep_edit_submitted`, `q_reopened_behavior`

## Workflow: Assignment and Reassignment

```text
unassigned
-> manager_queue
-> owner_assigned
-> follow_up_due
-> reassignment_review
```

- Trigger: customer has no owner, is overdue, or matches segment assignment rules.
- Actors: Sales Manager, Sales Director, Sales Rep
- Evidence: `ev_screenshot_assignment_rules`, `ev_notes_reassignment_unclear`, `ev_csv_customers_owner`
- Open questions: `q_reassignment_approval`, `q_manager_cross_team_visibility`
