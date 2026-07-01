import { createMockProvider } from "./mock-provider.mjs";
import { createOpenAICompatiblePlaceholderProvider } from "./openai-compatible-placeholder-provider.mjs";
import { ProviderUnavailableError } from "./provider-errors.mjs";

const PROVIDERS = [
  {
    name: "mock",
    status: "available",
    group: "Available",
    runtime: "dry-run only",
    network: false
  },
  {
    name: "openai-compatible-placeholder",
    status: "planned_not_callable",
    group: "Planned",
    runtime: "disabled",
    network: false
  }
];

export function listProviders() {
  return PROVIDERS;
}

export function getProvider(name, config) {
  if (name === "mock") {
    return createMockProvider(config);
  }

  if (name === "openai-compatible-placeholder") {
    return createOpenAICompatiblePlaceholderProvider(config);
  }

  throw new ProviderUnavailableError(`Unknown provider: ${name}`);
}
