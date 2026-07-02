import path from "node:path";

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }
    if (char === "\"") {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values;
}

function singularizeWord(word) {
  if (/^sales$/i.test(word)) return "sales";
  if (/ies$/i.test(word)) return word.replace(/ies$/i, "y");
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.replace(/s$/i, "");
  return word;
}

function pascalCaseWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function slugToEntityName(value) {
  return String(value)
    .replace(/\.[^.]+$/, "")
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => singularizeWord(part.toLowerCase()))
    .map(pascalCaseWord)
    .join("");
}

function normalizeFieldName(value) {
  return String(value).trim().toLowerCase();
}

function nonEmptyValues(sampleValues) {
  return sampleValues.map((value) => String(value ?? "").trim()).filter(Boolean);
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isDatetime(value) {
  return /^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?z?$/i.test(value);
}

function isBoolean(value) {
  return /^(true|false|yes|no|y|n)$/i.test(value);
}

function targetFromIdField(fieldName) {
  const normalized = normalizeFieldName(fieldName);
  const explicitTargets = new Map([
    ["customer_id", "Customer"],
    ["employee_id", "Employee"],
    ["department_id", "Department"],
    ["group_id", "Group"],
    ["rep_id", "SalesRep"],
    ["owner_rep_id", "SalesRep"],
    ["reviewed_by", "User"],
    ["submitted_by", "User"],
    ["created_by", "User"],
    ["updated_by", "User"],
    ["manager_id", "Employee"],
    ["supervisor_id", "Employee"],
    ["role_id", "Role"],
    ["permission_id", "Permission"],
    ["actor_id", "User"]
  ]);
  if (explicitTargets.has(normalized)) return explicitTargets.get(normalized);
  if (!normalized.endsWith("_id")) return null;

  const base = normalized.replace(/_id$/, "").replace(/^(owner|assigned|reviewed|submitted)_/, "");
  return slugToEntityName(base);
}

export function inferEntityNameFromCsvPath(filePath) {
  return slugToEntityName(path.basename(filePath, ".csv"));
}

export function inferRelationshipHint(fieldName) {
  const normalized = normalizeFieldName(fieldName);
  const targetEntityName = targetFromIdField(normalized);
  if (!targetEntityName) return null;
  return {
    targetEntityName,
    confidence: "low",
    needsReview: true,
    description: `${fieldName} may reference ${targetEntityName}; confirm before treating it as a foreign key.`
  };
}

export function inferFieldSemanticRole(fieldName, sampleValues = []) {
  const normalized = normalizeFieldName(fieldName);
  const values = nonEmptyValues(sampleValues);
  if (normalized === "id" || /(^|_)id$/.test(normalized)) {
    if (/^(record|customer|employee|department|segment|rep|role|permission|audit)_id$/.test(normalized)) return "primary_id_or_reference";
    return "reference";
  }
  if (/^(reviewed_by|submitted_by|created_by|updated_by|owner_rep_id|manager_id|supervisor_id|actor_id)$/.test(normalized)) return "reference";
  if (/status|state/.test(normalized)) return "status";
  if (/role/.test(normalized)) return "role";
  if (/risk_level|segment|priority|type|scope/.test(normalized)) return "enum";
  if (values.length > 0 && values.every(isDatetime)) return "datetime";
  if (values.length > 0 && values.every(isDate)) return "date";
  if (/date$|_date|due$|period/.test(normalized)) return "date";
  if (/_at$|time$|timestamp/.test(normalized)) return "datetime";
  if (/required|enabled|active|visible|visibility/.test(normalized) && nonEmptyValues(sampleValues).every(isBoolean)) return "boolean";
  if (/score|count|total|amount|days|number/.test(normalized)) return "measure";
  return "text";
}

export function inferFieldType(fieldName, sampleValues = []) {
  const normalized = normalizeFieldName(fieldName);
  const values = nonEmptyValues(sampleValues);
  if (values.length === 0) return /_id$|^id$/.test(normalized) ? "relation" : "unknown";

  if (values.every(isDatetime)) return "datetime";
  if (values.every(isDate)) return "date";
  if (/_at$|time$|timestamp/.test(normalized)) return "datetime";
  if (/date$|_date|due$|period/.test(normalized)) return "date";
  if (values.every(isBoolean)) return "boolean";
  if (values.every((value) => /^-?\d+(?:\.\d+)?$/.test(value)) || /score|count|total|amount|days|number/.test(normalized)) return "number";
  if (/^(reviewed_by|submitted_by|created_by|updated_by|owner_rep_id|manager_id|supervisor_id|actor_id)$/.test(normalized)) return "relation";
  if (/_id$/.test(normalized) && normalized !== "id") return "relation";
  if (/description|notes?|comment/.test(normalized)) return "text";
  if (/(^|_)name$/.test(normalized)) return "string";

  const uniqueValues = new Set(values.map((value) => value.toLowerCase()));
  if (/status|state|role|scope|type|level|segment|priority/.test(normalized)) return "enum";
  if (uniqueValues.size > 1 && uniqueValues.size <= Math.max(6, Math.ceil(values.length * 0.6))) return "enum";
  return "string";
}

export function inferRequiredHint(sampleValues = []) {
  if (sampleValues.length === 0) return "unknown";
  const emptyCount = sampleValues.filter((value) => String(value ?? "").trim().length === 0).length;
  if (emptyCount === 0) return "likely_required";
  if (emptyCount / sampleValues.length > 0.6) return "requires_review";
  return "optional_or_incomplete";
}

function observedValuesFor(fieldName, inferredType, sampleValues) {
  const values = Array.from(new Set(nonEmptyValues(sampleValues)));
  if (inferredType !== "enum" && inferFieldSemanticRole(fieldName, sampleValues) !== "status") return [];
  return values.slice(0, 12);
}

function parseCsv(text) {
  const rows = String(text).split(/\r?\n/).filter((line) => line.trim().length > 0).map(splitCsvLine);
  if (rows.length === 0) return { headers: [], rows: [] };
  return {
    headers: rows[0],
    rows: rows.slice(1)
  };
}

export function inferFieldsFromCsvContent(csvText, options = {}) {
  const { headers, rows } = parseCsv(csvText);
  return headers.map((header, columnIndex) => {
    const sampleValues = rows.map((row) => row[columnIndex] ?? "");
    const inferredType = inferFieldType(header, sampleValues);
    const semanticRole = inferFieldSemanticRole(header, sampleValues);
    const relationshipHint = inferRelationshipHint(header);
    return {
      name: header,
      inferredType,
      semanticRole,
      requiredHint: inferRequiredHint(sampleValues),
      relationshipHint,
      observedValues: observedValuesFor(header, inferredType, sampleValues),
      sampleValues: nonEmptyValues(sampleValues).slice(0, options.sampleLimit ?? 3)
    };
  });
}

export function summarizeCsvEntity(csvFile, csvText) {
  const entityName = inferEntityNameFromCsvPath(csvFile);
  const fields = inferFieldsFromCsvContent(csvText).map((field, index) => {
    const primaryLike = index === 0 && /(^|_)id$/.test(normalizeFieldName(field.name));
    if (primaryLike) {
      return {
        ...field,
        inferredType: field.inferredType === "relation" ? "string" : field.inferredType,
        semanticRole: "primary_id",
        relationshipHint: null
      };
    }
    return field;
  });

  return {
    csvFile,
    entityName,
    fields
  };
}
