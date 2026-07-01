import fs from "node:fs";
import path from "node:path";

export function createDryRunExtractionPlan({ provider, inventory }) {
  const providerDescription = provider.describe();
  const providerRuntime = provider.getRuntimeDescriptor
    ? provider.getRuntimeDescriptor()
    : providerDescription.runtime;
  const providerPlan = provider.planExtraction({
    inputFolder: inventory.inputFolder,
    totalFiles: inventory.summary.totalFiles,
    supportedFiles: inventory.summary.supportedFiles,
    unsupportedFiles: inventory.summary.unsupportedFiles
  });

  return {
    schemaVersion: "0.1.0",
    mode: "dry_run",
    provider: {
      name: providerDescription.name,
      networkCalls: false
    },
    providerRuntime,
    inputFolder: inventory.inputFolder,
    inventorySummary: {
      totalFiles: inventory.summary.totalFiles,
      supportedFiles: inventory.summary.supportedFiles,
      unsupportedFiles: inventory.summary.unsupportedFiles
    },
    plannedStages: providerPlan.plannedStages,
    safety: {
      evidenceFirst: true,
      reviewRequiredByDefault: true,
      noSilentOverwrite: true,
      networkCallsMade: false
    },
    status: "dry_run_only"
  };
}

export function renderExtractionPlanMarkdown(plan) {
  const lines = [
    "# SpecWise Extraction Dry-run Plan",
    "",
    "This plan was generated without AI provider calls.",
    "",
    "本计划未调用 AI，只用于展示未来 extraction pipeline 的执行边界。",
    "",
    "## Input",
    "",
    `- Input folder: ${plan.inputFolder}`,
    `- Total files: ${plan.inventorySummary.totalFiles}`,
    `- Supported files: ${plan.inventorySummary.supportedFiles}`,
    "",
    "## Provider",
    "",
    `- Provider: ${plan.provider.name}`,
    `- Mode: ${plan.mode}`,
    `- Network calls: ${plan.provider.networkCalls}`,
    "",
    "## Provider Runtime",
    "",
    `- Contract version: ${plan.providerRuntime.contractVersion}`,
    `- Provider: ${plan.providerRuntime.provider}`,
    `- Mode: ${plan.providerRuntime.mode}`,
    `- Network calls: ${plan.providerRuntime.capabilities.networkCalls}`,
    `- Runtime status: ${plan.providerRuntime.status}`,
    "",
    "## Planned Extraction Stages",
    ""
  ];

  plan.plannedStages.forEach((stage, index) => {
    lines.push(`${index + 1}. ${stage.name}`);
  });

  lines.push(
    "",
    "## Safety Rules",
    "",
    "- Evidence first",
    "- Review required by default",
    "- No silent overwrite",
    "- Conflicting claims become questions",
    "- Low-confidence claims become assumptions",
    "",
    "## Status",
    "",
    "Dry-run only. No AI extraction was performed."
  );

  return `${lines.join("\n")}\n`;
}

export function writeDryRunExtractionPlan(plan, outputFolder) {
  fs.mkdirSync(outputFolder, { recursive: true });
  fs.writeFileSync(path.join(outputFolder, "extraction-plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
  fs.writeFileSync(path.join(outputFolder, "extraction-plan.md"), renderExtractionPlanMarkdown(plan));
}
