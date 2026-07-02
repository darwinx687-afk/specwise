function renderItems(items, emptyText) {
  if (items.length === 0) return [`- ${emptyText}`];

  const lines = [];
  for (const item of items) {
    lines.push(`### ${item.candidateId}`);
    lines.push(`- Summary: ${item.summary ?? item.question ?? "Review item requires follow-up."}`);
    lines.push(`- Target: ${item.targetSection}`);
    lines.push(`- Priority: ${item.priority}`);
    lines.push(`- Confidence: ${item.confidence ?? "unknown"}`);
    lines.push(`- High-risk area: ${item.highRisk ? "yes" : "no"}`);
    if (item.acceptedAs) lines.push(`- Accepted as: ${item.acceptedAs}`);
    if (item.followUpQuestion) lines.push(`- Follow-up question: ${item.followUpQuestion}`);
    if (item.reviewerNote) lines.push(`- Reviewer note: ${item.reviewerNote}`);
    lines.push(`- Blocks readiness: ${item.blocksReadiness ?? false}`);
    lines.push("");
  }
  return lines;
}

function renderFollowUpQuestions(items) {
  if (items.length === 0) return ["- None."];

  const lines = [];
  for (const item of items) {
    lines.push(`### ${item.candidateId}`);
    lines.push(`- Target: ${item.targetSection}`);
    lines.push(`- Priority: ${item.priority}`);
    lines.push(`- High-risk area: ${item.highRisk ? "yes" : "no"}`);
    lines.push(`- Question: ${item.question}`);
    lines.push(`- Reviewer note: ${item.reviewerNote}`);
    lines.push("");
  }
  return lines;
}

function renderBlockedReadinessReasons(items) {
  if (items.length === 0) return ["- None."];

  const lines = [];
  for (const item of items) {
    lines.push(`### ${item.candidateId}`);
    lines.push(`- Priority: ${item.priority}`);
    lines.push(`- Target: ${item.targetSection}`);
    lines.push(`- Suggested owner: ${item.suggestedOwner}`);
    lines.push(`- High-risk area: ${item.highRisk ? "yes" : "no"}`);
    lines.push(`- Reason: ${item.reason}`);
    if (item.followUpQuestion) lines.push(`- Follow-up question: ${item.followUpQuestion}`);
    lines.push("");
  }
  return lines;
}

function groupedItemsFor(report) {
  return report.groupedItems ?? {
    safeToCarryForward: report.acceptedItems,
    needsBusinessConfirmation: report.followUpQuestions,
    deferredForLater: report.deferredItems,
    doNotApply: report.rejectedItems
  };
}

export function renderReviewReportMarkdown(report) {
  const groupedItems = groupedItemsFor(report);
  const blockedReadinessReasons = report.blockedReadinessReasons ?? report.blockedItems;
  const nextReviewActions = report.nextReviewActions ?? [
    "Resolve all follow-up questions before final spec readiness.",
    "Apply accepted items only by hand in a future manual spec revision."
  ];

  const lines = [
    "# SpecWise Human Review Report",
    "",
    "No patch was automatically applied.",
    "No final spec-pack was generated.",
    "Draft spec-pack was not modified.",
    "",
    "## Summary",
    "",
    `- Total candidates: ${report.summary.totalCandidates}`,
    `- Accepted: ${report.summary.accepted}`,
    `- Needs more info: ${report.summary.needsMoreInfo}`,
    `- Deferred: ${report.summary.deferred}`,
    `- Rejected: ${report.summary.rejected}`,
    `- Blocks readiness: ${report.summary.blocksReadiness}`,
    "",
    "## Review Status",
    "",
    `- Status: ${report.status}`,
    `- Safe to carry forward: ${groupedItems.safeToCarryForward.length}`,
    `- Needs business confirmation: ${groupedItems.needsBusinessConfirmation.length}`,
    `- Deferred for later: ${groupedItems.deferredForLater.length}`,
    `- Do not apply: ${groupedItems.doNotApply.length}`,
    "",
    "## Safe to Carry Forward",
    "",
    ...renderItems(groupedItems.safeToCarryForward, "None."),
    "",
    "## Needs Business Confirmation",
    "",
    ...renderItems(groupedItems.needsBusinessConfirmation, "None."),
    "",
    "## Follow-up Questions",
    "",
    ...renderFollowUpQuestions(report.followUpQuestions),
    "",
    "## Blocked Readiness Reasons",
    "",
    ...renderBlockedReadinessReasons(blockedReadinessReasons),
    "",
    "## Deferred for Later",
    "",
    ...renderItems(groupedItems.deferredForLater, "None."),
    "",
    "## Do Not Apply",
    "",
    ...renderItems(groupedItems.doNotApply, "None."),
    "",
    "## Recommended Next Review Actions",
    ""
  ];

  for (const action of nextReviewActions) {
    lines.push(`- ${action}`);
  }

  lines.push("");
  return lines.join("\n");
}

export function renderReviewedHandoffPlan(report) {
  const groupedItems = groupedItemsFor(report);
  const blockedReadinessReasons = report.blockedReadinessReasons ?? report.blockedItems;
  const nextReviewActions = report.nextReviewActions ?? [
    "Resolve all follow-up questions.",
    "Manually revise the next spec draft using accepted decisions only."
  ];
  const lines = [
    "# Reviewed Handoff Plan",
    "",
    "This handoff plan is based on human review decisions.",
    "It is not a final spec-pack.",
    "",
    "## Safe to Include in Next Spec Revision",
    ""
  ];

  if (groupedItems.safeToCarryForward.length === 0) {
    lines.push("- None yet.");
  } else {
    for (const item of groupedItems.safeToCarryForward) {
      lines.push(`- ${item.candidateId}: include as ${item.acceptedAs} after updating the next spec revision by hand.`);
    }
  }

  lines.push(
    "",
    "## Needs Business Confirmation",
    ""
  );

  if (blockedReadinessReasons.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of blockedReadinessReasons) {
      lines.push(`- ${item.candidateId}: ${item.reason} Owner: ${item.suggestedOwner}.`);
      if (item.followUpQuestion) lines.push(`  Follow-up: ${item.followUpQuestion}`);
    }
  }

  lines.push(
    "",
    "## Do Not Apply Yet",
    ""
  );

  const doNotApply = [...groupedItems.deferredForLater, ...groupedItems.doNotApply];
  if (doNotApply.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of doNotApply) {
      lines.push(`- ${item.candidateId}: ${item.reviewerNote || item.summary}`);
    }
  }

  lines.push(
    "",
    "## Recommended Next Actions",
    ""
  );

  nextReviewActions.forEach((action, index) => {
    lines.push(`${index + 1}. ${action}`);
  });

  lines.push(
    "",
    "## Boundary",
    "",
    "No AI patch was auto-applied. No final spec-pack was generated."
  );

  return `${lines.join("\n")}\n`;
}
