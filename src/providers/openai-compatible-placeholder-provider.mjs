import {
  createProviderRuntimeDescriptor,
  getPlaceholderNotCallableMessage
} from "./provider-runtime-contract.mjs";
import { ProviderRuntimeError } from "./provider-errors.mjs";

function throwNotCallable() {
  throw new ProviderRuntimeError(getPlaceholderNotCallableMessage());
}

export function createOpenAICompatiblePlaceholderProvider(config) {
  return {
    describe() {
      const runtime = createProviderRuntimeDescriptor("openai-compatible-placeholder", config);
      return {
        name: "openai-compatible-placeholder",
        mode: config.mode,
        model: config.model,
        status: runtime.status,
        networkCalls: false,
        runtime,
        description: "OpenAI-compatible placeholder for Phase 7B boundary preview only."
      };
    },

    getRuntimeDescriptor() {
      return createProviderRuntimeDescriptor("openai-compatible-placeholder", config);
    },

    getCapabilities() {
      return this.getRuntimeDescriptor().capabilities;
    },

    planExtraction() {
      throwNotCallable();
    },

    call() {
      throwNotCallable();
    }
  };
}
