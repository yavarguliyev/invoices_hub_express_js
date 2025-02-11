import { ValidationError } from 'express-validator';

import { CustomError } from 'core/errors/custom-error';

class RequestValidationError extends CustomError {
  statusCode = 400;
  reason = 'Validation failed';

  constructor (public errors: ValidationError[], details?: Record<string, any>) {
    super('Invalid request parameters', details);

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors () {
    return this.errors.map(error => ({
      message: error.msg,
      field: error.type,
      reason: this.reason,
      details: this.details
    }));
  }
}

export { RequestValidationError };
