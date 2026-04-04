import { Request, Response, NextFunction } from "express";
import { ZodAny, ZodObject } from "zod";

export const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(422).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Replace req.body with validated + typed data
    req.body = result.data;
    next();
  };
