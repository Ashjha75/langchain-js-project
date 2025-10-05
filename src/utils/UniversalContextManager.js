import { BaseMemory } from '@langchain/core/memory';
import { VectorStore } from '@langchain/core/vectorstores';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
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
    
    // Vector store for semantic search
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    this.vectorStore = new MemoryVectorStore(this.embeddings);
    
    // Initialize memory layers
    this.initializeMemoryLayers();
  }

  initializeMemoryLayers() {
    // Different types of memory for different purposes
    this.memoryLayers.set('codebase', new Map()); // Static codebase knowledge
    this.memoryLayers.set('patterns', new Map()); // Code patterns and practices
    this.memoryLayers.set('business', new Map()); // Business rules and concepts
    this.memoryLayers.set('generation', new Map()); // Generation history and learnings
    this.memoryLayers.set('user_preferences', new Map()); // User coding preferences
    this.memoryLayers.set('project_config', new Map()); // Project-specific configurations
  }

  /**
   * Store comprehensive context for any code project
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
      this.memoryLayers.get('patterns').set(projectId, {
        codingStyle: contextData.patterns.codingStyle,
        architecturalPatterns: contextData.patterns.architectural,
        designPatterns: contextData.patterns.design,
        namingConventions: contextData.patterns.naming
      });
    }

    // Business layer - domain knowledge
    if (contextData.businessContext) {
      this.memoryLayers.get('business').set(projectId, {
        domain: contextData.businessContext.domain,
        rules: contextData.businessContext.rules,
        constraints: contextData.businessContext.constraints,
        stakeholders: contextData.businessContext.stakeholders,
        workflows: contextData.businessContext.workflows
      });
    }

    // User preferences layer
    if (contextData.userPreferences) {
      this.memoryLayers.get('user_preferences').set(projectId, {
        codeStyle: contextData.userPreferences.codeStyle,
        frameworks: contextData.userPreferences.preferredFrameworks,
        tools: contextData.userPreferences.preferredTools,
        conventions: contextData.userPreferences.conventions
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
              category: example.category,
              quality: example.quality || 'good'
            }
          }));
        }
      }

      if (documents.length > 0) {
        await this.vectorStore.addDocuments(documents);
        logger.info(`🔍 Indexed ${documents.length} documents for semantic search`);
      }

    } catch (error) {
      logger.error('Error indexing in vector store:', error);
    }
  }

  updateRelationshipGraph(projectId, contextData) {
    // Build relationships between different code elements
    const relationships = new Map();

    if (contextData.codebaseAnalysis?.dependencies) {
      for (const [file, deps] of Object.entries(contextData.codebaseAnalysis.dependencies)) {
        relationships.set(file, {
          dependsOn: deps,
          usedBy: [],
          relatedTo: []
        });
      }
    }

    this.relationshipGraph.set(projectId, relationships);
  }

  trackTemporalContext(projectId, contextData) {
    // Track how context evolves over time
    const temporalEntry = {
      projectId,
      timestamp: new Date().toISOString(),
      changes: contextData.changes || [],
      evolution: contextData.evolution || 'initial',
      confidence: contextData.confidence || 1.0
    };

    this.temporalContext.push(temporalEntry);

    // Keep only recent history (last 1000 entries)
    if (this.temporalContext.length > 1000) {
      this.temporalContext = this.temporalContext.slice(-1000);
    }
  }

  /**
   * Retrieve comprehensive context for code generation
   */
  async getContextForGeneration(projectId, requirement, options = {}) {
    try {
      const {
        includeCodebase = true,
        includePatterns = true,
        includeBusiness = true,
        includeHistory = true,
        maxRelevantDocs = 10
      } = options;

      const context = {
        projectId,
        requirement,
        timestamp: new Date().toISOString(),
        layers: {}
      };

      // Get main context
      const mainContext = this.contextStore.get(projectId);
      if (mainContext) {
        context.main = mainContext;
        // Update access count
        mainContext.metadata.accessCount++;
      }

      // Get memory layers
      if (includeCodebase) {
        context.layers.codebase = this.memoryLayers.get('codebase').get(projectId);
      }
      
      if (includePatterns) {
        context.layers.patterns = this.memoryLayers.get('patterns').get(projectId);
      }
      
      if (includeBusiness) {
        context.layers.business = this.memoryLayers.get('business').get(projectId);
      }

      // Get relevant semantic context
      const relevantDocs = await this.getRelevantContext(projectId, requirement, maxRelevantDocs);
      context.relevant = relevantDocs;

      // Get historical context
      if (includeHistory) {
        context.history = this.getHistoricalContext(projectId);
      }

      // Get relationships
      context.relationships = this.relationshipGraph.get(projectId);

      // Calculate context quality
      context.quality = this.calculateContextQuality(context);

      logger.info(`📖 Retrieved context for ${projectId}: quality ${context.quality.score}/10`);
      return context;

    } catch (error) {
      logger.error('Error retrieving context:', error);
      throw error;
    }
  }

  async getRelevantContext(projectId, requirement, maxDocs = 10) {
    try {
      // Search for relevant documents
      const allDocs = await this.vectorStore.similaritySearch(requirement, maxDocs * 2);
      
      // Filter by project ID
      const projectDocs = allDocs.filter(doc => doc.metadata.projectId === projectId);
      
      // Sort by relevance and type priority
      const sortedDocs = projectDocs
        .sort((a, b) => {
          const typeScore = {
            'business': 3,
            'example': 2,
            'code': 1
          };
          return (typeScore[b.metadata.type] || 0) - (typeScore[a.metadata.type] || 0);
        })
        .slice(0, maxDocs);

      return sortedDocs;

    } catch (error) {
      logger.error('Error getting relevant context:', error);
      return [];
    }
  }

  getHistoricalContext(projectId, limit = 10) {
    return this.temporalContext
      .filter(entry => entry.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  calculateContextQuality(context) {
    let score = 0;
    let maxScore = 10;
    const details = {};

    // Main context availability (2 points)
    if (context.main) {
      score += 2;
      details.mainContext = 'Available';
    } else {
      details.mainContext = 'Missing';
    }

    // Memory layers (3 points)
    const layerCount = Object.keys(context.layers).length;
    const layerScore = Math.min(3, layerCount);
    score += layerScore;
    details.memoryLayers = `${layerCount}/3 layers`;

    // Relevant documents (2 points)
    const relevantScore = Math.min(2, context.relevant?.length / 5 * 2);
    score += relevantScore;
    details.relevantDocs = `${context.relevant?.length || 0} documents`;

    // Historical context (1 point)
    if (context.history?.length > 0) {
      score += 1;
      details.historicalContext = 'Available';
    } else {
      details.historicalContext = 'Limited';
    }

    // Relationships (2 points)
    if (context.relationships?.size > 0) {
      score += 2;
      details.relationships = 'Available';
    } else {
      details.relationships = 'Missing';
    }

    return {
      score: Math.round(score * 10) / 10,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      details
    };
  }

  /**
   * Learn and update context from new information
   */
  async updateContextFromFeedback(projectId, feedback) {
    try {
      const context = this.contextStore.get(projectId);
      if (!context) {
        logger.warn(`No context found for project: ${projectId}`);
        return;
      }

      // Update confidence based on feedback
      if (feedback.success) {
        context.metadata.confidence = Math.min(1.0, context.metadata.confidence + 0.1);
      } else {
        context.metadata.confidence = Math.max(0.1, context.metadata.confidence - 0.1);
      }

      // Learn new patterns from successful generations
      if (feedback.success && feedback.generatedCode) {
        await this.learnFromSuccessfulGeneration(projectId, feedback);
      }

      // Update business rules if feedback indicates rule violations
      if (feedback.businessViolations) {
        await this.updateBusinessRules(projectId, feedback.businessViolations);
      }

      // Track temporal evolution
      this.trackTemporalContext(projectId, {
        changes: ['feedback-update'],
        evolution: 'learning',
        confidence: context.metadata.confidence,
        feedback: feedback.summary
      });

      context.metadata.lastUpdated = new Date().toISOString();
      
      logger.info(`🧠 Updated context for ${projectId} based on feedback`);

    } catch (error) {
      logger.error('Error updating context from feedback:', error);
    }
  }

  async learnFromSuccessfulGeneration(projectId, feedback) {
    // Extract patterns from successful code generation
    const patterns = this.extractPatternsFromCode(feedback.generatedCode);
    
    // Update patterns memory layer
    const existingPatterns = this.memoryLayers.get('patterns').get(projectId) || {};
    const updatedPatterns = this.mergePatterns(existingPatterns, patterns);
    
    this.memoryLayers.get('patterns').set(projectId, updatedPatterns);

    // Add successful example to vector store
    await this.vectorStore.addDocuments([new Document({
      pageContent: feedback.generatedCode,
      metadata: {
        projectId,
        type: 'successful_example',
        requirement: feedback.requirement,
        quality: 'high',
        timestamp: new Date().toISOString()
      }
    })]);
  }

  extractPatternsFromCode(code) {
    // Simple pattern extraction - can be enhanced with AST analysis
    const patterns = {
      imports: [],
      functions: [],
      classes: [],
      styles: []
    };

    // Extract import patterns
    const importMatches = code.match(/import .+ from .+/g) || [];
    patterns.imports = importMatches;

    // Extract function patterns
    const functionMatches = code.match(/function \w+|const \w+ = |=>/g) || [];
    patterns.functions = functionMatches;

    // Extract class patterns
    const classMatches = code.match(/class \w+/g) || [];
    patterns.classes = classMatches;

    return patterns;
  }

  mergePatterns(existing, newPatterns) {
    const merged = { ...existing };
    
    for (const [key, value] of Object.entries(newPatterns)) {
      if (Array.isArray(value)) {
        merged[key] = [...(merged[key] || []), ...value];
        // Remove duplicates
        merged[key] = [...new Set(merged[key])];
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  async updateBusinessRules(projectId, violations) {
    const businessLayer = this.memoryLayers.get('business').get(projectId) || {};
    
    // Add new rules based on violations
    for (const violation of violations) {
      const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      businessLayer.rules = businessLayer.rules || {};
      businessLayer.rules[ruleId] = {
        description: violation.rule,
        severity: violation.severity || 'medium',
        category: violation.category || 'general',
        learnedFrom: 'violation',
        timestamp: new Date().toISOString()
      };
    }
    
    this.memoryLayers.get('business').set(projectId, businessLayer);
  }

  /**
   * Export context for backup or sharing
   */
  async exportContext(projectId) {
    try {
      const context = {
        main: this.contextStore.get(projectId),
        layers: {},
        relationships: this.relationshipGraph.get(projectId),
        history: this.getHistoricalContext(projectId, 50),
        exportedAt: new Date().toISOString()
      };

      // Export all memory layers
      for (const [layerName, layer] of this.memoryLayers.entries()) {
        context.layers[layerName] = layer.get(projectId);
      }

      return context;

    } catch (error) {
      logger.error('Error exporting context:', error);
      throw error;
    }
  }

  /**
   * Import context from backup
   */
  async importContext(projectId, contextData) {
    try {
      // Import main context
      if (contextData.main) {
        this.contextStore.set(projectId, contextData.main);
      }

      // Import memory layers
      if (contextData.layers) {
        for (const [layerName, layerData] of Object.entries(contextData.layers)) {
          if (layerData && this.memoryLayers.has(layerName)) {
            this.memoryLayers.get(layerName).set(projectId, layerData);
          }
        }
      }

      // Import relationships
      if (contextData.relationships) {
        this.relationshipGraph.set(projectId, contextData.relationships);
      }

      // Import history
      if (contextData.history) {
        this.temporalContext.push(...contextData.history);
      }

      logger.info(`📥 Imported context for project: ${projectId}`);
      return { success: true };

    } catch (error) {
      logger.error('Error importing context:', error);
      throw error;
    }
  }

  /**
   * Get context statistics and health
   */
  getContextStats() {
    return {
      totalProjects: this.contextStore.size,
      memoryLayers: {
        codebase: this.memoryLayers.get('codebase').size,
        patterns: this.memoryLayers.get('patterns').size,
        business: this.memoryLayers.get('business').size,
        generation: this.memoryLayers.get('generation').size,
        userPreferences: this.memoryLayers.get('user_preferences').size,
        projectConfig: this.memoryLayers.get('project_config').size
      },
      relationships: this.relationshipGraph.size,
      temporalEntries: this.temporalContext.length,
      vectorStoreSize: this.vectorStore?.vectorStore?.size || 0
    };
  }
}