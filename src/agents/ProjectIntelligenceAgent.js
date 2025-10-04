import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseAgent } from './BaseAgent.js';
import { logger } from '../utils/logger.js';
import { CodebaseAnalyzer } from '../utils/CodebaseAnalyzer.js';
import { BusinessContextManager } from '../utils/BusinessContextManager.js';
import { ChangeImpactAnalyzer } from '../utils/ChangeImpactAnalyzer.js';

/**
 * Advanced Project Intelligence Agent
 * Understands your entire codebase, business context, and provides intelligent assistance
 */
export class ProjectIntelligenceAgent extends BaseAgent {
  constructor() {
    super();
    this.model = new ChatGoogleGenerativeAI({
      modelName: process.env.GOOGLE_MODEL_NAME || 'gemini-1.5-flash',
      temperature: 0.2, // Lower temperature for more focused responses
      apiKey: process.env.GOOGLE_API_KEY,
    });
    
    this.codebaseAnalyzer = new CodebaseAnalyzer();
    this.businessContext = new BusinessContextManager();
    this.impactAnalyzer = new ChangeImpactAnalyzer();
    
    // Knowledge base for the project
    this.projectKnowledge = {
      architecture: null,
      patterns: [],
      businessRules: [],
      dependencies: new Map(),
      changeHistory: []
    };
  }

  /**
   * Initialize the agent with your project
   */
  async initializeProject(projectPath, businessContext = {}) {
    logger.info('🧠 Initializing Project Intelligence Agent');
    
    try {
      // 1. Analyze the entire codebase
      const codebaseAnalysis = await this.codebaseAnalyzer.analyzeProject(projectPath);
      
      // 2. Load business context
      await this.businessContext.initialize(businessContext);
      
      // 3. Build project knowledge graph
      this.projectKnowledge = {
        architecture: codebaseAnalysis.architecture,
        patterns: codebaseAnalysis.patterns,
        businessRules: businessContext.rules || [],
        dependencies: codebaseAnalysis.dependencies,
        changeHistory: []
      };
      
      logger.info('✅ Project Intelligence Agent initialized successfully');
      return {
        success: true,
        projectSummary: codebaseAnalysis.summary,
        knowledgeBase: this.projectKnowledge
      };
    } catch (error) {
      logger.error('❌ Failed to initialize Project Intelligence Agent:', error);
      throw error;
    }
  }

  /**
   * Intelligent code generation based on project context
   */
  async generateIntelligentCode(request) {
    const { 
      intent, 
      requirements, 
      targetFiles, 
      businessGoal,
      changeType = 'feature' // feature, bugfix, refactor, optimization
    } = request;

    logger.info('🎯 Generating intelligent code for:', intent);

    try {
      // 1. Analyze the current context
      const contextAnalysis = await this.analyzeChangeContext(targetFiles, changeType);
      
      // 2. Get relevant business rules
      const relevantRules = this.businessContext.getRelevantRules(intent, businessGoal);
      
      // 3. Analyze impact of the change
      const impactAnalysis = await this.impactAnalyzer.analyzeImpact(
        targetFiles, 
        changeType, 
        this.projectKnowledge
      );

      // 4. Generate code with full context
      const prompt = PromptTemplate.fromTemplate(`
You are an expert software architect working on a production-grade application.

PROJECT CONTEXT:
Architecture: {architecture}
Existing Patterns: {patterns}
Business Rules: {businessRules}
Dependencies: {dependencies}

CHANGE REQUEST:
Intent: {intent}
Requirements: {requirements}
Business Goal: {businessGoal}
Change Type: {changeType}

CONTEXT ANALYSIS:
Affected Files: {affectedFiles}
Code Patterns: {codePatterns}
Dependencies Impact: {dependenciesImpact}

IMPACT ANALYSIS:
Risk Level: {riskLevel}
Affected Components: {affectedComponents}
Required Tests: {requiredTests}

INSTRUCTIONS:
1. Generate production-grade code that follows the existing patterns
2. Ensure compatibility with the current architecture
3. Follow the established business rules
4. Consider the impact on other components
5. Include proper error handling and logging
6. Add appropriate tests and documentation
7. Suggest migration steps if needed

Generate the code with explanations for each decision made.
      `);

      const chain = RunnableSequence.from([prompt, this.model]);
      
      const result = await chain.invoke({
        architecture: JSON.stringify(this.projectKnowledge.architecture),
        patterns: JSON.stringify(this.projectKnowledge.patterns),
        businessRules: JSON.stringify(relevantRules),
        dependencies: JSON.stringify(Array.from(this.projectKnowledge.dependencies)),
        intent,
        requirements,
        businessGoal,
        changeType,
        affectedFiles: JSON.stringify(contextAnalysis.affectedFiles),
        codePatterns: JSON.stringify(contextAnalysis.patterns),
        dependenciesImpact: JSON.stringify(contextAnalysis.dependenciesImpact),
        riskLevel: impactAnalysis.riskLevel,
        affectedComponents: JSON.stringify(impactAnalysis.affectedComponents),
        requiredTests: JSON.stringify(impactAnalysis.requiredTests)
      });

      // 5. Process and validate the generated code
      const generatedCode = this.extractCodeFromResponse(result.content);
      const validation = await this.validateGeneratedCode(generatedCode, contextAnalysis);

      // 6. Record the change in history
      this.recordChange({
        intent,
        requirements,
        changeType,
        generatedCode,
        impactAnalysis,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        code: generatedCode,
        explanation: this.extractExplanation(result.content),
        impactAnalysis,
        validation,
        suggestions: this.generateSuggestions(contextAnalysis, impactAnalysis),
        nextSteps: this.generateNextSteps(impactAnalysis)
      };

    } catch (error) {
      logger.error('❌ Intelligent code generation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze existing code and suggest improvements
   */
  async analyzeAndImprove(filePaths, improvementGoals = []) {
    logger.info('🔍 Analyzing code for improvements');

    try {
      const codeAnalysis = await this.codebaseAnalyzer.analyzeFiles(filePaths);
      const businessAlignment = this.businessContext.checkAlignment(codeAnalysis);

      const prompt = PromptTemplate.fromTemplate(`
You are a senior code architect reviewing code for a production application.

CURRENT CODE ANALYSIS:
{codeAnalysis}

BUSINESS ALIGNMENT:
{businessAlignment}

PROJECT PATTERNS:
{projectPatterns}

IMPROVEMENT GOALS:
{improvementGoals}

ANALYZE THE CODE AND PROVIDE:
1. Code Quality Assessment
2. Performance Issues
3. Security Vulnerabilities
4. Business Logic Alignment
5. Architecture Consistency
6. Specific Improvement Recommendations
7. Refactoring Suggestions
8. Risk Assessment for changes

Provide detailed, actionable recommendations.
      `);

      const chain = RunnableSequence.from([prompt, this.model]);
      
      const result = await chain.invoke({
        codeAnalysis: JSON.stringify(codeAnalysis),
        businessAlignment: JSON.stringify(businessAlignment),
        projectPatterns: JSON.stringify(this.projectKnowledge.patterns),
        improvementGoals: JSON.stringify(improvementGoals)
      });

      return {
        success: true,
        analysis: this.parseAnalysisResult(result.content),
        recommendations: this.extractRecommendations(result.content),
        riskAssessment: this.extractRiskAssessment(result.content),
        prioritizedActions: this.prioritizeActions(result.content)
      };

    } catch (error) {
      logger.error('❌ Code analysis failed:', error);
      throw error;
    }
  }

  /**
   * Answer questions about the project
   */
  async answerProjectQuestion(question, context = {}) {
    logger.info('❓ Answering project question:', question);

    const prompt = PromptTemplate.fromTemplate(`
You are an expert consultant who knows everything about this project.

PROJECT KNOWLEDGE:
Architecture: {architecture}
Business Rules: {businessRules}
Code Patterns: {patterns}
Change History: {changeHistory}

QUESTION: {question}
CONTEXT: {context}

Provide a comprehensive answer that:
1. References specific parts of the codebase
2. Explains business implications
3. Suggests best practices
4. Considers the project's architecture
5. Provides concrete examples
6. Includes potential risks or considerations
    `);

    const chain = RunnableSequence.from([prompt, this.model]);
    
    const result = await chain.invoke({
      architecture: JSON.stringify(this.projectKnowledge.architecture),
      businessRules: JSON.stringify(this.projectKnowledge.businessRules),
      patterns: JSON.stringify(this.projectKnowledge.patterns),
      changeHistory: JSON.stringify(this.projectKnowledge.changeHistory.slice(-10)),
      question,
      context: JSON.stringify(context)
    });

    return {
      success: true,
      answer: result.content,
      relevantFiles: this.findRelevantFiles(question),
      relatedConcepts: this.findRelatedConcepts(question),
      suggestedActions: this.extractSuggestedActions(result.content)
    };
  }

  // Helper methods
  async analyzeChangeContext(targetFiles, changeType) {
    return this.codebaseAnalyzer.analyzeChangeContext(targetFiles, changeType);
  }

  recordChange(changeData) {
    this.projectKnowledge.changeHistory.push(changeData);
    // Keep only last 50 changes
    if (this.projectKnowledge.changeHistory.length > 50) {
      this.projectKnowledge.changeHistory = this.projectKnowledge.changeHistory.slice(-50);
    }
  }

  extractCodeFromResponse(response) {
    const codeBlockRegex = /```(?:javascript|js|jsx|typescript|ts|tsx|python|py)?\n?([\s\S]*?)```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches.length > 0 ? matches : [response];
  }

  extractExplanation(response) {
    // Extract explanation text (non-code parts)
    const explanationParts = response.split(/```[\s\S]*?```/);
    return explanationParts.join('\n').trim();
  }

  generateSuggestions(contextAnalysis, impactAnalysis) {
    return {
      codeQuality: contextAnalysis.qualitySuggestions || [],
      performance: impactAnalysis.performanceSuggestions || [],
      security: impactAnalysis.securitySuggestions || [],
      testing: impactAnalysis.testingSuggestions || []
    };
  }

  generateNextSteps(impactAnalysis) {
    return impactAnalysis.nextSteps || [
      'Test the generated code thoroughly',
      'Update documentation',
      'Review with team members',
      'Deploy to staging environment'
    ];
  }

  findRelevantFiles(question) {
    // Simple keyword matching - could be enhanced with vector search
    const keywords = question.toLowerCase().split(' ');
    const relevantFiles = [];
    
    // This would be implemented based on your project structure
    return relevantFiles;
  }

  findRelatedConcepts(question) {
    // Extract related business concepts and architectural patterns
    return [];
  }

  extractSuggestedActions(response) {
    // Extract actionable items from the response
    const actionRegex = /(?:suggest|recommend|should|could)[\s\S]*?(?:\.|$)/gi;
    const matches = response.match(actionRegex) || [];
    return matches.map(action => action.trim());
  }

  async validateGeneratedCode(code, context) {
    // Implement code validation logic
    return {
      syntaxValid: true,
      followsPatterns: true,
      businessLogicValid: true,
      securityChecks: true
    };
  }

  parseAnalysisResult(content) {
    // Parse the analysis result into structured data
    return {
      qualityScore: 0,
      issues: [],
      strengths: []
    };
  }

  extractRecommendations(content) {
    return [];
  }

  extractRiskAssessment(content) {
    return {
      riskLevel: 'medium',
      risks: []
    };
  }

  prioritizeActions(content) {
    return [];
  }
}