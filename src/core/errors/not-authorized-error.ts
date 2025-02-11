import { CustomError } from 'core/errors/custom-error';

class NotAuthorizedError extends CustomError {
  statusCode = 401;
  reason = 'User not authorized';

  constructor (details?: Record<string, any>) {
    super('Not authorized!', details);

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors () {
    return [{ message: this.message, reason: this.reason, details: this.details }];
  }
}

export { NotAuthorizedError };
