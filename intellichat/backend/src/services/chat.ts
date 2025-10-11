/**
 * Chat Service
 * Business logic for chat operations, AI interactions, and token management
 */

import { Types } from "mongoose";
import { createLogger } from "@/utils/logger";
import { getCurrentProvider } from "@/ai/factory";
import { Conversation, Message, TokenUsage, ChatHistory } from "@/models";
import { User } from "@/models/user";
import type { AIMessage, StreamChunk, ConversationContext, AIConfig } from "@/ai/interfaces";
import { TokenLimitError } from "@/ai/interfaces";
import { ValidationError, NotFoundError } from "@/utils/errorHandler";

const logger = createLogger("ChatService");

export interface CreateConversationRequest {
  userId: string;
  title?: string;
  model: string;
  systemPrompt?: string;
  config?: Partial<AIConfig>;
}

export interface SendMessageRequest {
  conversationId: string;
  userId: string;
  content: string;
  attachments?: Array<{
    type: "file" | "image" | "url";
    content: string;
    metadata?: Record<string, any>;
  }>;
  config?: Partial<AIConfig>;
}

export interface ConversationListOptions {
  userId: string;
  page: number;
  limit: number;
  status?: "active" | "archived" | "deleted";
  search?: string;
}

export interface TokenUsageStats {
  totalTokens: number;
  tokensUsed: number;
  tokensRemaining: number;
  monthlyUsage: number;
  conversationCount: number;
  messageCount: number;
}

export class ChatService {
  private aiProvider = getCurrentProvider();

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get the last message config from a conversation
   * Used to auto-populate settings from previous message
   */
  private async getLastMessageConfig(conversationId: string): Promise<Partial<AIConfig> | null> {
    try {
      const lastMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1 })
        .limit(1);
      
      if (lastMessage && lastMessage.config) {
        logger.info("Retrieved last message config", {
          conversationId,
          config: lastMessage.config,
        });
        return lastMessage.config;
      }
      
      return null;
    } catch (error) {
      logger.error("Error retrieving last message config", { error, conversationId });
      return null;
    }
  }

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  async createConversation(request: CreateConversationRequest): Promise<any> {
    try {
      logger.info("Creating new conversation", {
        userId: request.userId,
        model: request.model,
        title: request.title,
      });

      // Verify user exists and has permissions
      const user = await User.findById(request.userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Check if model is valid
      const isValidModel = await this.aiProvider.validateModel(request.model);
      if (!isValidModel) {
        throw new ValidationError(`Invalid model: ${request.model}`);
      }

      // Create conversation
      const conversation = new Conversation({
        userId: new Types.ObjectId(request.userId),
        title: request.title || "New Conversation",
        model: request.model,
        systemPrompt: request.systemPrompt,
        config: {
          temperature: request.config?.temperature ?? 0.7,
          maxTokens: request.config?.maxTokens ?? 2048,
          topP: request.config?.topP ?? 0.9,
          stream: request.config?.stream ?? true,
        },
      });

      await conversation.save();

      // Update user's chat history
      await this.updateChatHistory(request.userId, conversation);

      logger.info("Conversation created successfully", {
        conversationId: conversation._id,
        userId: request.userId,
      });

      return conversation;
    } catch (error) {
      logger.error("Error creating conversation", {
        error: (error as Error).message,
        userId: request.userId,
      });
      throw error;
    }
  }

  async getConversation(conversationId: string, userId: string): Promise<any> {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: new Types.ObjectId(userId),
      status: { $ne: "deleted" },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    return conversation;
  }

  async listConversations(options: ConversationListOptions): Promise<{
    conversations: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { userId, page = 1, limit = 20, status = "active", search } = options;

    const query: any = {
      userId: new Types.ObjectId(userId),
      status,
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(query),
    ]);

    return {
      conversations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateConversation(
    conversationId: string,
    userId: string,
    updates: Partial<Pick<any, "title" | "systemPrompt" | "config">>,
  ): Promise<any> {
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        userId: new Types.ObjectId(userId),
        status: { $ne: "deleted" },
      },
      { $set: updates },
      { new: true },
    );

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    return conversation;
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const result = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        userId: new Types.ObjectId(userId),
      },
      { $set: { status: "deleted" } },
    );

    if (!result) {
      throw new NotFoundError("Conversation not found");
    }

    // Update chat history
    await ChatHistory.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $pull: { conversations: { conversationId: new Types.ObjectId(conversationId) } },
        $inc: { totalConversations: -1 },
      },
    );
  }

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  async sendMessage(request: SendMessageRequest): Promise<any> {
    try {
      logger.info("Processing message", {
        conversationId: request.conversationId,
        userId: request.userId,
        contentLength: request.content.length,
        hasConfig: !!request.config,
      });

      // Get conversation and verify access
      const conversation = await this.getConversation(request.conversationId, request.userId);

      // Check token limits
      await this.checkTokenLimits(request.userId);

      // Get last message config if no config provided
      let effectiveRequestConfig = request.config;
      if (!effectiveRequestConfig) {
        const lastConfig = await this.getLastMessageConfig(request.conversationId);
        if (lastConfig) {
          effectiveRequestConfig = lastConfig;
          logger.info("Using last message config", { config: lastConfig });
        }
      }

      // Create user message with config
      const userMessage = new Message({
        conversationId: new Types.ObjectId(request.conversationId),
        role: "user",
        content: request.content,
        attachments: request.attachments,
        config: effectiveRequestConfig,
        tokens: {
          prompt: 0,
          completion: 0,
          total: 0,
        },
      });

      await userMessage.save();

      // Get conversation history for context
      const messages = await this.getConversationMessages(request.conversationId);

      // Prepare AI context
      const aiMessages: AIMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      }));

      // Merge conversation config with per-message config (per-message takes priority)
      const effectiveConfig: AIConfig = {
        model: conversation.model,
        temperature: effectiveRequestConfig?.temperature ?? conversation.config.temperature,
        maxTokens: effectiveRequestConfig?.maxTokens ?? conversation.config.maxTokens,
        topP: effectiveRequestConfig?.topP ?? conversation.config.topP,
        stream: false,
        systemPrompt:
          conversation.systemPrompt ||
          "You are a helpful assistant. Please format your response in Markdown.",
        browserSearch: effectiveRequestConfig?.browserSearch ?? false,
        codeInterpreter: effectiveRequestConfig?.codeInterpreter ?? false,
      };

      logger.info("Using effective config for message", {
        conversationId: request.conversationId,
        config: effectiveConfig,
        perMessageConfig: effectiveRequestConfig,
      });

      const context: ConversationContext = {
        conversationId: request.conversationId,
        userId: request.userId,
        messages: aiMessages,
        config: effectiveConfig,
      };

      // Generate AI response
      const aiResponse = await this.aiProvider.generateResponse(context);

      // Create assistant message
      const assistantMessage = new Message({
        conversationId: new Types.ObjectId(request.conversationId),
        role: "assistant",
        content: aiResponse.content,
        config: effectiveRequestConfig,
        tokens: {
          prompt: aiResponse.usage?.promptTokens || 0,
          completion: aiResponse.usage?.completionTokens || 0,
          total: aiResponse.usage?.totalTokens || 0,
        },
        metadata: {
          model: conversation.model,
          provider: this.aiProvider.name,
          finishReason: aiResponse.finishReason,
          contentType: "markdown", // 👈 Add content type indicator
          timestamp: new Date(),
        },
      });

      await assistantMessage.save();

      // Update conversation stats
      await Conversation.findByIdAndUpdate(conversation._id, {
        $inc: {
          messageCount: 2,
          totalTokens: aiResponse.usage?.totalTokens || 0,
        },
        $set: {
          lastMessageAt: new Date(),
        },
      });

      // Record token usage
      if (aiResponse.usage) {
        await this.recordTokenUsage({
          userId: request.userId,
          conversationId: request.conversationId,
          messageId: assistantMessage._id.toString(),
          provider: this.aiProvider.name,
          model: conversation.model,
          operation: "chat",
          tokens: aiResponse.usage,
          metadata: {
            model: conversation.model,
            provider: this.aiProvider.name,
            finishReason: aiResponse.finishReason,
            contentType: "markdown",
            timestamp: new Date(),
          },
        });
      }

      // Update user's subscription usage
      await User.findByIdAndUpdate(request.userId, {
        $inc: {
          "subscription.tokensUsed": aiResponse.usage?.totalTokens || 0,
        },
      });

      logger.info("Message processed successfully", {
        conversationId: request.conversationId,
        userMessageId: userMessage._id,
        assistantMessageId: assistantMessage._id,
        tokensUsed: aiResponse.usage?.totalTokens,
      });

      return assistantMessage;
    } catch (error) {
      logger.error("Error processing message", {
        error: (error as Error).message,
        conversationId: request.conversationId,
        userId: request.userId,
      });
      throw error;
    }
  }

  async *sendMessageStream(
    request: SendMessageRequest,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      logger.info("Starting streaming message", {
        conversationId: request.conversationId,
        userId: request.userId,
        hasConfig: !!request.config,
      });

      // Get conversation and verify access
      const conversation = await this.getConversation(request.conversationId, request.userId);

      // Check token limits
      await this.checkTokenLimits(request.userId);

      // Get last message config if no config provided
      let effectiveRequestConfig = request.config;
      if (!effectiveRequestConfig) {
        const lastConfig = await this.getLastMessageConfig(request.conversationId);
        if (lastConfig) {
          effectiveRequestConfig = lastConfig;
          logger.info("Using last message config for stream", { config: lastConfig });
        }
      }

      // Create user message with config
      const userMessage = new Message({
        conversationId: new Types.ObjectId(request.conversationId),
        role: "user",
        content: request.content,
        attachments: request.attachments,
        config: effectiveRequestConfig,
        tokens: { prompt: 0, completion: 0, total: 0 },
      });

      await userMessage.save();

      // Get conversation history
      const messages = await this.getConversationMessages(request.conversationId);
      const aiMessages: AIMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      }));

      // Merge conversation config with per-message config (per-message takes priority)
      const effectiveConfig: AIConfig = {
        model: conversation.model,
        temperature: effectiveRequestConfig?.temperature ?? conversation.config.temperature,
        maxTokens: effectiveRequestConfig?.maxTokens ?? conversation.config.maxTokens,
        topP: effectiveRequestConfig?.topP ?? conversation.config.topP,
        stream: true,
        systemPrompt: conversation.systemPrompt,
        browserSearch: effectiveRequestConfig?.browserSearch ?? false,
        codeInterpreter: effectiveRequestConfig?.codeInterpreter ?? false,
      };

      logger.info("Using effective config for stream", {
        conversationId: request.conversationId,
        config: effectiveConfig,
        perMessageConfig: request.config,
      });

      const context: ConversationContext = {
        conversationId: request.conversationId,
        userId: request.userId,
        messages: aiMessages,
        config: effectiveConfig,
      };

      let assistantMessage: any | null = null;
      let finalContent = "";

      // Stream AI response
      for await (const chunk of this.aiProvider.generateStreamResponse(context)) {
        yield chunk;

        if (chunk.isComplete) {
          finalContent = chunk.content;

          // Create assistant message with final content
          assistantMessage = new Message({
            conversationId: new Types.ObjectId(request.conversationId),
            role: "assistant",
            content: finalContent,
            config: effectiveRequestConfig,
            tokens: {
              prompt: chunk.usage?.promptTokens || 0,
              completion: chunk.usage?.completionTokens || 0,
              total: chunk.usage?.totalTokens || 0,
            },
            metadata: {
              model: conversation.model,
              provider: this.aiProvider.name,
              timestamp: new Date(),
            },
          });

          await assistantMessage.save();

          // Update conversation and record usage
          await Promise.all([
            Conversation.findByIdAndUpdate(conversation._id, {
              $inc: {
                messageCount: 2,
                totalTokens: chunk.usage?.totalTokens || 0,
              },
              $set: { lastMessageAt: new Date() },
            }),
            this.recordTokenUsage({
              userId: request.userId,
              conversationId: request.conversationId,
              messageId: assistantMessage._id.toString(),
              provider: this.aiProvider.name,
              model: conversation.model,
              operation: "chat",
              tokens: chunk.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              metadata: {
                requestId: (request as any).requestId,
                timestamp: new Date(),
              },
            }),
            User.findByIdAndUpdate(request.userId, {
              $inc: { "subscription.tokensUsed": chunk.usage?.totalTokens || 0 },
            }),
          ]);
        }
      }

      logger.info("Streaming message completed", {
        conversationId: request.conversationId,
        messageId: assistantMessage?._id,
        contentLength: finalContent.length,
      });
    } catch (error) {
      logger.error("Error in streaming message", {
        error: (error as Error).message,
        conversationId: request.conversationId,
      });
      throw error;
    }
  }

  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    before?: string,
  ): Promise<any[]> {
    const query: any = {
      conversationId: new Types.ObjectId(conversationId),
    };

    if (before) {
      query._id = { $lt: new Types.ObjectId(before) };
    }

    // Sort in ascending order (oldest first) for proper conversation context
    // The AI needs messages in chronological order to understand the conversation flow
    return Message.find(query).sort({ createdAt: 1 }).limit(limit).lean();
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  async getTokenUsageStats(userId: string): Promise<TokenUsageStats> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyUsage, conversationCount, messageCount] = await Promise.all([
      TokenUsage.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalTokens: { $sum: "$tokens.total" },
          },
        },
      ]),
      Conversation.countDocuments({
        userId: new Types.ObjectId(userId),
        status: "active",
      }),
      Message.countDocuments({
        conversationId: {
          $in: await Conversation.find({
            userId: new Types.ObjectId(userId),
            status: "active",
          }).distinct("_id"),
        },
      }),
    ]);

    return {
      totalTokens: user.subscription.tokensLimit,
      tokensUsed: user.subscription.tokensUsed,
      tokensRemaining: user.subscription.tokensLimit - user.subscription.tokensUsed,
      monthlyUsage: monthlyUsage[0]?.totalTokens || 0,
      conversationCount,
      messageCount,
    };
  }

  private async checkTokenLimits(userId: string): Promise<void> {
    // Check if token limit checking is enabled (can be disabled for development)
    const enableTokenLimitCheck = process.env.ENABLE_TOKEN_LIMIT_CHECK !== "false";

    if (!enableTokenLimitCheck) {
      return; // Skip token limit check
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.subscription.tokensUsed >= user.subscription.tokensLimit) {
      throw new TokenLimitError(
        "Token limit exceeded. Please upgrade your plan.",
        "service",
        user.subscription.tokensUsed,
        user.subscription.tokensLimit,
      );
    }
  }

  private async recordTokenUsage(data: {
    userId: string;
    conversationId: string;
    messageId: string;
    provider: string;
    model: string;
    operation: string;
    tokens: { promptTokens: number; completionTokens: number; totalTokens: number };
    metadata: Record<string, any>;
  }): Promise<void> {
    const tokenUsage = new TokenUsage({
      userId: new Types.ObjectId(data.userId),
      conversationId: new Types.ObjectId(data.conversationId),
      messageId: new Types.ObjectId(data.messageId),
      provider: data.provider,
      model: data.model,
      operation: data.operation,
      tokens: {
        prompt: data.tokens.promptTokens,
        completion: data.tokens.completionTokens,
        total: data.tokens.totalTokens,
      },
      metadata: data.metadata,
    });

    await tokenUsage.save();
  }

  private async updateChatHistory(userId: string, conversation: any): Promise<void> {
    await ChatHistory.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $push: {
          conversations: {
            conversationId: conversation._id,
            title: conversation.title,
            lastMessage: "",
            lastMessageAt: new Date(),
            messageCount: 0,
            totalTokens: 0,
          },
        },
        $inc: { totalConversations: 1 },
        $set: { lastActivity: new Date() },
      },
      { upsert: true },
    );
  }
}

export const chatService = new ChatService();
