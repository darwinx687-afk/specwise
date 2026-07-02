# 02 Entities

## Summary

- Core entities: Customer, SalesRep, CustomerSegment, FollowUpRecord, AssignmentRule, Role, Permission, AuditLog
- High-confidence entities: Customer, SalesRep, CustomerSegment, FollowUpRecord
- Entities needing review: AssignmentRule, Permission, AuditLog

## Entity: Customer

- Description: A customer managed by the CRM follow-up workflow.
- Fields: customer_id, customer_name, segment, owner_rep_id, status, risk_level, last_follow_up_date, next_follow_up_due
- Relations: belongs to CustomerSegment; assigned to SalesRep; has many FollowUpRecords
- Evidence: `ev_screenshot_customer_list_columns`, `ev_csv_customers_headers`

## Entity: SalesRep

- Description: A sales user who owns customers or reviews team activity.
- Fields: rep_id, rep_name, team, role, status
- Relations: owns many Customers; creates FollowUpRecords
- Evidence: `ev_csv_sales_reps_headers`, `ev_screenshot_permission_roles`

## Entity: CustomerSegment

- Description: A customer classification controlling follow-up urgency and manager visibility.
- Fields: segment, description, priority, default_follow_up_days, manager_visibility_required
- Relations: has many Customers
- Evidence: `ev_csv_segments_headers`, `ev_screenshot_assignment_rules`

## Entity: FollowUpRecord

- Description: A follow-up activity record for a customer.
- Fields: record_id, customer_id, rep_id, follow_up_type, status, created_at, submitted_at, reviewed_by, next_action_due
- Relations: belongs to Customer; created by SalesRep; reviewed by manager-like SalesRep
- Evidence: `ev_screenshot_follow_up_statuses`, `ev_csv_follow_up_headers`

## Entity: AssignmentRule

- Description: A rule used to assign or reassign customers.
- Fields: rule_name, segment, owner_criteria, approval_required
- Relations: may apply to CustomerSegment and SalesRep
- Evidence: `ev_screenshot_assignment_rules`

## Entity: Role

- Description: A role such as System Admin, Sales Director, Sales Manager, Sales Rep, or Viewer.
- Fields: role_name, data_scope
- Relations: has many Permissions
- Evidence: `ev_screenshot_permission_roles`, `ev_notes_roles_scope`

## Entity: Permission

- Description: A role-action-resource rule for CRM records.
- Fields: role_id, resource_type, action, data_scope, condition
- Relations: belongs to Role
- Evidence: `ev_screenshot_permission_roles`, `ev_screenshot_permission_unclear`

## Entity: AuditLog

- Description: A possible audit or review history record for assignments, exports, reviews, and inactive marking.
- Fields: actor, action, target, occurred_at
- Relations: may reference Customer or FollowUpRecord
- Evidence: `ev_notes_inactive_unclear`, `ev_notes_export_unclear`
