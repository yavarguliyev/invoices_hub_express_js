import { CustomError } from 'core/errors/custom-error';

class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Error connecting to the database';

  constructor (details?: Record<string, any>) {
    super('Database connection error', details);

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors () {
    return [{ message: this.message, reason: this.reason, details: this.details }];
  }
}

export { DatabaseConnectionError };
