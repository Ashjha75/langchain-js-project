/**
 * Groq AI Provider Implementation
 * Handles all Groq API interactions with streaming support and web search integration
 * NOW USING MODULAR CLIENT WITH FULL UI CONFIG SUPPORT
 */

import { CONFIG } from "@/config";
import { createLogger } from "@/utils/logger";
import { aiConfigManager } from "@/config/ai-config";
import { tavilySearch } from "@/tools/tavilySearch";
import { GroqClient, GroqUIConfig, GroqMessage } from "./groqClient";
import type {
  AIProvider,
  AIMessage,
  AIResponse,
  StreamChunk,
  ConversationContext,
} from "../interfaces";
import { AIProviderError, TokenLimitError, ModelNotFoundError } from "../interfaces";

const logger = createLogger("GroqProvider");

export class GroqProvider implements AIProvider {
  public readonly name = "groq";
  public readonly version = "2.0.0";

  private groqClient: GroqClient;

  constructor() {
    if (!CONFIG.ai.groq.apiKey) {
      throw new AIProviderError("Groq API key is required", "groq", "MISSING_API_KEY");
    }

    // Initialize modular Groq client
    this.groqClient = new GroqClient(CONFIG.ai.groq.apiKey);

    const enabledModels = aiConfigManager.getProviderModels("groq").filter((m) => m.enabled);

    logger.info("Groq provider initialized with modular client", {
      model: CONFIG.ai.groq.model,
      availableModels: enabledModels.length,
      models: enabledModels.map((m) => m.modelId),
      webSearchEnabled: tavilySearch.isEnabled(),
    });
  }

  /**
   * Check if the user's query needs web search
   */
  private needsWebSearch(message: string): boolean {
    const searchKeywords = [
      "search",
      "find",
      "latest",
      "recent",
      "current",
      "today",
      "news",
      "what's",
      "what is",
      "who is",
      "when did",
      "browse",
      "look up",
      "google",
      "web",
      "internet",
      "online",
      "2024",
      "2025",
      "this year",
      "now",
      "update",
    ];

    const lowerMessage = message.toLowerCase();
    return searchKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Perform web search if needed and enhance context
   * Only performs search if:
   * 1. Tavily Search is enabled (has API key)
   * 2. Browser search is enabled in UI config (builtInTools.browserSearch)
   * 3. Query needs web search (based on keywords)
   */
  private async enhanceWithWebSearch(
    context: ConversationContext,
  ): Promise<{ enhanced: boolean; searchResults?: string }> {
    // Get the latest user message
    const lastMessage = context.messages[context.messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return { enhanced: false };
    }

    // Check if Tavily is enabled
    if (!tavilySearch.isEnabled()) {
      return { enhanced: false };
    }

    // Check if browser search is enabled in UI config
    const browserSearchEnabled = context.config.browserSearch === true;
    if (!browserSearchEnabled) {
      logger.debug("Browser search disabled in config, skipping web search");
      return { enhanced: false };
    }

    // Check if the query needs web search
    if (!this.needsWebSearch(lastMessage.content)) {
      return { enhanced: false };
    }

    try {
      logger.info("Performing web search for query", {
        conversationId: context.conversationId,
        query: lastMessage.content.substring(0, 100),
      });

      const searchResults = await tavilySearch.searchAndFormat({
        query: lastMessage.content,
        searchDepth: "basic",
        maxResults: 5,
        includeAnswer: true,
      });

      return {
        enhanced: true,
        searchResults,
      };
    } catch (error: any) {
      logger.error("Web search failed", {
        error: error.message,
        conversationId: context.conversationId,
      });
      return { enhanced: false };
    }
  }

  /**
   * Convert ConversationContext config to GroqUIConfig
   * Maps backend config to UI config format
   */
  private contextToUIConfig(context: ConversationContext): GroqUIConfig {
    // Get merged configuration from central config
    const modelConfig = aiConfigManager.getMergedConfig(
      context.config.model || CONFIG.ai.groq.model,
      context.config,
    );

    // Build UI config from context - NO DEFAULTS, use what's provided
    const uiConfig: GroqUIConfig = {
      model: context.config.model || CONFIG.ai.groq.model,
      temperature: modelConfig.temperature,
      maxCompletionTokens: modelConfig.maxTokens,
      stream: context.config.stream !== undefined ? context.config.stream : true,
      jsonMode: false,
    };

    // Add built-in tools configuration
    if (context.config.browserSearch || context.config.codeInterpreter) {
      uiConfig.builtInTools = {
        browserSearch: context.config.browserSearch || false,
        codeInterpreter: context.config.codeInterpreter || false,
      };
    }

    // Add advanced config if available
    const advanced: any = {
      topP: modelConfig.topP,
      seed: modelConfig.seed || null,
      moderation: false,
      template: false
    };

    // Only add stopSequence if it's a string
    if (typeof modelConfig.stopSequence === 'string' && modelConfig.stopSequence) {
      advanced.stopSequence = modelConfig.stopSequence;
    }

    uiConfig.advanced = advanced;

    // Add system instructions if available
    if (context.config.systemPrompt) {
      uiConfig.systemInstructions = context.config.systemPrompt;
    }

    logger.debug("Converted context to UI config", {
      model: uiConfig.model,
      temperature: uiConfig.temperature,
      maxTokens: uiConfig.maxCompletionTokens,
      stream: uiConfig.stream,
      browserSearch: uiConfig.builtInTools?.browserSearch,
      codeInterpreter: uiConfig.builtInTools?.codeInterpreter
    });

    return uiConfig;
  }

  /**
   * Convert AIMessage to GroqMessage format
   */
  private convertMessages(messages: AIMessage[]): GroqMessage[] {
    return messages.map(msg => ({
      role: msg.role as any,
      content: msg.content
    }));
  }

  async generateResponse(context: ConversationContext): Promise<AIResponse> {
    try {
      // Check if web search is needed and enhance context
      const { enhanced, searchResults } = await this.enhanceWithWebSearch(context);

      // Convert context to UI config
      const uiConfig = this.contextToUIConfig(context);

      // LOG REQUEST DETAILS
      logger.info("🚀 [GROQ API REQUEST] Starting generation", {
        conversationId: context.conversationId,
        model: uiConfig.model,
        messageCount: context.messages.length,
        webSearchUsed: enhanced,
        uiConfig: {
          model: uiConfig.model,
          temperature: uiConfig.temperature,
          maxCompletionTokens: uiConfig.maxCompletionTokens,
          stream: uiConfig.stream,
          jsonMode: uiConfig.jsonMode,
          reasoning: uiConfig.reasoning,
          advanced: uiConfig.advanced,
          systemInstructions: uiConfig.systemInstructions?.substring(0, 100) + '...'
        },
        timestamp: new Date().toISOString()
      });

      // Enhance system instructions with web search results if available
      if (enhanced && searchResults) {
        const enhancedInstructions = (uiConfig.systemInstructions || "You are a helpful assistant.") +
          `\n\n# Real-time Web Search Results\n\n${searchResults}\n\nUse the above web search results to provide accurate, up-to-date information. Cite sources when possible.`;
        uiConfig.systemInstructions = enhancedInstructions;
      }

      // Convert messages and call modular Groq client
      const groqMessages = this.convertMessages(context.messages);
      const response = await this.groqClient.generateResponse(uiConfig, groqMessages);

      // Convert to AIResponse format
      const aiResponse: any = {
        content: response.content,
        metadata: {
          ...response.metadata,
          webSearchUsed: enhanced,
        },
      };

      // Add optional fields if available
      if (response.finishReason) {
        aiResponse.finishReason = response.finishReason;
      }

      if (response.usage) {
        aiResponse.usage = response.usage;
      }

      // LOG RESPONSE DETAILS
      logger.info("✅ [GROQ API RESPONSE] Response generated successfully", {
        conversationId: context.conversationId,
        contentLength: aiResponse.content.length,
        tokensUsed: aiResponse.usage?.totalTokens,
        webSearchUsed: enhanced,
        finishReason: aiResponse.finishReason,
        timestamp: new Date().toISOString()
      });

      return aiResponse as AIResponse;
    } catch (error: any) {
      logger.error("❌ [GROQ API ERROR] Error generating response", {
        error: error.message,
        conversationId: context.conversationId,
        model: context.config.model,
        stack: error.stack?.substring(0, 200),
        timestamp: new Date().toISOString()
      });

      if (error.status === 400 && error.message?.includes("token")) {
        throw new TokenLimitError(
          "Request exceeds token limit",
          "groq",
          context.config.maxTokens || 0,
          CONFIG.ai.groq.maxTokens,
        );
      }

      if (error.status === 404) {
        throw new ModelNotFoundError("Model not found", "groq", context.config.model);
      }

      throw new AIProviderError(
        `Groq API error: ${error.message}`,
        "groq",
        error.code || "UNKNOWN_ERROR",
        error,
      );
    }
  }

  async *generateStreamResponse(
    context: ConversationContext,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      // Check if web search is needed and enhance context
      const { enhanced, searchResults } = await this.enhanceWithWebSearch(context);

      // Convert context to UI config
      const uiConfig = this.contextToUIConfig(context);
      uiConfig.stream = true; // Force streaming

      // LOG STREAMING REQUEST DETAILS
      logger.info("🚀 [GROQ API STREAMING REQUEST] Starting stream", {
        conversationId: context.conversationId,
        model: uiConfig.model,
        messageCount: context.messages.length,
        webSearchUsed: enhanced,
        uiConfig: {
          model: uiConfig.model,
          temperature: uiConfig.temperature,
          maxCompletionTokens: uiConfig.maxCompletionTokens,
          stream: uiConfig.stream,
          jsonMode: uiConfig.jsonMode,
          reasoning: uiConfig.reasoning,
          advanced: uiConfig.advanced,
          systemInstructions: uiConfig.systemInstructions?.substring(0, 100) + '...'
        },
        timestamp: new Date().toISOString()
      });

      // Enhance system instructions with web search results if available
      if (enhanced && searchResults) {
        const enhancedInstructions = (uiConfig.systemInstructions || "You are a helpful assistant.") +
          `\n\n# Real-time Web Search Results\n\n${searchResults}\n\nUse the above web search results to provide accurate, up-to-date information. Cite sources when possible.`;
        uiConfig.systemInstructions = enhancedInstructions;
      }

      // Convert messages and call modular Groq client's streaming method
      const groqMessages = this.convertMessages(context.messages);
      const stream = this.groqClient.generateStreamResponse(uiConfig, groqMessages);

      let fullContent = "";
      let tokenCount = 0;

      // Process each chunk from the modular client
      for await (const chunk of stream) {
        if (chunk.type === 'token' && chunk.content) {
          fullContent += chunk.content;
          tokenCount++;

          // Yield delta for word-by-word streaming
          const streamChunk: StreamChunk = {
            content: chunk.content, // Send only the new token
            delta: chunk.content,
            isComplete: false,
          };

          yield streamChunk;
        }

        if (chunk.type === 'done') {
          const finalChunk: StreamChunk = {
            content: fullContent,
            delta: "",
            isComplete: true,
            usage: {
              promptTokens: 0,
              completionTokens: tokenCount,
              totalTokens: tokenCount,
            },
          };

          // LOG STREAMING COMPLETION
          logger.info("✅ [GROQ API STREAMING RESPONSE] Stream completed", {
            conversationId: context.conversationId,
            contentLength: fullContent.length,
            tokenCount,
            webSearchUsed: enhanced,
            timestamp: new Date().toISOString()
          });

          yield finalChunk;
          break;
        }

        if (chunk.type === 'error') {
          logger.error("❌ [GROQ API STREAMING ERROR] Stream error", {
            conversationId: context.conversationId,
            error: chunk.error,
            timestamp: new Date().toISOString()
          });
          throw new Error(chunk.error || 'Streaming error');
        }
      }

      logger.info("Streaming response completed", {
        conversationId: context.conversationId,
        contentLength: fullContent.length,
        tokenCount,
      });
    } catch (error: any) {
      logger.error("Error in streaming response", {
        error: error.message,
        conversationId: context.conversationId,
      });

      throw new AIProviderError(
        `Groq streaming error: ${error.message}`,
        "groq",
        error.code || "STREAM_ERROR",
        error,
      );
    }
  }

  async listModels(): Promise<string[]> {
    try {
      // Get all enabled Groq models from configuration
      const groqModels = aiConfigManager
        .getProviderModels("groq")
        .filter((m) => m.enabled)
        .map((m) => m.modelId);

      logger.info("Listing available models", { count: groqModels.length });
      return groqModels;
    } catch (error: any) {
      logger.error("Error listing models", { error: error.message });
      return [];
    }
  }

  async validateModel(model: string): Promise<boolean> {
    return this.groqClient.validateModel(model);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Use the modular client for health check
      const testConfig: GroqUIConfig = {
        model: CONFIG.ai.groq.model,
        temperature: 0.7,
        maxCompletionTokens: 5,
        stream: false
      };

      const testMessages: GroqMessage[] = [
        { role: 'user', content: 'test' }
      ];

      await this.groqClient.generateResponse(testConfig, testMessages);
      return true;
    } catch (error) {
      logger.warn("Health check failed", { error: (error as Error).message });
      return false;
    }
  }

  async estimateTokens(messages: AIMessage[]): Promise<number> {
    // Rough estimation: ~4 characters per token for English text
    // This is a basic estimation; for production, consider using tiktoken
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }
}
