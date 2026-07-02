# Workflow Notes

Primary customer follow-up workflow:

```text
new customer
-> assigned
-> follow-up draft
-> submitted
-> manager reviewed
-> closed
↘ reopened
```

Notes:

- new customer can be imported or manually created.
- assigned means an owner sales rep is set.
- follow-up draft is created by Sales Rep.
- submitted should trigger manager review.
- manager reviewed may lead to closed.
- reopened means another action is needed, but transition target is unclear.

Unclear:

- reopened 后是否回到 draft 不确定。
- closed 后是否还能编辑不确定。
- overdue 是否自动提醒不确定。
- reassignment 是否需要主管审批不确定。
- inactive customer 是否还能创建 follow-up 不确定。
