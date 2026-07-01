import fs from "node:fs";
import path from "node:path";
import { summarizeMaterials } from "./summarize-materials.mjs";

function formatBytes(bytes) {
  return `${bytes} bytes`;
}

function renderSignals(material) {
  const signals = material.signals ?? {};

  if (material.type === "mock_screenshot") {
    return [
      `  - Screen title: ${signals.screenTitle ?? "unknown"}`,
      `  - Detected sections: ${(signals.detectedSections ?? []).join(", ") || "none"}`,
      `  - Line count: ${signals.lineCount ?? 0}`
    ].join("\n");
  }

  if (material.type === "csv") {
    return [
      `  - Headers: ${(signals.headers ?? []).join(", ") || "none"}`,
      `  - Column count: ${signals.columnCount ?? 0}`,
      `  - Row count: ${signals.rowCount ?? 0}`
    ].join("\n");
  }

  if (material.type === "markdown" || material.type === "text") {
    return [
      `  - Line count: ${signals.lineCount ?? 0}`,
      `  - Heading count: ${signals.headingCount ?? 0}`,
      `  - Headings: ${(signals.headings ?? []).join(", ") || "none"}`
    ].join("\n");
  }

  return `  - Parse status: ${signals.parseStatus ?? "not_parsed"}`;
}

export function createInventoryDocument({ inputFolder, materials, generatedAt = new Date().toISOString() }) {
  return {
    schemaVersion: "0.1.0",
    inputFolder,
    generatedAt,
    summary: summarizeMaterials(materials),
    materials
  };
}

export function renderInventoryMarkdown(inventory) {
  const lines = [
    "# Material Summary",
    "",
    `Input folder: \`${inventory.inputFolder}\``,
    "",
    "## Summary",
    "",
    `- Total files: ${inventory.summary.totalFiles}`,
    `- Supported files: ${inventory.summary.supportedFiles}`,
    `- Unsupported files: ${inventory.summary.unsupportedFiles}`,
    "",
    "## By Type",
    "",
    "| Type | Count |",
    "|---|---:|"
  ];

  for (const [type, count] of Object.entries(inventory.summary.byType)) {
    lines.push(`| ${type} | ${count} |`);
  }

  lines.push("", "## Materials", "");

  for (const material of inventory.materials) {
    lines.push(`### ${material.id} — ${material.path}`);
    lines.push("");
    lines.push(`- Type: ${material.type}`);
    lines.push(`- Size: ${formatBytes(material.sizeBytes)}`);
    lines.push(`- Summary: ${material.summary}`);
    lines.push("- Signals:");
    lines.push(renderSignals(material));
    if (material.warnings.length > 0) {
      lines.push(`- Warnings: ${material.warnings.join("; ")}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function writeInventoryOutput(inventory, outputFolder) {
  fs.mkdirSync(outputFolder, { recursive: true });
  fs.writeFileSync(
    path.join(outputFolder, "material-inventory.json"),
    `${JSON.stringify(inventory, null, 2)}\n`
  );
  fs.writeFileSync(path.join(outputFolder, "material-summary.md"), renderInventoryMarkdown(inventory));
}

