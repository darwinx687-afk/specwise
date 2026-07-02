export const AVAILABLE_COMMANDS = [
  "validate",
  "init",
  "inventory",
  "draft",
  "provider",
  "extract",
  "patch",
  "ai-preview",
  "review",
  "apply-plan",
  "handoff",
  "doctor"
];

export const USAGE = {
  validate: "specwise validate <spec-pack-path> [--expect-fail]",
  init: "specwise init <output-folder> [--force]",
  inventory: "specwise inventory <input-folder> --out <output-folder> [--force]",
  draft: "specwise draft <input-folder> --out <output-folder> [--force]",
  "provider doctor": "specwise provider doctor --config <config-path>",
  extract: "specwise extract <input-folder> --out <output-folder> --config <config-path> --dry-run",
  "patch validate": "specwise patch validate <patch-file>",
  "patch preview": "specwise patch preview <draft-spec-pack-path> --patch <patch-file> --out <output-folder> [--force]",
  "ai-preview prepare": "specwise ai-preview prepare <input-folder> --out <output-folder> --config <config-path> [--force]",
  "review init": "specwise review init <merge-preview-folder> --out <review-folder> [--force]",
  "review validate": "specwise review validate <review-decisions-file>",
  "review report": "specwise review report <merge-preview-folder> --decisions <review-decisions-file> --out <output-folder> [--force]",
  "apply-plan create": "specwise apply-plan create <review-report-folder> --draft <draft-spec-pack-path> --out <output-folder> [--force]",
  "apply-plan validate": "specwise apply-plan validate <apply-plan-file>",
  "handoff create": "specwise handoff create <draft-spec-pack-path> --apply-plan <manual-apply-plan-file> --out <output-folder> [--target codex,claude-code,cursor,spec-kit] [--force]",
  "handoff validate": "specwise handoff validate <handoff-pack-folder>"
};

export function formatError(title, details = {}) {
  const lines = [`SpecWise error: ${title}`];

  if (details.usage) {
    lines.push("", "Command:", `  ${details.usage}`);
  }

  if (details.availableCommands?.length) {
    lines.push("", "Available commands:");
    for (const command of details.availableCommands) {
      lines.push(`  ${command}`);
    }
  }

  if (details.nextAction) {
    lines.push("", "Next action:");
    for (const line of String(details.nextAction).split("\n")) {
      lines.push(`  ${line}`);
    }
  }

  return lines.join("\n");
}

export function printError(title, details = {}) {
  console.error(formatError(title, details));
}

export function printUnknownCommand(command) {
  printError(`Unknown command "${command}"`, {
    availableCommands: AVAILABLE_COMMANDS,
    nextAction: "Run node bin/specwise.mjs --help"
  });
}

export function printMissingArgument(name, usage, example) {
  printError(`Missing required argument ${name}`, {
    usage,
    nextAction: example ?? `Provide ${name}.`
  });
}

export function printMissingOption(name, usage, example) {
  printError(`Missing required option ${name}`, {
    usage,
    nextAction: example ?? `Add ${name} <value>.`
  });
}

export function printPathNotFound(inputPath) {
  printError(`Path not found: ${inputPath}`, {
    nextAction: "Check the path and try again."
  });
}

export function printOutputFolderExists() {
  printError("Output folder already exists and is not empty.", {
    nextAction: "Re-run with --force to overwrite, or choose a different --out folder."
  });
}

export function printOutputPathNotDirectory(outputPath) {
  printError(`Output path exists and is not a directory: ${outputPath}`, {
    nextAction: "Choose a different --out folder."
  });
}

export function printParseErrors(errors, usage) {
  for (const error of errors) {
    printError(error, {
      usage,
      nextAction: "Check the command syntax and try again."
    });
  }
}

export function printSuccess(title, details = {}) {
  console.log(title);

  if (details.items?.length) {
    for (const item of details.items) {
      console.log(`- ${item}`);
    }
  }

  if (details.lines?.length) {
    console.log("");
    for (const line of details.lines) {
      console.log(line);
    }
  }
}
