import { ProviderRuntimeError, ProviderUnavailableError } from "./provider-errors.mjs";

export const PROVIDER_RUNTIME_CONTRACT_VERSION = "0.1.0";

const PHASE_7B_PLACEHOLDER_ERROR = "openai-compatible-placeholder is not callable in Phase 7B. Use the mock provider with --dry-run.";

function createSafetyDescriptor(config) {
  return {
    evidenceFirst: config.safety?.evidenceFirst ?? true,
    reviewRequiredByDefault: config.safety?.reviewRequiredByDefault ?? true,
    noSilentOverwrite: true
  };
}

function createCapabilities({ dryRunPlanning }) {
  return {
    networkCalls: false,
    textExtraction: false,
    visionExtraction: false,
    structuredOutput: false,
    dryRunPlanning
  };
}

export function createProviderRuntimeDescriptor(providerName, config) {
  if (providerName === "mock") {
    return {
      contractVersion: PROVIDER_RUNTIME_CONTRACT_VERSION,
      provider: "mock",
      mode: config.mode,
      capabilities: createCapabilities({ dryRunPlanning: true }),
      safety: createSafetyDescriptor(config),
      status: "available"
    };
  }

  if (providerName === "openai-compatible-placeholder") {
    return {
      contractVersion: PROVIDER_RUNTIME_CONTRACT_VERSION,
      provider: "openai-compatible-placeholder",
      mode: config.mode,
      capabilities: createCapabilities({ dryRunPlanning: false }),
      safety: createSafetyDescriptor(config),
      status: "planned_not_callable"
    };
  }

  throw new ProviderUnavailableError(`Unknown provider: ${providerName}`);
}

export function assertProviderRuntimeAllowed(config) {
  if (config.safety?.allowNetworkCalls === true) {
    throw new ProviderRuntimeError("Network calls are not allowed in Phase 7B.");
  }

  if (config.mode !== "dry_run" && config.mode !== "disabled") {
    throw new ProviderRuntimeError("Provider runtime mode must be dry_run or disabled in Phase 7B.");
  }

  if (config.provider === "mock" && config.mode === "dry_run") {
    return true;
  }

  if (config.provider === "openai-compatible-placeholder" && config.mode === "disabled") {
    throw new ProviderRuntimeError(PHASE_7B_PLACEHOLDER_ERROR);
  }

  if (config.provider === "mock") {
    throw new ProviderRuntimeError('Provider "mock" must use mode "dry_run" in Phase 7B.');
  }

  if (config.provider === "openai-compatible-placeholder") {
    throw new ProviderRuntimeError('Provider "openai-compatible-placeholder" is planned but disabled in Phase 7B.');
  }

  throw new ProviderUnavailableError(`Unknown provider: ${config.provider}`);
}

export function getPlaceholderNotCallableMessage() {
  return PHASE_7B_PLACEHOLDER_ERROR;
}
