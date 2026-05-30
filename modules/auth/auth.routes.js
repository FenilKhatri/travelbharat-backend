import express from "express";
import {
    register, login, googleAuth, logout, getMe,
    forgotPassword, resetPassword, verifyEmail,
    updateProfile, changePassword
} from "./auth.controller.js";
import { validateRegister, validateLogin } from "./auth.validator.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authLimiter } from "../../common/middlewares/limiter.js";

const router = express.Router();

// Public Routes
router.post("/register", validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/google", googleAuth);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected Routes
router.use(protect);
router.get("/me", getMe);
router.post("/logout", logout);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

export default router;