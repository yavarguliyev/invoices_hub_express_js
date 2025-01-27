import { BaseError } from 'errors';

export class ValidationError extends BaseError {
  constructor (message: string, details?: any) {
    super(400, message, details);
  }
}
