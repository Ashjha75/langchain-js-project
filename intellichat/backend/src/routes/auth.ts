/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */

import { Router } from "express";
import { authController } from "@/controllers/auth";
import { authenticateJWT } from "@/middleware/auth";
import { validateBody } from "@/middleware/validation";
import { z } from "zod";

const router = Router();

// Validation schemas
const registerBodySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character"),
  username: z.string().min(2, "User name must be at least 2 characters long").trim(),
  firstName: z.string().min(2, "First name must be at least 2 characters long").trim(),
  lastName: z.string().min(2, "Last name must be at least 2 characters long").trim(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
});

const loginBodySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character"),
});

const resetPasswordBodySchema = z.object({
  email: z.string().email("Invalid email format"),
});

const updateProfileBodySchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters long").trim().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters long").trim().optional(),
  profile: z
    .object({
      avatar: z.string().url("Invalid avatar URL").optional(),
      timezone: z.string().optional(),
      language: z.string().min(2, "Language code must be at least 2 characters").optional(),
      preferences: z
        .object({
          theme: z.enum(["light", "dark"]).optional(),
          defaultModel: z.string().optional(),
          streamingEnabled: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateBody(registerBodySchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validateBody(loginBodySchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", validateBody(refreshTokenBodySchema), authController.refreshToken);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  "/reset-password",
  validateBody(resetPasswordBodySchema),
  authController.requestPasswordReset,
);

/**
 * @route   GET /api/auth/health
 * @desc    Health check for auth service
 * @access  Public
 */
router.get("/health", authController.healthCheck);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticateJWT as any, authController.logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  "/change-password",
  authenticateJWT as any,
  validateBody(changePasswordBodySchema),
  authController.changePassword,
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", authenticateJWT as any, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticateJWT as any,
  validateBody(updateProfileBodySchema),
  authController.updateProfile,
);

export { router as authRoutes };
