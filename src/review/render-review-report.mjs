function renderItems(items, emptyText) {
  if (items.length === 0) return [`- ${emptyText}`];

  const lines = [];
  for (const item of items) {
    lines.push(`### ${item.candidateId}`);
    lines.push(`- Summary: ${item.summary}`);
    lines.push(`- Target: ${item.targetSection}`);
    lines.push(`- Priority: ${item.priority}`);
    lines.push(`- Confidence: ${item.confidence}`);
    if (item.acceptedAs) lines.push(`- Accepted as: ${item.acceptedAs}`);
    if (item.followUpQuestion) lines.push(`- Follow-up question: ${item.followUpQuestion}`);
    if (item.reviewerNote) lines.push(`- Reviewer note: ${item.reviewerNote}`);
    lines.push(`- Blocks readiness: ${item.blocksReadiness}`);
    lines.push("");
  }
  return lines;
}

export function renderReviewReportMarkdown(report) {
  const lines = [
    "# SpecWise Human Review Report",
    "",
    "No patch was automatically applied.",
    "No final spec-pack was generated.",
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
    "## Accepted Items",
    "",
    ...renderItems(report.acceptedItems, "None."),
    "",
    "## Follow-up Questions",
    ""
  ];

  if (report.followUpQuestions.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of report.followUpQuestions) {
      lines.push(`### ${item.candidateId}`);
      lines.push(`- Target: ${item.targetSection}`);
      lines.push(`- Priority: ${item.priority}`);
      lines.push(`- Question: ${item.question}`);
      lines.push(`- Reviewer note: ${item.reviewerNote}`);
      lines.push("");
    }
  }

  lines.push(
    "",
    "## Deferred Items",
    "",
    ...renderItems(report.deferredItems, "None."),
    "",
    "## Rejected Items",
    "",
    ...renderItems(report.rejectedItems, "None."),
    "",
    "## Blocked Readiness Reasons",
    ""
  );

  if (report.blockedItems.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of report.blockedItems) {
      lines.push(`- ${item.candidateId}: ${item.reviewerNote || item.followUpQuestion || item.summary}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

export function renderReviewedHandoffPlan(report) {
  const lines = [
    "# Reviewed Handoff Plan",
    "",
    "This handoff plan is based on human review decisions.",
    "It is not a final spec-pack.",
    "",
    "## Safe to Include in Next Spec Revision",
    ""
  ];

  if (report.acceptedItems.length === 0) {
    lines.push("- None yet.");
  } else {
    for (const item of report.acceptedItems) {
      lines.push(`- ${item.candidateId}: include as ${item.acceptedAs} after updating the next spec revision by hand.`);
    }
  }

  lines.push(
    "",
    "## Needs Business Confirmation",
    ""
  );

  if (report.followUpQuestions.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of report.followUpQuestions) {
      lines.push(`- ${item.candidateId}: ${item.question}`);
    }
  }

  lines.push(
    "",
    "## Do Not Apply Yet",
    ""
  );

  const doNotApply = [...report.deferredItems, ...report.rejectedItems];
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
    "",
    "1. Resolve all high-priority follow-up questions.",
    "2. Manually revise the next spec draft using accepted decisions only.",
    "3. Re-run SpecWise validation after any future manual spec revision.",
    "4. Keep rejected and deferred candidates out of implementation scope until reviewed again.",
    "",
    "## Boundary",
    "",
    "No AI patch was auto-applied. No final spec-pack was generated."
  );

  return `${lines.join("\n")}\n`;
}
