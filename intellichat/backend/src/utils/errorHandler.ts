import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MongoError } from "mongodb";
import { createLogger } from "@/utils/logger";

const logger = createLogger("ErrorHandler");

/**
 * Custom Error Classes for Different Types of Errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: any,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed", details?: any) {
    super(message, 401, details);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", details?: any) {
    super(message, 403, details);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: any) {
    super(message, 404, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", details?: any) {
    super(message, 409, details);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded", details?: any) {
    super(message, 429, details);
    this.name = "RateLimitError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: any) {
    super(message, 401, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied", details?: any) {
    super(message, 403, details);
    this.name = "ForbiddenError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, service: string, details?: any) {
    super(message, 503, { service, ...details });
    this.name = "ExternalServiceError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, operation?: string, details?: any) {
    super(message, 500, { operation, ...details });
    this.name = "DatabaseError";
  }
}

/**
 * Error Response Interface
 */
interface ErrorResponse {
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId?: string;
  stack?: string;
  details?: any;
  suggestions?: string[];
}

/**
 * Error Handler Factory
 */
export class ErrorHandlerFactory {
  /**
   * Handle Zod Validation Errors
   */
  static handleZodError(error: ZodError): ValidationError {
    const errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    const message = "Validation failed";
    return new ValidationError(message, { validationErrors: errors });
  }

  /**
   * Handle MongoDB Errors
   */
  static handleMongoError(error: MongoError): AppError {
    switch (error.code) {
      case 11000:
        // Duplicate key error
        const field = Object.keys((error as any).keyValue || {})[0] || "field";
        return new ConflictError(`Duplicate value for ${field}`, {
          field,
          value: (error as any).keyValue?.[field],
        });

      case 16755:
        return new ValidationError("Invalid ObjectId format");

      default:
        return new DatabaseError(error.message, "mongodb_operation", {
          code: error.code,
          codeName: (error as any).codeName,
        });
    }
  }

  /**
   * Handle JWT Errors
   */
  static handleJWTError(error: any): AuthenticationError {
    if (error.name === "JsonWebTokenError") {
      return new AuthenticationError("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return new AuthenticationError("Token expired");
    }
    return new AuthenticationError("Token verification failed");
  }

  /**
   * Handle Mongoose Validation Errors
   */
  static handleMongooseValidationError(error: any): ValidationError {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
      kind: err.kind,
    }));

    return new ValidationError("Mongoose validation failed", { validationErrors: errors });
  }

  /**
   * Handle Cast Errors (Invalid ObjectId, etc.)
   */
  static handleCastError(error: any): ValidationError {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }
}

/**
 * Development Error Response
 */
const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    status: err.status,
    message: err.message,
    statusCode: err.statusCode,
    timestamp: err.timestamp.toISOString(),
    path: req.originalUrl,
    requestId: (req as any).requestId,
    ...(err.stack && { stack: err.stack }),
    details: err.details,
  };

  logger.error("Development Error", err, {
    requestId: (req as any).requestId,
    path: req.originalUrl,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  res.status(err.statusCode).json(errorResponse);
};

/**
 * Production Error Response
 */
const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
  // Operational errors: send error details to client
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      status: err.status,
      message: err.message,
      statusCode: err.statusCode,
      timestamp: err.timestamp.toISOString(),
      path: req.originalUrl,
      requestId: (req as any).requestId,
      ...(err.details && { details: err.details }),
    };

    // Add helpful suggestions for common errors
    if (err.statusCode === 400) {
      errorResponse.suggestions = ["Check your request format and try again"];
    } else if (err.statusCode === 401) {
      errorResponse.suggestions = ["Please login and try again"];
    } else if (err.statusCode === 403) {
      errorResponse.suggestions = ["You may need different permissions for this action"];
    } else if (err.statusCode === 404) {
      errorResponse.suggestions = ["Check the URL and try again"];
    } else if (err.statusCode === 429) {
      errorResponse.suggestions = ["Please wait a moment before trying again"];
    }

    res.status(err.statusCode).json(errorResponse);
  } else {
    // Programming errors: don't leak error details
    logger.error("Programming Error", err, {
      requestId: (req as any).requestId,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    const errorResponse: ErrorResponse = {
      status: "error",
      message: "Something went wrong!",
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      requestId: (req as any).requestId,
      suggestions: ["Please try again later or contact support"],
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * Global Error Handler Middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = ErrorHandlerFactory.handleCastError(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = ErrorHandlerFactory.handleMongoError(error);
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    error = ErrorHandlerFactory.handleMongooseValidationError(error);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    error = ErrorHandlerFactory.handleZodError(error);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    error = ErrorHandlerFactory.handleJWTError(error);
  }

  // MongoDB errors
  if (err instanceof MongoError) {
    error = ErrorHandlerFactory.handleMongoError(error);
  }

  // If error is not an instance of AppError, convert it
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Internal server error",
      error.statusCode || 500,
      error.details,
      false, // Not operational
    );
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Async Error Handler Wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Can't find ${req.originalUrl} on this server`);
  next(error);
};

/**
 * Unhandled Promise Rejection Handler
 */
export const handleUnhandledRejection = (): void => {
  process.on("unhandledRejection", (reason: any, _promise: Promise<any>) => {
    logger.error("Unhandled Promise Rejection", reason);

    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Uncaught Exception Handler
 */
export const handleUncaughtException = (): void => {
  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception", error);

    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * SIGTERM Handler for Graceful Shutdown
 */
export const handleSIGTERM = (server: any): void => {
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });
};

/**
 * Error Logger Middleware
 */
export const errorLogger = (err: any, req: Request, _res: Response, next: NextFunction): void => {
  logger.error("Request Error", err, {
    requestId: (req as any).requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  next(err);
};

/**
 * Validation Error Helper
 */
export const createValidationError = (field: string, message: string): ValidationError => {
  return new ValidationError(`Validation failed for ${field}`, {
    validationErrors: [{ field, message }],
  });
};

/**
 * Success Response Helper
 */
export const sendSuccessResponse = (
  res: Response,
  data: any,
  message: string = "Operation successful",
  statusCode: number = 200,
  meta?: any,
): void => {
  const response: any = {
    status: "success",
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

/**
 * Paginated Response Helper
 */
export const sendPaginatedResponse = (
  res: Response,
  data: any[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message: string = "Data retrieved successfully",
  statusCode: number = 200,
): void => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};
