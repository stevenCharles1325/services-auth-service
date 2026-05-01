import { z } from "zod";
import { EnvManager } from "./env.manager";
import LocalEnvProvider from "./providers/local.provider";
// import { SSMEnvProvider } from './providers/ssm.provider';
import { IEnvProvider } from "./types";

// 1. Define what vars your service needs + their types
const schema = z.object({
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

// 2. Auto-select provider based on NODE_ENV
function createProvider(): IEnvProvider {
  const env = process.env.NODE_ENV ?? "development";
  switch (env) {
    case "production":
    case "staging":
      // return new SSMEnvProvider({
      //   basePath: `/myapp/auth-service/${env}`,
      //   region: process.env.AWS_REGION ?? 'ap-southeast-1',
      // });
      return {} as any;
    default:
      return new LocalEnvProvider();
  }
}

// 3. Export a single instance used everywhere
export const envManager = new EnvManager(schema, createProvider());
export type AppConfig = z.infer<typeof schema>;
