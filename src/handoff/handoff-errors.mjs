export class HandoffWorkflowError extends Error {
  constructor(message) {
    super(message);
    this.name = "HandoffWorkflowError";
  }
}

export class HandoffValidationError extends Error {
  constructor(errors) {
    const list = Array.isArray(errors) ? errors : [errors];
    super(list.map((error) => `ERROR ${error}`).join("\n"));
    this.name = "HandoffValidationError";
    this.errors = list;
  }
}
