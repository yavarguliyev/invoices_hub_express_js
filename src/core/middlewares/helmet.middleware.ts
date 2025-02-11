import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'before' })
export class HelmetMiddleware implements ExpressMiddlewareInterface {
  private helmetMiddleware = helmet();

  use (req: Request, res: Response, next: NextFunction): void {
    this.helmetMiddleware(req, res, next);
  }
}
