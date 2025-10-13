import winston from "winston";
import path from "path";
import fs from "fs";
import { CONFIG } from "@/config";

/**
 * Professional Logging System for IntelliChat Backend
 * Compatible with Render/Docker (writable logs in /tmp)
 */

// Determine log directory: use LOG_DIR env if set, else default from config
const logDir = process.env.LOG_DIR || path.dirname(CONFIG.logging.file.path);

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Update file paths for transports
const logFilePath = path.join(logDir, path.basename(CONFIG.logging.file.path));
const errorLogFilePath = path.join(logDir, path.basename(CONFIG.logging.file.errorPath));

// Custom log format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) log += `\n${stack}`;
    const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return log + metaStr;
  })
);

// Custom log format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    const logObj: any = { timestamp, level, message, ...meta };
    if (stack) logObj.stack = stack;
    return JSON.stringify(logObj);
  })
);

// File transport for all logs
const fileTransport = new winston.transports.File({
  filename: logFilePath,
  format: productionFormat,
  level: CONFIG.logging.level,
  maxsize: 10 * 1024 * 1024,
  maxFiles: 5,
});

// File transport for error logs only
const errorFileTransport = new winston.transports.File({
  filename: errorLogFilePath,
  format: productionFormat,
  level: "error",
  maxsize: 10 * 1024 * 1024,
  maxFiles: 5,
});

// Console transport
const consoleTransport = new winston.transports.Console({
  format: CONFIG.app.isDevelopment ? developmentFormat : productionFormat,
  level: CONFIG.logging.level,
});

// Create main logger instance
export const logger = winston.createLogger({
  level: CONFIG.logging.level,
  defaultMeta: {
    service: CONFIG.app.name,
    environment: CONFIG.app.env,
  },
  transports: [],
  exitOnError: false,
});

// Add transports
if (CONFIG.logging.console.enabled) {
  logger.add(consoleTransport);
}

if (CONFIG.logging.file.enabled) {
  logger.add(fileTransport);
  logger.add(errorFileTransport);
}

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logDir, "exceptions.log"),
    format: productionFormat,
  })
);

// Handle unhandled promise rejections
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logDir, "rejections.log"),
    format: productionFormat,
  })
);

/**
 * Logger class with context support
 */
export class Logger {
  protected context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: string, message: string, meta: any = {}) {
    logger.log(level, message, { context: this.context, ...meta });
  }

  error(message: string, error?: Error | any, meta: any = {}) {
    this.log("error", message, { error: error?.message || error, stack: error?.stack, ...meta });
  }

  warn(message: string, meta: any = {}) {
    this.log("warn", message, meta);
  }

  info(message: string, meta: any = {}) {
    this.log("info", message, meta);
  }

  http(message: string, meta: any = {}) {
    this.log("http", message, meta);
  }

  verbose(message: string, meta: any = {}) {
    this.log("verbose", message, meta);
  }

  debug(message: string, meta: any = {}) {
    this.log("debug", message, meta);
  }

  silly(message: string, meta: any = {}) {
    this.log("silly", message, meta);
  }

  // Specialized logging methods
  apiRequest(req: any, meta: any = {}) {
    this.http("API Request", {
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      ...meta,
    });
  }

  apiResponse(req: any, res: any, responseTime: number, meta: any = {}) {
    this.http("API Response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ...meta,
    });
  }

  databaseQuery(operation: string, collection: string, duration: number, meta: any = {}) {
    this.debug("Database Query", { operation, collection, duration: `${duration}ms`, ...meta });
  }

  aiRequest(model: string, tokens: number, duration: number, meta: any = {}) {
    this.info("AI Request", { model, tokens, duration: `${duration}ms`, ...meta });
  }

  toolExecution(toolName: string, success: boolean, duration: number, meta: any = {}) {
    this.info("Tool Execution", { tool: toolName, success, duration: `${duration}ms`, ...meta });
  }

  securityEvent(event: string, severity: "low" | "medium" | "high" | "critical", meta: any = {}) {
    const level = severity === "critical" || severity === "high" ? "error" : "warn";
    this.log(level, `Security Event: ${event}`, { security: true, severity, ...meta });
  }

  performance(operation: string, duration: number, meta: any = {}) {
    const level = duration > CONFIG.performance.timeout.slowThreshold ? "warn" : "info";
    this.log(level, `Performance: ${operation}`, { performance: true, duration: `${duration}ms`, slow: duration > CONFIG.performance.timeout.slowThreshold, ...meta });
  }

  businessEvent(event: string, meta: any = {}) {
    this.info(`Business Event: ${event}`, { business: true, ...meta });
  }
}

/**
 * Request ID generator for tracing
 */
export const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request context logger with correlation ID
 */
export class RequestLogger extends Logger {
  private requestId: string;

  constructor(context: string, requestId?: string) {
    super(context);
    this.requestId = requestId || generateRequestId();
  }

  private logWithRequestId(level: string, message: string, meta: any = {}) {
    logger.log(level, message, { context: this.context, requestId: this.requestId, ...meta });
  }

  getRequestId(): string {
    return this.requestId;
  }

  override error(message: string, error?: Error | any, meta: any = {}) {
    this.logWithRequestId("error", message, { error: error?.message || error, stack: error?.stack, ...meta });
  }

  override warn(message: string, meta: any = {}) {
    this.logWithRequestId("warn", message, meta);
  }

  override info(message: string, meta: any = {}) {
    this.logWithRequestId("info", message, meta);
  }

  override debug(message: string, meta: any = {}) {
    this.logWithRequestId("debug", message, meta);
  }
}

/**
 * Factory functions
 */
export const createLogger = (context: string): Logger => new Logger(context);
export const createRequestLogger = (context: string, requestId?: string): RequestLogger => new RequestLogger(context, requestId);

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private startTime: number;
  private logger: Logger;
  private operation: string;

  constructor(logger: Logger, operation: string) {
    this.logger = logger;
    this.operation = operation;
    this.startTime = Date.now();
  }

  end(meta: any = {}) {
    const duration = Date.now() - this.startTime;
    this.logger.performance(this.operation, duration, meta);
    return duration;
  }
}

export const createTimer = (logger: Logger, operation: string): PerformanceTimer => new PerformanceTimer(logger, operation);

export default logger;
