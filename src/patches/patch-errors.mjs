export class PatchValidationError extends Error {
  constructor(errors) {
    const normalizedErrors = Array.isArray(errors) ? errors : [errors];
    super(normalizedErrors.join("; "));
    this.name = "PatchValidationError";
    this.errors = normalizedErrors;
  }
}

export class PatchPreviewError extends Error {
  constructor(message) {
    super(message);
    this.name = "PatchPreviewError";
  }
}
