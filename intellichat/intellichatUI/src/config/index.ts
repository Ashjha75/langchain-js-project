// Application configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },

  // WebSocket Configuration
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    pingInterval: 30000,
  },

  // Authentication
  auth: {
    tokenKey: 'intellichat_token',
    refreshTokenKey: 'intellichat_refresh_token',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
  },

  // Chat Configuration
  chat: {
    maxMessageLength: 4000,
    maxMessagesPerConversation: 1000,
    defaultModel: 'gpt-4-turbo',
    defaultTemperature: 0.7,
    defaultMaxTokens: 2048,
    streamingChunkSize: 1024,
    typingIndicatorDelay: 500,
    messageRetryAttempts: 3,
  },

  // File Upload
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowedCodeTypes: [
      'text/javascript',
      'text/typescript',
      'text/python',
      'text/java',
      'text/cpp',
      'text/csharp',
      'text/html',
      'text/css',
      'application/json',
      'text/xml',
    ],
  },

  // UI Configuration
  ui: {
    sidebarWidth: 260,
    sidebarCollapsedWidth: 60,
    messageAnimationDuration: 200,
    toastDuration: 5000,
    debounceDelay: 300,
    throttleLimit: 100,
    virtualScrollItemHeight: 100,
    infiniteScrollThreshold: 0.8,
  },

  // Performance
  performance: {
    enableVirtualScrolling: true,
    lazyLoadImages: true,
    prefetchNextPage: true,
    cacheSize: 50,
    memoryCleanupInterval: 5 * 60 * 1000, // 5 minutes
  },

  // Analytics
  analytics: {
    enabled: process.env.NODE_ENV === 'production',
    trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    batchSize: 10,
    flushInterval: 5000,
  },

  // Feature Flags
  features: {
    enableVoiceInput: true,
    enableImageGeneration: true,
    enableCodeExecution: false,
    enableWebSearch: true,
    enableFileUpload: true,
    enableSharing: true,
    enableExport: true,
    enableDarkMode: true,
    enableNotifications: true,
    enableOfflineMode: false,
  },

  // Subscription Limits
  limits: {
    free: {
      messagesPerDay: 50,
      conversationsPerMonth: 10,
      fileUploadsPerDay: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      enabledTools: ['web_search', 'utility'],
    },
    pro: {
      messagesPerDay: 1000,
      conversationsPerMonth: 100,
      fileUploadsPerDay: 50,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enabledTools: ['web_search', 'code_execution', 'image_generation', 'utility'],
    },
    enterprise: {
      messagesPerDay: -1, // unlimited
      conversationsPerMonth: -1, // unlimited
      fileUploadsPerDay: -1, // unlimited
      maxFileSize: 100 * 1024 * 1024, // 100MB
      enabledTools: '*', // all tools
    },
  },

  // Theme Configuration
  theme: {
    defaultTheme: 'dark',
    accentColor: '#238636',
    fontFamily: 'Inter',
    borderRadius: '0.75rem',
    animationSpeed: 'normal',
  },

  // Keyboard Shortcuts
  shortcuts: {
    newChat: 'cmd+shift+n',
    toggleSidebar: 'cmd+shift+s',
    focusInput: 'cmd+k',
    sendMessage: 'cmd+enter',
    searchConversations: 'cmd+f',
    toggleTheme: 'cmd+shift+t',
    openSettings: 'cmd+comma',
  },

  // Error Handling
  errors: {
    maxRetries: 3,
    retryDelay: 1000,
    showStackTrace: process.env.NODE_ENV === 'development',
    reportErrors: process.env.NODE_ENV === 'production',
    errorReportingUrl: process.env.NEXT_PUBLIC_ERROR_REPORTING_URL,
  },

  // SEO
  seo: {
    defaultTitle: 'IntelliChat Pro - AI-Powered Chat Interface',
    titleTemplate: '%s | IntelliChat Pro',
    defaultDescription: 'Experience the future of AI conversation with IntelliChat Pro',
    defaultKeywords: ['AI chat', 'artificial intelligence', 'chatbot', 'conversation'],
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://intellichat.pro',
    twitterHandle: '@intellichat',
  },

  // Development
  dev: {
    enableDevTools: process.env.NODE_ENV === 'development',
    enableReduxDevTools: process.env.NODE_ENV === 'development',
    enableQueryDevTools: process.env.NODE_ENV === 'development',
    mockApi: process.env.NEXT_PUBLIC_MOCK_API === 'true',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  },
} as const;

// Type-safe configuration access
export type Config = typeof config;

// Environment-specific configurations
export const environments = {
  development: {
    ...config,
    api: {
      ...config.api,
      baseUrl: 'http://localhost:3001/api/v1',
    },
    websocket: {
      ...config.websocket,
      url: 'ws://localhost:3001',
    },
  },
  staging: {
    ...config,
    api: {
      ...config.api,
      baseUrl: 'https://staging-api.intellichat.pro/api/v1',
    },
    websocket: {
      ...config.websocket,
      url: 'wss://staging-api.intellichat.pro',
    },
  },
  production: {
    ...config,
    api: {
      ...config.api,
      baseUrl: 'https://api.intellichat.pro/api/v1',
    },
    websocket: {
      ...config.websocket,
      url: 'wss://api.intellichat.pro',
    },
  },
};

// Get current environment configuration
export function getEnvConfig(): Config {
  const env = process.env.NODE_ENV as keyof typeof environments;
  return environments[env] || environments.development;
}

// Validation functions
export function validateConfig(): void {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_WS_URL',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] && process.env.NODE_ENV === 'production'
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Initialize configuration
if (typeof window === 'undefined') {
  // Only validate on server side
  validateConfig();
}