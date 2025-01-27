import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Request, Response } from 'express';

import { BaseError, DbError, NotFoundError, BadRequestError } from 'errors';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error (error: any, _request: Request, response: Response) {
    let statusCode = error.httpCode || 500;
    let errorMessage = error.message || 'An unexpected error occurred.';
    let errorDetails = error.details || null;

    if (error instanceof DbError) {
      statusCode = error.httpCode;
      errorMessage = 'Database operation failed';
      errorDetails = { failedOperation: error.operationName, args: error.args };
    }

    if (error instanceof NotFoundError) {
      statusCode = error.httpCode;
      errorMessage = error.message || 'Resource not found';
    }

    if (error instanceof BadRequestError) {
      statusCode = error.httpCode;
      errorMessage = error.message || 'Bad request';
    }

    if (error instanceof BaseError) {
      statusCode = error.httpCode;
      errorMessage = error.message;
      errorDetails = error.details;
    }

    response.status(statusCode).json({ status: 'error', message: errorMessage, details: errorDetails });
  }
}
