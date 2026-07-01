# 02 Entities

## Summary
- Detected entities: Employee, Department
- High-confidence entities: Employee
- Entities needing review: Department

## Entity: Employee
- Description: A staff member evaluated or managed within the system.
- Fields: employee_name, department, role, status
- Relations: belongs to Department, inferred from the department field.
- Evidence: `ev_employee_table_columns`
- Confidence: high
- Open questions: `q_employee_status_enum`

## Entity: Department
- Description: An organizational unit used to group employees.
- Fields: department_name
- Relations: has many Employees, inferred from Employee.department.
- Evidence: `ev_employee_table_columns`
- Confidence: medium
- Open questions: `q_manager_cross_department_access`

