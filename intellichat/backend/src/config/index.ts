import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment Schema Validation using Zod
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3001'),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('IntelliChat Pro Backend'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_DOMAIN: z.string().default('localhost'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),

  // Database
  MONGODB_URI: z.string().default('mongodb://localhost:27017/intellichat'),
  MONGODB_DB_NAME: z.string().default('intellichat'),
  MONGODB_TEST_URI: z.string().default('mongodb://localhost:27017/intellichat_test'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform((val) => parseInt(val, 10)).default('0'),
  REDIS_TEST_DB: z.string().transform((val) => parseInt(val, 10)).default('1'),

  // Database Options
  DB_POOL_SIZE: z.string().transform((val) => parseInt(val, 10)).default('10'),
  DB_TIMEOUT: z.string().transform((val) => parseInt(val, 10)).default('10000'),
  DB_RETRY_WRITES: z.string().transform((val) => val === 'true').default('true'),

  // Authentication & Security
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRE_TIME: z.string().default('15m'),
  JWT_REFRESH_EXPIRE_TIME: z.string().default('7d'),
  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE: z.string().transform((val) => parseInt(val, 10)).default('86400000'),
  BCRYPT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).default('12'),
  PASSWORD_MIN_LENGTH: z.string().transform((val) => parseInt(val, 10)).default('8'),
  PASSWORD_REQUIRE_UPPERCASE: z.string().transform((val) => val === 'true').default('true'),
  PASSWORD_REQUIRE_LOWERCASE: z.string().transform((val) => val === 'true').default('true'),
  PASSWORD_REQUIRE_NUMBERS: z.string().transform((val) => val === 'true').default('true'),
  PASSWORD_REQUIRE_SPECIAL_CHARS: z.string().transform((val) => val === 'true').default('true'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).default('100'),
  RATE_LIMIT_SKIP_FAILED_REQUESTS: z.string().transform((val) => val === 'true').default('true'),

  // Security Features
  SECURITY_CORS_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  SECURITY_HELMET_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  SECURITY_RATE_LIMIT_ENABLED: z.string().transform((val) => val === 'true').default('true'),

  // AI Services
  GROQ_API_KEY: z.string(),
  GROQ_MODEL_DEFAULT: z.string().default('llama-3.1-70b-versatile'),
  GROQ_MAX_TOKENS: z.string().transform((val) => parseInt(val, 10)).default('4096'),
  GROQ_TEMPERATURE: z.string().transform((val) => parseFloat(val)).default('0.7'),
  GROQ_TOP_P: z.string().transform((val) => parseFloat(val)).default('0.9'),
  GROQ_TIMEOUT: z.string().transform((val) => parseInt(val, 10)).default('30000'),

  // Tool Configuration
  TOOL_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  TOOL_TIMEOUT: z.string().transform((val) => parseInt(val, 10)).default('10000'),
  TOOL_MAX_CONCURRENT: z.string().transform((val) => parseInt(val, 10)).default('5'),

  // External APIs (Optional)
  TAVILY_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_FILE_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  LOG_CONSOLE_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  LOG_FILE_PATH: z.string().default('logs/app.log'),
  LOG_ERROR_FILE_PATH: z.string().default('logs/error.log'),
  LOG_MAX_SIZE: z.string().default('10m'),
  LOG_MAX_FILES: z.string().transform((val) => parseInt(val, 10)).default('5'),
  LOG_DATE_PATTERN: z.string().default('YYYY-MM-DD'),
  LOG_REQUESTS: z.string().transform((val) => val === 'true').default('true'),
  LOG_REQUEST_BODY: z.string().transform((val) => val === 'true').default('false'),
  LOG_RESPONSE_BODY: z.string().transform((val) => val === 'true').default('false'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform((val) => parseInt(val, 10)).default('10485760'),
  MAX_FILES_PER_REQUEST: z.string().transform((val) => parseInt(val, 10)).default('5'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf,text/plain,text/markdown'),
  UPLOAD_DIR: z.string().default('uploads'),
  TEMP_DIR: z.string().default('temp'),
  STATIC_DIR: z.string().default('public'),

  // WebSocket
  WEBSOCKET_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  WEBSOCKET_PATH: z.string().default('/socket.io'),
  WEBSOCKET_CORS_ORIGINS: z.string().default('http://localhost:3000'),
  WEBSOCKET_PING_TIMEOUT: z.string().transform((val) => parseInt(val, 10)).default('60000'),
  WEBSOCKET_PING_INTERVAL: z.string().transform((val) => parseInt(val, 10)).default('25000'),

  // Performance
  COMPRESSION_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  COMPRESSION_LEVEL: z.string().transform((val) => parseInt(val, 10)).default('6'),
  COMPRESSION_THRESHOLD: z.string().transform((val) => parseInt(val, 10)).default('1024'),
  CACHE_TTL: z.string().transform((val) => parseInt(val, 10)).default('3600'),
  CACHE_MAX_KEYS: z.string().transform((val) => parseInt(val, 10)).default('1000'),
  MEMORY_CACHE_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  REQUEST_TIMEOUT: z.string().transform((val) => parseInt(val, 10)).default('30000'),
  SLOW_REQUEST_THRESHOLD: z.string().transform((val) => parseInt(val, 10)).default('5000'),

  // Monitoring
  HEALTH_CHECK_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  HEALTH_CHECK_PATH: z.string().default('/health'),
  HEALTH_CHECK_INTERVAL: z.string().transform((val) => parseInt(val, 10)).default('30000'),
  METRICS_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  PROMETHEUS_ENDPOINT: z.string().default('/metrics'),
  PROMETHEUS_PORT: z.string().transform((val) => parseInt(val, 10)).default('9464'),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  SENTRY_ENVIRONMENT: z.string().default('development'),

  // Email (Optional)
  EMAIL_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10)).default('587'),
  SMTP_SECURE: z.string().transform((val) => val === 'true').default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@intellichat.pro'),

  // Development
  DEV_SEED_DATABASE: z.string().transform((val) => val === 'true').default('true'),
  DEV_AUTO_MIGRATE: z.string().transform((val) => val === 'true').default('true'),
  DEV_SWAGGER_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  DEV_CORS_ALL_ORIGINS: z.string().transform((val) => val === 'true').default('true'),

  // Testing
  TEST_TIMEOUT: z.string().transform((val) => parseInt(val, 10)).default('10000'),
  TEST_PARALLEL: z.string().transform((val) => val === 'true').default('true'),
  TEST_COVERAGE_THRESHOLD: z.string().transform((val) => parseInt(val, 10)).default('80'),
});

// Validate and parse environment variables
let config: z.infer<typeof envSchema>;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment configuration:');
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

// Export configuration object
export const CONFIG = {
  // Application
  app: {
    name: config.APP_NAME,
    env: config.NODE_ENV,
    port: config.PORT,
    apiVersion: config.API_VERSION,
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
    isTest: config.NODE_ENV === 'test',
  },

  // Frontend
  frontend: {
    url: config.FRONTEND_URL,
    domain: config.FRONTEND_DOMAIN,
    corsOrigins: config.CORS_ORIGINS.split(',').map(origin => origin.trim()),
  },

  // Database
  database: {
    mongodb: {
      uri: config.NODE_ENV === 'test' ? config.MONGODB_TEST_URI : config.MONGODB_URI,
      dbName: config.MONGODB_DB_NAME,
      testUri: config.MONGODB_TEST_URI,
      options: {
        maxPoolSize: config.DB_POOL_SIZE,
        serverSelectionTimeoutMS: config.DB_TIMEOUT,
        retryWrites: config.DB_RETRY_WRITES,
      },
    },
    redis: {
      url: config.REDIS_URL,
      password: config.REDIS_PASSWORD,
      db: config.NODE_ENV === 'test' ? config.REDIS_TEST_DB : config.REDIS_DB,
      testDb: config.REDIS_TEST_DB,
    },
  },

  // Authentication
  auth: {
    jwt: {
      secret: config.JWT_SECRET,
      refreshSecret: config.JWT_REFRESH_SECRET,
      expiresIn: config.JWT_EXPIRE_TIME,
      refreshExpiresIn: config.JWT_REFRESH_EXPIRE_TIME,
      accessSecret: config.JWT_SECRET,
      accessExpiresIn: 3600, // 1 hour in seconds
      refreshExpiresInSeconds: 604800, // 7 days in seconds
    },
    session: {
      secret: config.SESSION_SECRET,
      maxAge: config.SESSION_MAX_AGE,
    },
    password: {
      bcryptRounds: config.BCRYPT_ROUNDS,
      minLength: config.PASSWORD_MIN_LENGTH,
    },
    passwordPolicy: {
      minLength: config.PASSWORD_MIN_LENGTH,
      requireUppercase: config.PASSWORD_REQUIRE_UPPERCASE,
      requireLowercase: config.PASSWORD_REQUIRE_LOWERCASE,
      requireNumbers: config.PASSWORD_REQUIRE_NUMBERS,
      requireSpecialChars: config.PASSWORD_REQUIRE_SPECIAL_CHARS,
    },
    bcryptRounds: config.BCRYPT_ROUNDS,
  },

  // Security
  security: {
    rateLimit: {
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
      skipFailedRequests: config.RATE_LIMIT_SKIP_FAILED_REQUESTS,
      enabled: config.SECURITY_RATE_LIMIT_ENABLED,
    },
    cors: {
      enabled: config.SECURITY_CORS_ENABLED,
      origins: config.CORS_ORIGINS.split(',').map(origin => origin.trim()),
      allOrigins: config.DEV_CORS_ALL_ORIGINS && config.NODE_ENV === 'development',
    },
    helmet: {
      enabled: config.SECURITY_HELMET_ENABLED,
    },
  },

  // AI Services
  ai: {
    groq: {
      apiKey: config.GROQ_API_KEY,
      model: config.GROQ_MODEL_DEFAULT,
      maxTokens: config.GROQ_MAX_TOKENS,
      temperature: config.GROQ_TEMPERATURE,
      topP: config.GROQ_TOP_P,
      timeout: config.GROQ_TIMEOUT,
    },
    tools: {
      enabled: config.TOOL_ENABLED,
      timeout: config.TOOL_TIMEOUT,
      maxConcurrent: config.TOOL_MAX_CONCURRENT,
    },
    external: {
      tavily: config.TAVILY_API_KEY,
      openai: config.OPENAI_API_KEY,
      anthropic: config.ANTHROPIC_API_KEY,
      gemini: config.GEMINI_API_KEY,
    },
  },

  // Logging
  logging: {
    level: config.LOG_LEVEL,
    file: {
      enabled: config.LOG_FILE_ENABLED,
      path: config.LOG_FILE_PATH,
      errorPath: config.LOG_ERROR_FILE_PATH,
      maxSize: config.LOG_MAX_SIZE,
      maxFiles: config.LOG_MAX_FILES,
      datePattern: config.LOG_DATE_PATTERN,
    },
    console: {
      enabled: config.LOG_CONSOLE_ENABLED,
    },
    requests: {
      enabled: config.LOG_REQUESTS,
      logBody: config.LOG_REQUEST_BODY,
      logResponse: config.LOG_RESPONSE_BODY,
    },
  },

  // File Upload
  upload: {
    maxFileSize: config.MAX_FILE_SIZE,
    maxFiles: config.MAX_FILES_PER_REQUEST,
    allowedTypes: config.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()),
    directories: {
      upload: config.UPLOAD_DIR,
      temp: config.TEMP_DIR,
      static: config.STATIC_DIR,
    },
  },

  // WebSocket
  websocket: {
    enabled: config.WEBSOCKET_ENABLED,
    path: config.WEBSOCKET_PATH,
    corsOrigins: config.WEBSOCKET_CORS_ORIGINS.split(',').map(origin => origin.trim()),
    pingTimeout: config.WEBSOCKET_PING_TIMEOUT,
    pingInterval: config.WEBSOCKET_PING_INTERVAL,
  },

  // Performance
  performance: {
    compression: {
      enabled: config.COMPRESSION_ENABLED,
      level: config.COMPRESSION_LEVEL,
      threshold: config.COMPRESSION_THRESHOLD,
    },
    cache: {
      ttl: config.CACHE_TTL,
      maxKeys: config.CACHE_MAX_KEYS,
      memoryEnabled: config.MEMORY_CACHE_ENABLED,
    },
    timeout: {
      request: config.REQUEST_TIMEOUT,
      slowThreshold: config.SLOW_REQUEST_THRESHOLD,
    },
  },

  // Monitoring
  monitoring: {
    healthCheck: {
      enabled: config.HEALTH_CHECK_ENABLED,
      path: config.HEALTH_CHECK_PATH,
      interval: config.HEALTH_CHECK_INTERVAL,
    },
    metrics: {
      enabled: config.METRICS_ENABLED,
      endpoint: config.PROMETHEUS_ENDPOINT,
      port: config.PROMETHEUS_PORT,
    },
    sentry: {
      enabled: config.SENTRY_ENABLED,
      dsn: config.SENTRY_DSN,
      environment: config.SENTRY_ENVIRONMENT,
    },
  },

  // Email
  email: {
    enabled: config.EMAIL_ENABLED,
    smtp: {
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    },
    from: config.EMAIL_FROM,
  },

  // Development
  development: {
    seedDatabase: config.DEV_SEED_DATABASE && config.NODE_ENV === 'development',
    autoMigrate: config.DEV_AUTO_MIGRATE && config.NODE_ENV === 'development',
    swagger: config.DEV_SWAGGER_ENABLED && config.NODE_ENV === 'development',
  },

  // Testing
  testing: {
    timeout: config.TEST_TIMEOUT,
    parallel: config.TEST_PARALLEL,
    coverageThreshold: config.TEST_COVERAGE_THRESHOLD,
  },
} as const;

// Type export for configuration
export type Config = typeof CONFIG;

// Utility functions
export const isDevelopment = () => CONFIG.app.isDevelopment;
export const isProduction = () => CONFIG.app.isProduction;
export const isTest = () => CONFIG.app.isTest;

export default CONFIG;