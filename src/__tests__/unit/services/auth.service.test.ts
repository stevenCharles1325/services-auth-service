import { AppConfig } from "#Env";
import { ConflictError } from "#Errors/http.error";
import type HashManager from "#Managers/hash.manager";
import type TokenManager from "#Managers/token.manager";
import type CredentialRepository from "#Repositories/credential.repository";
import type OTPCodeRepository from "#Repositories/otp-code.repository";
import type RefreshTokenRepository from "#Repositories/refresh-token.repository";
import AuthService from "#Services/auth.service";
import { mockEnv } from "src/__tests__/mocks/managers/env.manager.mock";
import { createMockHashManager } from "src/__tests__/mocks/managers/hash.manager.mock";
import { createMockTokenManager } from "src/__tests__/mocks/managers/token.manager.mock";
import { createMockCredentialRepo } from "src/__tests__/mocks/repositories/credential.repository.mock";
import { createMockOTPCodeRepo } from "src/__tests__/mocks/repositories/otp-code.repository.mock";
import { createMockRefreshTokenRepo } from "src/__tests__/mocks/repositories/refresh-token.repository.mock";
import { describe, it, expect } from "vitest";

describe("AuthService", () => {
  it("Should throw ConflictError when trying to register with an existing email", async () => {
    const mockedCredentialRepo = createMockCredentialRepo();
    const mockedRefreshTokenRepo = createMockRefreshTokenRepo();
    const mockedOTPCodeRepo = createMockOTPCodeRepo();
    const mockedHashManager = createMockHashManager();
    const mockedTokenManager = createMockTokenManager();
    const mockedEnv = mockEnv;

    mockedCredentialRepo.findCredentialByEmail.mockResolvedValue({
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      email: "sample@gmail.com",
      password: "hashed",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dto = {
      email: "sample@gmail.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      firstName: "John",
      middleName: "sample",
      lastName: "Doe",
      birthdate: "1990-01-01",
    };

    const authService = new AuthService(
      mockedCredentialRepo as unknown as CredentialRepository,
      mockedRefreshTokenRepo as unknown as RefreshTokenRepository,
      mockedOTPCodeRepo as unknown as OTPCodeRepository,
      mockedHashManager as unknown as HashManager,
      mockedTokenManager as unknown as TokenManager,
      mockedEnv as unknown as AppConfig,
    );

    await expect(authService.register(dto)).rejects.toThrow(ConflictError);
  });
});
