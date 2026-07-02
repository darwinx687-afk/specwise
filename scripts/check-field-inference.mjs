#!/usr/bin/env node
import fs from "node:fs";
import {
  inferEntityNameFromCsvPath,
  summarizeCsvEntity
} from "../src/draft/field-inference.mjs";

const checks = [
  {
    name: "customers.csv",
    path: "examples/legacy-crm-follow-up/input/data/customers.csv",
    entityName: "Customer",
    fields: {
      customer_id: { semanticRole: /primary_id|id/, type: /string|relation/, requiredHint: "likely_required" },
      owner_rep_id: { semanticRole: /reference/, relationshipTarget: "SalesRep", requiredHint: "optional_or_incomplete" },
      status: { type: "enum", observedValues: ["active", "inactive"] },
      risk_level: { type: "enum", observedValues: ["low", "medium", "high"] },
      last_follow_up_date: { type: "date" },
      next_follow_up_due: { type: "date" }
    }
  },
  {
    name: "follow_up_records.csv",
    path: "examples/legacy-crm-follow-up/input/data/follow_up_records.csv",
    entityName: "FollowUpRecord",
    fields: {
      record_id: { semanticRole: /primary_id|id/, type: /string|relation/ },
      customer_id: { semanticRole: /reference/, relationshipTarget: "Customer" },
      rep_id: { semanticRole: /reference/, relationshipTarget: "SalesRep" },
      status: { type: "enum", observedValues: ["draft", "submitted", "manager_reviewed", "closed", "reopened"] },
      created_at: { type: "datetime" }
    }
  },
  {
    name: "employees.csv",
    path: "examples/legacy-staff-evaluation/input/data/employees.csv",
    entityName: "Employee",
    fields: {
      employee_id: { semanticRole: /primary_id|id/, type: /string|relation/, requiredHint: "likely_required" },
      status: { type: "enum", observedValues: ["active", "inactive"] },
      joined_at: { semanticRole: "date", type: "date" },
      supervisor_id: { semanticRole: /reference/, relationshipTarget: "Employee", requiredHint: "optional_or_incomplete" }
    }
  },
  {
    name: "evaluation_records.csv",
    path: "examples/legacy-staff-evaluation/input/data/evaluation_records.csv",
    entityName: "EvaluationRecord",
    fields: {
      employee_id: { semanticRole: /reference/, relationshipTarget: "Employee" },
      status: { type: "enum", observedValues: ["draft", "submitted", "reviewed", "approved", "rejected"] },
      submitted_at: { type: "datetime", requiredHint: "optional_or_incomplete" },
      reviewed_at: { type: "datetime", requiredHint: "optional_or_incomplete" }
    }
  }
];

function fail(message) {
  throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) fail(`${message}: expected ${expected}, got ${actual}`);
}

function assertMatches(actual, expected, message) {
  if (expected instanceof RegExp) {
    if (!expected.test(String(actual))) fail(`${message}: expected ${actual} to match ${expected}`);
    return;
  }
  assertEqual(actual, expected, message);
}

function assertIncludesAll(actualValues, expectedValues, message) {
  const actual = new Set(actualValues ?? []);
  for (const value of expectedValues) {
    if (!actual.has(value)) fail(`${message}: missing observed value ${value}`);
  }
}

function checkField(summary, fieldName, expected) {
  const field = summary.fields.find((item) => item.name === fieldName);
  if (!field) fail(`${summary.entityName}: missing field ${fieldName}`);

  if (expected.type) assertMatches(field.inferredType, expected.type, `${summary.entityName}.${fieldName} type`);
  if (expected.semanticRole) assertMatches(field.semanticRole, expected.semanticRole, `${summary.entityName}.${fieldName} semanticRole`);
  if (expected.relationshipTarget) {
    assertEqual(field.relationshipHint?.targetEntityName, expected.relationshipTarget, `${summary.entityName}.${fieldName} relationship target`);
    assertEqual(field.relationshipHint?.needsReview, true, `${summary.entityName}.${fieldName} relationship review`);
  }
  if (expected.requiredHint) assertEqual(field.requiredHint, expected.requiredHint, `${summary.entityName}.${fieldName} required hint`);
  if (expected.observedValues) assertIncludesAll(field.observedValues, expected.observedValues, `${summary.entityName}.${fieldName} observed values`);
}

try {
  for (const check of checks) {
    const csvText = fs.readFileSync(check.path, "utf8");
    assertEqual(inferEntityNameFromCsvPath(check.path), check.entityName, `${check.name} entity name`);
    const summary = summarizeCsvEntity(check.path, csvText);
    assertEqual(summary.entityName, check.entityName, `${check.name} summary entity name`);
    for (const [fieldName, expected] of Object.entries(check.fields)) {
      checkField(summary, fieldName, expected);
    }
    console.log(`[field-inference] ${check.name} passed`);
  }
  console.log("[field-inference] all checks passed");
} catch (error) {
  console.error(`[field-inference] ${error.message}`);
  process.exitCode = 1;
}
