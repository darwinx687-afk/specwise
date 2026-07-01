export class ManualApplyPlanValidationError extends Error {
  constructor(errors) {
    const normalizedErrors = Array.isArray(errors) ? errors : [errors];
    super(normalizedErrors.join("; "));
    this.name = "ManualApplyPlanValidationError";
    this.errors = normalizedErrors;
  }
}

export class ApplyPlanWorkflowError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApplyPlanWorkflowError";
  }
}
