import winston from "winston";
import path from "path";
import fs from "fs";
import { CONFIG } from "@/config";

/**
 * Logging system compatible with Render/Docker free tier
 * Writes to /tmp/logs if LOG_DIR not set
 */
const logDir = process.env.LOG_DIR || "/tmp/logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, "app.log");
const errorLogFilePath = path.join(logDir, "error.log");
const exceptionsLogPath = path.join(logDir, "exceptions.log");
const rejectionsLogPath = path.join(logDir, "rejections.log");

// Development format
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  }),
);

// Production format
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Transports
const transports: winston.transport[] = [];

if (CONFIG.logging.console.enabled) {
  transports.push(
    new winston.transports.Console({
      format: CONFIG.app.isDevelopment ? devFormat : prodFormat,
      level: CONFIG.logging.level,
    }),
  );
}

if (CONFIG.logging.file.enabled) {
  transports.push(
    new winston.transports.File({
      filename: logFilePath,
      format: prodFormat,
      level: CONFIG.logging.level,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: errorLogFilePath,
      format: prodFormat,
      level: "error",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  );
}

// Logger instance
export const logger = winston.createLogger({
  level: CONFIG.logging.level,
  defaultMeta: { service: CONFIG.app.name, environment: CONFIG.app.env },
  transports,
  exitOnError: false,
});

// Handle exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: exceptionsLogPath, format: prodFormat }),
);

logger.rejections.handle(
  new winston.transports.File({ filename: rejectionsLogPath, format: prodFormat }),
);

/**
 * Base Logger class
 */
export class Logger {
  constructor(protected context: string) {}

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

  debug(message: string, meta: any = {}) {
    this.log("debug", message, meta);
  }

  // Add other levels if needed
}

/**
 * Request-scoped logger with unique requestId
 */
export class RequestLogger extends Logger {
  private requestId: string;

  constructor(context: string, requestId?: string) {
    super(context);
    this.requestId = requestId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  getRequestId() {
    return this.requestId;
  }

  private logWithRequestId(level: string, message: string, meta: any = {}) {
    logger.log(level, message, { context: this.context, requestId: this.requestId, ...meta });
  }

  override error(message: string, error?: Error | any, meta: any = {}) {
    this.logWithRequestId("error", message, {
      error: error?.message || error,
      stack: error?.stack,
      ...meta,
    });
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
 * Performance timer
 */
export class PerformanceTimer {
  private startTime: number;

  constructor(
    private logger: Logger,
    private operation: string,
  ) {
    this.startTime = Date.now();
  }

  end(meta: any = {}) {
    const duration = Date.now() - this.startTime;
    this.logger.info(`Performance: ${this.operation}`, { duration: `${duration}ms`, ...meta });
    return duration;
  }
}

// Factory functions
export const createLogger = (context: string): Logger => new Logger(context);
export const createRequestLogger = (context: string, requestId?: string): RequestLogger =>
  new RequestLogger(context, requestId);

export const createTimer = (logger: Logger, operation: string): PerformanceTimer =>
  new PerformanceTimer(logger, operation);

export default logger;
