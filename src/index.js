import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { CodeGenerationAgent } from './agents/CodeGenerationAgent.js';
import { logger } from './utils/logger.js';
import { validateEnvironment } from './utils/validation.js';

// Load environment variables
dotenv.config();

// Validate environment
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize the code generation agent
const codeAgent = new CodeGenerationAgent();

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'LangChain Code Generation Agent'
  });
});

app.post('/generate/nextjs', async (req, res) => {
  try {
    const { requirements, components, features } = req.body;
    
    logger.info('Generating Next.js code', { requirements, components, features });
    
    const result = await codeAgent.generateNextJSCode({
      requirements,
      components: components || [],
      features: features || []
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating Next.js code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/generate/express', async (req, res) => {
  try {
    const { requirements, routes, middleware, database } = req.body;
    
    logger.info('Generating Express.js code', { requirements, routes, middleware, database });
    
    const result = await codeAgent.generateExpressCode({
      requirements,
      routes: routes || [],
      middleware: middleware || [],
      database: database || 'none'
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating Express.js code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/generate/full-stack', async (req, res) => {
  try {
    const { requirements, frontend, backend } = req.body;
    
    logger.info('Generating full-stack code', { requirements, frontend, backend });
    
    const result = await codeAgent.generateFullStackCode({
      requirements,
      frontend: frontend || {},
      backend: backend || {}
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating full-stack code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 LangChain Code Generation Agent running on port ${PORT}`);
  logger.info(`📝 Health check: http://localhost:${PORT}/health`);
});

export default app;