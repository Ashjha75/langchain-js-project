/**
 * Modular Groq Client
 * Framework-agnostic Groq API wrapper that uses UI configuration
 * No hardcoded defaults - all config comes from UI sidebar
 * Compatible with LangChain, OpenAI SDK, and other frameworks
 */

import Groq from "groq-sdk";
import { createLogger } from "@/utils/logger";

const logger = createLogger("GroqClient");

/**
 * UI Configuration Interface
 * Maps directly to the Parameters sidebar in the UI
 */
export interface GroqUIConfig {
  // Model Selection
  model: string;
  systemInstructions?: string;

  // Core Parameters
  temperature: number;
  maxCompletionTokens: number;
  reasoning?: 'low' | 'medium' | 'high';

  // Modes
  stream: boolean;
  jsonMode?: boolean;

  // Built-in Tools (if needed)
  builtInTools?: {
    browserSearch?: boolean;
    codeInterpreter?: boolean;
  };

  // Advanced Settings
  advanced?: {
    moderation?: boolean;
    topP?: number;
    seed?: number | null;
    stopSequence?: string;
    template?: boolean;
  };

  // Additional Groq-specific options
  frequencyPenalty?: number;
  presencePenalty?: number;
  logitBias?: Record<string, number>;
  logprobs?: boolean;
  topLogprobs?: number;
  n?: number;
  tools?: Array<any>;
  toolChoice?: string | any;
  user?: string;
  responseFormat?: { type: 'text' | 'json_object' };
}

/**
 * Message format (OpenAI-compatible)
 */
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<any>;
}

/**
 * Response structure
 */
export interface GroqResponse {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    model: string;
    timestamp: string;
    provider: string;
  };
}

/**
 * Stream chunk for real-time responses
 */
export interface GroqStreamChunk {
  type: 'start' | 'token' | 'done' | 'error';
  content?: string;
  metadata?: any;
  error?: string;
}

/**
 * Modular Groq Client Class
 * Single responsibility: Handle Groq API calls with UI config
 */
export class GroqClient {
  private client: Groq;
  private maxRetries = 10;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Groq API key is required');
    }
    this.client = new Groq({ apiKey });
    logger.info('Groq client initialized');
  }

  /**
   * Map reasoning effort to Groq-compatible values
   */
  private mapReasoningEffort(reasoning?: 'low' | 'medium' | 'high'): string | undefined {
    const reasoningMap = {
      low: 'low',
      medium: 'medium',
      high: 'high'
    };
    return reasoning ? reasoningMap[reasoning] : undefined;
  }

  /**
   * Build messages array with system instructions
   */
  private buildMessages(messages: GroqMessage[], systemInstructions?: string): GroqMessage[] {
    const messagesCopy = [...messages];
    
    // Add system instructions if provided and not already present
    if (systemInstructions && !messagesCopy.some(m => m.role === 'system')) {
      messagesCopy.unshift({
        role: 'system',
        content: systemInstructions
      });
    }
    
    return messagesCopy;
  }

  /**
   * Generate non-streaming response
   * All configuration comes from uiConfig parameter
   */
  async generateResponse(
    uiConfig: GroqUIConfig,
    messages: GroqMessage[]
  ): Promise<GroqResponse> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        logger.info('Generating Groq response', {
          model: uiConfig.model,
          temperature: uiConfig.temperature,
          maxTokens: uiConfig.maxCompletionTokens,
          messageCount: messages.length,
          attempt: i + 1,
        });

        const builtMessages = this.buildMessages(messages, uiConfig.systemInstructions);

        // Build request parameters - EVERYTHING from UI config
        const requestParams: any = {
          messages: builtMessages,
          model: uiConfig.model,
          temperature: uiConfig.temperature,
          max_tokens: uiConfig.maxCompletionTokens,  // Use max_tokens instead of max_completion_tokens
          stream: false,
        };

        // Add advanced parameters if provided
        if (uiConfig.advanced?.topP !== undefined) {
          requestParams.top_p = uiConfig.advanced.topP;
        }

        if (uiConfig.advanced?.seed !== null && uiConfig.advanced?.seed !== undefined) {
          requestParams.seed = uiConfig.advanced.seed;
        }

        if (uiConfig.advanced?.stopSequence) {
          requestParams.stop = uiConfig.advanced.stopSequence.split(',').map(s => s.trim());
        }

        if (uiConfig.frequencyPenalty !== undefined) {
          requestParams.frequency_penalty = uiConfig.frequencyPenalty;
        }

        if (uiConfig.presencePenalty !== undefined) {
          requestParams.presence_penalty = uiConfig.presencePenalty;
        }

        if (uiConfig.reasoning) {
          requestParams.reasoning_effort = this.mapReasoningEffort(uiConfig.reasoning);
        }

        if (uiConfig.responseFormat || uiConfig.jsonMode) {
          requestParams.response_format = uiConfig.responseFormat || { type: 'json_object' };
        }

        if (uiConfig.tools && uiConfig.tools.length > 0) {
          requestParams.tools = uiConfig.tools;
        }

        if (uiConfig.toolChoice) {
          requestParams.tool_choice = uiConfig.toolChoice;
        }

        if (uiConfig.logitBias) {
          requestParams.logit_bias = uiConfig.logitBias;
        }

        if (uiConfig.logprobs) {
          requestParams.logprobs = uiConfig.logprobs;
          if (uiConfig.topLogprobs) {
            requestParams.top_logprobs = uiConfig.topLogprobs;
          }
        }

        if (uiConfig.n) {
          requestParams.n = uiConfig.n;
        }

        if (uiConfig.user) {
          requestParams.user = uiConfig.user;
        }

        logger.debug('Groq request parameters', requestParams);

        const completion = await this.client.chat.completions.create(requestParams);

        const response: any = {
          content: completion.choices[0]?.message?.content || '',
          metadata: {
            model: completion.model || 'unknown',
            timestamp: new Date().toISOString(),
            provider: 'groq'
          }
        };

        // Add optional fields
        if (completion.usage) {
          response.usage = {
            promptTokens: completion.usage.prompt_tokens || 0,
            completionTokens: completion.usage.completion_tokens || 0,
            totalTokens: completion.usage.total_tokens || 0
          };
        }

        if (completion.choices[0]?.finish_reason) {
          response.finishReason = completion.choices[0].finish_reason;
        }

        logger.info('Groq response generated', {
          contentLength: response.content.length,
          totalTokens: response.usage?.totalTokens
        });

        return response as GroqResponse;
      } catch (error: any) {
        logger.error('Groq API error', {
          error: error.message,
          status: error.status,
          code: error.code,
          attempt: i + 1,
        });
        if (i === this.maxRetries - 1) {
          throw error;
        }
        await new Promise(res => setTimeout(res, 1000 * (i + 1)));
      }
    }
    throw new Error('Groq API request failed after multiple retries');
  }

  /**
   * Generate streaming response with word-by-word tokens
   * All configuration comes from uiConfig parameter
   */
  async *generateStreamResponse(
    uiConfig: GroqUIConfig,
    messages: GroqMessage[]
  ): AsyncGenerator<GroqStreamChunk, void, unknown> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        logger.info('Starting Groq streaming response', {
          model: uiConfig.model,
          temperature: uiConfig.temperature,
          maxTokens: uiConfig.maxCompletionTokens,
          attempt: i + 1,
        });

        yield { type: 'start' };

        const builtMessages = this.buildMessages(messages, uiConfig.systemInstructions);

        // Build request parameters - EVERYTHING from UI config
        const requestParams: any = {
          messages: builtMessages,
          model: uiConfig.model,
          temperature: uiConfig.temperature,
          max_tokens: uiConfig.maxCompletionTokens,  // Use max_tokens instead of max_completion_tokens
          stream: true,
        };

        // Add advanced parameters if provided (same as non-streaming)
        if (uiConfig.advanced?.topP !== undefined) {
          requestParams.top_p = uiConfig.advanced.topP;
        }

        if (uiConfig.advanced?.seed !== null && uiConfig.advanced?.seed !== undefined) {
          requestParams.seed = uiConfig.advanced.seed;
        }

        if (uiConfig.advanced?.stopSequence) {
          requestParams.stop = uiConfig.advanced.stopSequence.split(',').map(s => s.trim());
        }

        if (uiConfig.frequencyPenalty !== undefined) {
          requestParams.frequency_penalty = uiConfig.frequencyPenalty;
        }

        if (uiConfig.presencePenalty !== undefined) {
          requestParams.presence_penalty = uiConfig.presencePenalty;
        }

        if (uiConfig.reasoning) {
          requestParams.reasoning_effort = this.mapReasoningEffort(uiConfig.reasoning);
        }

        if (uiConfig.responseFormat || uiConfig.jsonMode) {
          requestParams.response_format = uiConfig.responseFormat || { type: 'json_object' };
        }

        if (uiConfig.tools && uiConfig.tools.length > 0) {
          requestParams.tools = uiConfig.tools;
        }

        if (uiConfig.toolChoice) {
          requestParams.tool_choice = uiConfig.toolChoice;
        }

        logger.debug('Groq streaming request parameters', requestParams);

        const streamResponse: any = await this.client.chat.completions.create(requestParams);

        let fullContent = '';

        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || '';
          
          if (content) {
            fullContent += content;
            
            // Yield each token/word individually for smooth streaming
            yield {
              type: 'token',
              content: content,
              metadata: {
                model: chunk.model,
                finishReason: chunk.choices[0]?.finish_reason
              }
            };
          }

          // Check for completion
          if (chunk.choices[0]?.finish_reason) {
            logger.info('Groq stream completed', {
              finishReason: chunk.choices[0].finish_reason,
              contentLength: fullContent.length
            });

            yield {
              type: 'done',
              content: fullContent,
              metadata: {
                model: chunk.model,
                finishReason: chunk.choices[0].finish_reason,
                timestamp: new Date().toISOString()
              }
            };
          }
        }
        return;
      } catch (error: any) {
        logger.error('Groq streaming error', {
          error: error.message,
          status: error.status,
          attempt: i + 1,
        });

        if (i === this.maxRetries - 1) {
          yield {
            type: 'error',
            error: error.message
          };
          throw error;
        }
        await new Promise(res => setTimeout(res, 1000 * (i + 1)));
      }
    }
    throw new Error('Groq API streaming request failed after multiple retries');
  }

  /**
   * LangChain-compatible wrapper
   * Can be used to integrate with LangChain's ChatGroq or custom LLM wrapper
   */
  async callAsLangChainLLM(
    uiConfig: GroqUIConfig,
    prompt: string
  ): Promise<string> {
    const messages: GroqMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.generateResponse(uiConfig, messages);
    return response.content;
  }

  /**
   * Validate model availability
   */
  async validateModel(modelId: string): Promise<boolean> {
    try {
      // Try a simple request to validate model
      await this.client.chat.completions.create({
        model: modelId,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
        stream: false
      });
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      // Other errors might be auth/rate limit, not model availability
      return true;
    }
  }
}

/**
 * Factory function to create Groq client instance
 */
export function createGroqClient(apiKey: string): GroqClient {
  return new GroqClient(apiKey);
}
