import { envSchema } from "#Core/schemas/env.schema";
import z from "zod";

export interface IEnvProvider {
  get(key: string): Promise<string | undefined>;
  getAll(): Promise<Record<string, string>>;
}

export type Env = z.infer<typeof envSchema>;
