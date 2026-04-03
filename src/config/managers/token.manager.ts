import { parseExpiry } from "#Utils/time.util";
import jwt from "jsonwebtoken";

export default class TokenManager {
  constructor (
    private readonly jwtSecret: string,
    private readonly accessTokenExpiry: string,
    private readonly refreshTokenExpiry: string,
  ) {}

  public async signAccessToken(payload: Record<string, any>): Promise<string> {
    // @ts-ignore
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.accessTokenExpiry });
  }

  public async signRefreshToken(payload: Record<string, any>): Promise<string> {
    // @ts-ignore
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.refreshTokenExpiry });
  }

  public async verify(token: string): Promise<jwt.JwtPayload | string> {
    return jwt.verify(token, this.jwtSecret);
  }

  public async decode(token: string): Promise<jwt.JwtPayload | string | null> {
    return jwt.decode(token);
  }

  getExpiry(type: 'access' | 'refresh'): Date {
    const expiry = type === 'access' ? this.accessTokenExpiry : this.refreshTokenExpiry;
    return new Date(Date.now() + parseExpiry(expiry));
  }
}