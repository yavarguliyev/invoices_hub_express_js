import { CustomError } from 'core/errors/custom-error';

class NotFoundError extends CustomError {
  statusCode = 404;
  reason = 'Resource not found';

  constructor (message: string, details?: Record<string, any>) {
    super(message, details);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors () {
    return [{ message: this.message, reason: this.reason, details: this.details }];
  }
}

export { NotFoundError };
