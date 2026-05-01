import type { Request } from "express";

export interface RateLimitOptions {
  name: string;
  maxAttempts: number;
  windowMs: number;
  keyFn?: (req: Request) => string;
}
