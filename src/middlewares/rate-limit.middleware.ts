import { NextFunction, Request, Response } from "express";
import { TooManyRequestsError } from "#Core/errors/http.error";
import { RateLimitOptions } from "#Core/types/rate-limit.type";
import { rateLimit } from "#Core/utils/rate-limit.util";
import { getClientIp } from "#Core/utils/server.util";

export const createRateLimitMiddleware =
  (options: RateLimitOptions) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { name, maxAttempts, windowMs, keyFn } = options;
    const id = keyFn ? keyFn(req) : getClientIp(req);
    const key = `${name}:${id}`;

    const result = rateLimit(key, maxAttempts, windowMs);

    res.setHeader("X-RateLimit-Limit", String(maxAttempts));
    res.setHeader("X-RateLimit-Remaining", String(result.remaining));
    res.setHeader(
      "X-RateLimit-Reset",
      String(Math.ceil(result.resetAt / 1000)),
    );

    if (!result.allowed) {
      const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      return next(
        new TooManyRequestsError({
          message: "Too many requests, please try again later",
          meta: { name, retryAfterSec },
        }),
      );
    }

    next();
  };
