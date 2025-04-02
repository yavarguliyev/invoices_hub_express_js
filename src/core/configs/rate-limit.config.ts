import dotenv from 'dotenv';

import { RateLimitConfig } from 'domain/interfaces/rate-limit-config.interface';

dotenv.config();

export const rateLimitConfig: RateLimitConfig = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: String(process.env.RATE_LIMIT_MESSAGE),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      error: String(process.env.RATE_LIMIT_ERROR_TITLE),
      message: String(process.env.RATE_LIMIT_ERROR_MESSAGE)
    });
  }
};
