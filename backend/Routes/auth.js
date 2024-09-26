import express from 'express'
import { register, login, resetForgottenPassword, resendEmailVerification, verifyEmail, logoutUser, forgotPasswordRequest, refreshAccessToken } from '../Controllers/authController.js'

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPasswordRequest);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify-email/:verificationToken", verifyEmail);
router.post("/reset-password/:resetToken", resetForgottenPassword);

// Secured routes
router.post("/logout", logoutUser);
router.post("/resend-email-verification", resendEmailVerification);
export default router