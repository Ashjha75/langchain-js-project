import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

/**
 * Environment Schema Validation using Zod
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("3001"),
  API_VERSION: z.string().default("v1"),
  APP_NAME: z.string().default("IntelliChat Pro Backend"),

  // Frontend
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  FRONTEND_DOMAIN: z.string().default("localhost"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),

  // Database
  MONGODB_URI: z.string().default("mongodb://localhost:27017/intellichat"),
  MONGODB_DB_NAME: z.string().default("intellichat"),
  MONGODB_TEST_URI: z.string().default("mongodb://localhost:27017/intellichat_test"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("0"),
  REDIS_TEST_DB: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("1"),

  // Database Options
  DB_POOL_SIZE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("10"),
  DB_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("10000"),
  DB_RETRY_WRITES: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Authentication & Security
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRE_TIME: z.string().default("15m"),
  JWT_REFRESH_EXPIRE_TIME: z.string().default("7d"),
  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("86400000"),
  BCRYPT_ROUNDS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("12"),
  PASSWORD_MIN_LENGTH: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("8"),
  PASSWORD_REQUIRE_UPPERCASE: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  PASSWORD_REQUIRE_LOWERCASE: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  PASSWORD_REQUIRE_NUMBERS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  PASSWORD_REQUIRE_SPECIAL_CHARS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("100"),
  RATE_LIMIT_SKIP_FAILED_REQUESTS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Security Features
  SECURITY_CORS_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  SECURITY_HELMET_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  SECURITY_RATE_LIMIT_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // AI Services
  GROQ_API_KEY: z.string(),
  GROQ_MODEL_DEFAULT: z.string().default("llama-3.1-70b-versatile"),
  GROQ_MAX_TOKENS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("4096"),
  GROQ_TEMPERATURE: z
    .string()
    .transform((val) => parseFloat(val))
    .default("0.7"),
  GROQ_TOP_P: z
    .string()
    .transform((val) => parseFloat(val))
    .default("0.9"),
  GROQ_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("30000"),

  // Tool Configuration
  TOOL_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  TOOL_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("10000"),
  TOOL_MAX_CONCURRENT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5"),

  // External APIs (Optional)
  TAVILY_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  LOG_FILE_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  LOG_CONSOLE_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  LOG_FILE_PATH: z.string().default("logs/app.log"),
  LOG_ERROR_FILE_PATH: z.string().default("logs/error.log"),
  LOG_MAX_SIZE: z.string().default("10m"),
  LOG_MAX_FILES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5"),
  LOG_DATE_PATTERN: z.string().default("YYYY-MM-DD"),
  LOG_REQUESTS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  LOG_REQUEST_BODY: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  LOG_RESPONSE_BODY: z
    .string()
    .transform((val) => val === "true")
    .default("false"),

  // File Upload
  MAX_FILE_SIZE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("10485760"),
  MAX_FILES_PER_REQUEST: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5"),
  ALLOWED_FILE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/gif,application/pdf,text/plain,text/markdown"),
  UPLOAD_DIR: z.string().default("uploads"),
  TEMP_DIR: z.string().default("temp"),
  STATIC_DIR: z.string().default("public"),

  // WebSocket
  WEBSOCKET_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  WEBSOCKET_PATH: z.string().default("/socket.io"),
  WEBSOCKET_CORS_ORIGINS: z.string().default("http://localhost:3000"),
  WEBSOCKET_PING_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("60000"),
  WEBSOCKET_PING_INTERVAL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("25000"),

  // Performance
  COMPRESSION_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  COMPRESSION_LEVEL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("6"),
  COMPRESSION_THRESHOLD: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("1024"),
  CACHE_TTL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("3600"),
  CACHE_MAX_KEYS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("1000"),
  MEMORY_CACHE_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  REQUEST_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("30000"),
  SLOW_REQUEST_THRESHOLD: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5000"),

  // Monitoring
  HEALTH_CHECK_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  HEALTH_CHECK_PATH: z.string().default("/health"),
  HEALTH_CHECK_INTERVAL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("30000"),
  METRICS_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  PROMETHEUS_ENDPOINT: z.string().default("/metrics"),
  PROMETHEUS_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("9464"),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SENTRY_ENVIRONMENT: z.string().default("development"),

  // Email (Optional)
  EMAIL_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("587"),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default("noreply@intellichat.pro"),

  // Development
  DEV_SEED_DATABASE: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  DEV_AUTO_MIGRATE: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  DEV_SWAGGER_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  DEV_CORS_ALL_ORIGINS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Testing
  TEST_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("10000"),
  TEST_PARALLEL: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  TEST_COVERAGE_THRESHOLD: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("80"),
});

// Validate and parse environment variables
let envConfig: z.infer<typeof envSchema>;

try {
  envConfig = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Invalid environment configuration:");
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
  }
  process.exit(1);
}

// Export configuration object
export const CONFIG = {
  // Application
  app: {
    name: envConfig.APP_NAME,
    env: envConfig.NODE_ENV,
    port: envConfig.PORT,
    apiVersion: envConfig.API_VERSION,
    isDevelopment: envConfig.NODE_ENV === "development",
    isProduction: envConfig.NODE_ENV === "production",
    isTest: envConfig.NODE_ENV === "test",
  },

  // Frontend
  frontend: {
    url: envConfig.FRONTEND_URL,
    domain: envConfig.FRONTEND_DOMAIN,
    corsOrigins: envConfig.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
  },

  // Database
  database: {
    mongodb: {
      uri: envConfig.NODE_ENV === "test" ? envConfig.MONGODB_TEST_URI : envConfig.MONGODB_URI,
      dbName: envConfig.MONGODB_DB_NAME,
      testUri: envConfig.MONGODB_TEST_URI,
      options: {
        maxPoolSize: envConfig.DB_POOL_SIZE,
        serverSelectionTimeoutMS: envConfig.DB_TIMEOUT,
        retryWrites: envConfig.DB_RETRY_WRITES,
      },
    },
    redis: {
      url: envConfig.REDIS_URL,
      password: envConfig.REDIS_PASSWORD,
      db: envConfig.NODE_ENV === "test" ? envConfig.REDIS_TEST_DB : envConfig.REDIS_DB,
      testDb: envConfig.REDIS_TEST_DB,
    },
  },

  // Authentication
  auth: {
    jwt: {
      secret: envConfig.JWT_SECRET,
      refreshSecret: envConfig.JWT_REFRESH_SECRET,
      expiresIn: envConfig.JWT_EXPIRE_TIME,
      refreshExpiresIn: envConfig.JWT_REFRESH_EXPIRE_TIME,
      accessSecret: envConfig.JWT_SECRET,
      accessExpiresIn: 3600, // 1 hour in seconds
      refreshExpiresInSeconds: 604800, // 7 days in seconds
    },
    session: {
      secret: envConfig.SESSION_SECRET,
      maxAge: envConfig.SESSION_MAX_AGE,
    },
    password: {
      bcryptRounds: envConfig.BCRYPT_ROUNDS,
      minLength: envConfig.PASSWORD_MIN_LENGTH,
    },
    passwordPolicy: {
      minLength: envConfig.PASSWORD_MIN_LENGTH,
      requireUppercase: envConfig.PASSWORD_REQUIRE_UPPERCASE,
      requireLowercase: envConfig.PASSWORD_REQUIRE_LOWERCASE,
      requireNumbers: envConfig.PASSWORD_REQUIRE_NUMBERS,
      requireSpecialChars: envConfig.PASSWORD_REQUIRE_SPECIAL_CHARS,
    },
    bcryptRounds: envConfig.BCRYPT_ROUNDS,
  },

  // Security
  security: {
    rateLimit: {
      windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
      maxRequests: envConfig.RATE_LIMIT_MAX_REQUESTS,
      skipFailedRequests: envConfig.RATE_LIMIT_SKIP_FAILED_REQUESTS,
      enabled: envConfig.SECURITY_RATE_LIMIT_ENABLED,
    },
    cors: {
      enabled: envConfig.SECURITY_CORS_ENABLED,
      origins: envConfig.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
      allOrigins: envConfig.DEV_CORS_ALL_ORIGINS && envConfig.NODE_ENV === "development",
    },
    helmet: {
      enabled: envConfig.SECURITY_HELMET_ENABLED,
    },
  },

  // AI Services
  ai: {
    groq: {
      apiKey: envConfig.GROQ_API_KEY,
      model: envConfig.GROQ_MODEL_DEFAULT,
      maxTokens: envConfig.GROQ_MAX_TOKENS,
      temperature: envConfig.GROQ_TEMPERATURE,
      topP: envConfig.GROQ_TOP_P,
      timeout: envConfig.GROQ_TIMEOUT,
    },
    tools: {
      enabled: envConfig.TOOL_ENABLED,
      timeout: envConfig.TOOL_TIMEOUT,
      maxConcurrent: envConfig.TOOL_MAX_CONCURRENT,
    },
    external: {
      tavily: envConfig.TAVILY_API_KEY,
      openai: envConfig.OPENAI_API_KEY,
      anthropic: envConfig.ANTHROPIC_API_KEY,
      gemini: envConfig.GEMINI_API_KEY,
    },
  },

  // Logging
  logging: {
    level: envConfig.LOG_LEVEL,
    file: {
      enabled: envConfig.LOG_FILE_ENABLED,
      path: envConfig.LOG_FILE_PATH,
      errorPath: envConfig.LOG_ERROR_FILE_PATH,
      maxSize: envConfig.LOG_MAX_SIZE,
      maxFiles: envConfig.LOG_MAX_FILES,
      datePattern: envConfig.LOG_DATE_PATTERN,
    },
    console: {
      enabled: envConfig.LOG_CONSOLE_ENABLED,
    },
    requests: {
      enabled: envConfig.LOG_REQUESTS,
      logBody: envConfig.LOG_REQUEST_BODY,
      logResponse: envConfig.LOG_RESPONSE_BODY,
    },
  },

  // File Upload
  upload: {
    maxFileSize: envConfig.MAX_FILE_SIZE,
    maxFiles: envConfig.MAX_FILES_PER_REQUEST,
    allowedTypes: envConfig.ALLOWED_FILE_TYPES.split(",").map((type) => type.trim()),
    directories: {
      upload: envConfig.UPLOAD_DIR,
      temp: envConfig.TEMP_DIR,
      static: envConfig.STATIC_DIR,
    },
  },

  // WebSocket
  websocket: {
    enabled: envConfig.WEBSOCKET_ENABLED,
    path: envConfig.WEBSOCKET_PATH,
    corsOrigins: envConfig.WEBSOCKET_CORS_ORIGINS.split(",").map((origin) => origin.trim()),
    pingTimeout: envConfig.WEBSOCKET_PING_TIMEOUT,
    pingInterval: envConfig.WEBSOCKET_PING_INTERVAL,
  },

  // Performance
  performance: {
    compression: {
      enabled: envConfig.COMPRESSION_ENABLED,
      level: envConfig.COMPRESSION_LEVEL,
      threshold: envConfig.COMPRESSION_THRESHOLD,
    },
    cache: {
      ttl: envConfig.CACHE_TTL,
      maxKeys: envConfig.CACHE_MAX_KEYS,
      memoryEnabled: envConfig.MEMORY_CACHE_ENABLED,
    },
    timeout: {
      request: envConfig.REQUEST_TIMEOUT,
      slowThreshold: envConfig.SLOW_REQUEST_THRESHOLD,
    },
  },

  // Monitoring
  monitoring: {
    healthCheck: {
      enabled: envConfig.HEALTH_CHECK_ENABLED,
      path: envConfig.HEALTH_CHECK_PATH,
      interval: envConfig.HEALTH_CHECK_INTERVAL,
    },
    metrics: {
      enabled: envConfig.METRICS_ENABLED,
      endpoint: envConfig.PROMETHEUS_ENDPOINT,
      port: envConfig.PROMETHEUS_PORT,
    },
    sentry: {
      enabled: envConfig.SENTRY_ENABLED,
      dsn: envConfig.SENTRY_DSN,
      environment: envConfig.SENTRY_ENVIRONMENT,
    },
  },

  // Email
  email: {
    enabled: envConfig.EMAIL_ENABLED,
    smtp: {
      host: envConfig.SMTP_HOST,
      port: envConfig.SMTP_PORT,
      secure: envConfig.SMTP_SECURE,
      auth: {
        user: envConfig.SMTP_USER,
        pass: envConfig.SMTP_PASS,
      },
    },
    from: envConfig.EMAIL_FROM,
  },

  // Development
  development: {
    seedDatabase: envConfig.DEV_SEED_DATABASE && envConfig.NODE_ENV === "development",
    autoMigrate: envConfig.DEV_AUTO_MIGRATE && envConfig.NODE_ENV === "development",
    swagger: envConfig.DEV_SWAGGER_ENABLED && envConfig.NODE_ENV === "development",
  },

  // Testing
  testing: {
    timeout: envConfig.TEST_TIMEOUT,
    parallel: envConfig.TEST_PARALLEL,
    coverageThreshold: envConfig.TEST_COVERAGE_THRESHOLD,
  },
} as const;

// Type export for configuration
export type Config = typeof CONFIG;

// Export the config object with the name expected by imports
export const config = CONFIG;

// Utility functions
export const isDevelopment = () => CONFIG.app.isDevelopment;
export const isProduction = () => CONFIG.app.isProduction;
export const isTest = () => CONFIG.app.isTest;

export default CONFIG;
