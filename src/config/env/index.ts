import { z } from 'zod';
import { EnvManager } from './env.manager';
import LocalEnvProvider from './providers/local.provider';
// import { SSMEnvProvider } from './providers/ssm.provider';
import { IEnvProvider } from './types';

// 1. Define what vars your service needs + their types
const schema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
});

// 2. Auto-select provider based on NODE_ENV
function createProvider(): IEnvProvider {
  const env = process.env.NODE_ENV ?? 'development';
  switch (env) {
    case 'production':
    case 'staging':
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
export type ENV = z.infer<typeof schema>;