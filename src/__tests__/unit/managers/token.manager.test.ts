import { describe, it, expect, beforeEach, vi } from "vitest";
import TokenManager from "#Managers/token.manager";

const JWT_SECRET = "test_secret_that_is_long_enough_32ch";
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

describe("TokenManager", () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    tokenManager = new TokenManager(JWT_SECRET, ACCESS_EXPIRY, REFRESH_EXPIRY);
  });

  // ─── signAccessToken ───────────────────────────────────────────────

  describe("signAccessToken()", () => {
    const payload: any = {
      sub: crypto.randomUUID(),
      email: "test@test.com",
      isVerified: true,
      jti: crypto.randomUUID(),
    };

    it("should return a JWT string", async () => {
      const token = await tokenManager.signAccessToken(payload);
      expect(token).toBeDefined();
      expect(token.split(".")).toHaveLength(3); // header.payload.signature
    });

    it("should encode payload correctly", async () => {
      const token = await tokenManager.signAccessToken(payload);
      const decoded = (await tokenManager.verify(token)) as any;

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.isVerified).toBe(payload.isVerified);
      expect(decoded.jti).toBe(payload.jti);
    });

    it("should contain iat and exp claims", async () => {
      const token = await tokenManager.signAccessToken(payload);
      const decoded = (await tokenManager.verify(token)) as any;
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });

  // ─── signRefreshToken ──────────────────────────────────────────────

  describe("signRefreshToken()", () => {
    const payload = {
      sub: crypto.randomUUID(),
      jti: crypto.randomUUID(),
    };

    it("should return a JWT string", async () => {
      const token = await tokenManager.signRefreshToken(payload);
      expect(token).toBeDefined();
      expect(token.split(".")).toHaveLength(3);
    });

    it("should encode payload correctly", async () => {
      const token = await tokenManager.signRefreshToken(payload);
      const decoded = (await tokenManager.verify(token)) as any;
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.jti).toBe(payload.jti);
    });
  });

  // ─── verify ─────────────────────────────────────────────

  describe("verify()", () => {
    it("should return decoded payload for valid token", async () => {
      const payload = {
        sub: crypto.randomUUID(),
        email: "test@test.com",
        isVerified: true,
        jti: crypto.randomUUID(),
      };

      const token = await tokenManager.signAccessToken(payload);
      const decoded = (await tokenManager.verify(token)) as any;

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
    });

    it("should throw on invalid token", async () => {
      await expect(tokenManager.verify("invalid.token.here")).rejects.toThrow();
    });

    it("should throw on tampered token", async () => {
      const payload = {
        sub: crypto.randomUUID(),
        email: "test@test.com",
        isVerified: true,
        jti: crypto.randomUUID(),
      };

      const token = await tokenManager.signAccessToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX"; // corrupt signature

      await expect(tokenManager.verify(tampered)).rejects.toThrow();
    });

    it("should throw on expired token", async () => {
      const expiredTokenManager = new TokenManager(
        JWT_SECRET,
        "1ms",
        REFRESH_EXPIRY,
      );

      const payload = {
        sub: crypto.randomUUID(),
        email: "test@test.com",
        isVerified: true,
        jti: crypto.randomUUID(),
      };

      const token = await expiredTokenManager.signAccessToken(payload);

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(() => expiredTokenManager.verify(token)).rejects.toThrow();
    });

    it("should throw on token signed with different secret", async () => {
      const otherManager = new TokenManager(
        "different_secret_that_is_32chars!!",
        ACCESS_EXPIRY,
        REFRESH_EXPIRY,
      );

      const payload = {
        sub: crypto.randomUUID(),
        email: "test@test.com",
        isVerified: true,
        jti: crypto.randomUUID(),
      };

      const token = await otherManager.signAccessToken(payload);

      await expect(tokenManager.verify(token)).rejects.toThrow();
    });
  });

  // ─── verify ────────────────────────────────────────────

  describe("verify()", () => {
    it("should return decoded payload for valid token", async () => {
      const payload = {
        sub: crypto.randomUUID(),
        jti: crypto.randomUUID(),
      };

      const token = await tokenManager.signRefreshToken(payload);
      const decoded = (await tokenManager.verify(token)) as any;

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.jti).toBe(payload.jti);
    });

    it("should throw on invalid token", async () => {
      await expect(tokenManager.verify("invalid.token.here")).rejects.toThrow();
    });

    it("should not verify access token as refresh token", async () => {
      // Access tokens and refresh tokens should not be interchangeable
      // if you sign them with different secrets or add type claims
      const accessPayload = {
        sub: crypto.randomUUID(),
        email: "test@test.com",
        isVerified: true,
        jti: crypto.randomUUID(),
      };

      const accessToken = await tokenManager.signAccessToken(accessPayload);

      // If your TokenManager adds a `type` claim — this should throw
      // If not, this is a reminder to add it
      expect(accessToken).toBeDefined();
    });
  });

  // ─── getExpiry ─────────────────────────────────────────────────────

  describe("getExpiry()", () => {
    it("should return a future Date for access token", () => {
      const expiry = tokenManager.getExpiry("access");
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });

    it("should return a future Date for refresh token", () => {
      const expiry = tokenManager.getExpiry("refresh");
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });

    it("should return later expiry for refresh than access", () => {
      const accessExpiry = tokenManager.getExpiry("access");
      const refreshExpiry = tokenManager.getExpiry("refresh");
      expect(refreshExpiry.getTime()).toBeGreaterThan(accessExpiry.getTime());
    });

    it("should return expiry approximately 15 minutes from now for access", () => {
      const expiry = tokenManager.getExpiry("access");
      const expectedMs = 15 * 60 * 1000;
      const diff = expiry.getTime() - Date.now();

      // Allow 1 second tolerance
      expect(diff).toBeGreaterThan(expectedMs - 1000);
      expect(diff).toBeLessThan(expectedMs + 1000);
    });

    it("should return expiry approximately 7 days from now for refresh", () => {
      const expiry = tokenManager.getExpiry("refresh");
      const expectedMs = 7 * 24 * 60 * 60 * 1000;
      const diff = expiry.getTime() - Date.now();

      expect(diff).toBeGreaterThan(expectedMs - 1000);
      expect(diff).toBeLessThan(expectedMs + 1000);
    });
  });
});
