import type RefreshTokenRepository from "#Repositories/refresh-token.repository";
import { vi } from "vitest";

export const createMockRefreshTokenRepo = () =>
  ({
    findByAccessToken: vi.fn(),
    findByRefreshToken: vi.fn(),
    revokeByToken: vi.fn(),
    revokeById: vi.fn(),
    revokeByCredentialId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  }) satisfies Record<keyof RefreshTokenRepository, ReturnType<typeof vi.fn>>;
