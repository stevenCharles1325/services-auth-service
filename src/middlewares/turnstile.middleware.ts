import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "#Core/errors/http.error";
import { getClientIp, verifyTurnstile } from "#Core/utils/server.util";
import {
  DEFAULT_BODY_FIELD,
  DEFAULT_HEADER,
} from "#Core/config/constants";
import { TurnstileOptions } from "#Core/types/turnstile.type";

const extractToken = (
  req: Request,
  options: TurnstileOptions,
): string | undefined => {
  const headerName = (options.headerName ?? DEFAULT_HEADER).toLowerCase();
  const bodyField = options.bodyField ?? DEFAULT_BODY_FIELD;

  const header = req.headers[headerName];
  if (typeof header === "string" && header) return header;
  if (Array.isArray(header) && header[0]) return header[0];

  const body = req.body as Record<string, unknown> | undefined;
  const fromBody = body?.[bodyField];
  return typeof fromBody === "string" && fromBody ? fromBody : undefined;
};

export const createTurnstileMiddleware =
  (options: TurnstileOptions = {}) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractToken(req, options);
      const ip = getClientIp(req);
      const verified = await verifyTurnstile(token, ip);

      if (!verified) {
        throw new ForbiddenError({
          message: "Bot verification failed",
          meta: { ip },
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
