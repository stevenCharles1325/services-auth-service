export interface IEnvProvider {
  get(key: string): Promise<string | undefined>;
  getAll(): Promise<Record<string, string>>;
}