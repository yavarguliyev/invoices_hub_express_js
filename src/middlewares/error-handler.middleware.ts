import { Middleware, ExpressErrorMiddlewareInterface, HttpError } from 'routing-controllers';
import { Request, Response } from 'express';

import { BaseError, DbError, NotFoundError, BadRequestError, ValidationError } from 'errors';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error (error: any, _request: Request, response: Response) {
    let statusCode = error.httpCode || 500;
    let errorMessage = error.message || 'An unexpected error occurred.';
    let errorDetails = error.details || null;

    const validationErrors: { property: string; constraints: any; value: any }[] = [];

    if (error.errors) {
      error.errors.forEach((e: any) => {
        validationErrors.push({
          property: e.property,
          constraints: e.constraints,
          value: e.value
        });
      });
    }

    if (error instanceof DbError) {
      statusCode = error.httpCode;
      errorMessage = 'Database operation failed';
      errorDetails = { failedOperation: error.operationName, args: error.args };
    } else if (error instanceof NotFoundError) {
      statusCode = error.httpCode;
      errorMessage = error.message || 'Resource not found';
    } else if (error instanceof HttpError) {
      statusCode = error.httpCode;
      errorMessage = error.message || 'HTTP error occurred';
    } else if (error instanceof ValidationError) {
      statusCode = error.httpCode;
      errorMessage = error.message || 'Validation error occurred';
    } else if (error instanceof BadRequestError) {
      statusCode = error.httpCode;
      errorMessage = error.message || 'Bad request';
    } else if (error instanceof BaseError) {
      statusCode = error.httpCode;
      errorMessage = error.message;
      errorDetails = error.details;
    }

    if (validationErrors.length > 0) {
      errorDetails = validationErrors;
    }

    response.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      details: errorDetails
    });
  }
}
