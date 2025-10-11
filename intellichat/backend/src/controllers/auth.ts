/**
 * Authentication Controller
 * Handles HTTP requests for authentication and user management
 */

import type { Request, Response, NextFunction } from "express";
import { authService } from "@/services/auth";
import { createLogger } from "@/utils/logger";
import { ValidationError, UnauthorizedError } from "@/utils/errorHandler";

const logger = createLogger("AuthController");

export class AuthController {
  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, acceptTerms, username } = req.body;
      console.log("=== DEBUG REQUEST ===");
      console.log("Full req.body:", JSON.stringify(req.body, null, 2));
      console.log("All keys in body:", Object.keys(req.body));
      console.log("Username value:", req.body.username);
      console.log("Username type:", typeof req.body.username);
      console.log("==================");
      if (!email || !password || !firstName || !lastName || !acceptTerms || !username) {
        throw new ValidationError("All fields are required");
      }

      const result = await authService.register({
        username,
        email,
        password,
        firstName,
        lastName,
        acceptTerms,
      });

      logger.info("User registered successfully", {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        throw new ValidationError("Email and password are required");
      }

      const result = await authService.login({
        email,
        password,
        rememberMe: rememberMe || false,
      });

      logger.info("User logged in successfully", {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError("Refresh token is required");
      }

      const result = await authService.refreshToken({ refreshToken });

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { refreshToken } = req.body;
      const userId = user?.id;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      await authService.logout(userId, refreshToken);

      logger.info("User logged out", {
        userId,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { currentPassword, newPassword } = req.body;
      const userId = user?.id;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!currentPassword || !newPassword) {
        throw new ValidationError("Current password and new password are required");
      }

      await authService.changePassword({
        userId,
        currentPassword,
        newPassword,
      });

      logger.info("Password changed successfully", {
        userId,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError("Email is required");
      }

      await authService.requestPasswordReset({ email });

      logger.info("Password reset requested", {
        email,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent",
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const user = await authService.getProfile(userId);

      res.json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName,
          username: (user as any).username,
          role: user.role,
          status: (user as any).status,
          subscription: user.subscription,
          auth: {
            lastLogin: (user as any).auth?.lastLogin,
            emailVerified: (user as any).auth?.emailVerified,
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id;
      const { firstName, lastName, profile } = req.body;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const updatedUser = await authService.updateProfile({
        userId,
        firstName,
        lastName,
        profile,
      });

      logger.info("Profile updated successfully", {
        userId,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: (updatedUser as any).firstName,
          lastName: (updatedUser as any).lastName,
          profile: updatedUser.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: "Auth service is healthy",
      timestamp: new Date().toISOString(),
    });
  }
}

export const authController = new AuthController();
