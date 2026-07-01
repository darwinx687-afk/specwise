# 05 Open Questions

## High Priority

### Q1: Can managers view cross-department records?
- Category: permission
- Why it matters: This affects data scope, API filtering, and acceptance tests.
- Blocks: `perm_manager_view_group_employees`, `ac_manager_scope`
- Suggested owner: business_owner
- Related evidence: `ev_roles_md_manager`, `ev_employee_list_filters`

## Medium Priority

### Q2: What values are valid for employee status?
- Category: field
- Why it matters: This affects enum design, validation, and filters.
- Blocks: `field_employee_status`, `ac_employee_status_values`
- Suggested owner: product_manager
- Related evidence: `ev_employee_status_values`

### Q3: What is the employee status workflow?
- Category: workflow
- Why it matters: This affects state transitions and permission checks.
- Blocks: `wf_employee_status_maintenance`
- Suggested owner: product_manager
- Related evidence: `ev_employee_edit_button`

## Low Priority

### Q4: Should employee deletion be soft delete?
- Category: audit
- Why it matters: This affects data retention and audit implementation.
- Blocks: `asm_soft_delete`
- Suggested owner: admin
- Related evidence: none

