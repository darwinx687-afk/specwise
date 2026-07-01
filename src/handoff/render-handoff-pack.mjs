import fs from "node:fs";
import { fromRoot } from "../utils/paths.mjs";

function line(value, fallback = "none") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function needsReviewText(value) {
  return value ? "needsReview" : "confirmed";
}

function renderEvidenceIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return "none";
  return ids.join(", ");
}

function renderQuestionsForIds(specPack, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return "none";
  const questions = new Map((specPack.openQuestions || []).map((question) => [question.id, question.question]));
  return ids.map((id) => `${id}: ${questions.get(id) || "question text unavailable"}`).join("; ");
}

function statusLabel(manifest) {
  if (manifest.gates.handoffType === "blocked_handoff") return "Blocked Handoff";
  if (manifest.gates.handoffType === "implementation_candidate") return "Implementation Candidate";
  return "Review Required";
}

function readHandoffTemplate(...segments) {
  return fs.readFileSync(fromRoot("templates", "handoff", ...segments), "utf8").trimEnd();
}

function applyTemplate(template, values) {
  let output = template;
  for (const [key, value] of Object.entries(values)) {
    output = output.replaceAll(`{{${key}}}`, value);
  }
  return `${output}\n`;
}

function sharedTemplateValues() {
  return {
    sharedSafetyNotice: readHandoffTemplate("shared", "safety-notice.md"),
    openQuestionPolicy: readHandoffTemplate("shared", "open-question-policy.md"),
    permissionPolicy: readHandoffTemplate("shared", "permission-policy.md"),
    implementationBoundary: readHandoffTemplate("shared", "implementation-boundary.md")
  };
}

function isPermissionQuestion(question) {
  const text = JSON.stringify(question).toLowerCase();
  return question.category === "permission" || text.includes("permission") || text.includes("export") || text.includes("approve") || text.includes("delete") || text.includes("configure") || text.includes("cross-department");
}

function isWorkflowQuestion(question) {
  const text = JSON.stringify(question).toLowerCase();
  return question.category === "workflow" || text.includes("workflow") || text.includes("submitted") || text.includes("review") || text.includes("approval");
}

function summarizeTopItems(items, renderItem, emptyText) {
  if (!Array.isArray(items) || items.length === 0) return `- ${emptyText}`;
  return items.slice(0, 8).map(renderItem).join("\n");
}

function renderAgentBlockerSummary({ specPack, manualApplyPlan }) {
  const questions = specPack.openQuestions || [];
  const blockedItems = manualApplyPlan.blockedItems || [];
  const permissionQuestions = questions.filter(isPermissionQuestion);
  const workflowQuestions = questions.filter(isWorkflowQuestion);

  return [
    `- Open questions: ${questions.length}`,
    `- Manual apply plan blocked items: ${blockedItems.length}`,
    `- Permission review items: ${permissionQuestions.length}`,
    `- Workflow review items: ${workflowQuestions.length}`,
    "",
    "### Manual Apply Plan Blockers",
    "",
    summarizeTopItems(
      blockedItems,
      (item) => `- ${item.sourceCandidateId}: ${item.reason} Required owner: ${item.requiredOwner}.`,
      "No manual apply plan blockers detected."
    ),
    "",
    "### High-Priority Open Questions",
    "",
    summarizeTopItems(
      questions.filter((question) => question.priority === "high"),
      (question) => `- ${question.id}: ${question.question}`,
      "No high-priority open questions detected."
    ),
    "",
    "### Permission Review Items",
    "",
    summarizeTopItems(
      permissionQuestions,
      (question) => `- ${question.id}: ${question.question}`,
      "No permission review items detected."
    ),
    "",
    "### Workflow Review Items",
    "",
    summarizeTopItems(
      workflowQuestions,
      (question) => `- ${question.id}: ${question.question}`,
      "No workflow review items detected."
    )
  ].join("\n");
}

export function renderPackReadme({ manifest }) {
  return `${[
    "# SpecWise Agent Handoff Pack Skeleton",
    "",
    "This pack prepares reviewed SpecWise context for future AI coding agents.",
    "",
    "## Current Status",
    "",
    `- Handoff type: ${manifest.gates.handoffType}`,
    `- Implementation allowed: ${manifest.gates.implementationAllowed}`,
    `- Status: ${statusLabel(manifest)}`,
    "",
    "## What This Pack Is",
    "",
    "- Reviewed context package",
    "- Evidence-aware business/spec context",
    "- Discovery handoff when blockers remain",
    "",
    "## What This Pack Is Not",
    "",
    "- Not an implementation instruction",
    "- Not a final spec-pack",
    "- Not an agent execution request",
    "- Not a code generation request",
    "",
    "## Start Here",
    "",
    "1. `00_agent-instructions.md`",
    "2. `07_open-questions.md`",
    "3. `09_implementation-boundaries.md`",
    "4. `10_manual-apply-plan-summary.md`",
    "",
    "## Safety",
    "",
    `- No agent calls made: ${manifest.safety.noAgentCallsMade}`,
    `- No auto implementation: ${manifest.safety.noAutoImplementation}`,
    `- No final spec-pack generated: ${manifest.safety.noFinalSpecPackGenerated}`,
    "",
    "本 handoff pack 只用于未来 AI coding agent 的上下文准备，不会调用 agent，也不会生成代码。",
    "",
    "## Machine Artifacts",
    "",
    "- machine/spec-pack.json",
    "- machine/evidence-map.json",
    "- `machine/buildability-report.md`",
    "- `machine/manual-apply-plan.json`"
  ].join("\n")}\n`;
}

export function renderAgentInstructions() {
  return `${[
    "# Agent Instructions",
    "",
    "You are receiving a SpecWise handoff pack.",
    "",
    "Do not implement unresolved business rules.",
    "Do not turn assumptions into facts.",
    "Do not remove review_required labels.",
    "Do not bypass permission questions.",
    "Do not assume missing approval/export/delete/configure rules.",
    "Do not generate production-ready claims from incomplete materials.",
    "",
    "Start by reading:",
    "1. 07_open-questions.md",
    "2. 09_implementation-boundaries.md",
    "3. 06_acceptance-criteria.md"
  ].join("\n")}\n`;
}

export function renderProjectContext({ specPack, manifest }) {
  const project = specPack.project || {};
  const materials = Array.isArray(specPack.sourceMaterials) ? specPack.sourceMaterials : [];
  const blockers = Array.isArray(specPack.buildability?.mainBlockers) ? specPack.buildability.mainBlockers : [];

  const lines = [
    "# Project Context",
    "",
    `- Project name: ${line(project.name || project.nameZh || project.id)}`,
    `- Spec-pack status: ${manifest.source.specPackStatus}`,
    `- Buildability score: ${manifest.source.buildabilityScore}`,
    `- Handoff type: ${manifest.gates.handoffType}`,
    `- Implementation allowed: ${manifest.gates.implementationAllowed}`,
    "",
    "## Source Material Summary",
    ""
  ];

  if (materials.length === 0) {
    lines.push("- No source materials listed in spec-pack.json.");
  } else {
    for (const material of materials) {
      lines.push(`- ${line(material.id)}: ${line(material.type)} (${line(material.description || material.name)})`);
    }
  }

  lines.push("", "## Buildability Blockers", "");
  if (blockers.length === 0) {
    lines.push("- No buildability blockers listed.");
  } else {
    for (const blocker of blockers) lines.push(`- ${blocker}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderModulesAndPages({ specPack }) {
  const lines = ["# Modules And Pages", ""];
  const pages = new Map((specPack.pages || []).map((page) => [page.id, page]));

  for (const module of specPack.modules || []) {
    lines.push(`## ${module.name || module.id}`);
    lines.push("");
    lines.push(`- ID: ${module.id}`);
    lines.push(`- Chinese name: ${line(module.nameZh)}`);
    lines.push(`- Description: ${line(module.description)}`);
    lines.push(`- Review state: ${needsReviewText(module.needsReview)}`);
    lines.push(`- Evidence: ${renderEvidenceIds(module.evidenceIds)}`);
    lines.push("- Pages:");
    for (const pageId of module.pages || []) {
      const page = pages.get(pageId);
      lines.push(`  - ${pageId}: ${line(page?.name || page?.title || page?.nameZh)}`);
    }
    if (!Array.isArray(module.pages) || module.pages.length === 0) lines.push("  - none");
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function renderEntitiesAndFields({ specPack }) {
  const fields = new Map((specPack.fields || []).map((field) => [field.id, field]));
  const lines = ["# Entities And Fields", ""];

  for (const entity of specPack.entities || []) {
    lines.push(`## ${entity.name || entity.id}`);
    lines.push("");
    lines.push(`- ID: ${entity.id}`);
    lines.push(`- Chinese name: ${line(entity.nameZh)}`);
    lines.push(`- Description: ${line(entity.description)}`);
    lines.push(`- Review state: ${needsReviewText(entity.needsReview)}`);
    lines.push(`- Open questions: ${renderQuestionsForIds(specPack, entity.openQuestionIds)}`);
    lines.push(`- Evidence: ${renderEvidenceIds(entity.evidenceIds)}`);
    lines.push("");
    lines.push("### Fields");
    for (const fieldId of entity.fields || []) {
      const field = fields.get(fieldId);
      lines.push(`- ${fieldId}: ${line(field?.name || field?.label || field?.nameZh)}; type=${line(field?.type)}; ${needsReviewText(field?.needsReview)}`);
    }
    if (!Array.isArray(entity.fields) || entity.fields.length === 0) lines.push("- none");
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function renderPermissionsAndScopes({ specPack }) {
  const lines = [
    "# Permissions And Scopes",
    "",
    "Permissions must not be inferred. Items marked needsReview require confirmation.",
    ""
  ];

  for (const permission of specPack.permissions || []) {
    lines.push(`## ${permission.id}`);
    lines.push("");
    lines.push(`- Role: ${line(permission.roleId)}`);
    lines.push(`- Resource: ${line(permission.resourceType)}`);
    lines.push(`- Action: ${line(permission.action)}`);
    lines.push(`- Data scope: ${line(permission.dataScope)}`);
    lines.push(`- Condition: ${line(permission.condition)}`);
    lines.push(`- Review state: ${needsReviewText(permission.needsReview)}`);
    lines.push(`- Open questions: ${renderQuestionsForIds(specPack, permission.openQuestionIds)}`);
    lines.push(`- Evidence: ${renderEvidenceIds(permission.evidenceIds)}`);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function renderWorkflowsAndStates({ specPack }) {
  const lines = [
    "# Workflows And States",
    "",
    "Uncertain transitions must stay marked. Do not implement unresolved workflow rules.",
    ""
  ];

  for (const workflow of specPack.workflows || []) {
    lines.push(`## ${workflow.name || workflow.id}`);
    lines.push("");
    lines.push(`- ID: ${workflow.id}`);
    lines.push(`- Trigger: ${line(workflow.trigger)}`);
    lines.push(`- Actors: ${Array.isArray(workflow.actors) ? workflow.actors.join(", ") : "none"}`);
    lines.push(`- States: ${Array.isArray(workflow.states) ? workflow.states.join(", ") : "none"}`);
    lines.push(`- Review state: ${needsReviewText(workflow.needsReview)}`);
    lines.push(`- Open questions: ${renderQuestionsForIds(specPack, workflow.openQuestionIds)}`);
    lines.push(`- Evidence: ${renderEvidenceIds(workflow.evidenceIds)}`);
    lines.push("");
    lines.push("### Steps");
    for (const step of workflow.steps || []) {
      const uncertainty = step.confidence === "low" || workflow.needsReview ? "uncertain transition" : "reviewed transition";
      lines.push(`- ${step.id}: ${line(step.fromState)} -> ${line(step.toState)} via ${line(step.action)} (${uncertainty}; confidence=${line(step.confidence)})`);
    }
    if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) lines.push("- none");
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function renderAcceptanceCriteria({ specPack }) {
  const lines = ["# Acceptance Criteria", ""];
  for (const criterion of specPack.acceptanceCriteria || []) {
    lines.push(`## ${criterion.title || criterion.id}`);
    lines.push("");
    lines.push(`- ID: ${criterion.id}`);
    lines.push(`- Category: ${line(criterion.category)}`);
    lines.push(`- Priority: ${line(criterion.priority)}`);
    lines.push(`- Description: ${line(criterion.description)}`);
    lines.push(`- Review state: ${needsReviewText(criterion.needsReview)}`);
    lines.push(`- Related questions: ${renderQuestionsForIds(specPack, criterion.relatedQuestionIds)}`);
    lines.push(`- Evidence: ${renderEvidenceIds(criterion.evidenceIds)}`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

export function renderOpenQuestions({ specPack, manualApplyPlan }) {
  const questions = specPack.openQuestions || [];
  const blockedItems = manualApplyPlan.blockedItems || [];
  const businessSteps = (manualApplyPlan.manualSteps || []).filter((step) => step.requiresBusinessConfirmation);
  const permissionQuestions = questions.filter((question) => question.category === "permission" || JSON.stringify(question).toLowerCase().includes("permission"));
  const workflowQuestions = questions.filter((question) => question.category === "workflow" || JSON.stringify(question).toLowerCase().includes("workflow"));

  const lines = [
    "# Open Questions And Blockers",
    "",
    "Open questions must stay visible. Do not implement unresolved business rules.",
    "",
    "## Spec-Pack Open Questions",
    ""
  ];

  if (questions.length === 0) {
    lines.push("- No unresolved questions detected.");
  } else {
    for (const question of questions) {
      lines.push(`### ${question.id}`);
      lines.push(`- Priority: ${line(question.priority)}`);
      lines.push(`- Category: ${line(question.category)}`);
      lines.push(`- Question: ${line(question.question)}`);
      lines.push(`- Owner: ${line(question.suggestedOwner)}`);
      lines.push(`- Why it matters: ${line(question.whyItMatters)}`);
      lines.push(`- Evidence: ${renderEvidenceIds(question.evidenceIds)}`);
      lines.push("");
    }
  }

  lines.push("", "## Manual Apply Plan Blocked Items", "");
  if (blockedItems.length === 0) {
    lines.push("- No manual apply plan blocked items detected.");
  } else {
    for (const item of blockedItems) {
      lines.push(`- ${item.sourceCandidateId}: ${item.reason} Owner: ${item.requiredOwner}. Follow-up: ${line(item.suggestedFollowUpQuestion)}`);
    }
  }

  lines.push("", "## Business Confirmation Items", "");
  if (businessSteps.length === 0) {
    lines.push("- No business confirmation items detected.");
  } else {
    for (const step of businessSteps) {
      lines.push(`- ${step.sourceCandidateId}: ${step.description}`);
    }
  }

  lines.push("", "## Permission Blockers", "");
  if (permissionQuestions.length === 0) {
    lines.push("- No permission blockers detected.");
  } else {
    for (const question of permissionQuestions) lines.push(`- ${question.id}: ${question.question}`);
  }

  lines.push("", "## Workflow Blockers", "");
  if (workflowQuestions.length === 0) {
    lines.push("- No workflow blockers detected.");
  } else {
    for (const question of workflowQuestions) lines.push(`- ${question.id}: ${question.question}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderEvidenceMapSummary({ evidenceMap }) {
  const evidenceItems = evidenceMap.evidenceItems || [];
  const claimMappings = evidenceMap.claimMappings || [];
  const coverage = evidenceMap.coverageSummary || {};
  const lines = [
    "# Evidence Map Summary",
    "",
    `- Evidence item count: ${evidenceItems.length}`,
    `- Claim mapping count: ${claimMappings.length}`,
    `- Coverage summary: ${JSON.stringify(coverage)}`,
    "",
    "Evidence IDs should remain linked. Claims without evidence cannot become implementation facts.",
    "",
    "## Evidence Items",
    ""
  ];

  for (const item of evidenceItems) {
    lines.push(`- ${item.id}: ${line(item.quoteOrDescription)} Reliability: ${line(item.reliability)}.`);
  }
  if (evidenceItems.length === 0) lines.push("- None.");

  return `${lines.join("\n")}\n`;
}

export function renderImplementationBoundaries({ manifest }) {
  return `${[
    "# Implementation Boundaries",
    "",
    "Implementation is not authorized for unresolved high-priority questions.",
    "Permissions must not be inferred.",
    "Export / approve / delete / configure rules require explicit confirmation.",
    "Assumptions must stay marked.",
    "",
    "## Phase 10B Gate",
    "",
    `- Handoff type: ${manifest.gates.handoffType}`,
    `- Implementation allowed: ${manifest.gates.implementationAllowed}`,
    `- Blocked by open questions: ${manifest.gates.blockedByOpenQuestions}`,
    `- Blocked by manual apply plan: ${manifest.gates.blockedByManualApplyPlan}`,
    `- Blocked by low buildability: ${manifest.gates.blockedByLowBuildability}`,
    `- Blocked by high-risk permissions: ${manifest.gates.blockedByHighRiskPermissions}`,
    "",
    "This pack prepares context only. It does not authorize implementation."
  ].join("\n")}\n`;
}

export function renderManualApplyPlanSummary({ manualApplyPlan }) {
  const lines = [
    "# Manual Apply Plan Summary",
    "",
    "This summary is for review context only. It is not an implementation task list.",
    "",
    "## Summary",
    "",
    `- Total reviewed items: ${manualApplyPlan.summary?.totalReviewedItems ?? 0}`,
    `- Safe to apply manually: ${manualApplyPlan.summary?.safeToApplyManually ?? 0}`,
    `- Needs business confirmation: ${manualApplyPlan.summary?.needsBusinessConfirmation ?? 0}`,
    `- Deferred: ${manualApplyPlan.summary?.deferred ?? 0}`,
    `- Do not apply: ${manualApplyPlan.summary?.doNotApply ?? 0}`,
    `- Blocks final spec: ${manualApplyPlan.summary?.blocksFinalSpec === true}`,
    "",
    "## Manual Steps",
    ""
  ];

  for (const step of manualApplyPlan.manualSteps || []) {
    lines.push(`- ${step.id}: ${step.action}; ${step.description}; autoApplyAllowed=${step.autoApplyAllowed}`);
  }
  if (!Array.isArray(manualApplyPlan.manualSteps) || manualApplyPlan.manualSteps.length === 0) lines.push("- None.");

  return `${lines.join("\n")}\n`;
}

export function renderAgentSpecific({ target, specPack, manualApplyPlan }) {
  const template = readHandoffTemplate("agent-specific", `${target}.md`);
  return applyTemplate(template, {
    ...sharedTemplateValues(),
    implementationBlockers: renderAgentBlockerSummary({ specPack, manualApplyPlan })
  });
}
