import { Request } from "express";

// Relies on `app.set('trust proxy', N)` in main/server.ts: with that configured,
// `req.ip` strips the N trusted proxy hops from X-Forwarded-For and returns the
// real client. Without trust proxy, `req.ip` is the socket peer.
export function getClientIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export async function verifyTurnstile(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Allow local dev without Turnstile configured
  if (!secret && process.env.NODE_ENV === "development") {
    return true;
  }

  if (!token || !secret) {
    return false;
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error("[turnstile] Verification failed:", error);
    return false;
  }
}
