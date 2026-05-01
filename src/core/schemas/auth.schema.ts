import { z } from "zod";

export const SignUpSchema = z
  .object({
    email: z.email(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional(),
    birthdate: z.string().refine(
      (date) => {
        const parsedDate = Date.parse(date);
        return !isNaN(parsedDate) && new Date(parsedDate) < new Date();
      },
      {
        message: "Birthdate must be a valid date in the past",
      },
    ),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const OTPCodeSchema = z.object({
  code: z.string().length(6, "OTP code must be 6 digits"),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const RefreshTokenSchema = z.object({
  token: z.string(),
});

export const VerifyEmailSchema = z.object({
  credentialId: z.string(),
  code: z.string().length(6, "OTP code must be 6 digits"),
});

export const ForgotPasswordSchema = z.object({
  email: z.email(),
});

export type SignUpDTO = z.infer<typeof SignUpSchema>;
export type SignInDTO = z.infer<typeof SignInSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type VerifyEmailDTO = z.infer<typeof VerifyEmailSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
export type OTPCodeDTO = z.infer<typeof OTPCodeSchema>;
export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
