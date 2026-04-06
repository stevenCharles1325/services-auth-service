import { vi } from "vitest";

export const createMockTokenManager = () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verify: vi.fn(),
  decode: vi.fn(),
  getExpiry: vi.fn(),
});
