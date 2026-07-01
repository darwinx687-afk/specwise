export class ReviewDecisionValidationError extends Error {
  constructor(errors) {
    const normalizedErrors = Array.isArray(errors) ? errors : [errors];
    super(normalizedErrors.join("; "));
    this.name = "ReviewDecisionValidationError";
    this.errors = normalizedErrors;
  }
}

export class ReviewWorkflowError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReviewWorkflowError";
  }
}
