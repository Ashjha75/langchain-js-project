import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseAgent } from './BaseAgent.js';
import { 
  NEXTJS_TEMPLATES, 
  EXPRESS_TEMPLATES, 
  FULLSTACK_TEMPLATES 
} from '../templates/index.js';
import { logger } from '../utils/logger.js';
import { CodeValidator } from '../utils/CodeValidator.js';

export class CodeGenerationAgent extends BaseAgent {
  constructor() {
    super();
    this.model = new ChatGoogleGenerativeAI({
      modelName: process.env.GOOGLE_MODEL_NAME || 'gemini-1.5-flash',
      temperature: 0.3,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    this.validator = new CodeValidator();
  }

  async generateNextJSCode(options) {
    const { requirements, components, features } = options;
    
    try {
      logger.info('Starting Next.js code generation');
      
      const prompt = PromptTemplate.fromTemplate(NEXTJS_TEMPLATES.component);
      const chain = RunnableSequence.from([prompt, this.model]);
      
      const result = await chain.invoke({
        requirements: JSON.stringify(requirements),
        components: JSON.stringify(components),
        features: JSON.stringify(features),
        timestamp: new Date().toISOString()
      });
      
      const generatedCode = this.extractCodeFromResponse(result.content);
      const validationResults = await this.validator.validateNextJSCode(generatedCode);
      
      return {
        code: generatedCode,
        validation: validationResults,
        metadata: {
          framework: 'Next.js',
          generatedAt: new Date().toISOString(),
          requirements,
          components,
          features
        }
      };
    } catch (error) {
      logger.error('Error in Next.js code generation:', error);
      throw new Error(`Next.js code generation failed: ${error.message}`);
    }
  }

  async generateExpressCode(options) {
    const { requirements, routes, middleware, database } = options;
    
    try {
      logger.info('Starting Express.js code generation');
      
      const prompt = PromptTemplate.fromTemplate(EXPRESS_TEMPLATES.server);
      const chain = RunnableSequence.from([prompt, this.model]);
      
      const result = await chain.invoke({
        requirements: JSON.stringify(requirements),
        routes: JSON.stringify(routes),
        middleware: JSON.stringify(middleware),
        database,
        timestamp: new Date().toISOString()
      });
      
      const generatedCode = this.extractCodeFromResponse(result.content);
      const validationResults = await this.validator.validateExpressCode(generatedCode);
      
      return {
        code: generatedCode,
        validation: validationResults,
        metadata: {
          framework: 'Express.js',
          generatedAt: new Date().toISOString(),
          requirements,
          routes,
          middleware,
          database
        }
      };
    } catch (error) {
      logger.error('Error in Express.js code generation:', error);
      throw new Error(`Express.js code generation failed: ${error.message}`);
    }
  }

  async generateFullStackCode(options) {
    const { requirements, frontend, backend } = options;
    
    try {
      logger.info('Starting full-stack code generation');
      
      const prompt = PromptTemplate.fromTemplate(FULLSTACK_TEMPLATES.project);
      const chain = RunnableSequence.from([prompt, this.model]);
      
      const result = await chain.invoke({
        requirements: JSON.stringify(requirements),
        frontend: JSON.stringify(frontend),
        backend: JSON.stringify(backend),
        timestamp: new Date().toISOString()
      });
      
      const generatedCode = this.extractCodeFromResponse(result.content);
      const validationResults = await this.validator.validateFullStackCode(generatedCode);
      
      return {
        code: generatedCode,
        validation: validationResults,
        metadata: {
          framework: 'Full-Stack (Next.js + Express.js)',
          generatedAt: new Date().toISOString(),
          requirements,
          frontend,
          backend
        }
      };
    } catch (error) {
      logger.error('Error in full-stack code generation:', error);
      throw new Error(`Full-stack code generation failed: ${error.message}`);
    }
  }

  extractCodeFromResponse(response) {
    // Extract code blocks from the response
    const codeBlockRegex = /```(?:javascript|js|jsx|typescript|ts|tsx)?\n?([\s\S]*?)```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches.length > 0 ? matches : [response];
  }

  async optimizeCode(code, framework) {
    try {
      const optimizationPrompt = PromptTemplate.fromTemplate(`
        Optimize the following {framework} code for best practices, performance, and maintainability:
        
        Code:
        {code}
        
        Please provide optimized version with explanations of improvements made.
      `);
      
      const chain = RunnableSequence.from([optimizationPrompt, this.model]);
      
      const result = await chain.invoke({
        framework,
        code: JSON.stringify(code)
      });
      
      return this.extractCodeFromResponse(result.content);
    } catch (error) {
      logger.error('Error optimizing code:', error);
      throw new Error(`Code optimization failed: ${error.message}`);
    }
  }
}