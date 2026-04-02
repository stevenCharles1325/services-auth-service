import { z, ZodObject, ZodRawShape } from 'zod';
import { IEnvProvider } from './types';

export class EnvManager<T extends ZodRawShape> {
  private cache: z.infer<ZodObject<T>> | null = null;

  constructor(
    private readonly schema: ZodObject<T>,
    private readonly provider: IEnvProvider,
  ) {}

  async load(): Promise<z.infer<ZodObject<T>>> {
    if (this.cache) return this.cache;

    const raw = await this.provider.getAll();
    const parsed = this.schema.safeParse(raw);

    if (!parsed.success) {
      const issues = parsed.error.issues
        .map(i => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(`❌ Invalid environment variables:\n${issues}`);
    }

    this.cache = parsed.data;
    return this.cache;
  }

  async get<K extends keyof z.infer<ZodObject<T>>>(
    key: K
  ): Promise<z.infer<ZodObject<T>>[K]> {
    const config = await this.load();
    return config[key];
  }
}