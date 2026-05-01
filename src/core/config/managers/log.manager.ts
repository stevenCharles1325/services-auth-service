import pino, { Logger } from "pino";

const createLogger = (): Logger => {
  const isDev = process.env.NODE_ENV === "development";

  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    transport: isDev
      ? {
          target: "pino-pretty", // human readable in dev
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined, // JSON in production — picked up by log aggregators
  });
};

export const logger = createLogger();
