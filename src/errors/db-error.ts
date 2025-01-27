import { BaseError } from 'errors';

export class DbError extends BaseError {
  public operationName: string;
  public args: any[];

  constructor (operationName: string, args: any[] = []) {
    super(500, 'Database operation failed', { operationName, args });
    this.operationName = operationName;
    this.args = args;
  }

  toJSON () {
    return {
      status: this.httpCode,
      message: this.message,
      failedOperation: this.operationName,
      details: this.args
    };
  }
}
