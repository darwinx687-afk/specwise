const UNCERTAIN_MARKERS = /unclear|not sure|needs confirmation|should be confirmed|不清楚|不确定|需要确认|是否|好像|maybe|requires approval|who can|whether|can edit|after review/i;
const CAUTIOUS_STATE_MARKERS = /reopened|rejected|approved|closed|reviewed|退回|重开|关闭|审核|通过/i;
const HEADING_STOP = /^[A-Z][A-Za-z /-]+:$/;
const BRANCH_STATES = new Set(["reopened", "rejected"]);

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";
}

function getLines(text) {
  return String(text ?? "").split(/\r?\n/);
}

function sourceId(sourceRef) {
  if (typeof sourceRef === "string") return sourceRef;
  return sourceRef?.id ?? sourceRef?.path ?? "unknown_source";
}

function sourceLabel(sourceRef) {
  if (typeof sourceRef === "string") return sourceRef;
  return sourceRef?.path ?? sourceRef?.id ?? "unknown source";
}

function evidenceIdsFor(sourceRef) {
  return Array.isArray(sourceRef?.evidenceIds) ? sourceRef.evidenceIds : [];
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function cleanStateValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/^(?:->|→|↘)\s*/, "")
    .replace(/[`*_]/g, " ")
    .replace(/[：:。.;,，]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return String(value)
    .replace(/_/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => (part.length <= 2 ? part.toUpperCase() : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`))
    .join(" ");
}

function displayLabelFor(rawValue, stateId) {
  const cleaned = cleanStateValue(rawValue);
  const known = new Map([
    ["draft", "Draft"],
    ["submitted", "Submitted"],
    ["reviewed", "Reviewed"],
    ["approved", "Approved"],
    ["rejected", "Rejected"],
    ["closed", "Closed"],
    ["reopened", "Reopened"],
    ["assigned", "Assigned"],
    ["new_customer", "New Customer"],
    ["follow_up_draft", "Follow-up Draft"],
    ["manager_reviewed", "Manager Reviewed"]
  ]);
  return known.get(stateId) ?? titleCase(cleaned || stateId);
}

export function normalizeWorkflowStateName(value) {
  const cleaned = cleanStateValue(value);
  const lower = cleaned.toLowerCase();
  const known = new Map([
    ["草稿", "draft"],
    ["已提交", "submitted"],
    ["审核中", "reviewed"],
    ["已通过", "approved"],
    ["已退回", "rejected"],
    ["manager reviewed", "manager_reviewed"],
    ["manager_reviewed", "manager_reviewed"],
    ["follow-up draft", "follow_up_draft"],
    ["follow up draft", "follow_up_draft"],
    ["follow_up_draft", "follow_up_draft"],
    ["new customer", "new_customer"],
    ["new_customer", "new_customer"]
  ]);
  return known.get(cleaned) ?? known.get(lower) ?? slug(lower);
}

function shouldKeepState(stateId) {
  return Boolean(stateId) && stateId !== "unknown" && !/^(notes|unclear|known_states|known_actions|status_labels|visible_status_labels|primary_customer_follow_up_workflow)$/.test(stateId);
}

function buildState(rawValue, sourceRef, kind) {
  const id = normalizeWorkflowStateName(rawValue);
  if (!shouldKeepState(id)) return null;
  return {
    id,
    displayLabel: displayLabelFor(rawValue, id),
    raw: cleanStateValue(rawValue),
    kind,
    sources: [sourceLabel(sourceRef)],
    sourceRefs: [sourceId(sourceRef)],
    evidenceIds: evidenceIdsFor(sourceRef)
  };
}

function mergeSignalMap(map, item) {
  if (!item) return;
  const current = map.get(item.id);
  if (!current) {
    map.set(item.id, { ...item, sources: unique(item.sources), sourceRefs: unique(item.sourceRefs), evidenceIds: unique(item.evidenceIds) });
    return;
  }
  current.sources = unique([...current.sources, ...item.sources]);
  current.sourceRefs = unique([...current.sourceRefs, ...item.sourceRefs]);
  current.evidenceIds = unique([...current.evidenceIds, ...item.evidenceIds]);
  if (current.kind !== item.kind) current.kind = "mixed";
}

function bulletsUnderAny(text, headings) {
  const wanted = new Set(headings.map((heading) => heading.toLowerCase()));
  const results = [];
  let active = false;

  for (const line of getLines(text)) {
    const trimmed = line.trim();
    const headingName = trimmed.replace(/:$/, "").toLowerCase();
    if (wanted.has(headingName)) {
      active = true;
      continue;
    }

    if (!active) continue;
    if (!trimmed) {
      if (results.length > 0) break;
      continue;
    }
    if (HEADING_STOP.test(trimmed) || /^#+\s+/.test(trimmed)) break;
    if (trimmed.startsWith("- ")) {
      results.push(trimmed.replace(/^- /, "").trim());
    }
  }

  return results;
}

function parseSimpleCsvLine(line) {
  return line.split(",").map((value) => value.trim());
}

function csvStatusValues(text) {
  const rows = getLines(text).filter((line) => line.trim()).map(parseSimpleCsvLine);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.toLowerCase());
  const statusIndex = headers.indexOf("status");
  if (statusIndex === -1) return [];
  return rows.slice(1).map((row) => row[statusIndex]).filter(Boolean);
}

export function extractStatusLabelsFromText(text, sourceRef = "unknown_source") {
  const values = [
    ...bulletsUnderAny(text, ["Visible status labels", "Status labels", "Known states"]),
    ...csvStatusValues(text)
  ];
  const states = new Map();
  for (const value of values) {
    mergeSignalMap(states, buildState(value, sourceRef, "status_label"));
  }
  return Array.from(states.values());
}

function transitionId(fromState, toState, branchCandidate) {
  return `${fromState}_to_${toState}${branchCandidate ? "_branch" : ""}`;
}

export function extractArrowChainsFromText(text, sourceRef = "unknown_source") {
  const chains = [];
  const transitions = [];
  const states = [];
  let previousStateCandidate = null;
  let inCodeBlock = false;

  for (const line of getLines(text)) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (!trimmed || (!inCodeBlock && /^#+\s+/.test(trimmed))) continue;

    if (/(?:->|→|↘)/.test(trimmed)) {
      const startsWithArrow = /^(?:->|→|↘)/.test(trimmed);
      const rawParts = trimmed.split(/\s*(?:->|→|↘)\s*/).filter(Boolean);
      const parts = startsWithArrow && previousStateCandidate ? [previousStateCandidate, ...rawParts] : rawParts;
      const chainStates = parts.map((part) => buildState(part, sourceRef, "arrow_chain")).filter(Boolean);
      const branchCandidate = /↘/.test(trimmed);
      if (chainStates.length > 0) {
        chains.push({
          source: sourceLabel(sourceRef),
          sourceRef: sourceId(sourceRef),
          evidenceIds: evidenceIdsFor(sourceRef),
          rawLine: trimmed,
          branchCandidate,
          states: chainStates
        });
        states.push(...chainStates);
      }
      for (let index = 0; index < chainStates.length - 1; index += 1) {
        const from = chainStates[index];
        const to = chainStates[index + 1];
        const transitionBranch = branchCandidate || BRANCH_STATES.has(to.id);
        transitions.push({
          id: transitionId(from.id, to.id, transitionBranch),
          fromState: from.id,
          fromDisplayLabel: from.displayLabel,
          toState: to.id,
          toDisplayLabel: to.displayLabel,
          confidence: transitionBranch ? "low" : "medium",
          reviewRequired: true,
          branchCandidate: transitionBranch,
          source: sourceLabel(sourceRef),
          sourceRef: sourceId(sourceRef),
          rawLine: trimmed,
          evidenceIds: evidenceIdsFor(sourceRef)
        });
      }
      previousStateCandidate = chainStates.at(-1)?.raw ?? null;
      continue;
    }

    if (!trimmed.endsWith(":") && !trimmed.startsWith("- ")) {
      previousStateCandidate = trimmed;
    }
  }

  return { chains, transitions, states };
}

export function detectUncertainWorkflowLines(text, sourceRef = "unknown_source") {
  return getLines(text)
    .map((line) => line.trim().replace(/^- /, ""))
    .filter((line) => line.length > 0 && !/^#+\s+/.test(line) && !/^unclear rules?:?$/i.test(line) && !/^unclear:?$/i.test(line))
    .filter((line) => UNCERTAIN_MARKERS.test(line) || (CAUTIOUS_STATE_MARKERS.test(line) && /unclear|不确定|是否|may|might|can|requires|审批|退回|reopened|rejected/i.test(line)))
    .map((line) => ({
      line,
      source: sourceLabel(sourceRef),
      sourceRef: sourceId(sourceRef),
      evidenceIds: evidenceIdsFor(sourceRef)
    }));
}

function questionKey(question) {
  return question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function addQuestion(questions, seen, question, details = {}) {
  const key = questionKey(question);
  if (seen.has(key)) return;
  seen.add(key);
  questions.push({
    question,
    category: details.category ?? "workflow",
    priority: details.priority ?? "medium",
    reason: details.reason ?? "Deterministic workflow inference found an uncertain or branch transition.",
    evidenceIds: unique(details.evidenceIds ?? []),
    sourceRefs: unique(details.sourceRefs ?? [])
  });
}

export function buildWorkflowOpenQuestions(workflowSignals) {
  const questions = [];
  const seen = new Set();
  const states = new Set((workflowSignals.states ?? []).map((state) => state.id));
  const allText = [
    ...(workflowSignals.uncertainLines ?? []).map((item) => item.line),
    ...(workflowSignals.transitions ?? []).map((item) => item.rawLine),
    ...(workflowSignals.statusLabels ?? []).map((item) => item.raw)
  ].join("\n").toLowerCase();
  const evidenceIds = unique([
    ...(workflowSignals.uncertainLines ?? []).flatMap((item) => item.evidenceIds),
    ...(workflowSignals.transitions ?? []).flatMap((item) => item.evidenceIds),
    ...(workflowSignals.statusLabels ?? []).flatMap((item) => item.evidenceIds)
  ]);
  const sourceRefs = unique([
    ...(workflowSignals.uncertainLines ?? []).map((item) => item.sourceRef),
    ...(workflowSignals.transitions ?? []).map((item) => item.sourceRef),
    ...(workflowSignals.statusLabels ?? []).flatMap((item) => item.sourceRefs)
  ]);
  const isFollowUp = /follow.?up|customer|sales rep|reassignment|overdue/.test(allText) || states.has("manager_reviewed") || states.has("closed");
  const isEvaluation = /evaluation|employee|评估|reviewed record|evaluation record/.test(allText) || states.has("approved") || states.has("rejected");

  if ((workflowSignals.statusLabels ?? []).length > 0 && (workflowSignals.transitions ?? []).length === 0) {
    addQuestion(questions, seen, "What are the allowed transitions between these statuses?", { evidenceIds, sourceRefs });
  }
  if (isFollowUp && (workflowSignals.statusLabels ?? []).length > 0) {
    addQuestion(questions, seen, "What are the allowed transitions between follow-up statuses?", { evidenceIds, sourceRefs });
  }
  if (states.has("reopened") || /reopened|重开/.test(allText)) {
    addQuestion(
      questions,
      seen,
      isFollowUp ? "What happens when a closed follow-up is reopened?" : "What state does a reopened record return to?",
      { evidenceIds, sourceRefs }
    );
  }
  if (states.has("rejected") || /rejected|退回/.test(allText)) {
    addQuestion(
      questions,
      seen,
      isEvaluation ? "What happens after an evaluation record is rejected?" : "What happens after a record is rejected?",
      { evidenceIds, sourceRefs }
    );
  }
  if (states.has("approved") || /approved|approve reviewed|final approval|最终通过|已通过/.test(allText)) {
    addQuestion(
      questions,
      seen,
      isEvaluation ? "Who can approve reviewed evaluation records?" : "Who can approve reviewed records?",
      { category: "approval", priority: "high", evidenceIds, sourceRefs }
    );
    addQuestion(
      questions,
      seen,
      isEvaluation ? "Is approval required before an evaluation record becomes final?" : "Is approval required before the record becomes final?",
      { category: "approval", priority: "high", evidenceIds, sourceRefs }
    );
  }
  if ((states.has("submitted") && /edit|can edit|编辑|after review|submitted records can be edited/.test(allText)) || /submitted.*edit|edit.*submitted/i.test(allText)) {
    addQuestion(
      questions,
      seen,
      isFollowUp ? "Can Sales Reps edit submitted follow-up records?" : "Can submitted records be edited after review starts?",
      { category: "workflow", priority: "high", evidenceIds, sourceRefs }
    );
  }
  if (/reassignment|reassign|重新分配|主管审批/.test(allText)) {
    addQuestion(questions, seen, "Does customer reassignment require manager approval?", { category: "approval", priority: "high", evidenceIds, sourceRefs });
  }
  if (/overdue|自动提醒|自动|manual/.test(allText) && /reassign|reassignment|overdue|提醒/.test(allText)) {
    addQuestion(questions, seen, "Are overdue customers reassigned automatically or manually?", { evidenceIds, sourceRefs });
  }
  if (states.has("closed") && /edit|can edit|是否还能编辑/.test(allText)) {
    addQuestion(questions, seen, "Can closed records be edited or reopened after closure?", { evidenceIds, sourceRefs });
  }

  return questions;
}

export function summarizeWorkflowInference(workflowSignals) {
  const statusCount = workflowSignals.statusLabels?.length ?? 0;
  const transitionCount = workflowSignals.transitions?.length ?? 0;
  const branchCount = workflowSignals.branchCandidates?.length ?? 0;
  const uncertainCount = workflowSignals.uncertainLines?.length ?? 0;
  return [
    `Observed status labels: ${statusCount}`,
    `Inferred transition candidates: ${transitionCount}`,
    `Branch or exception candidates: ${branchCount}`,
    `Uncertain workflow lines: ${uncertainCount}`
  ];
}

export function inferWorkflowTransitions(materials) {
  const statusLabels = new Map();
  const states = new Map();
  const transitions = new Map();
  const uncertainLines = [];

  for (const material of materials) {
    const sourceRef = {
      id: material.id,
      path: material.path,
      type: material.type,
      evidenceIds: material.evidenceIds ?? []
    };
    const text = material.text ?? "";

    for (const label of extractStatusLabelsFromText(text, sourceRef)) {
      mergeSignalMap(statusLabels, label);
      mergeSignalMap(states, { ...label, kind: "status_label" });
    }

    const arrowSignals = extractArrowChainsFromText(text, sourceRef);
    for (const state of arrowSignals.states) {
      mergeSignalMap(states, state);
    }
    for (const transition of arrowSignals.transitions) {
      const existing = transitions.get(transition.id);
      if (!existing) {
        transitions.set(transition.id, { ...transition, evidenceIds: unique(transition.evidenceIds), sourceRefs: [transition.sourceRef] });
      } else {
        existing.evidenceIds = unique([...existing.evidenceIds, ...transition.evidenceIds]);
        existing.sourceRefs = unique([...existing.sourceRefs, transition.sourceRef]);
      }
    }

    uncertainLines.push(...detectUncertainWorkflowLines(text, sourceRef));
  }

  const transitionBranchCandidates = Array.from(transitions.values())
    .filter((transition) => transition.branchCandidate)
    .map((transition) => ({
      state: transition.fromState,
      stateDisplayLabel: transition.fromDisplayLabel,
      branch: transition.toState,
      branchDisplayLabel: transition.toDisplayLabel,
      confidence: "low",
      reviewRequired: true,
      question: transition.toState === "reopened"
        ? "What state does a reopened record return to?"
        : transition.toState === "rejected"
          ? "What happens after a record is rejected?"
          : "What is the target state for this branch?",
      source: transition.source,
      sourceRef: transition.sourceRef,
      rawLine: transition.rawLine,
      evidenceIds: transition.evidenceIds
    }));
  const branchTargets = new Set(transitionBranchCandidates.map((branch) => branch.branch));
  const observedBranchCandidates = Array.from(states.values())
    .filter((state) => BRANCH_STATES.has(state.id) && !branchTargets.has(state.id))
    .map((state) => ({
      state: state.id,
      stateDisplayLabel: state.displayLabel,
      branch: state.id === "reopened" ? "target_state_unknown" : "return_path_unknown",
      branchDisplayLabel: state.id === "reopened" ? "Target State Unknown" : "Return Path Unknown",
      confidence: "low",
      reviewRequired: true,
      question: state.id === "reopened"
        ? "What state does a reopened record return to?"
        : "What happens after a record is rejected?",
      source: state.sources[0] ?? "unknown source",
      sourceRef: state.sourceRefs[0] ?? "unknown_source",
      rawLine: state.raw,
      evidenceIds: state.evidenceIds
    }));

  const workflowSignals = {
    states: Array.from(states.values()),
    statusLabels: Array.from(statusLabels.values()),
    transitions: Array.from(transitions.values()),
    uncertainLines,
    branchCandidates: [...transitionBranchCandidates, ...observedBranchCandidates]
  };
  workflowSignals.openQuestions = buildWorkflowOpenQuestions(workflowSignals);
  workflowSignals.summary = summarizeWorkflowInference(workflowSignals);
  return workflowSignals;
}
