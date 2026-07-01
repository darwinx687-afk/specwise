# 04 Workflows

## Summary
- Detected workflows: Evaluation Review Workflow
- Confirmed states: draft, submitted, reviewed, approved, rejected
- Inferred states: final
- Main risks: approval authority, rejected-record return path, submitted-record edit behavior, audit visibility

## Workflow: Evaluation Review
- State path: draft -> submitted -> reviewed -> approved; rejected is an alternate return-for-revision outcome.
- Trigger: A Group Leader or Evaluator creates a draft evaluation record for an employee.
- Actors: Group Leader, Evaluator, Department Manager, President or Company Admin as possible final approver
- Steps:
  1. Group Leader or Evaluator saves a draft evaluation record.
  2. Group Leader or Evaluator submits the record for review.
  3. Department Manager reviews the submitted record.
  4. The record is either reviewed and later approved, or rejected and returned for revision.
  5. Final approval actor is unclear.
- States: draft, submitted, reviewed, approved, rejected
- Approval points: review by Department Manager is supported; final approval authority is unclear.
- Exceptions: rejected records may return for revision, but whether they return to draft is unclear. Submitted records may or may not be editable before review starts.
- Evidence: `ev_evaluation_status_labels`, `ev_evaluation_records_csv_states`, `ev_workflow_states`, `ev_workflow_unclear_rules`, `ev_evaluation_detail_actions`
- Open questions: `q_group_leader_edit_submitted`, `q_approval_authority`, `q_approval_required_final`, `q_rejected_return_to_draft`
