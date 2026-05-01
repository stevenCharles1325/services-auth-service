import AuthController from "#App/controllers/auth.controller";
import { validate } from "#Middleware/validation.middleware";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  VerifyEmailSchema,
} from "#Core/schemas/auth.schema";
import express, { RequestHandler } from "express";
import { CreateRequestHandler } from "#Core/types/common.type";
import { RateLimitOptions } from "#Core/types/rate-limit.type";

export default function createAuthRoutes(
  authController: AuthController,
  turnstileMiddleware: RequestHandler,
  createRateLimit: CreateRequestHandler<[options: RateLimitOptions]>,
) {
  const router = express.Router();

  const rateLimitDefaultOptions: Omit<RateLimitOptions, "name"> = {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,
  };

  router.post(
    "/login",
    createRateLimit({
      name: "AuthService:Login",
      ...rateLimitDefaultOptions,
    }),
    turnstileMiddleware,
    validate(SignInSchema),
    authController.login.bind(authController),
  );
  router.post(
    "/register",
    createRateLimit({
      name: "AuthService:Register",
      ...rateLimitDefaultOptions,
    }),
    turnstileMiddleware,
    validate(SignUpSchema),
    authController.register.bind(authController),
  );
  router.post(
    "/verify-email",
    createRateLimit({
      name: "AuthService:VerifyEmail",
      ...rateLimitDefaultOptions,
    }),
    turnstileMiddleware,
    validate(VerifyEmailSchema),
    authController.verifyEmail.bind(authController),
  );
  router.post(
    "/logout",
    createRateLimit({
      name: "AuthService:Logout",
      ...rateLimitDefaultOptions,
    }),
    turnstileMiddleware,
    authController.logout.bind(authController),
  );
  router.post(
    "/forgot-password",
    createRateLimit({
      name: "AuthService:ForgotPassword",
      ...rateLimitDefaultOptions,
    }),
    turnstileMiddleware,
    validate(ForgotPasswordSchema),
    authController.forgotPassword.bind(authController),
  );
  router.post(
    "/reset-password",
    createRateLimit({
      name: "AuthService:ResetPassword",
      ...rateLimitDefaultOptions,
    }),
    turnstileMiddleware,
    validate(ResetPasswordSchema),
    authController.resetPassword.bind(authController),
  );
  router.post(
    "/refresh",
    createRateLimit({
      name: "AuthService:Refresh",
      ...rateLimitDefaultOptions,
    }),
    turnstileMiddleware,
    authController.refreshToken.bind(authController),
  );

  return router;
}
