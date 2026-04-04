import { CookieOptions } from "express";

export const SALT_ROUNDS = 12;
export const ACCESS_TOKEN_EXPIRATION = "15m";
export const REFRESH_TOKEN_EXPIRATION = "7d";
export const OTP_CODE_EXPIRATION_MINUTES = 10;

const isProd = process.env.NODE_ENV === "production";
export const ACCESS_TOKEN_COOKIE: CookieOptions = {
  httpOnly: true, // JavaScript cannot access this cookie
  secure: isProd, // HTTPS only in production, allows HTTP in dev
  sameSite: "strict", // never sent on cross-site requests
  maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
  path: "/",
};

export const REFRESH_TOKEN_COOKIE: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/auth/refresh", // only sent to the refresh endpoint
};
