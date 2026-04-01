import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
});

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const OTPCodeSchema = z.object({
  code: z.string().length(6, 'OTP code must be 6 digits'),
});

export const RefreshTokenSchema = z.object({
  token: z.string(),
});

export type SignUpDTO = z.infer<typeof SignUpSchema>;
export type SignInDTO = z.infer<typeof SignInSchema>;
export type OTPCodeDTO = z.infer<typeof OTPCodeSchema>;
export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;


