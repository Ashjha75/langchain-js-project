/**
 * Main Application Entry Point
 * Sets up Express server with all middleware, routes, and configurations
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { CONFIG } from '@/config';
import { createLogger } from '@/utils/logger';
import { globalErrorHandler } from '@/utils/errorHandler';

// Routes
import { authRoutes } from '@/routes/auth';
import { chatRoutes } from '@/routes/chat';

const logger = createLogger('Application');

class Application {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = CONFIG.app.port;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Basic Express middleware
    this.app.use(helmet()); // Security headers
    this.app.use(compression()); // Gzip compression
    this.app.use(express.json({ limit: '10mb' })); // JSON body parser
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded body parser

    // CORS configuration  
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      optionsSuccessStatus: 200
    }));

    logger.info('Middleware initialized successfully');
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: CONFIG.app.env
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/chat', chatRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Endpoint not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    });

    logger.info('Routes initialized successfully');
  }

  private initializeErrorHandling(): void {
    this.app.use(globalErrorHandler);
    logger.info('Error handling initialized successfully');
  }

  public async start(): Promise<void> {
    try {
      // Start server
      this.app.listen(this.port, () => {
        logger.info(`Server started successfully`, {
          port: this.port,
          environment: CONFIG.app.env,
          node_version: process.version,
          pid: process.pid
        });
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start application', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', {
        promise,
        reason
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    });
  }
}

// Create and start application
const application = new Application();

if (require.main === module) {
  application.start().catch((error) => {
    logger.error('Application startup failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });
}

export default application.app;
