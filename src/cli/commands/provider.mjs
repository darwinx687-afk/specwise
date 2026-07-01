import { loadProviderConfig } from "../../providers/provider-config.mjs";
import { ProviderConfigError, ProviderRuntimeError, ProviderUnavailableError } from "../../providers/provider-errors.mjs";
import { createProviderRuntimeDescriptor } from "../../providers/provider-runtime-contract.mjs";
import { getProvider, listProviders } from "../../providers/provider-registry.mjs";

function getOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : null;
}

function runProviderList() {
  console.log("SpecWise providers\n");
  console.log("Available:");
  for (const provider of listProviders().filter((item) => item.group === "Available")) {
    console.log(`- ${provider.name}`);
    console.log(`  status: ${provider.status}`);
    console.log(`  runtime: ${provider.runtime}`);
    console.log(`  network: ${provider.network}`);
  }
  console.log("");
  console.log("Planned:");
  for (const provider of listProviders().filter((item) => item.group === "Planned")) {
    console.log(`- ${provider.name}`);
    console.log(`  status: ${provider.status}`);
    console.log(`  runtime: ${provider.runtime}`);
    console.log(`  network: ${provider.network}`);
  }
  return 0;
}

function runProviderDoctor(args) {
  const configPath = getOption(args, "--config");
  if (!configPath) {
    console.error("ERROR provider doctor requires --config <path>");
    return 1;
  }

  console.log("SpecWise provider doctor\n");

  try {
    const config = loadProviderConfig(configPath);
    console.log("✓ config loaded");
    const provider = getProvider(config.provider, config);
    const runtime = provider.getRuntimeDescriptor
      ? provider.getRuntimeDescriptor()
      : createProviderRuntimeDescriptor(config.provider, config);

    console.log(`Provider: ${runtime.provider}`);
    console.log(`Status: ${runtime.status}`);
    console.log(`Runtime: ${runtime.mode}`);
    console.log(`Network calls: ${runtime.capabilities.networkCalls}`);
    console.log(`Contract: ${runtime.contractVersion}`);
    console.log(`Dry-run planning: ${runtime.capabilities.dryRunPlanning}`);
    console.log(`Evidence first: ${runtime.safety.evidenceFirst}`);
    console.log(`Review required by default: ${runtime.safety.reviewRequiredByDefault}`);
    console.log("");

    if (runtime.status === "planned_not_callable") {
      console.log("This provider cannot be used for extraction in Phase 7B.");
      return 0;
    }

    console.log("Status: provider config ready for dry-run planning");
    return 0;
  } catch (error) {
    if (error instanceof ProviderConfigError || error instanceof ProviderRuntimeError || error instanceof ProviderUnavailableError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

export function runProvider(args) {
  const [subcommand, ...rest] = args;

  if (subcommand === "list") {
    return runProviderList();
  }

  if (subcommand === "doctor") {
    return runProviderDoctor(rest);
  }

  console.error("ERROR provider requires a subcommand: list or doctor");
  return 1;
}
