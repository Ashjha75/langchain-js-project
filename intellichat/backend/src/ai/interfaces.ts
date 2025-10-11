/**
 * AI Provider Interface
 * Abstract interface for different AI providers (Groq, LangChain, LangGraph, LlamaIndex, Google AI)
 */

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
  finishReason?: string;
}

export interface StreamChunk {
  content: string;
  delta: string;
  isComplete: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  systemPrompt?: string;
  browserSearch?: boolean; // Enable web search via Tavily
  codeInterpreter?: boolean; // Enable code execution
}

export interface ConversationContext {
  conversationId: string;
  messages: AIMessage[];
  config: AIConfig;
  userId: string;
}

export interface AIProvider {
  name: string;
  version: string;

  // Core methods
  generateResponse(context: ConversationContext): Promise<AIResponse>;
  generateStreamResponse(context: ConversationContext): AsyncGenerator<StreamChunk, void, unknown>;

  // Model management
  listModels(): Promise<string[]>;
  validateModel(model: string): Promise<boolean>;

  // Health check
  healthCheck(): Promise<boolean>;

  // Token estimation
  estimateTokens(messages: AIMessage[]): Promise<number>;
}

export enum AIProviderType {
  GROQ = "groq",
  LANGCHAIN = "langchain",
  LANGGRAPH = "langgraph",
  LLAMAINDEX = "llamaindex",
  GOOGLE_AI = "google-ai",
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
}

export interface ProviderFactory {
  createProvider(type: AIProviderType, config?: Record<string, any>): AIProvider;
  getAvailableProviders(): AIProviderType[];
}

// Error types for AI operations
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export class TokenLimitError extends AIProviderError {
  constructor(
    message: string,
    provider: string,
    public requestedTokens: number,
    public maxTokens: number,
  ) {
    super(message, provider, "TOKEN_LIMIT_EXCEEDED");
  }
}

export class ModelNotFoundError extends AIProviderError {
  constructor(
    message: string,
    provider: string,
    public model: string,
  ) {
    super(message, provider, "MODEL_NOT_FOUND");
  }
}
