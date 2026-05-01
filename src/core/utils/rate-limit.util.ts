interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  resetAt: number;
}

// In-memory store. Single-process only — for multi-instance deployments,
// swap this for a Redis-backed implementation behind the same interface.
const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfterMs: 0,
      resetAt,
    };
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    retryAfterMs: 0,
    resetAt: entry.resetAt,
  };
}
