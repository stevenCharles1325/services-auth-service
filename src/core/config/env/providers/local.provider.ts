import 'dotenv/config';
import { IEnvProvider } from "../types";

export default class LocalProvider implements IEnvProvider {
  public async get(key: string): Promise<string | undefined> {
    return process.env[key];
  }

  public async getAll(): Promise<Record<string, string>> {
    return Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => v !== undefined)
    ) as Record<string, string>;
  }
}