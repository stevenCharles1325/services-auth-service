import { vi } from "vitest";

export const createMockHashManager = () => ({
  hash: vi.fn(),
  compare: vi.fn(),
  sha256: vi.fn(),
});
