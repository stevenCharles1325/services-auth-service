import { z } from "zod";
import { EnvManager } from "./env.manager";
import LocalEnvProvider from "./providers/local.provider";
// import { SSMEnvProvider } from './providers/ssm.provider';
import { IEnvProvider } from "./types";
import { envSchema } from "#Core/schemas/env.schema";

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
export const envManager = new EnvManager(envSchema, createProvider());
export type AppConfig = z.infer<typeof envSchema>;
