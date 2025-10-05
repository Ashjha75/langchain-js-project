import { BaseMemory } from '@langchain/core/memory';
import { VectorStore } from '@langchain/core/vectorstores';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { NeonVectorStore } from './NeonVectorStore.js';
import { logger } from './logger.js';
import fs from 'fs/promises';
import path from 'path';

export class UniversalContextManager {
  constructor(options = {}) {
    this.contextStore = new Map(); // Main context storage
    this.memoryLayers = new Map(); // Different types of memory
    this.relationshipGraph = new Map(); // Code relationships
    this.temporalContext = []; // Time-based context evolution
    this.businessKnowledge = new Map(); // Business domain knowledge
    
    // Use Neon vector store if configured, otherwise fallback to memory store
    this.useNeon = process.env.VECTOR_STORE_TYPE === 'neon' && process.env.NEON_DATABASE_URL;
    
    if (this.useNeon) {
      this.vectorStore = new NeonVectorStore();
      logger.info('🐘 Using Neon PostgreSQL for vector storage');
    } else {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      logger.info('🧠 Using in-memory vector storage');
    }
    
    // Initialize memory layers
    this.initializeMemoryLayers();
  }

  initializeMemoryLayers() {
    // Different types of memory for different purposes
    this.memoryLayers.set('codebase', new Map()); // Static codebase knowledge
    this.memoryLayers.set('patterns', new Map()); // Code patterns and conventions
    this.memoryLayers.set('business', new Map()); // Business rules and requirements
    this.memoryLayers.set('generation', new Map()); // Generation history and preferences
    this.memoryLayers.set('user', new Map()); // User preferences and feedback

    logger.info('🧠 Initialized memory layers for universal context management');
  }

  /**
   * Store comprehensive context for a project
   */
  async storeContext(projectId, contextData) {
    try {
      const timestamp = new Date().toISOString();
      
      // Create comprehensive context entry
      const contextEntry = {
        projectId,
        timestamp,
        ...contextData,
        metadata: {
          version: '1.0',
          lastUpdated: timestamp,
          accessCount: 0,
          confidence: 1.0
        }
      };

      // Store in main context store
      this.contextStore.set(projectId, contextEntry);

      // Store in appropriate memory layers
      await this.distributeToMemoryLayers(projectId, contextData);

      // Build semantic index
      await this.indexInVectorStore(projectId, contextData);

      // Update relationships
      this.updateRelationshipGraph(projectId, contextData);

      // Track temporal evolution
      this.trackTemporalContext(projectId, contextData);

      logger.info(`📚 Stored comprehensive context for project: ${projectId}`);
      return { success: true, contextId: projectId };

    } catch (error) {
      logger.error('Error storing context:', error);
      throw error;
    }
  }

  async distributeToMemoryLayers(projectId, contextData) {
    // Distribute different types of data to appropriate memory layers
    
    // Codebase layer - static analysis data
    if (contextData.codebaseAnalysis) {
      this.memoryLayers.get('codebase').set(projectId, {
        fileStructure: contextData.codebaseAnalysis.fileStructure,
        dependencies: contextData.codebaseAnalysis.dependencies,
        technologies: contextData.codebaseAnalysis.technologies,
        metrics: contextData.codebaseAnalysis.metrics
      });
    }

    // Patterns layer - coding patterns and conventions
    if (contextData.patterns) {
      this.memoryLayers.get('patterns').set(projectId, contextData.patterns);
    }

    // Business layer - domain knowledge and requirements
    if (contextData.businessContext) {
      this.memoryLayers.get('business').set(projectId, contextData.businessContext);
    }

    // Generation layer - past generation results and preferences
    if (contextData.generationHistory) {
      this.memoryLayers.get('generation').set(projectId, contextData.generationHistory);
    }

    // User layer - user preferences and feedback
    if (contextData.userPreferences) {
      this.memoryLayers.get('user').set(projectId, contextData.userPreferences);
    }

    // Store in Neon if available
    if (this.useNeon) {
      await this.vectorStore.storeContext(projectId, 'memory_layers', {
        codebase: this.memoryLayers.get('codebase').get(projectId),
        patterns: this.memoryLayers.get('patterns').get(projectId),
        business: this.memoryLayers.get('business').get(projectId),
        generation: this.memoryLayers.get('generation').get(projectId),
        user: this.memoryLayers.get('user').get(projectId)
      });
    }
  }

  async indexInVectorStore(projectId, contextData) {
    try {
      const documents = [];

      // Index codebase content
      if (contextData.codeFiles) {
        for (const file of contextData.codeFiles) {
          documents.push(new Document({
            pageContent: file.content,
            metadata: {
              projectId,
              type: 'code',
              filePath: file.path,
              language: file.language,
              framework: file.framework,
              lastModified: file.lastModified
            }
          }));
        }
      }

      // Index business documentation
      if (contextData.businessDocs) {
        for (const doc of contextData.businessDocs) {
          documents.push(new Document({
            pageContent: doc.content,
            metadata: {
              projectId,
              type: 'business',
              docType: doc.type,
              importance: doc.importance || 'medium'
            }
          }));
        }
      }

      // Index patterns and examples
      if (contextData.examples) {
        for (const example of contextData.examples) {
          documents.push(new Document({
            pageContent: example.code,
            metadata: {
              projectId,
              type: 'example',
              pattern: example.pattern,
              technology: example.technology,
              complexity: example.complexity
            }
          }));
        }
      }

      // Add structured analysis data as searchable content
      if (contextData.codebaseAnalysis) {
        const analysis = contextData.codebaseAnalysis;
        documents.push(new Document({
          pageContent: `Project Technologies: ${analysis.technologies?.join(', ')}
Project Frameworks: ${analysis.frameworks?.join(', ')}
Business Domain: ${analysis.businessDomain}
Architecture Pattern: ${analysis.architecturePattern}
File Structure: ${JSON.stringify(analysis.fileStructure, null, 2)}`,
          metadata: {
            projectId,
            type: 'analysis',
            subtype: 'technologies'
          }
        }));
      }

      // Store documents in vector store
      if (documents.length > 0) {
        if (this.useNeon) {
          // Use Neon vector store
          await this.vectorStore.addDocuments(documents, projectId, 'context');
          
          // Also store structured context data in Neon
          if (contextData.codebaseAnalysis) {
            await this.vectorStore.storeContext(projectId, 'codebase_analysis', contextData.codebaseAnalysis);
          }
          
          if (contextData.businessContext) {
            await this.vectorStore.storeContext(projectId, 'business_context', contextData.businessContext);
          }
          
          if (contextData.patterns) {
            await this.vectorStore.storeContext(projectId, 'patterns', contextData.patterns);
          }
        } else {
          // Use memory vector store
          await this.vectorStore.addDocuments(documents);
        }
        
        logger.info(`🔍 Indexed ${documents.length} documents in vector store for project: ${projectId}`);
      }

    } catch (error) {
      logger.error('Error indexing in vector store:', error);
      // Don't throw error - indexing failure shouldn't break context storage
    }
  }

  updateRelationshipGraph(projectId, contextData) {
    // Build graph of code relationships (imports, dependencies, etc.)
    const relationships = new Map();

    if (contextData.codebaseAnalysis?.dependencies) {
      relationships.set('dependencies', contextData.codebaseAnalysis.dependencies);
    }

    if (contextData.codeFiles) {
      const fileRelations = new Map();
      
      for (const file of contextData.codeFiles) {
        // Extract imports and exports
        const imports = this.extractImports(file.content, file.language);
        const exports = this.extractExports(file.content, file.language);
        
        fileRelations.set(file.path, { imports, exports });
      }
      
      relationships.set('fileRelations', fileRelations);
    }

    this.relationshipGraph.set(projectId, relationships);
  }

  trackTemporalContext(projectId, contextData) {
    // Track how context evolves over time
    const temporalEntry = {
      projectId,
      timestamp: new Date().toISOString(),
      contextSnapshot: JSON.stringify(contextData),
      changeType: 'update',
      metadata: {
        filesCount: contextData.codeFiles?.length || 0,
        technologies: contextData.codebaseAnalysis?.technologies || [],
        complexity: contextData.codebaseAnalysis?.complexity || 'unknown'
      }
    };

    this.temporalContext.push(temporalEntry);

    // Keep only last 50 entries per project to manage memory
    const projectEntries = this.temporalContext.filter(entry => entry.projectId === projectId);
    if (projectEntries.length > 50) {
      this.temporalContext = this.temporalContext.filter(entry => 
        entry.projectId !== projectId || 
        projectEntries.slice(-50).includes(entry)
      );
    }
  }

  /**
   * Get context for code generation with intelligent filtering
   */
  async getContextForGeneration(projectId, requirement, options = {}) {
    try {
      const {
        includeCodebase = true,
        includePatterns = true,
        includeBusiness = true,
        includeHistory = false,
        maxTokens = 50000
      } = options;

      const context = {
        projectId,
        requirement,
        timestamp: new Date().toISOString(),
        metadata: {}
      };

      // Get stored context
      const storedContext = this.contextStore.get(projectId);
      if (storedContext) {
        storedContext.metadata.accessCount += 1;
      }

      // Get relevant semantic context
      const relevantDocs = await this.getRelevantContext(projectId, requirement);
      context.relevantCode = relevantDocs;

      // Get memory layer data
      if (includeCodebase && this.memoryLayers.get('codebase').has(projectId)) {
        context.codebaseContext = this.memoryLayers.get('codebase').get(projectId);
      }

      if (includePatterns && this.memoryLayers.get('patterns').has(projectId)) {
        context.patterns = this.memoryLayers.get('patterns').get(projectId);
      }

      if (includeBusiness && this.memoryLayers.get('business').has(projectId)) {
        context.businessContext = this.memoryLayers.get('business').get(projectId);
      }

      if (includeHistory && this.memoryLayers.get('generation').has(projectId)) {
        context.generationHistory = this.memoryLayers.get('generation').get(projectId);
      }

      // Get relationship context
      if (this.relationshipGraph.has(projectId)) {
        context.relationships = this.relationshipGraph.get(projectId);
      }

      // Get temporal context if requested
      if (includeHistory) {
        context.historicalContext = this.getHistoricalContext(projectId);
      }

      // Optimize context size
      const optimizedContext = this.optimizeContextSize(context, maxTokens);

      logger.info(`🎯 Retrieved context for generation: ${projectId}`, {
        requirement,
        contextSize: JSON.stringify(optimizedContext).length
      });

      return optimizedContext;

    } catch (error) {
      logger.error('Error getting context for generation:', error);
      return {
        projectId,
        requirement,
        error: error.message,
        fallbackContext: this.getFallbackContext(projectId)
      };
    }
  }

  async getRelevantContext(projectId, requirement, maxDocs = 10) {
    try {
      if (this.useNeon) {
        // Use Neon similarity search
        return await this.vectorStore.similaritySearch(requirement, projectId, {
          k: maxDocs,
          threshold: 0.7,
          includeMetadata: true
        });
      } else {
        // Use memory vector store
        const results = await this.vectorStore.similaritySearch(requirement, maxDocs);
        return results.filter(doc => 
          doc.metadata?.projectId === projectId || !doc.metadata?.projectId
        );
      }
    } catch (error) {
      logger.error('Error getting relevant context:', error);
      return [];
    }
  }

  getHistoricalContext(projectId, limit = 10) {
    return this.temporalContext
      .filter(entry => entry.projectId === projectId)
      .slice(-limit)
      .map(entry => ({
        timestamp: entry.timestamp,
        changeType: entry.changeType,
        metadata: entry.metadata
      }));
  }

  optimizeContextSize(context, maxTokens) {
    const contextStr = JSON.stringify(context);
    const currentSize = contextStr.length;

    if (currentSize <= maxTokens) {
      return context;
    }

    // Prioritize different types of context
    const optimized = {
      projectId: context.projectId,
      requirement: context.requirement,
      timestamp: context.timestamp
    };

    const remainingTokens = maxTokens - JSON.stringify(optimized).length;
    let usedTokens = 0;

    // Priority order: relevantCode > patterns > codebaseContext > businessContext
    const priorities = [
      'relevantCode',
      'patterns', 
      'codebaseContext',
      'businessContext',
      'relationships',
      'generationHistory',
      'historicalContext'
    ];

    for (const key of priorities) {
      if (context[key] && usedTokens < remainingTokens) {
        const itemSize = JSON.stringify(context[key]).length;
        if (usedTokens + itemSize <= remainingTokens) {
          optimized[key] = context[key];
          usedTokens += itemSize;
        } else {
          // Truncate if needed
          if (Array.isArray(context[key])) {
            const maxItems = Math.floor((remainingTokens - usedTokens) / (itemSize / context[key].length));
            if (maxItems > 0) {
              optimized[key] = context[key].slice(0, maxItems);
            }
          }
          break;
        }
      }
    }

    logger.info(`📐 Optimized context size: ${currentSize} → ${JSON.stringify(optimized).length} tokens`);
    return optimized;
  }

  getFallbackContext(projectId) {
    return {
      projectId,
      codebaseContext: this.memoryLayers.get('codebase').get(projectId),
      patterns: this.memoryLayers.get('patterns').get(projectId),
      businessContext: this.memoryLayers.get('business').get(projectId)
    };
  }

  /**
   * Update context based on feedback
   */
  async updateContextFromFeedback(projectId, feedback) {
    try {
      const { quality, usefulness, improvements, newPatterns } = feedback;

      // Update generation preferences
      const currentGenContext = this.memoryLayers.get('generation').get(projectId) || {};
      currentGenContext.feedback = currentGenContext.feedback || [];
      currentGenContext.feedback.push({
        timestamp: new Date().toISOString(),
        quality,
        usefulness,
        improvements
      });

      this.memoryLayers.get('generation').set(projectId, currentGenContext);

      // Add new patterns if provided
      if (newPatterns) {
        const currentPatterns = this.memoryLayers.get('patterns').get(projectId) || {};
        Object.assign(currentPatterns, newPatterns);
        this.memoryLayers.get('patterns').set(projectId, currentPatterns);
      }

      // Store in Neon if available
      if (this.useNeon) {
        await this.vectorStore.storeContext(projectId, 'feedback', feedback);
      }

      logger.info(`💡 Updated context from feedback for project: ${projectId}`);

    } catch (error) {
      logger.error('Error updating context from feedback:', error);
      throw error;
    }
  }

  extractImports(content, language) {
    // Simple regex-based import extraction
    const imports = [];
    const patterns = {
      javascript: /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
      python: /from\s+([^\s]+)\s+import|import\s+([^\s]+)/g,
      java: /import\s+([^;]+);/g
    };

    const pattern = patterns[language];
    if (pattern) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1] || match[2]);
      }
    }

    return imports;
  }

  extractExports(content, language) {
    // Simple regex-based export extraction
    const exports = [];
    const patterns = {
      javascript: /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+([^\s(]+)/g,
      python: /def\s+([^\s(]+)|class\s+([^\s(:]+)/g,
      java: /public\s+(?:class|interface)\s+([^\s{]+)/g
    };

    const pattern = patterns[language];
    if (pattern) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        exports.push(match[1] || match[2]);
      }
    }

    return exports;
  }

  /**
   * Get statistics about stored context
   */
  getContextStats() {
    return {
      totalProjects: this.contextStore.size,
      memoryLayers: {
        codebase: this.memoryLayers.get('codebase').size,
        patterns: this.memoryLayers.get('patterns').size,
        business: this.memoryLayers.get('business').size,
        generation: this.memoryLayers.get('generation').size,
        user: this.memoryLayers.get('user').size
      },
      relationships: this.relationshipGraph.size,
      temporalEntries: this.temporalContext.length,
      storageType: this.useNeon ? 'neon' : 'memory'
    };
  }

  /**
   * Clear all context for a project
   */
  async clearProjectContext(projectId) {
    try {
      // Clear from main store
      this.contextStore.delete(projectId);

      // Clear from memory layers
      for (const layer of this.memoryLayers.values()) {
        layer.delete(projectId);
      }

      // Clear from relationship graph
      this.relationshipGraph.delete(projectId);

      // Clear from temporal context
      this.temporalContext = this.temporalContext.filter(entry => entry.projectId !== projectId);

      // Clear from Neon if available
      if (this.useNeon) {
        await this.vectorStore.deleteProject(projectId);
      }

      logger.info(`🗑️ Cleared all context for project: ${projectId}`);
      return { success: true };

    } catch (error) {
      logger.error('Error clearing project context:', error);
      throw error;
    }
  }
}