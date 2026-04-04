import AuthController from "#Controllers/auth.controller";
import { validate } from "#Middlewares/validation.middleware";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  VerifyEmailSchema,
} from "#Schemas/auth.schema";
import express from "express";
export default function createAuthRoutes(authController: AuthController) {
  const router = express.Router();

  router.post(
    "/login",
    validate(SignInSchema),
    authController.login.bind(authController),
  );
  router.post(
    "/register",
    validate(SignUpSchema),
    authController.register.bind(authController),
  );
  router.post(
    "/verify-email",
    validate(VerifyEmailSchema),
    authController.verifyEmail.bind(authController),
  );
  router.post("/logout", authController.logout.bind(authController));
  router.post(
    "/forgot-password",
    validate(ForgotPasswordSchema),
    authController.forgotPassword.bind(authController),
  );
  router.post(
    "/reset-password",
    validate(ResetPasswordSchema),
    authController.resetPassword.bind(authController),
  );
  router.post("/refresh", authController.refreshToken.bind(authController));

  return router;
}
