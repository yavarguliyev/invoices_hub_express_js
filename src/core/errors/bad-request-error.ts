import { CustomError } from 'core/errors/custom-error';

class BadRequestError extends CustomError {
  statusCode = 400;
  reason = 'Bad request';

  constructor (message: string, details?: Record<string, any>) {
    super(message, details);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors () {
    return [{ message: this.message, reason: this.reason, details: this.details }];
  }
}

export { BadRequestError };
