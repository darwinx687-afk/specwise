# 05 Open Questions

## High Priority

### Q1: Can Sales Managers view customers outside their team?

- Category: permission
- Why it matters: This affects data scope, API filters, exports, dashboards, and review queues.
- Blocks: `perm_sales_manager_view_team_customers`, `ac_manager_scope_enforced`
- Suggested owner: business_owner
- Evidence: `ev_screenshot_permission_roles`, `ev_notes_roles_scope`

### Q2: Which roles can export customer and follow-up records?

- Category: permission
- Why it matters: Export is visible, but export authority affects sensitive data handling.
- Blocks: `perm_sales_director_export_records`, `ac_export_permission_confirmed`
- Suggested owner: business_owner
- Evidence: `ev_notes_export_unclear`, `ev_screenshot_customer_list_actions`

### Q3: Who can mark a customer inactive?

- Category: business_rule
- Why it matters: Inactive customer marking may affect follow-up obligations and audit history.
- Blocks: `ac_inactive_requires_confirmed_rule`
- Suggested owner: product_manager
- Evidence: `ev_screenshot_customer_detail_unclear`, `ev_notes_inactive_unclear`

### Q4: Does customer reassignment require manager approval?

- Category: workflow
- Why it matters: Reassignment affects ownership, queues, and possible audit requirements.
- Blocks: `wf_assignment_reassignment`, `ac_reassignment_rule_confirmed`
- Suggested owner: product_manager
- Evidence: `ev_screenshot_assignment_rules`, `ev_notes_reassignment_unclear`

### Q5: Can Sales Reps edit submitted follow-up records?

- Category: workflow
- Why it matters: Submitted edits affect review integrity and audit behavior.
- Blocks: `wf_customer_follow_up`, `ac_submitted_record_edit_rule`
- Suggested owner: product_manager
- Evidence: `ev_screenshot_follow_up_actions`, `ev_workflow_notes_states`

### Q6: What happens when a closed follow-up is reopened?

- Category: workflow
- Why it matters: Reopened records need a clear next state and edit behavior.
- Blocks: `wf_customer_follow_up`, `ac_reopened_transition_confirmed`
- Suggested owner: product_manager
- Evidence: `ev_screenshot_follow_up_statuses`, `ev_workflow_notes_reopened_unclear`

## Medium Priority

### Q7: Does overdue follow-up trigger automatic reminder?

- Category: business_rule
- Why it matters: Reminder behavior affects queues and notifications.
- Blocks: `asm_overdue_attention_queue`
- Suggested owner: product_manager
- Evidence: `ev_screenshot_dashboard_widgets`, `ev_workflow_notes_overdue_unclear`
