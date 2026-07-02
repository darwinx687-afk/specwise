# Spec Pack 中文业务摘要

## 项目状态

- Buildability Score: 70 / 100
- Status: Review Required

## 系统概述

旧版客户跟进后台系统是一个 synthetic mock 场景，用来模拟客户、销售人员、客户分层、跟进记录、分配规则、报表和权限设置。

## 系统包含哪些模块？

当前识别到 Dashboard、Customer Management、Follow-up Records、Assignment Rules、Reports、Permission Settings 六个模块。

## 系统管理哪些数据？

系统主要管理 Customer、SalesRep、CustomerSegment、FollowUpRecord、AssignmentRule、Role、Permission 和 AuditLog 等数据。

## 谁能看什么、做什么？

角色包括 System Admin、Sales Director、Sales Manager、Sales Rep、Viewer。角色列表较清楚，但跨团队可见性、导出权限、标记 inactive 和重分配审批仍需确认。

## 业务流程怎么走？

核心流程是客户跟进生命周期：new customer -> assigned -> follow-up draft -> submitted -> manager reviewed -> closed，并可能 reopened。reopened 后回到哪个状态、提交后是否允许销售编辑仍不确定。

## 哪些地方需要确认？

高优先级问题包括：Sales Manager 是否可看跨团队客户、哪些角色可以导出、谁能标记客户 inactive、客户重分配是否需要主管审批、Sales Rep 是否能编辑已提交跟进记录、closed 后 reopened 如何处理。

## 是否可以进入开发？

该 pack 可以作为人工 review 和后续实现规划的上下文，但不应直接作为最终实现依据。权限和流程规则需要业务方确认。
