import HashManager from "#Managers/hash.manager";
import { describe, it, expect, beforeEach } from "vitest";

describe("HashManager", () => {
  let hashManager: HashManager;

  beforeEach(() => {
    hashManager = new HashManager(10); // low rounds for faster tests
  });

  describe("hash()", () => {
    it("should return a hashed string", async () => {
      const result = await hashManager.hash("password123");
      expect(result).toBeDefined();
      expect(result).not.toBe("password123");
    });

    it("should return different hashes for the same input", async () => {
      const hash1 = await hashManager.hash("password123");
      const hash2 = await hashManager.hash("password123");
      expect(hash1).not.toBe(hash2); // bcrypt uses random salt
    });

    it("should return a bcrypt hash format", async () => {
      const result = await hashManager.hash("password123");
      expect(result).toMatch(/^\$2[ab]\$\d+\$/); // bcrypt format
    });
  });

  describe("compare()", () => {
    it("should return true for matching password and hash", async () => {
      const hash = await hashManager.hash("password123");
      const result = await hashManager.compare("password123", hash);
      expect(result).toBe(true);
    });

    it("should return false for non-matching password and hash", async () => {
      const hash = await hashManager.hash("password123");
      const result = await hashManager.compare("wrongpassword", hash);
      expect(result).toBe(false);
    });

    it("should return false for empty string against a valid hash", async () => {
      const hash = await hashManager.hash("password123");
      const result = await hashManager.compare("", hash);
      expect(result).toBe(false);
    });
  });

  describe("sha256()", () => {
    it("should return a sha256 hex string", async () => {
      const result = await hashManager.sha256("token123");
      expect(result).toMatch(/^[a-f0-9]{64}$/); // 64 hex chars
    });

    it("should return the same hash for the same input", async () => {
      const hash1 = await hashManager.sha256("token123");
      const hash2 = await hashManager.sha256("token123");
      expect(hash1).toBe(hash2); // deterministic unlike bcrypt
    });

    it("should return different hashes for different inputs", async () => {
      const hash1 = await hashManager.sha256("token123");
      const hash2 = hashManager.sha256("token456");
      expect(hash1).not.toBe(hash2);
    });

    it("should not return the original value", async () => {
      const result = await hashManager.sha256("token123");
      expect(result).not.toBe("token123");
    });
  });
});
