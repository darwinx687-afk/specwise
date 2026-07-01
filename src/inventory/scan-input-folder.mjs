import fs from "node:fs";
import path from "node:path";
import { getMaterialExtension, getMaterialType } from "../utils/file-types.mjs";

const TYPE_ORDER = {
  mock_screenshot: 0,
  markdown: 1,
  text: 2,
  csv: 3,
  xlsx: 4,
  image: 5,
  unsupported: 6
};

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectFiles(inputFolder) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  walk(inputFolder);
  return files;
}

function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function getPreview(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, 240);
}

function getLines(text) {
  if (text.length === 0) return [];
  return text.split(/\r?\n/);
}

function summarizeMockScreenshot(filePath, text) {
  const lines = getLines(text);
  const firstScreenLine = lines.find((line) => line.startsWith("Screen:"));
  const screenTitle = firstScreenLine ? firstScreenLine.replace(/^Screen:\s*/, "").trim() : null;
  const detectedSections = lines
    .map((line) => line.trim())
    .filter((line) => /^(Visible .+|Detected business signals):$/.test(line))
    .map((line) => line.replace(/:$/, ""));

  return {
    summary: screenTitle
      ? `Mock screenshot text for screen "${screenTitle}" with ${lines.length} lines.`
      : `Mock screenshot text with ${lines.length} lines.`,
    signals: {
      lineCount: lines.length,
      screenTitle,
      detectedSections,
      preview: getPreview(text)
    },
    warnings: []
  };
}

function summarizeMarkdownOrText(filePath, text, type) {
  const lines = getLines(text);
  const headings = lines
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, "").trim());

  return {
    summary: `${type === "markdown" ? "Markdown" : "Text"} file with ${lines.length} lines${headings.length ? ` and ${headings.length} heading(s)` : ""}.`,
    signals: {
      lineCount: lines.length,
      headingCount: headings.length,
      headings,
      preview: getPreview(text)
    },
    warnings: []
  };
}

function parseSimpleCsvLine(line) {
  return line.split(",").map((value) => value.trim());
}

function summarizeCsv(filePath, text) {
  const rows = getLines(text).filter((line) => line.trim().length > 0);
  if (rows.length === 0) {
    return {
      summary: "Empty CSV file.",
      signals: {
        headers: [],
        columnCount: 0,
        rowCount: 0,
        sampleRows: []
      },
      warnings: ["CSV file is empty."]
    };
  }

  const headers = parseSimpleCsvLine(rows[0]);
  const dataRows = rows.slice(1).map(parseSimpleCsvLine);
  const sampleRows = dataRows.slice(0, 3);

  return {
    summary: `CSV with ${headers.length} columns and ${dataRows.length} data rows.`,
    signals: {
      headers,
      columnCount: headers.length,
      rowCount: dataRows.length,
      sampleRows
    },
    warnings: []
  };
}

function summarizeMetadataOnly(type) {
  if (type === "xlsx") {
    return {
      summary: "XLSX file recorded as metadata only.",
      signals: {
        parseStatus: "not_parsed_dependency_free_phase",
        note: "XLSX content parsing is intentionally deferred to a later phase."
      },
      warnings: []
    };
  }

  if (type === "image") {
    return {
      summary: "Image file recorded as metadata only.",
      signals: {
        parseStatus: "not_parsed_no_ocr_phase",
        note: "Image OCR and vision analysis are intentionally deferred to a later phase."
      },
      warnings: []
    };
  }

  return {
    summary: "Unsupported file type recorded but not parsed.",
    signals: {
      parseStatus: "unsupported_file_type"
    },
    warnings: ["Unsupported file type for SpecWise v0.1 inventory."]
  };
}

function inspectMaterial(filePath, inputFolder, index) {
  const fileName = path.basename(filePath);
  const type = getMaterialType(fileName);
  const relativePath = toPosixPath(path.relative(inputFolder, filePath));
  const stat = fs.statSync(filePath);
  let details;

  if (type === "mock_screenshot") {
    details = summarizeMockScreenshot(filePath, readTextFile(filePath));
  } else if (type === "markdown" || type === "text") {
    details = summarizeMarkdownOrText(filePath, readTextFile(filePath), type);
  } else if (type === "csv") {
    details = summarizeCsv(filePath, readTextFile(filePath));
  } else {
    details = summarizeMetadataOnly(type);
  }

  return {
    id: `mat_${String(index + 1).padStart(3, "0")}`,
    type,
    path: relativePath,
    absolutePathIncluded: false,
    fileName,
    extension: getMaterialExtension(fileName),
    sizeBytes: stat.size,
    summary: details.summary,
    signals: details.signals,
    warnings: details.warnings
  };
}

function displayInputFolder(inputFolder) {
  const relative = path.relative(process.cwd(), inputFolder);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
    return toPosixPath(relative);
  }
  return path.basename(inputFolder);
}

export function scanInputFolder(inputFolder) {
  const resolvedInputFolder = path.resolve(process.cwd(), inputFolder);
  if (!fs.existsSync(resolvedInputFolder) || !fs.statSync(resolvedInputFolder).isDirectory()) {
    throw new Error(`Input folder not found: ${inputFolder}`);
  }

  const files = collectFiles(resolvedInputFolder).sort((a, b) => {
    const typeA = getMaterialType(path.basename(a));
    const typeB = getMaterialType(path.basename(b));
    const order = TYPE_ORDER[typeA] - TYPE_ORDER[typeB];
    if (order !== 0) return order;
    return path.relative(resolvedInputFolder, a).localeCompare(path.relative(resolvedInputFolder, b));
  });

  const materials = files.map((filePath, index) => inspectMaterial(filePath, resolvedInputFolder, index));

  return {
    inputFolder: displayInputFolder(resolvedInputFolder),
    materials
  };
}

