import { AppError } from "./app.error";

interface HttpErrorOptions {
  message?: string;
  cause?: unknown;
  meta?: Record<string, unknown>;
}

export class BadRequestError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super({
      statusCode: 400,
      code: "BAD_REQUEST",
      message: options.message ?? "Bad request",
      cause: options.cause,
      meta: options.meta,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: options.message ?? "Unauthorized",
      cause: options.cause,
      meta: options.meta,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super({
      statusCode: 403,
      code: "FORBIDDEN",
      message: options.message ?? "Forbidden",
      cause: options.cause,
      meta: options.meta,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super({
      statusCode: 404,
      code: "NOT_FOUND",
      message: options.message ?? "Resource not found",
      cause: options.cause,
      meta: options.meta,
    });
  }
}

export class ConflictError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super({
      statusCode: 409,
      code: "CONFLICT",
      message: options.message ?? "Conflict",
      cause: options.cause,
      meta: options.meta,
    });
  }
}

export class ValidationError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: options.message ?? "Validation failed",
      cause: options.cause,
      meta: options.meta,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super({
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: options.message ?? "Internal server error",
      cause: options.cause,
      meta: options.meta,
    });
  }
}
