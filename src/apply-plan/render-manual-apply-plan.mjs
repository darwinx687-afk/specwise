function renderStep(step) {
  return [
    `### ${step.id}`,
    "",
    `- Source candidate: ${step.sourceCandidateId}`,
    `- Decision: ${step.decision}`,
    `- Accepted as: ${step.acceptedAs ?? "none"}`,
    `- Target file: ${step.targetFile}`,
    `- Target section: ${step.targetSection}`,
    `- Action: ${step.action}`,
    `- Description: ${step.description}`,
    `- Requires business confirmation: ${step.requiresBusinessConfirmation}`,
    `- Requires developer review: ${step.requiresDeveloperReview}`,
    `- Auto-apply allowed: ${step.autoApplyAllowed}`,
    ""
  ];
}

export function renderManualApplyPlanMarkdown(plan) {
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
    "",
    "## Manual Steps",
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

  return `${lines.join("\n")}\n`;
}

export function renderBlockedItemsMarkdown(plan) {
  const lines = [
    "# Blocked Items",
    "",
    "These items block final spec readiness.",
    ""
  ];

  const groups = [
    ["high", "High Priority"],
    ["medium", "Medium Priority"],
    ["low", "Low Priority"],
    ["deferred", "Deferred"]
  ];

  for (const [priority, title] of groups) {
    lines.push(`## ${title}`, "");
    const items = plan.blockedItems.filter((item) => item.priority === priority || (priority === "deferred" && item.priority !== "high" && item.priority !== "medium" && item.priority !== "low"));
    if (items.length === 0) {
      lines.push("- None.", "");
      continue;
    }

    for (const item of items) {
      lines.push(`### ${item.sourceCandidateId}`);
      lines.push(`- Reason: ${item.reason}`);
      lines.push(`- Source candidate: ${item.sourceCandidateId}`);
      lines.push(`- Required owner: ${item.requiredOwner}`);
      lines.push(`- Suggested follow-up question: ${item.suggestedFollowUpQuestion ?? "none"}`);
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}
