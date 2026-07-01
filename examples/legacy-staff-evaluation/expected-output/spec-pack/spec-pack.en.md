# Legacy Staff Evaluation Admin System Developer Handoff

## Buildability Status
- Score: 72 / 100
- Status: Review Required

## What Was Detected

The source materials support five modules: Dashboard, Staff Management, Evaluation Records, Review Reports, and Permission Settings. The strongest evidence comes from mock screen text, CSV headers/rows, role notes, and workflow notes.

Core entities include Employee, Department, Group, EvaluationRecord, Role, Permission, User/Account, and AuditLog. Employee, Department, EvaluationRecord, Role, and Permission are high confidence. Group, User/Account, and AuditLog need review.

## What Can Be Implemented From This Spec

Developers can start modeling employees, departments, groups, evaluation records, roles, permissions, and audit logs. The first workflow pass can model draft, submitted, reviewed, approved, and rejected states, with guarded transitions for submit, review, approve, reject, edit, and export.

## What Still Requires Review

High-priority review is required for Department Manager cross-department visibility, Group Leader edits after submission, final approval authority, export permission, and whether approval is required before a record becomes final.

Medium-priority review is required for rejected-record return behavior, audit-log visibility, inactive employees in reports, and employee deactivation versus deletion.

## What Should Be Handed Off To A Coding Agent

Use `spec-pack.json` as the structured implementation context and `evidence-map.json` to trace claims back to source materials. Start with data models and permission scaffolding, then implement the evaluation review workflow behind explicit feature assumptions.

## What Should Not Be Assumed

Do not assume the legacy system should be automatically reconstructed. Do not assume export is safe for all managers. Do not assume Department Managers can view other departments. Do not assume submitted records can be edited. Do not treat soft delete, risk-level derivation, or audit-log visibility as confirmed facts.

## AI Coding Handoff Notes

This spec pack is suitable as a first-pass AI coding context, but it should not be treated as final implementation truth until the high-priority permission and workflow questions are reviewed.

