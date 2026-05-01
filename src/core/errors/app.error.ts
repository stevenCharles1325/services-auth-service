export interface AppErrorOptions {
  message: string;
  statusCode: number;
  code: string;
  cause?: unknown; // original error that triggered this
  meta?: Record<string, unknown>; // extra context for logging
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly cause?: unknown;
  public readonly meta?: Record<string, unknown>;
  public readonly isOperational: boolean = true; // distinguishes known vs unknown errors

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.cause = options.cause;
    this.meta = options.meta;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
