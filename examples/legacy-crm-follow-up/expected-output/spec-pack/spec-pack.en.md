# Spec Pack Developer Handoff

## Buildability Status

- Score: 70 / 100
- Status: Review Required

## System Summary

Legacy CRM Follow-up Admin System is a synthetic internal CRM scenario for managing customers, sales reps, customer segments, follow-up records, assignment rules, reports, and permission settings.

## Modules

The expected modules are Dashboard, Customer Management, Follow-up Records, Assignment Rules, Reports, and Permission Settings.

## Entities

The main entities are Customer, SalesRep, CustomerSegment, FollowUpRecord, AssignmentRule, Role, Permission, and AuditLog.

## Permissions

The role list is clear: System Admin, Sales Director, Sales Manager, Sales Rep, and Viewer. The exact data scope and export authority still need review.

## Workflows

The main workflow is customer follow-up lifecycle: new customer, assigned, follow-up draft, submitted, manager reviewed, closed, and reopened. Reopened behavior and submitted-record edit access require confirmation.

## Open Questions

The highest-risk questions cover cross-team visibility, export permission, inactive marking, reassignment approval, submitted-record edit behavior, and reopened follow-up behavior.

## Acceptance Criteria

Acceptance criteria focus on manager scope, export authority, follow-up transitions, submitted edit behavior, assignment queue behavior, and synthetic data safety.

## Handoff Notes

Use this pack as review-required implementation planning context only. Confirm permission and workflow questions before coding any production CRM behavior.
