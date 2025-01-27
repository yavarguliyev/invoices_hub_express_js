import { HttpError } from 'routing-controllers';

export class BaseError extends HttpError {
  details: any;

  constructor (httpCode: number, message: string, details?: any) {
    super(httpCode);
    this.message = message;
    this.details = details || null;
  }

  toJSON () {
    return { status: this.httpCode, message: this.message, details: this.details };
  }
}
