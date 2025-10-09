import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { CONFIG } from '@/config';
import { createLogger } from '@/utils/logger';
import { RateLimitError } from '@/utils/errorHandler';

const logger = createLogger('SecurityMiddleware');

/**
 * Helmet Security Headers Middleware
 * Comprehensive security headers configuration
 */
export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:", "ws:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: CONFIG.security.rateLimit.windowMs,
  max: CONFIG.security.rateLimit.maxRequests,
  skipFailedRequests: CONFIG.security.rateLimit.skipFailedRequests,
  keyGenerator: (req: Request): string => {
    return (req as any).clientIP || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response): void => {
    logger.securityEvent('Rate limit exceeded', 'medium', {
      ip: (req as any).clientIP || req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
    });

    const error = new RateLimitError('Too many requests, please try again later');
    res.status(429).json({
      status: 'error',
      message: error.message,
      statusCode: 429,
      timestamp: new Date().toISOString(),
      retryAfter: Math.ceil(CONFIG.security.rateLimit.windowMs / 1000),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiting for Authentication Endpoints
 * More restrictive limits for sensitive operations
 */
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request): string => {
    const email = req.body?.email || req.query?.email || '';
    const ip = (req as any).clientIP || req.ip || 'unknown';
    return `auth:${email}:${ip}`;
  },
  handler: (req: Request, res: Response): void => {
    logger.securityEvent('Authentication rate limit exceeded', 'high', {
      ip: (req as any).clientIP || req.ip,
      email: req.body?.email,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });

    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
      retryAfter: 900, // 15 minutes
    });
  },
});

/**
 * CORS Configuration Middleware
 * Handles Cross-Origin Resource Sharing
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  const allowedOrigins = CONFIG.security.cors.allOrigins 
    ? ['*'] 
    : CONFIG.security.cors.origins;

  // Check if origin is allowed
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-Request-ID,API-Version'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '3600');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

/**
 * Input Sanitization Middleware
 * Advanced sanitization to prevent injection attacks
 */
export const inputSanitizationMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  // Sanitize request body
  if (req.body) {
    req.body = deepSanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = deepSanitize(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = deepSanitize(req.params);
  }

  next();
};

/**
 * SQL Injection Prevention Middleware
 * Detects and blocks potential SQL injection attempts
 */
export const sqlInjectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\b(OR|AND)\b.*?=.*?=)/i,
    /('(''|[^'])*')/,
  ];

  const checkForSqlInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const scanObject = (obj: any): boolean => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (checkForSqlInjection(obj[key])) {
          return true;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (scanObject(obj[key])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check body, query, and params for SQL injection patterns
  const hasSqlInjection = 
    scanObject(req.body || {}) ||
    scanObject(req.query || {}) ||
    scanObject(req.params || {});

  if (hasSqlInjection) {
    logger.securityEvent('SQL injection attempt detected', 'critical', {
      ip: (req as any).clientIP || req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    res.status(400).json({
      status: 'error',
      message: 'Invalid request format',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

/**
 * Request Size Validation Middleware
 * Prevents payload size attacks
 */
export const requestSizeValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = req.get('content-length');
  const maxSize = CONFIG.upload.maxFileSize;

  if (contentLength && parseInt(contentLength) > maxSize) {
    logger.securityEvent('Oversized request detected', 'medium', {
      ip: (req as any).clientIP || req.ip,
      contentLength,
      maxSize,
      url: req.originalUrl,
    });

    res.status(413).json({
      status: 'error',
      message: 'Request payload too large',
      statusCode: 413,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

/**
 * Suspicious Activity Detection Middleware
 * Detects and logs suspicious request patterns
 */
export const suspiciousActivityMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent') || '';
  const ip = (req as any).clientIP || req.ip;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /sqlmap|nikto|nmap|masscan/i,
    /burp|zap|w3af|metasploit/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isSuspicious) {
    logger.securityEvent('Suspicious user agent detected', 'medium', {
      ip,
      userAgent,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Check for rapid requests (basic detection)
  // This would typically use Redis for proper rate tracking
  // For now, we'll just log the activity
  // const requestKey = `requests:${ip}`;  // Future implementation

  next();
};

/**
 * API Key Validation Middleware (for external APIs)
 * Validates API keys for external access
 */
export const apiKeyValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.get('X-API-Key') || req.query.apiKey;
  
  if (!apiKey) {
    res.status(401).json({
      status: 'error',
      message: 'API key required',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Validate API key format
  if (typeof apiKey !== 'string' || apiKey.length < 32) {
    logger.securityEvent('Invalid API key format', 'medium', {
      ip: (req as any).clientIP || req.ip,
      userAgent: req.get('User-Agent'),
      invalidKey: typeof apiKey === 'string' ? apiKey.substring(0, 8) + '...' : 'invalid',
    });

    res.status(401).json({
      status: 'error',
      message: 'Invalid API key format',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Here you would validate against your API key database
  // For now, we'll just pass through
  next();
};

/**
 * Content Type Validation Middleware
 * Ensures correct content types for different endpoints
 */
export const contentTypeValidationMiddleware = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      res.status(400).json({
        status: 'error',
        message: 'Content-Type header required',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const isAllowed = allowedTypes.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      res.status(415).json({
        status: 'error',
        message: `Unsupported content type. Allowed types: ${allowedTypes.join(', ')}`,
        statusCode: 415,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

// Helper Functions

function deepSanitize(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = deepSanitize(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

function sanitizeString(str: string): string {
  return str
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove potentially dangerous HTML tags
    .replace(/<(iframe|object|embed|link|meta|base)[^>]*>/gi, '');
}

// Export all security middleware
export default {
  securityHeaders: securityHeadersMiddleware,
  rateLimit: rateLimitMiddleware,
  authRateLimit: authRateLimitMiddleware,
  cors: corsMiddleware,
  inputSanitization: inputSanitizationMiddleware,
  sqlInjection: sqlInjectionMiddleware,
  requestSizeValidation: requestSizeValidationMiddleware,
  suspiciousActivity: suspiciousActivityMiddleware,
  apiKeyValidation: apiKeyValidationMiddleware,
  contentTypeValidation: contentTypeValidationMiddleware,
};