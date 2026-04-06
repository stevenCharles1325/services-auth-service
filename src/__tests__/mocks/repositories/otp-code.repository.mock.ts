import OTPCodeRepository from "#Repositories/otp-code.repository";
import { vi } from "vitest";

export const createMockOTPCodeRepo = () =>
  ({
    findOTP: vi.fn(),
    markOTPAsUsed: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }) satisfies Record<keyof OTPCodeRepository, ReturnType<typeof vi.fn>>;
