/**
 * Groq AI Provider Implementation
 * Handles all Groq API interactions with streaming support
 */

import Groq from 'groq-sdk';
import { CONFIG } from '@/config';
import { createLogger } from '@/utils/logger';
import {
  AIProvider,
  AIMessage,
  AIResponse,
  StreamChunk,
  ConversationContext,
  AIProviderError,
  TokenLimitError,
  ModelNotFoundError
} from '../interfaces';

const logger = createLogger('GroqProvider');

export class GroqProvider implements AIProvider {
  public readonly name = 'groq';
  public readonly version = '1.0.0';
  
  private client: Groq;
  private availableModels: string[] = [
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama-3.2-1b-preview',
    'llama-3.2-3b-preview',
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview',
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma-7b-it',
    'gemma2-9b-it',
    'openai/gpt-oss-120b'
  ];

  constructor() {
    if (!CONFIG.ai.groq.apiKey) {
      throw new AIProviderError(
        'Groq API key is required',
        'groq',
        'MISSING_API_KEY'
      );
    }

    this.client = new Groq({
      apiKey: CONFIG.ai.groq.apiKey,
    });

    logger.info('Groq provider initialized', {
      model: CONFIG.ai.groq.model,
      availableModels: this.availableModels.length
    });
  }

  async generateResponse(context: ConversationContext): Promise<AIResponse> {
    try {
      logger.info('Generating response with Groq', {
        conversationId: context.conversationId,
        model: context.config.model,
        messageCount: context.messages.length
      });

      const messages = this.formatMessages(context.messages, context.config.systemPrompt);
      
      const completion = await this.client.chat.completions.create({
        model: context.config.model || CONFIG.ai.groq.model,
        messages: messages as any,
        temperature: context.config.temperature || CONFIG.ai.groq.temperature,
        max_tokens: context.config.maxTokens || CONFIG.ai.groq.maxTokens,
        top_p: context.config.topP || CONFIG.ai.groq.topP,
        stream: false,
      });

      const response: AIResponse = {
        content: completion.choices[0]?.message?.content || '',
        ...(completion.usage && {
          usage: {
            promptTokens: completion.usage.prompt_tokens || 0,
            completionTokens: completion.usage.completion_tokens || 0,
            totalTokens: completion.usage.total_tokens || 0
          }
        }),
        ...(completion.choices[0]?.finish_reason && {
          finishReason: completion.choices[0].finish_reason
        }),
        metadata: {
          model: completion.model,
          provider: 'groq',
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Response generated successfully', {
        conversationId: context.conversationId,
        contentLength: response.content.length,
        tokensUsed: response.usage?.totalTokens
      });

      return response;
    } catch (error: any) {
      logger.error('Error generating response', {
        error: error.message,
        conversationId: context.conversationId,
        model: context.config.model
      });

      if (error.status === 400 && error.message?.includes('token')) {
        throw new TokenLimitError(
          'Request exceeds token limit',
          'groq',
          context.config.maxTokens || 0,
          CONFIG.ai.groq.maxTokens
        );
      }

      if (error.status === 404) {
        throw new ModelNotFoundError(
          'Model not found',
          'groq',
          context.config.model
        );
      }

      throw new AIProviderError(
        `Groq API error: ${error.message}`,
        'groq',
        error.code || 'UNKNOWN_ERROR',
        error
      );
    }
  }

  async* generateStreamResponse(context: ConversationContext): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      logger.info('Starting streaming response with Groq', {
        conversationId: context.conversationId,
        model: context.config.model
      });

      const messages = this.formatMessages(context.messages, context.config.systemPrompt);
      
      const stream = await this.client.chat.completions.create({
        model: context.config.model || CONFIG.ai.groq.model,
        messages: messages as any,
        temperature: context.config.temperature || CONFIG.ai.groq.temperature,
        max_tokens: context.config.maxTokens || CONFIG.ai.groq.maxTokens,
        top_p: context.config.topP || CONFIG.ai.groq.topP,
        stream: true,
      });

      let fullContent = '';
      let tokenCount = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        
        if (delta) {
          fullContent += delta;
          tokenCount++;
          
          const streamChunk: StreamChunk = {
            content: fullContent,
            delta,
            isComplete: false,
          };

          yield streamChunk;
        }

        // Check if stream is complete
        if (chunk.choices[0]?.finish_reason) {
          const finalChunk: StreamChunk = {
            content: fullContent,
            delta: '',
            isComplete: true,
            usage: {
              promptTokens: 0,
              completionTokens: tokenCount,
              totalTokens: tokenCount
            }
          };

          yield finalChunk;
          break;
        }
      }

      logger.info('Streaming response completed', {
        conversationId: context.conversationId,
        contentLength: fullContent.length,
        estimatedTokens: tokenCount
      });

    } catch (error: any) {
      logger.error('Error in streaming response', {
        error: error.message,
        conversationId: context.conversationId
      });

      throw new AIProviderError(
        `Groq streaming error: ${error.message}`,
        'groq',
        error.code || 'STREAM_ERROR',
        error
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      // For Groq, we maintain a static list since their API doesn't provide a models endpoint
      return [...this.availableModels];
    } catch (error: any) {
      logger.error('Error listing models', { error: error.message });
      return this.availableModels; // Fallback to static list
    }
  }

  async validateModel(model: string): Promise<boolean> {
    const models = await this.listModels();
    return models.includes(model);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check by making a minimal request
      const testContext: ConversationContext = {
        conversationId: 'health-check',
        userId: 'system',
        messages: [{ role: 'user', content: 'test' }],
        config: { model: CONFIG.ai.groq.model, maxTokens: 1 }
      };

      await this.generateResponse(testContext);
      return true;
    } catch (error) {
      logger.warn('Health check failed', { error: (error as Error).message });
      return false;
    }
  }

  async estimateTokens(messages: AIMessage[]): Promise<number> {
    // Rough estimation: ~4 characters per token for English text
    // This is a basic estimation; for production, consider using tiktoken
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  private formatMessages(messages: AIMessage[], systemPrompt?: string): any[] {
    const formattedMessages = [];

    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add conversation messages
    formattedMessages.push(...messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })));

    return formattedMessages;
  }
}