import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CONFIG } from '@/config';
import { createLogger } from '@/utils/logger';
import { AuthenticationError, ValidationError, ForbiddenError } from '@/utils/errorHandler';
import { 
  IUserWithoutPassword, 
  UserRole, 
  Permission,
  ITokenPayload,
  IRefreshTokenPayload,
  AuthenticatedRequest 
} from '@/types';

const logger = createLogger('AuthMiddleware');

/**
 * JWT Token Validation Middleware
 * Validates JWT tokens and sets user context
 */
export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      logger.securityEvent('Missing authentication token', 'low', {
        ip: (req as any).clientIP || req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      
      const error = new AuthenticationError('Authentication token required');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, CONFIG.auth.jwt.accessSecret) as ITokenPayload;
    
    // Validate token payload structure
    if (!decoded.userId || !decoded.email || !decoded.role) {
      logger.securityEvent('Invalid token payload structure', 'medium', {
        ip: (req as any).clientIP || req.ip,
        tokenId: decoded.jti,
      });
      
      const error = new AuthenticationError('Invalid token structure');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check token expiration (additional check)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      logger.securityEvent('Expired token used', 'low', {
        ip: (req as any).clientIP || req.ip,
        userId: decoded.userId,
        expiredAt: new Date(decoded.exp * 1000),
      });
      
      const error = new AuthenticationError('Token has expired');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Set user context
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      ...(decoded.jti && { tokenId: decoded.jti }),
    };

    logger.info('User authenticated successfully', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      ip: (req as any).clientIP || req.ip,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.securityEvent('Invalid JWT token', 'medium', {
        ip: (req as any).clientIP || req.ip,
        error: error.message,
        userAgent: req.get('User-Agent'),
      });
      
      const authError = new AuthenticationError('Invalid authentication token');
      res.status(401).json({
        status: 'error',
        message: authError.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error('Authentication middleware error', { error });
    const authError = new AuthenticationError('Authentication failed');
    res.status(401).json({
      status: 'error',
      message: authError.message,
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Optional JWT Authentication Middleware
 * Sets user context if token is provided, but doesn't require it
 */
export const optionalAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, CONFIG.auth.jwt.accessSecret) as ITokenPayload;
        
        if (decoded.userId && decoded.email && decoded.role) {
          req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions || [],
            ...(decoded.jti && { tokenId: decoded.jti }),
          };
        }
      } catch (error) {
        // Silently ignore invalid tokens in optional auth
        logger.debug('Optional auth token validation failed', { error: (error as Error).message });
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', { error });
    next(); // Continue without authentication
  }
};

/**
 * Role-Based Authorization Middleware
 * Checks if user has required role
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error = new AuthenticationError('Authentication required');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.securityEvent('Insufficient role permissions', 'medium', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        url: req.originalUrl,
        ip: (req as any).clientIP || req.ip,
      });
      
      const error = new ForbiddenError('Insufficient permissions');
      res.status(403).json({
        status: 'error',
        message: error.message,
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

/**
 * Permission-Based Authorization Middleware
 * Checks if user has required permissions
 */
export const requirePermission = (permissions: Permission | Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error = new AuthenticationError('Authentication required');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const userPermissions = req.user.permissions || [];

    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.securityEvent('Insufficient permissions', 'medium', {
        userId: req.user.id,
        userPermissions,
        requiredPermissions,
        url: req.originalUrl,
        ip: (req as any).clientIP || req.ip,
      });
      
      const error = new ForbiddenError('Insufficient permissions');
      res.status(403).json({
        status: 'error',
        message: error.message,
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

/**
 * Admin Only Authorization Middleware
 * Shortcut for admin role requirement
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * User Ownership Validation Middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error = new AuthenticationError('Authentication required');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam] || req.query[userIdParam];
    
    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Check ownership
    if (resourceUserId !== req.user.id) {
      logger.securityEvent('Unauthorized resource access attempt', 'medium', {
        userId: req.user.id,
        attemptedResourceUserId: resourceUserId,
        url: req.originalUrl,
        ip: (req as any).clientIP || req.ip,
      });
      
      const error = new ForbiddenError('Access denied: insufficient permissions');
      res.status(403).json({
        status: 'error',
        message: error.message,
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

/**
 * Refresh Token Validation Middleware
 * Validates refresh tokens for token renewal
 */
export const validateRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const error = new ValidationError('Refresh token required');
      res.status(400).json({
        status: 'error',
        message: error.message,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, CONFIG.auth.jwt.refreshSecret) as IRefreshTokenPayload;
    
    if (!decoded.userId || !decoded.tokenFamily) {
      const error = new AuthenticationError('Invalid refresh token structure');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Store decoded token for use in next middleware
    (req as any).decodedRefreshToken = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.securityEvent('Invalid refresh token', 'medium', {
        ip: (req as any).clientIP || req.ip,
        error: (error as Error).message,
      });
      
      const authError = new AuthenticationError('Invalid refresh token');
      res.status(401).json({
        status: 'error',
        message: authError.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error('Refresh token validation error', { error });
    const authError = new AuthenticationError('Token validation failed');
    res.status(401).json({
      status: 'error',
      message: authError.message,
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Password Validation Middleware
 * Validates password complexity requirements
 */
export const validatePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { password } = req.body;

  if (!password) {
    const error = new ValidationError('Password is required');
    res.status(400).json({
      status: 'error',
      message: error.message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const minLength = CONFIG.auth.passwordPolicy.minLength;
  const requireUppercase = CONFIG.auth.passwordPolicy.requireUppercase;
  const requireLowercase = CONFIG.auth.passwordPolicy.requireLowercase;
  const requireNumbers = CONFIG.auth.passwordPolicy.requireNumbers;
  const requireSpecialChars = CONFIG.auth.passwordPolicy.requireSpecialChars;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (errors.length > 0) {
    const error = new ValidationError(`Password validation failed: ${errors.join(', ')}`);
    res.status(400).json({
      status: 'error',
      message: error.message,
      details: errors,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

/**
 * Token Blacklist Middleware
 * Checks if token is blacklisted (for logout functionality)
 */
export const checkTokenBlacklist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.tokenId) {
      next();
      return;
    }

    // Here you would check against a Redis blacklist or database
    // For now, we'll assume the token is valid
    // In a real implementation:
    // const isBlacklisted = await redis.exists(`blacklist:${req.user.tokenId}`);
    const isBlacklisted = false;

    if (isBlacklisted) {
      logger.securityEvent('Blacklisted token used', 'medium', {
        userId: req.user.id,
        tokenId: req.user.tokenId,
        ip: (req as any).clientIP || req.ip,
      });
      
      const error = new AuthenticationError('Token has been revoked');
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Token blacklist check error', { error });
    next(); // Continue on error (fail open for availability)
  }
};

// Utility Functions

/**
 * Hash Password Utility
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = CONFIG.auth.bcryptRounds;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare Password Utility
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (user: IUserWithoutPassword): string => {
  const payload: ITokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + CONFIG.auth.jwt.accessExpiresIn,
    jti: generateTokenId(),
  };

  return jwt.sign(payload, CONFIG.auth.jwt.accessSecret);
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (userId: string, tokenFamily?: string): string => {
  const payload: IRefreshTokenPayload = {
    userId,
    tokenFamily: tokenFamily || generateTokenId(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + CONFIG.auth.jwt.refreshExpiresInSeconds,
  };

  return jwt.sign(payload, CONFIG.auth.jwt.refreshSecret);
};

/**
 * Generate Unique Token ID
 */
function generateTokenId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Extract User ID from Token
 */
export const extractUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, CONFIG.auth.jwt.accessSecret) as ITokenPayload;
    return decoded.userId;
  } catch {
    return null;
  }
};

// Export all authentication middleware
export default {
  authenticateJWT,
  optionalAuth,
  requireRole,
  requirePermission,
  requireAdmin,
  requireOwnership,
  validateRefreshToken,
  validatePassword,
  checkTokenBlacklist,
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  extractUserIdFromToken,
};