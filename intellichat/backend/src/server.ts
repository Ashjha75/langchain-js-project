/**
 * Server Entry Point
 * Starts the IntelliChat Pro backend server
 */

import app from './app';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Server');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 IntelliChat Pro Server is running!`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    process.exit(1);
  }
};

startServer();
