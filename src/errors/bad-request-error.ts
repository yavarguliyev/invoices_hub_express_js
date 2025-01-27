import { BaseError } from 'errors';

export class BadRequestError extends BaseError {
  constructor (message: string = 'Bad request') {
    super(400, message);
  }
}
