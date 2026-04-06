import { vi } from "vitest";
import type CredentialRepository from "#Interfaces/credential-repository.interface";

export const createMockCredentialRepo = () =>
  ({
    findCredentialById: vi.fn(),
    findCredentialByEmail: vi.fn(),
    markEmailAsVerified: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  }) satisfies Record<keyof CredentialRepository, ReturnType<typeof vi.fn>>;
