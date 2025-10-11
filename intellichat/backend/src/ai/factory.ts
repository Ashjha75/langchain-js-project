/**
 * AI Provider Factory
 * Factory pattern to create and manage different AI providers
 */

import { createLogger } from "@/utils/logger";
import type { AIProvider, ProviderFactory } from "./interfaces";
import { AIProviderType, AIProviderError } from "./interfaces";
import { GroqProvider } from "./providers/groq";

const logger = createLogger("AIProviderFactory");

export class AIProviderFactoryImpl implements ProviderFactory {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private defaultProvider: AIProviderType = AIProviderType.GROQ;

  constructor() {
    this.initializeProviders();
  }

  createProvider(type: AIProviderType, _config?: Record<string, any>): AIProvider {
    try {
      // Check if provider is already cached
      if (this.providers.has(type)) {
        return this.providers.get(type)!;
      }

      let provider: AIProvider;

      switch (type) {
        case AIProviderType.GROQ:
          provider = new GroqProvider();
          break;

        case AIProviderType.LANGCHAIN:
          throw new AIProviderError(
            "LangChain provider not implemented yet",
            "langchain",
            "NOT_IMPLEMENTED",
          );

        case AIProviderType.LANGGRAPH:
          throw new AIProviderError(
            "LangGraph provider not implemented yet",
            "langgraph",
            "NOT_IMPLEMENTED",
          );

        case AIProviderType.LLAMAINDEX:
          throw new AIProviderError(
            "LlamaIndex provider not implemented yet",
            "llamaindex",
            "NOT_IMPLEMENTED",
          );

        case AIProviderType.GOOGLE_AI:
          throw new AIProviderError(
            "Google AI provider not implemented yet",
            "google-ai",
            "NOT_IMPLEMENTED",
          );

        case AIProviderType.OPENAI:
          throw new AIProviderError(
            "OpenAI provider not implemented yet",
            "openai",
            "NOT_IMPLEMENTED",
          );

        case AIProviderType.ANTHROPIC:
          throw new AIProviderError(
            "Anthropic provider not implemented yet",
            "anthropic",
            "NOT_IMPLEMENTED",
          );

        default:
          throw new AIProviderError(
            `Unsupported provider type: ${type}`,
            "factory",
            "UNSUPPORTED_PROVIDER",
          );
      }

      // Cache the provider
      this.providers.set(type, provider);

      logger.info("Provider created and cached", {
        type,
        name: provider.name,
        version: provider.version,
      });

      return provider;
    } catch (error) {
      logger.error("Error creating provider", {
        type,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  getAvailableProviders(): AIProviderType[] {
    return [
      AIProviderType.GROQ,
      // Add more as they're implemented
      // AIProviderType.LANGCHAIN,
      // AIProviderType.LANGGRAPH,
      // AIProviderType.LLAMAINDEX,
      // AIProviderType.GOOGLE_AI,
      // AIProviderType.OPENAI,
      // AIProviderType.ANTHROPIC,
    ];
  }

  getDefaultProvider(): AIProvider {
    return this.createProvider(this.defaultProvider);
  }

  setDefaultProvider(type: AIProviderType): void {
    if (!this.getAvailableProviders().includes(type)) {
      throw new AIProviderError(
        `Provider ${type} is not available`,
        "factory",
        "UNAVAILABLE_PROVIDER",
      );
    }
    this.defaultProvider = type;
    logger.info("Default provider changed", { newDefault: type });
  }

  async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const availableProviders = this.getAvailableProviders();

    for (const providerType of availableProviders) {
      try {
        const provider = this.createProvider(providerType);
        results[providerType] = await provider.healthCheck();
      } catch (error) {
        results[providerType] = false;
        logger.warn(`Health check failed for ${providerType}`, {
          error: (error as Error).message,
        });
      }
    }

    return results;
  }

  clearCache(): void {
    this.providers.clear();
    logger.info("Provider cache cleared");
  }

  private initializeProviders(): void {
    // Pre-initialize default provider
    try {
      this.createProvider(this.defaultProvider);
      logger.info("AI Provider Factory initialized", {
        defaultProvider: this.defaultProvider,
        availableProviders: this.getAvailableProviders().length,
      });
    } catch (error) {
      logger.error("Failed to initialize default provider", {
        provider: this.defaultProvider,
        error: (error as Error).message,
      });
    }
  }
}

// Export singleton instance
export const aiProviderFactory = new AIProviderFactoryImpl();

// Helper function to get current provider
export function getCurrentProvider(): AIProvider {
  return aiProviderFactory.getDefaultProvider();
}

// Helper function to switch provider
export function switchProvider(type: AIProviderType): AIProvider {
  aiProviderFactory.setDefaultProvider(type);
  return aiProviderFactory.getDefaultProvider();
}
