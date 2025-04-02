import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { rateLimit } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

import { rateLimitConfig } from 'core/configs/rate-limit.config';

@Middleware({ type: 'before', priority: 1 })
export class RateLimitMiddleware implements ExpressMiddlewareInterface {
  private limiter = rateLimit(rateLimitConfig);

  use (request: Request, response: Response, next: NextFunction): void {
    console.log('Rate limit middleware executing...');
    this.limiter(request, response, next);
  }
}
