import bcrypt from "bcrypt";
import { createHash } from "crypto";

export default class HashManager {
  constructor (
    private readonly saltRounds: number,
  ) {}

  public async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  public async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  public async sha256(value: string): Promise<string> {
    return createHash('sha256').update(value).digest('hex');
  }
}