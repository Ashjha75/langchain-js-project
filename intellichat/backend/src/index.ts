/**
 * IntelliChat Pro Backend
 * Main entry point for the backend application
 */

// Core exports
export * from '@/types';
export { config, CONFIG } from '@/config';
export { createLogger } from '@/utils/logger';
export * from '@/utils/errorHandler';

// Specific model exports to avoid conflicts
export { 
  User, 
  Conversation, 
  Message, 
  TokenUsage, 
  ChatHistory 
} from '@/models';

// Service exports
export { AuthService } from '@/services/auth';
export { ChatService } from '@/services/chat';

// Controller exports
export * from '@/controllers';

// Route exports
export * from '@/routes';

// AI exports
export { aiProviderFactory } from '@/ai/factory';

// Main application export
export { default as app } from '@/app';