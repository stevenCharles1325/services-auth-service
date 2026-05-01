import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "#Core/errors/app.error";

interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, unknown>;
  stack?: string;
}

const isDev = process.env.NODE_ENV === "development";

const handleZodError = (error: ZodError, res: Response): void => {
  res.status(422).json({
    success: false,
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    errors: error.flatten().fieldErrors,
  } satisfies ErrorResponse);
};

const handleJwtError = (error: Error, res: Response): void => {
  const isExpired = error.name === "TokenExpiredError";
  res.status(401).json({
    success: false,
    code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
    message: isExpired ? "Token has expired" : "Invalid token",
  } satisfies ErrorResponse);
};

const handleAppError = (error: AppError, res: Response): void => {
  const body: ErrorResponse = {
    success: false,
    code: error.code,
    message: error.message,
  };

  // Only expose stack trace in development
  if (isDev) body.stack = error.stack;

  res.status(error.statusCode).json(body);
};

const handleUnknownError = (error: unknown, res: Response): void => {
  // Never expose internal details to client in production
  console.error("[Unhandled Error]", error);

  const body: ErrorResponse = {
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message:
      isDev && error instanceof Error ? error.message : "Something went wrong",
  };

  if (isDev && error instanceof Error) body.stack = error.stack;

  res.status(500).json(body);
};

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) return handleZodError(error, res);

  if (
    error instanceof Error &&
    ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
      error.name,
    )
  ) {
    return handleJwtError(error, res);
  }

  if (error instanceof AppError) return handleAppError(error, res);

  handleUnknownError(error, res);
};
