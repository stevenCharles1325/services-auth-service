import jwt from "jsonwebtoken";

export interface ITokenManager {
  signAccessToken(payload: Record<string, any>): Promise<string>;
  signRefreshToken(payload: Record<string, any>): Promise<string>;
  verify(token: string): Promise<jwt.JwtPayload | string>;
  decode<T>(token: string): Promise<T>;
  getExpiry(type: "access" | "refresh"): Date;
}
