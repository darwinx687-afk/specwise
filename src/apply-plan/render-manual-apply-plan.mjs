function renderStep(step) {
  return [
    `### ${step.id}`,
    "",
    `- Priority: ${step.priority ?? "medium"}`,
    `- Suggested owner: ${step.suggestedOwner ?? "review_owner"}`,
    `- Source candidate: ${step.sourceCandidateId}`,
    `- Decision: ${step.decision}`,
    `- Accepted as: ${step.acceptedAs ?? "none"}`,
    `- Target file: ${step.targetFile}`,
    `- Target section: ${step.targetSection}`,
    `- Action: ${step.action}`,
    `- High-risk area: ${step.highRisk ? "yes" : "no"}`,
    `- Description: ${step.description}`,
    `- Requires business confirmation: ${step.requiresBusinessConfirmation}`,
    `- Requires developer review: ${step.requiresDeveloperReview}`,
    `- Auto-apply allowed: ${step.autoApplyAllowed}`,
    ""
  ];
}

function groupedStepsFor(plan) {
  return plan.groupedSteps ?? {
    safeManualUpdates: plan.manualSteps.filter((step) => ["manually_add", "manually_update", "convert_to_assumption", "convert_to_question"].includes(step.action) && !step.requiresBusinessConfirmation),
    businessConfirmationRequired: plan.manualSteps.filter((step) => step.requiresBusinessConfirmation && step.action !== "defer" && step.action !== "do_not_apply"),
    developerReviewRequired: plan.manualSteps.filter((step) => step.requiresDeveloperReview && !["keep_blocked", "defer", "do_not_apply"].includes(step.action)),
    blockedOrDeferred: plan.manualSteps.filter((step) => ["keep_blocked", "defer", "do_not_apply"].includes(step.action))
  };
}

function renderStepGroup(title, steps, emptyText) {
  const lines = [`## ${title}`, ""];
  if (steps.length === 0) {
    lines.push(`- ${emptyText}`, "");
    return lines;
  }

  for (const step of steps) {
    lines.push(...renderStep(step));
  }
  return lines;
}

export function renderManualApplyPlanMarkdown(plan) {
  const groupedSteps = groupedStepsFor(plan);
  const lines = [
    "# SpecWise Manual Apply Plan",
    "",
    "This is a manual revision plan.",
    "No patch was automatically applied.",
    "No final spec-pack was generated.",
    "",
    "本计划只用于人工修改下一版 spec-pack，不会自动应用 patch。",
    "",
    "## Summary",
    "",
    `- Total reviewed items: ${plan.summary.totalReviewedItems}`,
    `- Safe to apply manually: ${plan.summary.safeToApplyManually}`,
    `- Needs business confirmation: ${plan.summary.needsBusinessConfirmation}`,
    `- Deferred: ${plan.summary.deferred}`,
    `- Do not apply: ${plan.summary.doNotApply}`,
    `- Blocks final spec: ${plan.summary.blocksFinalSpec}`,
    `- Status: ${plan.status}`,
    "",
    ...renderStepGroup("Safe Manual Updates", groupedSteps.safeManualUpdates, "None."),
    ...renderStepGroup("Business Confirmation Required", groupedSteps.businessConfirmationRequired, "None."),
    ...renderStepGroup("Developer Review Required", groupedSteps.developerReviewRequired, "None."),
    ...renderStepGroup("Blocked or Deferred", groupedSteps.blockedOrDeferred, "None."),
    "## All Manual Steps",
    ""
  ];

  for (const step of plan.manualSteps) {
    lines.push(...renderStep(step));
  }

  lines.push(
    "## Blocked Items",
    ""
  );

  if (plan.blockedItems.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of plan.blockedItems) {
      lines.push(`### ${item.sourceCandidateId}`);
      lines.push(`- Priority: ${item.priority}`);
      lines.push(`- Category: ${item.category ?? "business_confirmation"}`);
      lines.push(`- Reason: ${item.reason}`);
      lines.push(`- Required owner: ${item.requiredOwner}`);
      lines.push(`- Suggested follow-up question: ${item.suggestedFollowUpQuestion ?? "none"}`);
      lines.push("");
    }
  }

  lines.push(
    "",
    "## Next Actions",
    "",
    "1. Resolve all blocked business questions.",
    "2. Apply safe manual updates by hand in a new spec revision.",
    "3. Re-run SpecWise validation after manual edits.",
    "4. Do not mark ready_for_ai_coding unless future validation and review gates allow it."
  );

  return `${lines.join("\n")}\n`;
}

export function renderSpecRevisionChecklist(plan) {
  const groups = [
    ["before_editing", "Before Editing"],
    ["safe_manual_updates", "Safe Manual Updates"],
    ["requires_business_confirmation", "Requires Business Confirmation"],
    ["developer_review_required", "Developer Review Required"],
    ["do_not_auto_apply", "Do Not Auto-Apply"]
  ];
  const lines = [
    "# Spec Revision Checklist",
    "",
    "Use this checklist when preparing the next manual spec-pack revision.",
    ""
  ];

  for (const [groupId, title] of groups) {
    lines.push(`## ${title}`, "");
    const items = plan.revisionChecklist.filter((item) => item.group === groupId);
    if (items.length === 0) {
      lines.push("- [ ] None.", "");
      continue;
    }
    for (const item of items) {
      lines.push(`- [ ] ${item.text}`);
    }
    lines.push("");
  }

  lines.push(
    "## Re-run After Manual Revision",
    "",
    "- [ ] Run `node bin/specwise.mjs validate <manual-spec-pack-folder>`.",
    "- [ ] Run `npm test` before any future commit.",
    "- [ ] Keep rejected, deferred, and unresolved business-confirmation items out of the manual revision.",
    ""
  );

  return `${lines.join("\n")}\n`;
}

function blockedGroupsFor(plan) {
  return [
    [
      "High Priority Permission / Scope Blockers",
      plan.blockedItems.filter((item) => item.category === "permission_scope")
    ],
    [
      "Workflow / State Blockers",
      plan.blockedItems.filter((item) => item.category === "workflow_state")
    ],
    [
      "Data / Entity Blockers",
      plan.blockedItems.filter((item) => item.category === "data_entity")
    ],
    [
      "Business Confirmation Blockers",
      plan.blockedItems.filter((item) => item.category === "business_confirmation")
    ],
    [
      "Deferred Items",
      plan.blockedItems.filter((item) => item.category === "deferred")
    ]
  ];
}

export function renderBlockedItemsMarkdown(plan) {
  const lines = [
    "# Blocked Items",
    "",
    "These items block final spec readiness.",
    ""
  ];

  for (const [title, items] of blockedGroupsFor(plan)) {
    lines.push(`## ${title}`, "");
    if (items.length === 0) {
      lines.push("- None.", "");
      continue;
    }

    for (const item of items) {
      lines.push(`### ${item.sourceCandidateId}`);
      lines.push(`- Priority: ${item.priority}`);
      lines.push(`- Reason: ${item.reason}`);
      lines.push(`- Source candidate: ${item.sourceCandidateId}`);
      lines.push(`- Required owner: ${item.requiredOwner}`);
      lines.push(`- Suggested follow-up question: ${item.suggestedFollowUpQuestion ?? "none"}`);
      lines.push("");
    }
  }

  lines.push("## Suggested Follow-up Questions", "");
  const questions = plan.blockedItems.filter((item) => item.suggestedFollowUpQuestion);
  if (questions.length === 0) {
    lines.push("- None.", "");
  } else {
    for (const item of questions) {
      lines.push(`- ${item.sourceCandidateId}: ${item.suggestedFollowUpQuestion}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}
