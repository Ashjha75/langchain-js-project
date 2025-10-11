/**
 * Groq AI Provider Implementation
 * Handles all Groq API interactions with streaming support and web search integration
 */

import Groq from "groq-sdk";
import { CONFIG } from "@/config";
import { createLogger } from "@/utils/logger";
import { aiConfigManager } from "@/config/ai-config";
import { tavilySearch } from "@/tools/tavilySearch";
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
  public readonly version = "1.0.0";

  private client: Groq;

  constructor() {
    if (!CONFIG.ai.groq.apiKey) {
      throw new AIProviderError("Groq API key is required", "groq", "MISSING_API_KEY");
    }

    this.client = new Groq({
      apiKey: CONFIG.ai.groq.apiKey,
    });

    const enabledModels = aiConfigManager.getProviderModels("groq").filter((m) => m.enabled);

    logger.info("Groq provider initialized", {
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
   */
  private async enhanceWithWebSearch(
    context: ConversationContext,
  ): Promise<{ enhanced: boolean; searchResults?: string }> {
    // Get the latest user message
    const lastMessage = context.messages[context.messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return { enhanced: false };
    }

    // Check if web search is needed and enabled
    if (!tavilySearch.isEnabled() || !this.needsWebSearch(lastMessage.content)) {
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

  async generateResponse(context: ConversationContext): Promise<AIResponse> {
    try {
      // Check if web search is needed and enhance context
      const { enhanced, searchResults } = await this.enhanceWithWebSearch(context);

      // Get merged configuration from central config
      const modelConfig = aiConfigManager.getMergedConfig(
        context.config.model || CONFIG.ai.groq.model,
        context.config,
      );

      logger.info("Generating response with Groq", {
        conversationId: context.conversationId,
        model: context.config.model,
        messageCount: context.messages.length,
        webSearchUsed: enhanced,
        config: modelConfig,
      });

      // Enhance system prompt with web search results if available
      let systemPrompt = context.config.systemPrompt || "You are a helpful assistant.";
      if (enhanced && searchResults) {
        systemPrompt += `\n\n# Real-time Web Search Results\n\n${searchResults}\n\nUse the above web search results to provide accurate, up-to-date information. Cite sources when possible.`;
      }

      const messages = this.formatMessages(context.messages, systemPrompt);

      const completion = await this.client.chat.completions.create({
        model: context.config.model || CONFIG.ai.groq.model,
        messages: messages as any,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: modelConfig.topP,
        stream: false,
        response_format: { type: "json_object" },
        ...(modelConfig.seed && { seed: modelConfig.seed }),
        ...(modelConfig.stopSequence && { stop: modelConfig.stopSequence }),
      });

      const responseContent = JSON.parse(completion.choices[0]?.message?.content || "{}");

      const response: AIResponse = {
        content: responseContent.markdown || responseContent.content || "",
        ...(completion.usage && {
          usage: {
            promptTokens: completion.usage.prompt_tokens || 0,
            completionTokens: completion.usage.completion_tokens || 0,
            totalTokens: completion.usage.total_tokens || 0,
          },
        }),
        ...(completion.choices[0]?.finish_reason && {
          finishReason: completion.choices[0].finish_reason,
        }),
        metadata: {
          model: completion.model,
          provider: "groq",
          webSearchUsed: enhanced,
          timestamp: new Date().toISOString(),
        },
      };

      logger.info("Response generated successfully", {
        conversationId: context.conversationId,
        contentLength: response.content.length,
        tokensUsed: response.usage?.totalTokens,
        webSearchUsed: enhanced,
      });

      return response;
    } catch (error: any) {
      logger.error("Error generating response", {
        error: error.message,
        conversationId: context.conversationId,
        model: context.config.model,
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
      // Get merged configuration from central config
      const modelConfig = aiConfigManager.getMergedConfig(
        context.config.model || CONFIG.ai.groq.model,
        context.config,
      );

      logger.info("Starting streaming response with Groq", {
        conversationId: context.conversationId,
        model: context.config.model,
        config: modelConfig,
      });

      const messages = this.formatMessages(context.messages, context.config.systemPrompt);

      const stream = await this.client.chat.completions.create({
        model: context.config.model || CONFIG.ai.groq.model,
        messages: messages as any,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: modelConfig.topP,
        stream: true,
        ...(modelConfig.seed && { seed: modelConfig.seed }),
        ...(modelConfig.stopSequence && { stop: modelConfig.stopSequence }),
      });

      let fullContent = "";
      let tokenCount = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";

        if (delta) {
          fullContent += delta;
          tokenCount++;

          // Send delta only (not full content) for real-time streaming effect
          const streamChunk: StreamChunk = {
            content: delta, // Send only the new token, not full content
            delta,
            isComplete: false,
          };

          yield streamChunk;
        }

        // Check if stream is complete
        if (chunk.choices[0]?.finish_reason) {
          const finalChunk: StreamChunk = {
            content: fullContent, // Send full content in final chunk
            delta: "",
            isComplete: true,
            usage: {
              promptTokens: 0,
              completionTokens: tokenCount,
              totalTokens: tokenCount,
            },
          };

          yield finalChunk;
          break;
        }
      }

      logger.info("Streaming response completed", {
        conversationId: context.conversationId,
        contentLength: fullContent.length,
        estimatedTokens: tokenCount,
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
    return aiConfigManager.isValidModel(model);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check by making a minimal request
      const testContext: ConversationContext = {
        conversationId: "health-check",
        userId: "system",
        messages: [{ role: "user", content: "test" }],
        config: { model: CONFIG.ai.groq.model, maxTokens: 1 },
      };

      await this.generateResponse(testContext);
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

  private formatMessages(messages: AIMessage[], systemPrompt?: string): any[] {
    const formattedMessages = [];

    const markdownPrompt = `
      Please format your entire response in Markdown.
      Return a single JSON object with a key "markdown" containing the Markdown content.
      ${systemPrompt || ""}
    `;

    // Add system prompt if provided
    if (markdownPrompt) {
      formattedMessages.push({
        role: "system",
        content: markdownPrompt.trim(),
      });
    }

    // Add conversation messages
    formattedMessages.push(
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    );

    return formattedMessages;
  }
}
