import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, RunnableParallel } from '@langchain/core/runnables';
import { BaseAgent } from './BaseAgent.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import globPkg from 'glob';
const { glob } = globPkg;

export class UniversalCodeGenerationAgent extends BaseAgent {
  constructor() {
    super();
    this.model = new ChatGoogleGenerativeAI({
      modelName: process.env.GOOGLE_MODEL_NAME || 'gemini-1.5-flash',
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    
    // Universal context management
    this.codebaseMemory = new Map(); // Stores analyzed codebase patterns
    this.businessRules = new Map();  // Stores business context
    this.generationHistory = [];     // Stores generation history for learning
    
    // Vector store for semantic code search
    this.vectorStore = null;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    // Text splitter for code chunks
    this.codeSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
      separators: [
        '\n\nclass ',
        '\nfunction ',
        '\nconst ',
        '\nexport ',
        '\nimport ',
        '\n\n',
        '\n',
        ' '
      ]
    });
    
    this.initializeVectorStore();
  }

  async initializeVectorStore() {
    try {
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      logger.info('Universal vector store initialized');
    } catch (error) {
      logger.error('Failed to initialize vector store:', error);
    }
  }

  /**
   * Analyze any codebase and extract patterns, context, and knowledge
   */
  async analyzeCodebase(codebasePath, options = {}) {
    try {
      logger.info(`🔍 Analyzing codebase at: ${codebasePath}`);
      
      const {
        includePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py', '**/*.java', '**/*.php', '**/*.rb', '**/*.go'],
        excludePatterns = ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'coverage/**'],
        maxFileSize = 100000 // 100KB max per file
      } = options;

      // Find all code files
      const allFiles = [];
      for (const pattern of includePatterns) {
        const files = await glob(pattern, {
          cwd: codebasePath,
          ignore: excludePatterns,
          absolute: true
        });
        allFiles.push(...files);
      }

      logger.info(`📁 Found ${allFiles.length} files to analyze`);

      // Analyze files in parallel batches
      const batchSize = 10;
      const analysis = {
        totalFiles: allFiles.length,
        analyzedFiles: 0,
        patterns: new Set(),
        technologies: new Set(),
        architectureStyle: null,
        businessDomain: null,
        codeQuality: {},
        dependencies: new Set(),
        fileTypes: {},
        complexity: 0
      };

      for (let i = 0; i < allFiles.length; i += batchSize) {
        const batch = allFiles.slice(i, i + batchSize);
        const batchPromises = batch.map(filePath => this.analyzeFile(filePath, maxFileSize));
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled' && result.value) {
            this.mergeAnalysis(analysis, result.value);
            analysis.analyzedFiles++;
          }
        }
      }

      // Store the analysis in memory
      this.codebaseMemory.set(codebasePath, {
        ...analysis,
        analyzedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      // Index code chunks in vector store for semantic search
      await this.indexCodebaseInVectorStore(codebasePath, allFiles);

      logger.info(`✅ Codebase analysis complete: ${analysis.analyzedFiles}/${analysis.totalFiles} files`);
      return analysis;

    } catch (error) {
      logger.error('Error analyzing codebase:', error);
      throw error;
    }
  }

  async analyzeFile(filePath, maxFileSize) {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size > maxFileSize) {
        logger.warn(`Skipping large file: ${filePath} (${stats.size} bytes)`);
        return null;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const extension = path.extname(filePath).toLowerCase();
      
      return {
        filePath,
        extension,
        size: stats.size,
        patterns: this.extractCodePatterns(content, extension),
        technologies: this.detectTechnologies(content, filePath),
        complexity: this.calculateComplexity(content),
        businessConcepts: this.extractBusinessConcepts(content),
        dependencies: this.extractDependencies(content, extension),
        functions: this.extractFunctions(content, extension),
        classes: this.extractClasses(content, extension),
        exports: this.extractExports(content, extension)
      };
    } catch (error) {
      logger.error(`Error analyzing file ${filePath}:`, error);
      return null;
    }
  }

  extractCodePatterns(content, extension) {
    const patterns = [];
    
    // Universal patterns
    if (content.includes('class ')) patterns.push('object-oriented');
    if (content.includes('function ') || content.includes('const ') || content.includes('let ')) patterns.push('functional');
    if (content.includes('async ') || content.includes('await ')) patterns.push('async-programming');
    if (content.includes('import ') || content.includes('require(')) patterns.push('modular');
    
    // Framework-specific patterns
    if (content.includes('React') || content.includes('jsx')) patterns.push('react');
    if (content.includes('Vue') || content.includes('.vue')) patterns.push('vue');
    if (content.includes('Angular') || content.includes('@Component')) patterns.push('angular');
    if (content.includes('express') || content.includes('app.get')) patterns.push('express');
    if (content.includes('Next.js') || content.includes('next/')) patterns.push('nextjs');
    if (content.includes('Django') || content.includes('from django')) patterns.push('django');
    if (content.includes('Flask') || content.includes('from flask')) patterns.push('flask');
    if (content.includes('Spring') || content.includes('@RestController')) patterns.push('spring');
    
    // Architecture patterns
    if (content.includes('Repository') || content.includes('Service')) patterns.push('layered-architecture');
    if (content.includes('Controller') && content.includes('Model')) patterns.push('mvc');
    if (content.includes('GraphQL') || content.includes('resolver')) patterns.push('graphql');
    if (content.includes('REST') || content.includes('api/')) patterns.push('rest-api');
    
    return patterns;
  }

  detectTechnologies(content, filePath) {
    const technologies = [];
    const fileName = path.basename(filePath);
    
    // Language detection
    const ext = path.extname(filePath);
    switch (ext) {
      case '.js': case '.jsx': technologies.push('javascript'); break;
      case '.ts': case '.tsx': technologies.push('typescript'); break;
      case '.py': technologies.push('python'); break;
      case '.java': technologies.push('java'); break;
      case '.php': technologies.push('php'); break;
      case '.rb': technologies.push('ruby'); break;
      case '.go': technologies.push('golang'); break;
      case '.cs': technologies.push('csharp'); break;
    }
    
    // Database technologies
    if (content.includes('mongoose') || content.includes('MongoDB')) technologies.push('mongodb');
    if (content.includes('mysql') || content.includes('MySQL')) technologies.push('mysql');
    if (content.includes('postgres') || content.includes('PostgreSQL')) technologies.push('postgresql');
    if (content.includes('redis') || content.includes('Redis')) technologies.push('redis');
    
    // Frontend technologies
    if (content.includes('tailwind') || content.includes('Tailwind')) technologies.push('tailwindcss');
    if (content.includes('bootstrap') || content.includes('Bootstrap')) technologies.push('bootstrap');
    if (content.includes('material-ui') || content.includes('mui')) technologies.push('material-ui');
    
    return technologies;
  }

  calculateComplexity(content) {
    // Simple complexity calculation based on various factors
    const lines = content.split('\n').length;
    const functions = (content.match(/function|=>/g) || []).length;
    const conditions = (content.match(/if|switch|for|while|\?/g) || []).length;
    const classes = (content.match(/class /g) || []).length;
    
    return {
      lines,
      functions,
      conditions,
      classes,
      score: Math.min(10, Math.round((functions + conditions + classes) / lines * 100))
    };
  }

  extractBusinessConcepts(content) {
    const concepts = [];
    
    // Common business terms
    const businessTerms = [
      'user', 'customer', 'order', 'payment', 'product', 'invoice', 'billing',
      'account', 'subscription', 'transaction', 'authentication', 'authorization',
      'profile', 'dashboard', 'report', 'analytics', 'notification', 'email',
      'cart', 'checkout', 'inventory', 'shipping', 'discount', 'coupon',
      'admin', 'manager', 'employee', 'role', 'permission', 'workflow'
    ];
    
    businessTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        concepts.push(term);
      }
    });
    
    return [...new Set(concepts)];
  }

  extractDependencies(content, extension) {
    const dependencies = [];
    
    // JavaScript/TypeScript
    if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
      const imports = content.match(/import .+ from ['"]([^'"]+)['"]/g) || [];
      const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
      dependencies.push(...imports, ...requires);
    }
    
    // Python
    if (extension === '.py') {
      const imports = content.match(/from (\w+) import|import (\w+)/g) || [];
      dependencies.push(...imports);
    }
    
    return dependencies;
  }

  extractFunctions(content, extension) {
    const functions = [];
    
    // JavaScript/TypeScript function extraction
    if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
      const functionDeclarations = content.match(/function\s+(\w+)/g) || [];
      const arrowFunctions = content.match(/const\s+(\w+)\s*=\s*\(/g) || [];
      const methods = content.match(/(\w+)\s*\(/g) || [];
      functions.push(...functionDeclarations, ...arrowFunctions, ...methods);
    }
    
    return functions.map(f => f.replace(/function\s+|const\s+|=.*/, '').trim());
  }

  extractClasses(content, extension) {
    const classes = [];
    const classMatches = content.match(/class\s+(\w+)/g) || [];
    return classMatches.map(c => c.replace('class ', ''));
  }

  extractExports(content, extension) {
    const exports = [];
    const exportMatches = content.match(/export\s+(default\s+)?(\w+|{[^}]+})/g) || [];
    return exportMatches;
  }

  mergeAnalysis(mainAnalysis, fileAnalysis) {
    if (!fileAnalysis) return;
    
    // Merge patterns
    fileAnalysis.patterns.forEach(pattern => mainAnalysis.patterns.add(pattern));
    fileAnalysis.technologies.forEach(tech => mainAnalysis.technologies.add(tech));
    fileAnalysis.dependencies.forEach(dep => mainAnalysis.dependencies.add(dep));
    
    // Update file types
    const ext = fileAnalysis.extension;
    mainAnalysis.fileTypes[ext] = (mainAnalysis.fileTypes[ext] || 0) + 1;
    
    // Update complexity
    mainAnalysis.complexity += fileAnalysis.complexity.score;
  }

  async indexCodebaseInVectorStore(codebasePath, filePaths) {
    try {
      const documents = [];
      
      for (const filePath of filePaths.slice(0, 100)) { // Limit for demo
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const chunks = await this.codeSplitter.splitText(content);
          
          for (const [index, chunk] of chunks.entries()) {
            documents.push(new Document({
              pageContent: chunk,
              metadata: {
                source: filePath,
                chunkIndex: index,
                fileType: path.extname(filePath),
                codebasePath,
                indexedAt: new Date().toISOString()
              }
            }));
          }
        } catch (error) {
          logger.error(`Error processing file for vector store: ${filePath}`, error);
        }
      }
      
      if (documents.length > 0) {
        await this.vectorStore.addDocuments(documents);
        logger.info(`📚 Indexed ${documents.length} code chunks in vector store`);
      }
    } catch (error) {
      logger.error('Error indexing codebase in vector store:', error);
    }
  }

  /**
   * Universal code generation that adapts to any codebase
   */
  async generateUniversalCode(options) {
    const {
      requirement,
      codebasePath,
      targetLanguage,
      targetFramework,
      contextFiles = [],
      businessGoals = [],
      constraints = []
    } = options;

    try {
      logger.info('🎯 Starting universal code generation');
      
      // Step 1: Get codebase context
      let codebaseAnalysis = this.codebaseMemory.get(codebasePath);
      if (!codebaseAnalysis) {
        codebaseAnalysis = await this.analyzeCodebase(codebasePath);
      }
      
      // Step 2: Get relevant code context through vector search
      const relevantContext = await this.getRelevantCodeContext(requirement, codebasePath);
      
      // Step 3: Build context-aware prompt
      const contextPrompt = await this.buildUniversalPrompt({
        requirement,
        codebaseAnalysis,
        relevantContext,
        targetLanguage,
        targetFramework,
        businessGoals,
        constraints
      });
      
      // Step 4: Generate code with full context
      const generatedCode = await this.runUniversalGeneration(contextPrompt);
      
      // Step 5: Store generation for future learning
      this.storeGenerationHistory({
        requirement,
        codebasePath,
        context: relevantContext,
        generatedCode,
        timestamp: new Date().toISOString()
      });
      
      return {
        code: generatedCode,
        context: {
          codebaseAnalysis: {
            patterns: Array.from(codebaseAnalysis.patterns),
            technologies: Array.from(codebaseAnalysis.technologies),
            complexity: codebaseAnalysis.complexity
          },
          relevantFiles: relevantContext.map(doc => doc.metadata.source),
          usedContext: relevantContext.length
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          requirement,
          targetLanguage,
          targetFramework
        }
      };
      
    } catch (error) {
      logger.error('Error in universal code generation:', error);
      throw error;
    }
  }

  async getRelevantCodeContext(requirement, codebasePath, maxResults = 10) {
    try {
      if (!this.vectorStore) {
        logger.warn('Vector store not initialized, skipping context retrieval');
        return [];
      }
      
      // Search for relevant code chunks
      const relevantDocs = await this.vectorStore.similaritySearch(requirement, maxResults);
      
      // Filter by codebase path if specified
      const filteredDocs = codebasePath 
        ? relevantDocs.filter(doc => doc.metadata.codebasePath === codebasePath)
        : relevantDocs;
      
      logger.info(`🔍 Found ${filteredDocs.length} relevant code chunks`);
      return filteredDocs;
      
    } catch (error) {
      logger.error('Error retrieving relevant code context:', error);
      return [];
    }
  }

  async buildUniversalPrompt(options) {
    const {
      requirement,
      codebaseAnalysis,
      relevantContext,
      targetLanguage,
      targetFramework,
      businessGoals,
      constraints
    } = options;

    const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert software developer with deep understanding of multiple programming languages and frameworks.

CODEBASE CONTEXT:
- Primary Technologies: {technologies}
- Code Patterns: {patterns}
- Architecture Style: {architectureStyle}
- Complexity Level: {complexity}/10

RELEVANT CODE EXAMPLES:
{relevantCode}

REQUIREMENT:
{requirement}

TARGET SPECIFICATIONS:
- Language: {targetLanguage}
- Framework: {targetFramework}
- Business Goals: {businessGoals}
- Constraints: {constraints}

INSTRUCTIONS:
1. Analyze the existing codebase patterns and follow the same coding style
2. Use the relevant code examples as reference for structure and conventions
3. Generate code that integrates seamlessly with the existing architecture
4. Follow the identified patterns and technologies already in use
5. Consider the business goals and constraints provided
6. Include proper error handling, logging, and best practices
7. Add comments explaining the business logic and integration points

Generate production-ready code that feels like it was written by the same team that built the existing codebase.

CODE:
`);

    return await promptTemplate.format({
      technologies: Array.from(codebaseAnalysis.technologies).join(', '),
      patterns: Array.from(codebaseAnalysis.patterns).join(', '),
      architectureStyle: this.determineArchitectureStyle(codebaseAnalysis),
      complexity: Math.round(codebaseAnalysis.complexity / codebaseAnalysis.analyzedFiles),
      relevantCode: relevantContext.map(doc => 
        `FILE: ${doc.metadata.source}\n${doc.pageContent}\n---`
      ).join('\n'),
      requirement,
      targetLanguage: targetLanguage || 'auto-detect',
      targetFramework: targetFramework || 'auto-detect',
      businessGoals: businessGoals.join(', '),
      constraints: constraints.join(', ')
    });
  }

  determineArchitectureStyle(analysis) {
    const patterns = Array.from(analysis.patterns);
    
    if (patterns.includes('mvc')) return 'MVC Architecture';
    if (patterns.includes('layered-architecture')) return 'Layered Architecture';
    if (patterns.includes('microservices')) return 'Microservices';
    if (patterns.includes('object-oriented')) return 'Object-Oriented';
    if (patterns.includes('functional')) return 'Functional Programming';
    
    return 'Mixed Architecture';
  }

  async runUniversalGeneration(prompt) {
    try {
      const result = await this.model.invoke(prompt);
      return this.extractCodeFromResponse(result.content);
    } catch (error) {
      logger.error('Error in universal generation:', error);
      throw error;
    }
  }

  extractCodeFromResponse(response) {
    // Extract code blocks from the response
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      matches.push(match[1]);
    }
    
    if (matches.length > 0) {
      return matches;
    }
    
    // If no code blocks, return the whole response
    return [response];
  }

  storeGenerationHistory(generation) {
    this.generationHistory.push(generation);
    
    // Keep only last 100 generations
    if (this.generationHistory.length > 100) {
      this.generationHistory = this.generationHistory.slice(-100);
    }
    
    logger.info('📝 Stored generation in history');
  }

  /**
   * Learn from previous generations and improve
   */
  async learnFromHistory() {
    if (this.generationHistory.length < 10) return;
    
    try {
      const recentGenerations = this.generationHistory.slice(-20);
      
      // Analyze patterns in successful generations
      const successPatterns = this.analyzeSuccessPatterns(recentGenerations);
      
      // Update business rules based on learnings
      this.updateBusinessRulesFromLearning(successPatterns);
      
      logger.info('🧠 Updated knowledge from generation history');
    } catch (error) {
      logger.error('Error learning from history:', error);
    }
  }

  analyzeSuccessPatterns(generations) {
    // This would analyze which generations were successful
    // and extract common patterns for improvement
    return {
      commonRequirements: [],
      successfulPatterns: [],
      frequentTechnologies: []
    };
  }

  updateBusinessRulesFromLearning(patterns) {
    // Update business rules based on learned patterns
    patterns.commonRequirements.forEach(req => {
      this.businessRules.set(`learned_${req}`, {
        type: 'learned_pattern',
        confidence: 0.8,
        usage_count: 1
      });
    });
  }

  /**
   * Get codebase summary for any project
   */
  getCodebaseSummary(codebasePath) {
    const analysis = this.codebaseMemory.get(codebasePath);
    
    if (!analysis) {
      return { error: 'Codebase not analyzed yet. Please run analyzeCodebase first.' };
    }
    
    return {
      totalFiles: analysis.totalFiles,
      analyzedFiles: analysis.analyzedFiles,
      technologies: Array.from(analysis.technologies),
      patterns: Array.from(analysis.patterns),
      fileTypes: analysis.fileTypes,
      averageComplexity: Math.round(analysis.complexity / analysis.analyzedFiles),
      lastAnalyzed: analysis.analyzedAt
    };
  }
}