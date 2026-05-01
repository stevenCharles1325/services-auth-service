import { RequestHandler } from "express";

export type CreateRequestHandler<T extends unknown[] = []> = (...args: T) => RequestHandler;