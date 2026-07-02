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

function textMatches(value, terms) {
  const text = JSON.stringify(value).toLowerCase();
  return terms.some((term) => text.includes(term));
}

function isDataQuestion(question) {
  return question.category === "data" || question.category === "entity" || textMatches(question, ["entity", "field", "enum", "relationship", "foreign key", "data"]);
}

function isAssignmentQuestion(question) {
  return textMatches(question, ["assignment", "assign", "owner", "ownership", "manager", "reviewer"]);
}

function isExportApprovalInactiveQuestion(question) {
  return textMatches(question, ["export", "approve", "approval", "inactive", "deactivate", "delete", "reassign", "reassignment"]);
}

function renderQuestionGroup(title, questions) {
  const lines = [`## ${title}`, ""];
  if (questions.length === 0) {
    lines.push("- No questions detected in this group.", "");
    return lines;
  }

  for (const question of questions) {
    lines.push(`### ${question.id}`);
    lines.push(`- Priority: ${line(question.priority)}`);
    lines.push(`- Category: ${line(question.category)}`);
    lines.push(`- Question: ${line(question.question)}`);
    lines.push(`- Suggested owner: ${line(question.suggestedOwner)}`);
    lines.push(`- Why it matters: ${line(question.whyItMatters)}`);
    lines.push(`- Evidence: ${renderEvidenceIds(question.evidenceIds)}`);
    lines.push("");
  }
  return lines;
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

export function renderPackReadme({ manifest, specPack = {}, manualApplyPlan = {} }) {
  const openQuestionCount = Array.isArray(specPack.openQuestions) ? specPack.openQuestions.length : 0;
  const blockedItemCount = Array.isArray(manualApplyPlan.blockedItems) ? manualApplyPlan.blockedItems.length : 0;
  const manualApplyPlanPresent = manualApplyPlan.mode === "manual_apply_plan_only" || Array.isArray(manualApplyPlan.manualSteps);

  return `${[
    "# SpecWise Agent Handoff Pack Skeleton",
    "",
    "This pack prepares reviewed SpecWise context for future AI coding agents.",
    "It is not an implementation request.",
    "It is not a final spec-pack.",
    "",
    "## Status Summary",
    "",
    `- Handoff type: ${manifest.gates.handoffType}`,
    `- Implementation allowed: ${manifest.gates.implementationAllowed}`,
    `- Spec status: ${line(manifest.source.specPackStatus)}`,
    `- Buildability score: ${line(manifest.source.buildabilityScore)}`,
    `- Open questions: ${openQuestionCount}`,
    `- Blocked items: ${blockedItemCount}`,
    `- Manual apply plan present: ${manualApplyPlanPresent}`,
    `- Handoff status: ${statusLabel(manifest)}`,
    "",
    "## Start Here",
    "",
    "1. `00_agent-instructions.md`",
    "2. `07_open-questions.md`",
    "3. `09_implementation-boundaries.md`",
    "4. `10_manual-apply-plan-summary.md`",
    "5. `06_acceptance-criteria.md`",
    "",
    "## What This Pack Is",
    "",
    "- Reviewed context package",
    "- Evidence-aware business/spec context",
    "- Discovery handoff when blockers remain",
    "- Human-readable context for future planning",
    "",
    "## What This Pack Is Not",
    "",
    "- Not an instruction to implement",
    "- Not a final spec-pack",
    "- Not an agent execution request",
    "- Not a code generation request",
    "- Not permission to infer missing business rules",
    "",
    "## Safety",
    "",
    `- No agent calls made: ${manifest.safety.noAgentCallsMade}`,
    `- No auto implementation: ${manifest.safety.noAutoImplementation}`,
    `- No final spec-pack generated: ${manifest.safety.noFinalSpecPackGenerated}`,
    "",
    "本 handoff pack 只用于上下文准备，不授权实现，不生成代码。",
    "",
    "## Source Artifacts",
    "",
    "- `machine/spec-pack.json`",
    "- `machine/evidence-map.json`",
    "- `machine/buildability-report.md`",
    "- `machine/manual-apply-plan.json`",
    "- `machine/README.md`"
  ].join("\n")}\n`;
}

export function renderAgentInstructions() {
  return `${[
    "# Agent Instructions",
    "",
    "You are receiving a SpecWise handoff pack.",
    "",
    "## Non-negotiable Boundaries",
    "",
    "- Do not implement unresolved business rules.",
    "- Do not turn assumptions into facts.",
    "- Do not remove `review_required` labels.",
    "- Do not bypass permission questions.",
    "- Do not infer approval/export/delete/configure rules.",
    "- Do not generate production-ready claims from incomplete materials.",
    "",
    "## Required Reading Order",
    "",
    "1. `07_open-questions.md`",
    "2. `09_implementation-boundaries.md`",
    "3. `04_permissions-and-scopes.md`",
    "4. `06_acceptance-criteria.md`",
    "5. `10_manual-apply-plan-summary.md`",
    "",
    "## Before Any Future Implementation Planning",
    "",
    "- Identify unresolved questions.",
    "- Identify permission blockers.",
    "- Identify workflow blockers.",
    "- Ask the user for explicit confirmation before planning code."
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
  const remainingQuestions = [...questions];
  const takeQuestions = (predicate) => {
    const matched = remainingQuestions.filter(predicate);
    for (const question of matched) {
      const index = remainingQuestions.indexOf(question);
      if (index >= 0) remainingQuestions.splice(index, 1);
    }
    return matched;
  };
  const highPriorityPermissionQuestions = takeQuestions((question) => question.priority === "high" && isPermissionQuestion(question));
  const workflowQuestions = takeQuestions(isWorkflowQuestion);
  const dataQuestions = takeQuestions(isDataQuestion);
  const assignmentQuestions = takeQuestions(isAssignmentQuestion);
  const exportApprovalInactiveQuestions = takeQuestions(isExportApprovalInactiveQuestion);
  const otherQuestions = remainingQuestions;

  const lines = [
    "# Open Questions",
    "",
    "Open questions must remain visible.",
    "They must not be converted into implementation facts.",
    "",
    ...renderQuestionGroup("High Priority Permission / Scope Questions", highPriorityPermissionQuestions),
    ...renderQuestionGroup("Workflow / State Questions", workflowQuestions),
    ...renderQuestionGroup("Data / Entity Questions", dataQuestions),
    ...renderQuestionGroup("Assignment / Ownership Questions", assignmentQuestions),
    ...renderQuestionGroup("Export / Approval / Inactive / Reassignment Questions", exportApprovalInactiveQuestions),
    ...renderQuestionGroup("Other Questions", otherQuestions),
    "## Questions from Manual Apply Plan",
    ""
  ];

  if (blockedItems.length === 0) {
    lines.push("- No manual apply plan blocked questions detected.");
  } else {
    for (const item of blockedItems) {
      lines.push(`- ${item.sourceCandidateId}: ${item.reason} Owner: ${item.requiredOwner}. Follow-up: ${line(item.suggestedFollowUpQuestion)}`);
    }
  }

  lines.push("", "## Suggested Confirmation Owners", "");
  const ownerCounts = new Map();
  for (const question of questions) {
    const owner = line(question.suggestedOwner, "business_owner");
    ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1);
  }
  for (const step of businessSteps) {
    const owner = line(step.suggestedOwner, "business_owner");
    ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1);
  }
  for (const item of blockedItems) {
    const owner = line(item.requiredOwner, "business_owner");
    ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1);
  }

  if (ownerCounts.size === 0) {
    lines.push("- Business owner: none detected");
    lines.push("- System admin: none detected");
    lines.push("- Department/team manager: none detected");
    lines.push("- Developer/FDE reviewer: none detected");
  } else {
    lines.push(`- Business owner: ${ownerCounts.get("business_owner") || 0}`);
    lines.push(`- System admin: ${ownerCounts.get("system_admin") || 0}`);
    lines.push(`- Department/team manager: ${(ownerCounts.get("department_manager") || 0) + (ownerCounts.get("team_manager") || 0)}`);
    lines.push(`- Developer/FDE reviewer: ${(ownerCounts.get("developer_reviewer") || 0) + (ownerCounts.get("fde_reviewer") || 0) + (ownerCounts.get("review_owner") || 0)}`);
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
    "",
    "## Permission Boundaries",
    "",
    "- Export rules require explicit confirmation.",
    "- Approval rules require explicit confirmation.",
    "- Delete / inactive / reassignment rules require explicit confirmation.",
    "- Cross-team / cross-department / cross-company access must not be inferred.",
    "",
    "## Workflow Boundaries",
    "",
    "- Uncertain transitions remain questions.",
    "- Reopened / rejected / approved branches require confirmation if unclear.",
    "",
    "## Data Boundaries",
    "",
    "- Relationship hints are not confirmed foreign keys.",
    "- Observed enum values are not complete production enums.",
    "- Assumptions must stay marked.",
    "",
    "## Handoff Gate",
    "",
    `- Handoff type: ${manifest.gates.handoffType}`,
    `- Implementation allowed: ${manifest.gates.implementationAllowed}`,
    `- Blocked by open questions: ${manifest.gates.blockedByOpenQuestions}`,
    `- Blocked by manual apply plan: ${manifest.gates.blockedByManualApplyPlan}`,
    `- Blocked by low buildability: ${manifest.gates.blockedByLowBuildability}`,
    `- Blocked by high-risk permissions: ${manifest.gates.blockedByHighRiskPermissions}`,
    "",
    "## Handoff Boundary",
    "",
    "This handoff pack is context only.",
    "It does not authorize implementation."
  ].join("\n")}\n`;
}

function stepsForGroup(manualApplyPlan, groupName, fallbackPredicate) {
  const grouped = manualApplyPlan.groupedSteps?.[groupName];
  if (Array.isArray(grouped) && grouped.length > 0 && grouped[0]?.id && !grouped[0]?.action) {
    const byId = new Map((manualApplyPlan.manualSteps || []).map((step) => [step.id, step]));
    return grouped.map((item) => byId.get(item.id)).filter(Boolean);
  }
  if (Array.isArray(grouped)) return grouped;
  return (manualApplyPlan.manualSteps || []).filter(fallbackPredicate);
}

function renderManualStepList(steps, emptyText) {
  if (!Array.isArray(steps) || steps.length === 0) return [`- ${emptyText}`];
  return steps.map((step) => `- ${step.id}: ${step.description} Priority: ${line(step.priority, "medium")}. Owner: ${line(step.suggestedOwner, "review_owner")}. Auto-apply allowed: ${step.autoApplyAllowed}.`);
}

export function renderManualApplyPlanSummary({ manualApplyPlan }) {
  const safeManualUpdates = stepsForGroup(
    manualApplyPlan,
    "safeManualUpdates",
    (step) => ["manually_add", "manually_update", "convert_to_assumption", "convert_to_question"].includes(step.action) && !step.requiresBusinessConfirmation
  );
  const businessConfirmationRequired = stepsForGroup(
    manualApplyPlan,
    "businessConfirmationRequired",
    (step) => step.requiresBusinessConfirmation && step.action !== "defer" && step.action !== "do_not_apply"
  );
  const developerReviewRequired = stepsForGroup(
    manualApplyPlan,
    "developerReviewRequired",
    (step) => step.requiresDeveloperReview && !["keep_blocked", "defer", "do_not_apply"].includes(step.action)
  );
  const blockedOrDeferred = stepsForGroup(
    manualApplyPlan,
    "blockedOrDeferred",
    (step) => ["keep_blocked", "defer", "do_not_apply"].includes(step.action)
  );
  const highestPriorityQuestions = (manualApplyPlan.blockedItems || [])
    .filter((item) => item.priority === "high" && item.suggestedFollowUpQuestion)
    .slice(0, 8);

  const lines = [
    "# Manual Apply Plan Summary",
    "",
    "This summary comes from the manual apply plan.",
    "No patch was automatically applied.",
    "No final spec-pack was generated.",
    "Accepted items are not automatically applied items.",
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
    "## Safe Manual Updates",
    "",
    ...renderManualStepList(safeManualUpdates, "No safe manual updates detected."),
    "",
    "## Business Confirmation Required",
    "",
    ...renderManualStepList(businessConfirmationRequired, "No business confirmation items detected."),
    "",
    "## Developer Review Required",
    "",
    ...renderManualStepList(developerReviewRequired, "No developer review items detected."),
    "",
    "## Blocked or Deferred",
    "",
    ...renderManualStepList(blockedOrDeferred, "No blocked or deferred items detected."),
    "",
    "## Highest Priority Follow-up Questions",
    ""
  ];

  if (highestPriorityQuestions.length === 0) {
    lines.push("- No highest priority follow-up questions detected.");
  } else {
    for (const item of highestPriorityQuestions) {
      lines.push(`- ${item.sourceCandidateId}: ${item.suggestedFollowUpQuestion} Owner: ${item.requiredOwner}.`);
    }
  }

  lines.push(
    "",
    "## Next Human Review Actions",
    "",
    "- Resolve business confirmation items before implementation planning.",
    "- Keep blocked or deferred items out of implementation scope.",
    "- Re-run handoff validation after any future manual spec revision.",
    "- Ask the user for explicit approval before planning code."
  );

  return `${lines.join("\n")}\n`;
}

export function renderMachineReadme() {
  return `${[
    "# Machine-readable Source Artifacts",
    "",
    "These files are copied from SpecWise source artifacts for traceability.",
    "",
    "They are not generated application code.",
    "They are not final implementation instructions.",
    "",
    "## Files",
    "",
    "- `spec-pack.json`",
    "- `evidence-map.json`",
    "- `buildability-report.md`",
    "- `manual-apply-plan.json`"
  ].join("\n")}\n`;
}

export function renderAgentSpecific({ target, specPack, manualApplyPlan }) {
  const template = readHandoffTemplate("agent-specific", `${target}.md`);
  return applyTemplate(template, {
    ...sharedTemplateValues(),
    implementationBlockers: renderAgentBlockerSummary({ specPack, manualApplyPlan })
  });
}
