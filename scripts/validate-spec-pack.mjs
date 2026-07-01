#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REQUIRED_FILES = [
  "01_modules.md",
  "02_entities.md",
  "03_permissions.md",
  "04_workflows.md",
  "05_questions.md",
  "06_acceptance.md",
  "buildability-report.md",
  "spec-pack.json",
  "evidence-map.json",
  "spec-pack.zh-CN.md",
  "spec-pack.en.md"
];

const STATUS_BY_SCORE = [
  { min: 80, max: 100, status: "ready_for_ai_coding" },
  { min: 60, max: 79, status: "review_required" },
  { min: 40, max: 59, status: "needs_discovery" },
  { min: 0, max: 39, status: "not_buildable_yet" }
];

const args = process.argv.slice(2);
const expectFail = args.includes("--expect-fail");
const packPaths = args.filter((arg) => arg !== "--expect-fail");
if (packPaths.length === 0) {
  packPaths.push("spec-pack");
}

let root;
let displayPath;
let errors;
let warnings;

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(fileName) {
  const file = path.join(root, fileName);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${fileName} is not valid JSON: ${error.message}`);
    return null;
  }
}

function requireArray(object, key, minLength = 0) {
  if (!Array.isArray(object?.[key])) {
    fail(`spec-pack.json ${key} must be an array`);
    return [];
  }
  if (object[key].length < minLength) {
    fail(`spec-pack.json ${key} must contain at least ${minLength} item(s)`);
  }
  return object[key];
}

function collectIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== "object") {
      fail(`${label} contains a non-object item`);
      continue;
    }
    if (!item.id || typeof item.id !== "string") {
      fail(`${label} item is missing string id`);
      continue;
    }
    if (ids.has(item.id)) {
      fail(`${label} has duplicate id ${item.id}`);
    }
    ids.add(item.id);
  }
  return ids;
}

function requireRefs(ownerLabel, ownerId, refs, targetIds, targetLabel) {
  if (!Array.isArray(refs)) return;
  for (const ref of refs) {
    if (!targetIds.has(ref)) {
      fail(`${ownerLabel} ${ownerId} references missing ${targetLabel} ${ref}`);
    }
  }
}

function expectedStatusForScore(score) {
  return STATUS_BY_SCORE.find((range) => score >= range.min && score <= range.max)?.status;
}

function validateCurrentRoot() {
for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    fail(`Missing required file: ${file}`);
  }
}

const spec = readJson("spec-pack.json");
const evidenceMap = readJson("evidence-map.json");

if (spec) {
  if (spec.schemaVersion !== "0.1.0") fail("spec-pack.json schemaVersion must be 0.1.0");
  if (!spec.project || typeof spec.project !== "object") fail("spec-pack.json project is required");
  if (!spec.project?.status) fail("spec-pack.json project.status is required");
  if (!spec.generatedAt) fail("spec-pack.json generatedAt is required");
  if (!spec.generator?.name || !spec.generator?.version) fail("spec-pack.json generator.name and generator.version are required");

  const sourceMaterials = requireArray(spec, "sourceMaterials", 1);
  const modules = requireArray(spec, "modules", 1);
  const pages = requireArray(spec, "pages", 1);
  const entities = requireArray(spec, "entities", 1);
  const fields = requireArray(spec, "fields", 1);
  const roles = requireArray(spec, "roles", 0);
  const permissions = requireArray(spec, "permissions", 0);
  const workflows = requireArray(spec, "workflows", 0);
  const acceptanceCriteria = requireArray(spec, "acceptanceCriteria", 1);
  const openQuestions = requireArray(spec, "openQuestions", 1);
  const assumptions = requireArray(spec, "assumptions", 0);

  if (roles.length === 0 && permissions.length === 0) {
    fail("spec-pack.json must include at least one role or permission, or an explicit unknown role entry");
  }
  if (workflows.length === 0) {
    fail("spec-pack.json must include at least one workflow, even if it records workflow_unknown");
  }

  const sourceIds = collectIds(sourceMaterials, "sourceMaterials");
  const moduleIds = collectIds(modules, "modules");
  const pageIds = collectIds(pages, "pages");
  const entityIds = collectIds(entities, "entities");
  const fieldIds = collectIds(fields, "fields");
  const roleIds = collectIds(roles, "roles");
  const permissionIds = collectIds(permissions, "permissions");
  const workflowIds = collectIds(workflows, "workflows");
  const acceptanceIds = collectIds(acceptanceCriteria, "acceptanceCriteria");
  const questionIds = collectIds(openQuestions, "openQuestions");
  const assumptionIds = collectIds(assumptions, "assumptions");

  for (const module of modules) {
    requireRefs("module", module.id, module.pages, pageIds, "page");
  }

  for (const page of pages) {
    if (!moduleIds.has(page.moduleId)) fail(`page ${page.id} references missing module ${page.moduleId}`);
    requireRefs("page", page.id, page.visibleFields, fieldIds, "field");
  }

  for (const entity of entities) {
    requireRefs("entity", entity.id, entity.fields, fieldIds, "field");
    for (const relation of entity.relations ?? []) {
      if (relation.targetEntityId && !entityIds.has(relation.targetEntityId)) {
        fail(`entity ${entity.id} relation references missing entity ${relation.targetEntityId}`);
      }
    }
  }

  for (const field of fields) {
    if (!entityIds.has(field.entityId)) fail(`field ${field.id} references missing entity ${field.entityId}`);
    requireRefs("field", field.id, field.openQuestionIds, questionIds, "open question");
  }

  for (const permission of permissions) {
    if (!roleIds.has(permission.roleId)) fail(`permission ${permission.id} references missing role ${permission.roleId}`);
    requireRefs("permission", permission.id, permission.openQuestionIds, questionIds, "open question");
  }

  for (const workflow of workflows) {
    requireRefs("workflow", workflow.id, workflow.actors, roleIds, "role");
  }

  for (const criterion of acceptanceCriteria) {
    requireRefs("acceptance criterion", criterion.id, criterion.relatedModuleIds, moduleIds, "module");
    requireRefs("acceptance criterion", criterion.id, criterion.relatedQuestionIds, questionIds, "open question");
  }

  const allClaimIds = new Set([
    ...moduleIds,
    ...pageIds,
    ...entityIds,
    ...fieldIds,
    ...roleIds,
    ...permissionIds,
    ...workflowIds,
    ...acceptanceIds,
    ...questionIds,
    ...assumptionIds
  ]);

  for (const question of openQuestions) {
    requireRefs("open question", question.id, question.blockedItems, allClaimIds, "blocked item");
  }

  for (const assumption of assumptions) {
    requireRefs("assumption", assumption.id, assumption.relatedQuestionIds, questionIds, "open question");
  }

  const buildability = spec.buildability;
  if (!buildability || typeof buildability !== "object") {
    fail("spec-pack.json buildability is required");
  } else {
    const expected = expectedStatusForScore(buildability.score);
    if (expected && buildability.status !== expected) {
      fail(`buildability.status ${buildability.status} does not match score ${buildability.score}; expected ${expected}`);
    }

    const dimensionScores = buildability.dimensionScores ?? {};
    const dimensionTotal = [
      "moduleClarity",
      "entityClarity",
      "fieldClarity",
      "permissionClarity",
      "workflowClarity",
      "evidenceCoverage",
      "ambiguityControl"
    ].reduce((sum, key) => sum + (Number.isInteger(dimensionScores[key]) ? dimensionScores[key] : 0), 0);

    if (Number.isInteger(buildability.score) && dimensionTotal !== buildability.score) {
      fail(`buildability.score ${buildability.score} must equal dimension score total ${dimensionTotal}`);
    }

    if (buildability.status === "ready_for_ai_coding") {
      const riskyQuestions = openQuestions.filter((question) => question.priority === "high");
      if (riskyQuestions.length > 0) {
        fail("ready_for_ai_coding cannot have high-priority open questions");
      }
      if ((dimensionScores.permissionClarity ?? 0) < 12 || (dimensionScores.workflowClarity ?? 0) < 12) {
        fail("ready_for_ai_coding requires permissionClarity and workflowClarity of at least 12");
      }
    }
  }

  if (evidenceMap) {
    if (evidenceMap.schemaVersion !== "0.1.0") fail("evidence-map.json schemaVersion must be 0.1.0");
    if (!Array.isArray(evidenceMap.evidenceItems)) fail("evidence-map.json evidenceItems must be an array");
    if (!Array.isArray(evidenceMap.claimMappings)) fail("evidence-map.json claimMappings must be an array");

    const evidenceIds = collectIds(evidenceMap.evidenceItems ?? [], "evidenceItems");
    for (const evidence of evidenceMap.evidenceItems ?? []) {
      if (evidence.sourceMaterialId && !sourceIds.has(evidence.sourceMaterialId)) {
        fail(`evidence item ${evidence.id} references missing source material ${evidence.sourceMaterialId}`);
      }
    }

    for (const mapping of evidenceMap.claimMappings ?? []) {
      if (!allClaimIds.has(mapping.claimId)) {
        warn(`claim mapping ${mapping.claimId} does not match a known spec-pack claim id`);
      }
      requireRefs("claim mapping", mapping.claimId, mapping.evidenceIds, evidenceIds, "evidence item");
    }

    const totalClaims = evidenceMap.claimMappings?.length ?? 0;
    const claimsWithEvidence = (evidenceMap.claimMappings ?? []).filter((mapping) => Array.isArray(mapping.evidenceIds) && mapping.evidenceIds.length > 0).length;
    const claimsWithoutEvidence = totalClaims - claimsWithEvidence;
    const highConfidenceClaims = (evidenceMap.claimMappings ?? []).filter((mapping) => mapping.confidence === "high").length;
    const mediumConfidenceClaims = (evidenceMap.claimMappings ?? []).filter((mapping) => mapping.confidence === "medium").length;
    const lowConfidenceClaims = (evidenceMap.claimMappings ?? []).filter((mapping) => mapping.confidence === "low").length;
    const expectedRate = totalClaims === 0 ? 0 : Number((claimsWithEvidence / totalClaims).toFixed(2));
    const coverageSummary = evidenceMap.coverageSummary ?? {};

    if (coverageSummary.totalClaims !== totalClaims) fail(`coverageSummary.totalClaims must be ${totalClaims}`);
    if (coverageSummary.claimsWithEvidence !== claimsWithEvidence) fail(`coverageSummary.claimsWithEvidence must be ${claimsWithEvidence}`);
    if (coverageSummary.claimsWithoutEvidence !== claimsWithoutEvidence) fail(`coverageSummary.claimsWithoutEvidence must be ${claimsWithoutEvidence}`);
    if (coverageSummary.highConfidenceClaims !== highConfidenceClaims) fail(`coverageSummary.highConfidenceClaims must be ${highConfidenceClaims}`);
    if (coverageSummary.mediumConfidenceClaims !== mediumConfidenceClaims) fail(`coverageSummary.mediumConfidenceClaims must be ${mediumConfidenceClaims}`);
    if (coverageSummary.lowConfidenceClaims !== lowConfidenceClaims) fail(`coverageSummary.lowConfidenceClaims must be ${lowConfidenceClaims}`);
    if (coverageSummary.evidenceCoverageRate !== expectedRate) {
      fail(`coverageSummary.evidenceCoverageRate must be ${expectedRate}`);
    }
  }
}

return {
  displayPath,
  errors: [...errors],
  warnings: [...warnings],
  ok: errors.length === 0
};
}

function validatePack(packPath) {
  root = path.resolve(packPath);
  displayPath = packPath;
  errors = [];
  warnings = [];
  return validateCurrentRoot();
}

const results = packPaths.map(validatePack);

for (const result of results) {
  for (const warning of result.warnings) {
    console.warn(`WARN ${result.displayPath}: ${warning}`);
  }
}

if (expectFail) {
  const failed = results.find((result) => !result.ok);
  if (!failed) {
    for (const result of results) {
      console.error(`ERROR ${result.displayPath}: expected validation failure but validation passed`);
    }
    process.exit(1);
  }

  console.log(`SpecWise v0.1 validation failed as expected: ${failed.displayPath}`);
  console.log(`First error: ${failed.errors[0]}`);
  process.exit(0);
}

const failedResults = results.filter((result) => !result.ok);
if (failedResults.length > 0) {
  for (const result of failedResults) {
    for (const error of result.errors) {
      console.error(`ERROR ${result.displayPath}: ${error}`);
    }
  }
  process.exit(1);
}

for (const result of results) {
  console.log(`SpecWise v0.1 validation passed: ${result.displayPath}`);
}
