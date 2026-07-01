import fs from "node:fs";
import path from "node:path";
import { ProviderConfigError } from "./provider-errors.mjs";

const ALLOWED_PROVIDERS = new Set(["mock", "openai-compatible-placeholder"]);
const ALLOWED_MODES = new Set(["dry_run", "disabled"]);
const PLACEHOLDER_HOST_SUFFIX = ".invalid";

export function normalizeProviderConfig(config) {
  return {
    schemaVersion: config.schemaVersion,
    provider: config.provider,
    mode: config.mode ?? "disabled",
    model: config.model,
    apiKeyEnv: config.apiKeyEnv,
    baseUrl: config.baseUrl,
    temperature: typeof config.temperature === "number" ? config.temperature : 0,
    safety: {
      evidenceFirst: config.safety?.evidenceFirst ?? true,
      reviewRequiredByDefault: config.safety?.reviewRequiredByDefault ?? true,
      allowNetworkCalls: config.safety?.allowNetworkCalls ?? false,
      allowLocalAbsolutePathsInOutput: config.safety?.allowLocalAbsolutePathsInOutput ?? false
    }
  };
}

export function validateProviderConfig(config) {
  const errors = [];

  if (!config || typeof config !== "object") {
    throw new ProviderConfigError("Provider config must be a JSON object.");
  }

  if (!config.schemaVersion) errors.push("schemaVersion is required");
  if (!config.provider) errors.push("provider is required");
  if (config.provider && !ALLOWED_PROVIDERS.has(config.provider)) {
    errors.push(`provider must be one of: ${Array.from(ALLOWED_PROVIDERS).join(", ")}`);
  }

  const mode = config.mode ?? "disabled";
  if (!ALLOWED_MODES.has(mode)) {
    errors.push(`mode must be one of: ${Array.from(ALLOWED_MODES).join(", ")}`);
  }

  if (config.provider === "mock" && !config.model) {
    errors.push("model is required for mock provider");
  }

  if (config.provider === "mock" && mode !== "dry_run") {
    errors.push('Provider "mock" must use mode "dry_run" in Phase 7B');
  }

  if (config.provider === "openai-compatible-placeholder" && mode !== "disabled") {
    errors.push('Provider "openai-compatible-placeholder" is planned but disabled in Phase 7B');
  }

  if (config.provider === "openai-compatible-placeholder" && config.apiKeyEnv !== undefined && typeof config.apiKeyEnv !== "string") {
    errors.push("apiKeyEnv must be a string when provided");
  }

  if (config.provider === "openai-compatible-placeholder" && config.baseUrl !== undefined) {
    if (typeof config.baseUrl !== "string") {
      errors.push("baseUrl must be a string when provided");
    } else {
      try {
        const parsedBaseUrl = new URL(config.baseUrl);
        if (!parsedBaseUrl.hostname.endsWith(PLACEHOLDER_HOST_SUFFIX)) {
          errors.push("baseUrl must use a non-real .invalid host in Phase 7B");
        }
      } catch {
        errors.push("baseUrl must be a valid URL when provided");
      }
    }
  }

  if (config.safety?.evidenceFirst === false) {
    errors.push("safety.evidenceFirst must not be false");
  }
  if (config.safety?.reviewRequiredByDefault === false) {
    errors.push("safety.reviewRequiredByDefault must not be false");
  }
  if (config.safety?.allowNetworkCalls === true) {
    errors.push("Network calls are not allowed in Phase 7B");
  }
  if (config.safety?.allowLocalAbsolutePathsInOutput === true) {
    errors.push("safety.allowLocalAbsolutePathsInOutput must not be true in Phase 7B");
  }

  if (errors.length > 0) {
    throw new ProviderConfigError(errors.join("; "));
  }

  return true;
}

export function loadProviderConfig(configPath) {
  if (!configPath) {
    throw new ProviderConfigError("Provider config path is required.");
  }

  const resolvedPath = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new ProviderConfigError(`Provider config not found: ${configPath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new ProviderConfigError(`Provider config is not valid JSON: ${error.message}`);
  }

  validateProviderConfig(parsed);
  return normalizeProviderConfig(parsed);
}
