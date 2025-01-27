import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Request, Response } from 'express';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error (error: any, _request: Request, response: Response) {
    const statusCode = error.httpCode || 400;

    response.status(statusCode).json({
      status: 'error',
      message: error.message || 'An unexpected error occurred.',
      details: error.errors || null
    });
  }
}
