import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  HASH_SALT_ROUNDS: z.coerce.number().default(12),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_TOKEN_EXPIRATION: z.string().default("7d"),
  OTP_CODE_EXPIRATION_MINUTES: z.coerce.number().default(10),
});