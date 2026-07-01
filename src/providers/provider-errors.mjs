export class ProviderConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProviderConfigError";
  }
}

export class ProviderUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

export class ProviderRuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProviderRuntimeError";
  }
}
