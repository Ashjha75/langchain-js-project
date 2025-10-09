import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { createLogger, createRequestLogger, generateRequestId } from '@/utils/logger';
import { CONFIG } from '@/config';

const logger = createLogger('RequestMiddleware');

/**
 * Request ID Middleware
 * Adds unique request ID for tracing
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Request Logger Middleware
 * Comprehensive request/response logging with performance monitoring
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!CONFIG.logging.requests.enabled) {
    return next();
  }

  const startTime = Date.now();
  (req as any).startTime = startTime;

  const requestLogger = createRequestLogger('Request', (req as any).requestId);

  // Log incoming request
  requestLogger.apiRequest(req, {
    headers: CONFIG.logging.requests.logBody ? req.headers : undefined,
    body: CONFIG.logging.requests.logBody ? req.body : undefined,
    query: req.query,
    params: req.params,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    
    requestLogger.apiResponse(req, res, responseTime, {
      responseBody: CONFIG.logging.requests.logResponse ? data : undefined,
      slow: responseTime > CONFIG.performance.timeout.slowThreshold,
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Morgan HTTP Logger
 * Standard HTTP request logging for development
 */
export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
    skip: (req: Request) => {
      // Skip health check and static file requests in production
      if (CONFIG.app.isProduction) {
        return req.url === '/health' || req.url.startsWith('/static');
      }
      return false;
    },
  }
);

/**
 * Request Timeout Middleware
 * Prevents long-running requests
 */
export const timeoutMiddleware = (timeout: number = CONFIG.performance.timeout.request) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          status: 'error',
          message: 'Request timeout',
          statusCode: 408,
          timestamp: new Date().toISOString(),
        });
      }
    }, timeout);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
};

/**
 * Request Size Limit Middleware
 * Prevents oversized payloads
 */
export const requestSizeLimitMiddleware = (limit: string = '10mb') => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const contentLength = _req.get('content-length');
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const limitInMB = parseFloat(limit.replace('mb', ''));
      
      if (sizeInMB > limitInMB) {
        res.status(413).json({
          status: 'error',
          message: `Request payload too large. Maximum size is ${limit}`,
          statusCode: 413,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }
    
    next();
  };
};

/**
 * API Version Middleware
 * Handles API versioning
 */
export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiVersion = req.headers['api-version'] || req.query.version || CONFIG.app.apiVersion;
  (req as any).apiVersion = apiVersion;
  res.setHeader('API-Version', apiVersion as string);
  next();
};

/**
 * User Agent Parser Middleware
 * Extracts user agent information
 */
export const userAgentMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Simple user agent parsing (can be enhanced with a library like 'ua-parser-js')
  const parsedUA = {
    raw: userAgent,
    browser: extractBrowser(userAgent),
    os: extractOS(userAgent),
    device: extractDevice(userAgent),
    isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
    isBot: /bot|crawler|spider/i.test(userAgent),
  };
  
  (req as any).userAgent = parsedUA;
  next();
};

/**
 * Request Validation Middleware
 * Basic request validation
 */
export const requestValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Validate required headers
  const requiredHeaders = ['user-agent'];
  
  for (const header of requiredHeaders) {
    if (!req.get(header)) {
      res.status(400).json({
        status: 'error',
        message: `Missing required header: ${header}`,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }
  
  next();
};

/**
 * IP Extraction Middleware
 * Extracts real client IP
 */
export const ipExtractionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const forwarded = req.get('X-Forwarded-For');
  const realIP = req.get('X-Real-IP');
  const cloudflareIP = req.get('CF-Connecting-IP');
  
  let clientIP = req.ip;
  
  if (cloudflareIP) {
    clientIP = cloudflareIP;
  } else if (realIP) {
    clientIP = realIP;
  } else if (forwarded) {
    clientIP = forwarded.split(',')[0]?.trim();
  }
  
  (req as any).clientIP = clientIP;
  res.setHeader('X-Client-IP', clientIP || 'unknown');
  next();
};

/**
 * Request Sanitization Middleware
 * Sanitizes request data to prevent XSS and injection attacks
 */
export const sanitizationMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  
  next();
};

/**
 * Performance Monitoring Middleware
 * Tracks request performance metrics
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startHrTime = process.hrtime();
  const startMemory = process.memoryUsage();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startHrTime);
    const responseTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    const endMemory = process.memoryUsage();
    
    const performanceData = {
      responseTime: Math.round(responseTime * 100) / 100,
      memoryUsage: {
        heapUsedDelta: endMemory.heapUsed - startMemory.heapUsed,
        heapTotalDelta: endMemory.heapTotal - startMemory.heapTotal,
        rss: endMemory.rss,
      },
      statusCode: res.statusCode,
      method: req.method,
      url: req.originalUrl,
    };
    
    // Log slow requests
    if (responseTime > CONFIG.performance.timeout.slowThreshold) {
      logger.warn('Slow request detected', performanceData);
    }
    
    // Store performance data for monitoring
    (req as any).performanceData = performanceData;
  });
  
  next();
};

/**
 * Development Only Middleware
 * Additional debugging information for development
 */
export const developmentMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  if (CONFIG.app.isDevelopment) {
    res.setHeader('X-Environment', 'development');
    res.setHeader('X-Node-Version', process.version);
    res.setHeader('X-App-Version', '1.0.0');
  }
  
  next();
};

// Helper functions

function extractBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function extractOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function extractDevice(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Basic XSS prevention
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

// Export all middleware
export default {
  requestId: requestIdMiddleware,
  requestLogger: requestLoggerMiddleware,
  morgan: morganMiddleware,
  timeout: timeoutMiddleware,
  requestSizeLimit: requestSizeLimitMiddleware,
  apiVersion: apiVersionMiddleware,
  userAgent: userAgentMiddleware,
  requestValidation: requestValidationMiddleware,
  ipExtraction: ipExtractionMiddleware,
  sanitization: sanitizationMiddleware,
  performance: performanceMiddleware,
  development: developmentMiddleware,
};