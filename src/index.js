import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { CodeGenerationAgent } from './agents/CodeGenerationAgent.js';
import { ProjectIntelligenceAgent } from './agents/ProjectIntelligenceAgent.js';
import { UniversalCodeGenerationAgent } from './agents/UniversalCodeGenerationAgent.js';
import { UniversalContextManager } from './utils/UniversalContextManager.js';
import { UniversalCodebaseAnalyzer } from './utils/UniversalCodebaseAnalyzer.js';
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

// Initialize agents and managers
const codeAgent = new CodeGenerationAgent();
const intelligenceAgent = new ProjectIntelligenceAgent();
const universalAgent = new UniversalCodeGenerationAgent();
const contextManager = new UniversalContextManager();
const codebaseAnalyzer = new UniversalCodebaseAnalyzer();

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Universal LangChain Code Generation Agent',
    capabilities: [
      'universal-code-generation',
      'context-aware-analysis', 
      'multi-language-support',
      'business-domain-understanding',
      'memory-persistence'
    ]
  });
});

// Universal Code Generation Endpoints
app.post('/universal/analyze', async (req, res) => {
  try {
    const { projectPath, options = {} } = req.body;
    
    if (!projectPath) {
      return res.status(400).json({
        success: false,
        error: 'projectPath is required',
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info('🔍 Analyzing codebase universally', { projectPath });
    
    // Analyze the codebase
    const analysis = await codebaseAnalyzer.analyzeProject(projectPath, options);
    
    // Store analysis in context manager
    await contextManager.storeContext(projectPath, {
      codebaseAnalysis: analysis,
      analyzedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in universal analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/universal/generate', async (req, res) => {
  try {
    const { 
      requirement, 
      codebasePath, 
      targetLanguage, 
      targetFramework,
      contextFiles = [],
      businessGoals = [],
      constraints = [] 
    } = req.body;
    
    if (!requirement) {
      return res.status(400).json({
        success: false,
        error: 'requirement is required',
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info('🎯 Universal code generation', { requirement, codebasePath, targetLanguage });
    
    const result = await universalAgent.generateUniversalCode({
      requirement,
      codebasePath,
      targetLanguage,
      targetFramework,
      contextFiles,
      businessGoals,
      constraints
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in universal generation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/universal/context/store', async (req, res) => {
  try {
    const { projectId, contextData } = req.body;
    
    if (!projectId || !contextData) {
      return res.status(400).json({
        success: false,
        error: 'projectId and contextData are required',
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info('📚 Storing universal context', { projectId });
    
    const result = await contextManager.storeContext(projectId, contextData);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error storing context:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/universal/context/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requirement, includeCodebase = true, includePatterns = true, includeBusiness = true } = req.query;
    
    logger.info('📖 Retrieving universal context', { projectId, requirement });
    
    const context = await contextManager.getContextForGeneration(projectId, requirement, {
      includeCodebase: includeCodebase === 'true',
      includePatterns: includePatterns === 'true', 
      includeBusiness: includeBusiness === 'true'
    });
    
    res.json({
      success: true,
      data: context,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving context:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/universal/learn', async (req, res) => {
  try {
    const { projectId, feedback } = req.body;
    
    if (!projectId || !feedback) {
      return res.status(400).json({
        success: false,
        error: 'projectId and feedback are required',
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info('🧠 Learning from feedback', { projectId });
    
    await contextManager.updateContextFromFeedback(projectId, feedback);
    await universalAgent.learnFromHistory();
    
    res.json({
      success: true,
      data: { message: 'Learning completed successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in learning process:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/universal/stats', async (req, res) => {
  try {
    const contextStats = contextManager.getContextStats();
    const agentStats = {
      totalGenerations: universalAgent.generationHistory.length,
      codebaseMemory: universalAgent.codebaseMemory.size,
      businessRules: universalAgent.businessRules.size
    };
    
    res.json({
      success: true,
      data: {
        context: contextStats,
        agent: agentStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Legacy Template-Based Endpoints (for backward compatibility)
app.post('/generate/nextjs', async (req, res) => {
  try {
    const { requirements, components, features } = req.body;
    
    logger.info('Generating Next.js code (legacy template)', { requirements, components, features });
    
    const result = await codeAgent.generateNextJSCode({
      requirements,
      components: components || [],
      features: features || []
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      note: 'Consider using /universal/generate for context-aware generation'
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
    
    logger.info('Generating Express.js code (legacy template)', { requirements, routes, middleware, database });
    
    const result = await codeAgent.generateExpressCode({
      requirements,
      routes: routes || [],
      middleware: middleware || [],
      database: database || 'none'
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      note: 'Consider using /universal/generate for context-aware generation'
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
    
    logger.info('Generating full-stack code (legacy template)', { requirements, frontend, backend });
    
    const result = await codeAgent.generateFullStackCode({
      requirements,
      frontend: frontend || {},
      backend: backend || {}
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      note: 'Consider using /universal/generate for context-aware generation'
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

// Project Intelligence Endpoints (enhanced with universal context)
app.post('/intelligence/initialize', async (req, res) => {
  try {
    const { projectPath, businessContext } = req.body;
    
    logger.info('Initializing project intelligence', { projectPath });
    
    // First, run universal analysis
    const analysis = await codebaseAnalyzer.analyzeProject(projectPath);
    
    // Store in context manager
    await contextManager.storeContext(projectPath, {
      codebaseAnalysis: analysis,
      businessContext: businessContext || {},
      analyzedAt: new Date().toISOString()
    });
    
    // Initialize intelligence agent
    const result = await intelligenceAgent.initializeProject(projectPath, businessContext);
    
    res.json({
      success: true,
      data: {
        ...result,
        universalAnalysis: analysis.summary,
        contextStored: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error initializing project intelligence:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/intelligence/generate', async (req, res) => {
  try {
    const { intent, requirements, targetFiles, businessGoal, changeType } = req.body;
    
    logger.info('Generating intelligent code', { intent, changeType });
    
    const result = await intelligenceAgent.generateIntelligentCode({
      intent,
      requirements,
      targetFiles: targetFiles || [],
      businessGoal,
      changeType: changeType || 'feature'
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating intelligent code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/intelligence/analyze', async (req, res) => {
  try {
    const { filePaths, improvementGoals } = req.body;
    
    logger.info('Analyzing code for improvements', { filePaths });
    
    const result = await intelligenceAgent.analyzeAndImprove(filePaths, improvementGoals);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error analyzing code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/intelligence/question', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    logger.info('Answering project question', { question });
    
    const result = await intelligenceAgent.answerProjectQuestion(question, context);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error answering project question:', error);
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
    available_endpoints: [
      'GET /health - Health check',
      'POST /universal/analyze - Analyze any codebase',
      'POST /universal/generate - Universal code generation', 
      'POST /universal/context/store - Store project context',
      'GET /universal/context/:projectId - Get project context',
      'POST /universal/learn - Learn from feedback',
      'GET /universal/stats - Get system statistics',
      'POST /intelligence/initialize - Initialize project intelligence',
      'POST /intelligence/generate - Generate intelligent code',
      'POST /intelligence/analyze - Analyze and improve code',
      'POST /intelligence/question - Ask project questions',
      'POST /generate/nextjs - Legacy Next.js generation',
      'POST /generate/express - Legacy Express.js generation', 
      'POST /generate/full-stack - Legacy full-stack generation'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Universal LangChain Code Generation Agent running on port ${PORT}`);
  logger.info(`📝 Health check: http://localhost:${PORT}/health`);
  logger.info(`🎯 Universal generation: http://localhost:${PORT}/universal/generate`);
  logger.info(`🔍 Universal analysis: http://localhost:${PORT}/universal/analyze`);
  logger.info(`📊 System stats: http://localhost:${PORT}/universal/stats`);
});

export default app;