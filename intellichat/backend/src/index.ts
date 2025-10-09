/**
 * IntelliChat Pro Backend
 * Main entry point for the backend application
 */

// Core exports
export * from '@/types';
export * from '@/config';
export { createLogger } from '@/utils/logger';
export * from '@/utils/errorHandler';

// Component exports
export * from '@/models';
export * from '@/services';
export * from '@/controllers';
export * from '@/routes';
export * from '@/ai';

// Main application export
export { default as app } from '@/app';