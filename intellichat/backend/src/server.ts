// src/server.ts
import app from './app';
import { CONFIG } from './config';
import dbConnect from './database';
import { logger } from './utils/logger';

const PORT = CONFIG.app.port || 3001;

async function startServer() {
  try {
    // Connect to database
    logger.info('🔌 Connecting to database...');
    await dbConnect();
    logger.info('✅ Database connected successfully');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 IntelliChat Backend Server started`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${CONFIG.app.env}`);
      logger.info(`📊 API Version: ${CONFIG.app.apiVersion}`);
      logger.info(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      
      if (CONFIG.app.isDevelopment) {
        logger.info(`📖 Frontend URL: ${CONFIG.frontend.url}`);
        logger.info(`🛠️  Development mode enabled`);
      }
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('🛑 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Process terminated');
        process.exit(0);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('🚨 Uncaught Exception thrown:', error);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error('💥 Server startup failed:', error);
  process.exit(1);
});