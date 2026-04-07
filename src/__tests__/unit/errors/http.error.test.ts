import { describe, it, expect } from "vitest";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from "#Errors/http.error";
import { AppError } from "#Errors/app.error";

describe("HTTP Errors", () => {
  describe("BadRequestError", () => {
    it("should have correct statusCode and code", () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
    });

    it("should use default message when none provided", () => {
      const error = new BadRequestError();
      expect(error.message).toBe("Bad request");
    });

    it("should use custom message when provided", () => {
      const error = new BadRequestError({ message: "Custom message" });
      expect(error.message).toBe("Custom message");
    });

    it("should be an instance of AppError", () => {
      const error = new BadRequestError();
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should be marked as operational", () => {
      const error = new BadRequestError();
      expect(error.isOperational).toBe(true);
    });

    it("should attach cause when provided", () => {
      const cause = new Error("original error");
      const error = new BadRequestError({ cause });
      expect(error.cause).toBe(cause);
    });

    it("should attach meta when provided", () => {
      const meta = { field: "email" };
      const error = new BadRequestError({ meta });
      expect(error.meta).toEqual(meta);
    });
  });

  // Rest of errors follow the same pattern
  // Use it.each to avoid repetition

  describe.each([
    {
      ErrorClass: UnauthorizedError,
      statusCode: 401,
      code: "UNAUTHORIZED",
      defaultMessage: "Unauthorized",
    },
    {
      ErrorClass: ForbiddenError,
      statusCode: 403,
      code: "FORBIDDEN",
      defaultMessage: "Forbidden",
    },
    {
      ErrorClass: NotFoundError,
      statusCode: 404,
      code: "NOT_FOUND",
      defaultMessage: "Resource not found",
    },
    {
      ErrorClass: ConflictError,
      statusCode: 409,
      code: "CONFLICT",
      defaultMessage: "Conflict",
    },
    {
      ErrorClass: ValidationError,
      statusCode: 422,
      code: "VALIDATION_ERROR",
      defaultMessage: "Validation failed",
    },
    {
      ErrorClass: InternalServerError,
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      defaultMessage: "Internal server error",
    },
  ])("$ErrorClass.name", ({ ErrorClass, statusCode, code, defaultMessage }) => {
    it("should have correct statusCode", () => {
      const error = new ErrorClass();
      expect(error.statusCode).toBe(statusCode);
    });

    it("should have correct code", () => {
      const error = new ErrorClass();
      expect(error.code).toBe(code);
    });

    it("should use default message", () => {
      const error = new ErrorClass();
      expect(error.message).toBe(defaultMessage);
    });

    it("should use custom message", () => {
      const error = new ErrorClass({ message: "Custom" });
      expect(error.message).toBe("Custom");
    });

    it("should be instance of AppError and Error", () => {
      const error = new ErrorClass();
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should be operational", () => {
      const error = new ErrorClass();
      expect(error.isOperational).toBe(true);
    });

    it("should have a stack trace", () => {
      const error = new ErrorClass();
      expect(error.stack).toBeDefined();
    });
  });
});
