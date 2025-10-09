/**
 * Middleware Index
 * Central export point for all middleware functions
 */

// Import all middleware modules
import requestMiddleware from './request';
import securityMiddleware from './security';
import authMiddleware from './auth';
import validationMiddleware from './validation';

// Re-export all middleware with organized structure
export {
  // Request Processing Middleware
  requestIdMiddleware as generateRequestId,
  requestLoggerMiddleware as requestLogger,
  morganMiddleware as morganLogger,
  timeoutMiddleware as requestTimeout,
  requestSizeLimitMiddleware as requestSizeLimit,
  apiVersionMiddleware as apiVersioning,
  userAgentMiddleware as userAgentParser,
  ipExtractionMiddleware as clientIPExtractor,
  sanitizationMiddleware as requestSanitizer,
  performanceMiddleware as performanceMonitor,
  developmentMiddleware as debugHeaders,
} from './request';

export {
  // Security Middleware
  securityHeadersMiddleware,
  rateLimitMiddleware,
  authRateLimitMiddleware,
  corsMiddleware,
  inputSanitizationMiddleware,
  sqlInjectionMiddleware,
  requestSizeValidationMiddleware,
  suspiciousActivityMiddleware,
  apiKeyValidationMiddleware,
  contentTypeValidationMiddleware,
} from './security';

export {
  // Authentication & Authorization Middleware
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
} from './auth';

export {
  // Validation Middleware
  validateSchema,
  validateBody,
  validateQuery,
  validateParams,
  validateMultiple,
  validateOptional,
  
  // Common validations
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateChangePassword,
  validateUpdateProfile,
  validateCreateConversation,
  validateCreateMessage,
  validateToolExecution,
  validateFileUpload,
  validateSearch,
  validatePagination,
  validateIdParam,
  validateEmail,
  validateUUID,
  
  // Schemas
  userRegistrationSchema,
  userLoginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  updateProfileSchema,
  createConversationSchema,
  createMessageSchema,
  toolExecutionSchema,
  fileUploadSchema,
  searchSchema,
  paginationSchema,
  idParamSchema,
  emailSchema,
  uuidSchema,
} from './validation';

// Export middleware groups for easier access
export const Request = requestMiddleware;
export const Security = securityMiddleware;
export const Auth = authMiddleware;
export const Validation = validationMiddleware;

// Common Middleware Stacks for Easy Application

/**
 * Basic API Middleware Stack
 * Essential middleware for all API routes
 */
export const basicApiStack = [
  requestMiddleware.requestId,
  requestMiddleware.requestLogger,
  requestMiddleware.ipExtraction,
  securityMiddleware.securityHeaders,
  securityMiddleware.cors,
  requestMiddleware.sanitization,
  securityMiddleware.inputSanitization,
  requestMiddleware.performance,
];

/**
 * Public API Middleware Stack
 * For routes that don't require authentication
 */
export const publicApiStack = [
  ...basicApiStack,
  securityMiddleware.rateLimit,
  securityMiddleware.sqlInjection,
  securityMiddleware.suspiciousActivity,
  requestMiddleware.userAgent,
];

/**
 * Protected API Middleware Stack
 * For routes that require authentication
 */
export const protectedApiStack = [
  ...publicApiStack,
  authMiddleware.authenticateJWT,
  authMiddleware.checkTokenBlacklist,
];

/**
 * Admin API Middleware Stack
 * For routes that require admin privileges
 */
export const adminApiStack = [
  ...protectedApiStack,
  authMiddleware.requireAdmin,
];

/**
 * Authentication Endpoints Middleware Stack
 * For login, register, password reset endpoints
 */
export const authEndpointStack = [
  ...basicApiStack,
  securityMiddleware.authRateLimit,
  securityMiddleware.sqlInjection,
  securityMiddleware.contentTypeValidation(['application/json']),
];

/**
 * File Upload Middleware Stack
 * For file upload endpoints
 */
export const fileUploadStack = [
  ...basicApiStack,
  securityMiddleware.requestSizeValidation,
  authMiddleware.authenticateJWT,
  securityMiddleware.contentTypeValidation(['multipart/form-data']),
];

/**
 * WebSocket Middleware Stack
 * For WebSocket connection upgrades
 */
export const websocketStack = [
  requestMiddleware.requestId,
  requestMiddleware.ipExtraction,
  securityMiddleware.cors,
  authMiddleware.optionalAuth,
];

/**
 * Development Middleware Stack
 * Additional middleware for development environment
 */
export const developmentStack = [
  requestMiddleware.morgan,
  requestMiddleware.development,
];

// Utility functions for applying middleware stacks

/**
 * Apply a middleware stack to an Express application or router
 */
export const applyMiddlewareStack = (app: any, stack: any[]) => {
  stack.forEach(middleware => {
    app.use(middleware);
  });
};

/**
 * Create a combined middleware stack
 */
export const combineStacks = (...stacks: any[][]) => {
  return stacks.flat();
};

/**
 * Create conditional middleware that only applies in certain environments
 */
export const conditionalMiddleware = (condition: boolean, middleware: any) => {
  return condition ? middleware : (_req: any, _res: any, next: any) => next();
};

// Environment-specific middleware configurations

/**
 * Production Middleware Configuration
 */
export const productionMiddleware = {
  security: [
    securityMiddleware.securityHeaders,
    securityMiddleware.rateLimit,
    securityMiddleware.cors,
    securityMiddleware.inputSanitization,
    securityMiddleware.sqlInjection,
    securityMiddleware.requestSizeValidation,
    securityMiddleware.suspiciousActivity,
  ],
  request: [
    requestMiddleware.requestId,
    requestMiddleware.requestLogger,
    requestMiddleware.ipExtraction,
    requestMiddleware.timeout(),
    requestMiddleware.sanitization,
    requestMiddleware.performance,
  ],
  auth: [
    authMiddleware.authenticateJWT,
    authMiddleware.checkTokenBlacklist,
  ],
};

/**
 * Development Middleware Configuration
 */
export const developmentMiddleware = {
  ...productionMiddleware,
  development: [
    requestMiddleware.morgan,
    requestMiddleware.development,
  ],
};

/**
 * Testing Middleware Configuration
 */
export const testingMiddleware = {
  request: [
    requestMiddleware.requestId,
    requestMiddleware.ipExtraction,
  ],
  security: [
    securityMiddleware.cors,
    securityMiddleware.inputSanitization,
  ],
  auth: [
    authMiddleware.authenticateJWT,
  ],
};

// Export default middleware collection
export default {
  Request: requestMiddleware,
  Security: securityMiddleware,
  Auth: authMiddleware,
  Validation: validationMiddleware,
  
  // Middleware stacks
  basicApiStack,
  publicApiStack,
  protectedApiStack,
  adminApiStack,
  authEndpointStack,
  fileUploadStack,
  websocketStack,
  developmentStack,
  
  // Utilities
  applyMiddlewareStack,
  combineStacks,
  conditionalMiddleware,
  
  // Environment configurations
  productionMiddleware,
  developmentMiddleware,
  testingMiddleware,
};