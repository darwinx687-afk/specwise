import { runAiPreview } from "./commands/ai-preview.mjs";
import { runApplyPlan } from "./commands/apply-plan.mjs";
import { runDoctor } from "./commands/doctor.mjs";
import { runDraft } from "./commands/draft.mjs";
import { runExtract } from "./commands/extract.mjs";
import { runHandoff } from "./commands/handoff.mjs";
import { printHelp, printVersion } from "./commands/help.mjs";
import { runInit } from "./commands/init.mjs";
import { runInventory } from "./commands/inventory.mjs";
import { runPatch } from "./commands/patch.mjs";
import { runProvider } from "./commands/provider.mjs";
import { runReview } from "./commands/review.mjs";
import { runValidate } from "./commands/validate.mjs";

export async function run(args) {
  const [command, ...rest] = args;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  if (command === "--version" || command === "-v") {
    printVersion();
    return 0;
  }

  if (command === "validate") {
    return runValidate(rest);
  }

  if (command === "doctor") {
    return runDoctor();
  }

  if (command === "init") {
    return runInit(rest);
  }

  if (command === "inventory") {
    return runInventory(rest);
  }

  if (command === "draft") {
    return runDraft(rest);
  }

  if (command === "provider") {
    return runProvider(rest);
  }

  if (command === "extract") {
    return runExtract(rest);
  }

  if (command === "patch") {
    return runPatch(rest);
  }

  if (command === "ai-preview") {
    return runAiPreview(rest);
  }

  if (command === "review") {
    return runReview(rest);
  }

  if (command === "apply-plan") {
    return runApplyPlan(rest);
  }

  if (command === "handoff") {
    return runHandoff(rest);
  }

  console.error(`ERROR unknown command: ${command}`);
  console.error("Run `specwise --help` for usage.");
  return 1;
}
