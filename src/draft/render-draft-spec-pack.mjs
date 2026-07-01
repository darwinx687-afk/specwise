import fs from "node:fs";
import path from "node:path";

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function confidenceLine(item) {
  return `- Confidence: ${item.confidence ?? "low"}\n- Needs review: ${item.needsReview ?? true}`;
}

function renderModules(draft) {
  const { specPack, generatedNote } = draft;
  const lines = [
    "# 01 Modules",
    "",
    generatedNote,
    "",
    "## Summary",
    `- Detected modules: ${specPack.modules.map((module) => module.name).join(", ") || "none"}`,
    "- Status: Review Required",
    "- Main risks: deterministic module detection requires human review.",
    ""
  ];

  for (const module of specPack.modules) {
    lines.push(`## Module: ${module.name}`);
    lines.push(`- Purpose: ${module.description}`);
    lines.push(`- Pages: ${module.pages.join(", ") || "none"}`);
    lines.push("- Main actions: review detected pages and source materials");
    lines.push(`- Evidence: ${module.evidenceIds.join(", ") || "none"}`);
    lines.push(confidenceLine(module));
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderEntities(draft) {
  const { specPack, generatedNote } = draft;
  const lines = [
    "# 02 Entities",
    "",
    generatedNote,
    "",
    "## Summary",
    `- Detected entities: ${specPack.entities.map((entity) => entity.name).join(", ") || "none"}`,
    "- All entity and field meanings require human review.",
    ""
  ];

  for (const entity of specPack.entities) {
    lines.push(`## Entity: ${entity.name}`);
    lines.push(`- Description: ${entity.description}`);
    lines.push(`- Fields: ${entity.fields.join(", ") || "none"}`);
    lines.push(`- Relations: ${entity.relations.length ? entity.relations.map((relation) => `${relation.type} ${relation.targetEntityId}`).join(", ") : "none detected"}`);
    lines.push(`- Evidence: ${entity.evidenceIds.join(", ") || "none"}`);
    lines.push(confidenceLine(entity));
    lines.push(`- Open questions: ${(entity.openQuestionIds ?? []).join(", ") || "none"}`);
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderPermissions(draft) {
  const { specPack, generatedNote } = draft;
  const lines = [
    "# 03 Permissions",
    "",
    generatedNote,
    "",
    "## Summary",
    `- Detected roles: ${specPack.roles.map((role) => role.name).join(", ") || "none"}`,
    "- Permission confidence: conservative by default.",
    "- Main blockers: role actions, data scopes, export, configure, and approve rules require review.",
    ""
  ];

  for (const role of specPack.roles) {
    const rolePermissions = specPack.permissions.filter((permission) => permission.roleId === role.id);
    lines.push(`## Role: ${role.name}`);
    lines.push(`- Data scope: ${role.scope}`);
    lines.push(`- Description: ${role.description}`);
    lines.push(`- Candidate permissions: ${rolePermissions.map((permission) => `${permission.action} ${permission.resourceType}`).join(", ") || "none"}`);
    lines.push(`- Evidence: ${role.evidenceIds.join(", ") || "none"}`);
    lines.push(confidenceLine(role));
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderWorkflows(draft) {
  const { specPack, generatedNote } = draft;
  const lines = [
    "# 04 Workflows",
    "",
    generatedNote,
    "",
    "## Summary",
    `- Detected workflows: ${specPack.workflows.map((workflow) => workflow.name).join(", ") || "none"}`,
    "- Workflow transitions are draft candidates only.",
    ""
  ];

  for (const workflow of specPack.workflows) {
    lines.push(`## Workflow: ${workflow.name}`);
    lines.push(`- Trigger: ${workflow.trigger}`);
    lines.push(`- Actors: ${workflow.actors.join(", ") || "unknown"}`);
    lines.push(`- States: ${workflow.states.join(", ") || "unknown"}`);
    lines.push("- Steps:");
    for (const step of workflow.steps) {
      lines.push(`  - ${step.fromState} -> ${step.toState}: ${step.name} (${step.confidence})`);
    }
    lines.push("- Approval points: detected approval/review steps require confirmation.");
    lines.push("- Exceptions: rejected paths and edit-after-submit behavior require review if present.");
    lines.push(`- Evidence: ${workflow.evidenceIds.join(", ") || "none"}`);
    lines.push(`- Open questions: ${(workflow.openQuestionIds ?? []).join(", ") || "none"}`);
    lines.push(confidenceLine(workflow));
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderQuestions(draft) {
  const { specPack, generatedNote } = draft;
  const priorityGroups = ["high", "medium", "low"];
  const lines = ["# 05 Open Questions", "", generatedNote, ""];

  for (const priority of priorityGroups) {
    const questions = specPack.openQuestions.filter((question) => question.priority === priority);
    lines.push(`## ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`);
    lines.push("");
    if (questions.length === 0) {
      lines.push("- None detected.");
      lines.push("");
      continue;
    }
    for (const question of questions) {
      lines.push(`### ${question.id}: ${question.question}`);
      lines.push(`- Category: ${question.category}`);
      lines.push(`- Why it matters: ${question.whyItMatters}`);
      lines.push(`- Blocks: ${question.blockedItems.join(", ") || "none"}`);
      lines.push(`- Suggested owner: ${question.suggestedOwner}`);
      lines.push(`- Related evidence: ${(question.evidenceIds ?? []).join(", ") || "none"}`);
      lines.push("");
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderAcceptance(draft) {
  const { specPack, generatedNote } = draft;
  const lines = [
    "# 06 Acceptance Criteria",
    "",
    generatedNote,
    "",
    "## Draft Acceptance Criteria",
    ""
  ];

  for (const criterion of specPack.acceptanceCriteria) {
    lines.push(`### ${criterion.id}: ${criterion.title}`);
    lines.push(`- Priority: ${criterion.priority}`);
    lines.push(`- Expected behavior: ${criterion.description}`);
    lines.push("- Test idea: convert this reviewed criterion into an implementation test after human confirmation.");
    lines.push(`- Related question: ${(criterion.relatedQuestionIds ?? []).join(", ") || "none"}`);
    lines.push(`- Needs review: ${criterion.needsReview}`);
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderBuildability(draft) {
  const { specPack, generatedNote } = draft;
  const buildability = specPack.buildability;
  const lines = [
    "# Buildability Report",
    "",
    generatedNote,
    "",
    "## Overall Score",
    `Buildability Score: ${buildability.score} / 100`,
    "Status: Review Required",
    "",
    "## Dimension Scores",
    `- Module Clarity: ${buildability.dimensionScores.moduleClarity} / 15`,
    `- Entity Clarity: ${buildability.dimensionScores.entityClarity} / 15`,
    `- Field Clarity: ${buildability.dimensionScores.fieldClarity} / 15`,
    `- Permission Clarity: ${buildability.dimensionScores.permissionClarity} / 15`,
    `- Workflow Clarity: ${buildability.dimensionScores.workflowClarity} / 15`,
    `- Evidence Coverage: ${buildability.dimensionScores.evidenceCoverage} / 15`,
    `- Ambiguity Control: ${buildability.dimensionScores.ambiguityControl} / 10`,
    "",
    "## Main Blockers"
  ];

  buildability.mainBlockers.forEach((blocker, index) => lines.push(`${index + 1}. ${blocker}`));
  lines.push("", "## Recommended Next Actions");
  buildability.recommendedNextActions.forEach((action, index) => lines.push(`${index + 1}. ${action}`));

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderSummaryZh(draft) {
  const { specPack, generatedNoteZh } = draft;
  return `# Spec Pack 中文草案

${generatedNoteZh}

## 项目状态
- Buildability Score: ${specPack.buildability.score} / 100
- Status: Review Required
- Generator: deterministic_no_ai

## 识别到的内容

本草案基于输入材料清单、CSV headers、mock screenshot text 和 notes headings 生成。当前识别到 ${specPack.modules.length} 个模块、${specPack.entities.length} 个实体、${specPack.roles.length} 个角色和 ${specPack.workflows.length} 个流程候选。

## 需要确认

所有推断内容都需要人工确认，尤其是权限、导出、审批、工作流状态和数据范围。该草案不能作为最终实现事实。
`;
}

function renderSummaryEn(draft) {
  const { specPack, generatedNote } = draft;
  return `# Spec Pack Draft

${generatedNote}

## Buildability Status
- Score: ${specPack.buildability.score} / 100
- Status: Review Required
- Generator mode: deterministic_no_ai

## Detected Draft Scope

The deterministic draft detected ${specPack.modules.length} module candidates, ${specPack.entities.length} entity candidates, ${specPack.roles.length} role candidates, and ${specPack.workflows.length} workflow candidate(s).

## Review Notes

This draft is a safe baseline, not final implementation truth. It should be reviewed before any AI coding or application implementation work begins.
`;
}

export function writeDraftSpecPack(draft, outputFolder) {
  const specPackFolder = path.join(outputFolder, "spec-pack");
  fs.mkdirSync(specPackFolder, { recursive: true });

  const files = {
    "01_modules.md": renderModules(draft),
    "02_entities.md": renderEntities(draft),
    "03_permissions.md": renderPermissions(draft),
    "04_workflows.md": renderWorkflows(draft),
    "05_questions.md": renderQuestions(draft),
    "06_acceptance.md": renderAcceptance(draft),
    "buildability-report.md": renderBuildability(draft),
    "spec-pack.zh-CN.md": renderSummaryZh(draft),
    "spec-pack.en.md": renderSummaryEn(draft)
  };

  for (const [fileName, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(specPackFolder, fileName), content);
  }

  writeJson(path.join(specPackFolder, "spec-pack.json"), draft.specPack);
  writeJson(path.join(specPackFolder, "evidence-map.json"), draft.evidenceMap);
}

