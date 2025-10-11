/**
 * MongoDB Models for Chat System
 * Mongoose schemas for conversations, messages, and token usage
 */

import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

// ============================================================================
// CONVERSATION MODEL
// ============================================================================

export interface ConversationSchema {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  model: string;
  systemPrompt?: string;
  config: {
    temperature: number;
    maxTokens: number;
    topP: number;
    stream: boolean;
  };
  status: "active" | "archived" | "deleted";
  messageCount: number;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

export type IConversationDocument = Document & ConversationSchema;

const ConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      maxlength: 100,
    },
    systemPrompt: {
      type: String,
      maxlength: 2000,
    },
    config: {
      temperature: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 2,
      },
      maxTokens: {
        type: Number,
        default: 2048,
        min: 1,
        max: 32000,
      },
      topP: {
        type: Number,
        default: 0.9,
        min: 0,
        max: 1,
      },
      stream: {
        type: Boolean,
        default: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
      index: true,
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "conversations",
  },
);

// Indexes
ConversationSchema.index({ userId: 1, status: 1, lastMessageAt: -1 });
ConversationSchema.index({ userId: 1, createdAt: -1 });

// Virtual for message population
ConversationSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "conversationId",
});

export const Conversation = mongoose.model<IConversationDocument>(
  "Conversation",
  ConversationSchema,
);

// ============================================================================
// MESSAGE MODEL
// ============================================================================

export interface MessageSchema {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  config?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    browserSearch?: boolean;
    codeInterpreter?: boolean;
  };
  metadata: {
    model?: string;
    provider?: string;
    finishReason?: string;
    timestamp: Date;
    responseTime?: number;
  };
  attachments?: Array<{
    type: "file" | "image" | "url";
    content: string;
    metadata?: Record<string, any>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export type IMessageDocument = Document & MessageSchema;

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    tokens: {
      prompt: {
        type: Number,
        default: 0,
        min: 0,
      },
      completion: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    config: {
      temperature: {
        type: Number,
        min: 0,
        max: 2,
      },
      maxTokens: {
        type: Number,
        min: 1,
        max: 32000,
      },
      topP: {
        type: Number,
        min: 0,
        max: 1,
      },
      stream: {
        type: Boolean,
      },
      browserSearch: {
        type: Boolean,
      },
      codeInterpreter: {
        type: Boolean,
      },
    },
    metadata: {
      model: String,
      provider: String,
      finishReason: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      responseTime: Number,
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ["file", "image", "url"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        metadata: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
    collection: "messages",
  },
);

// Indexes
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ conversationId: 1, role: 1 });

export const Message = mongoose.model<IMessageDocument>("Message", MessageSchema);

// ============================================================================
// TOKEN USAGE MODEL
// ============================================================================

export interface TokenUsageSchema {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  conversationId?: Types.ObjectId;
  messageId?: Types.ObjectId;
  provider: string;
  model: string;
  operation: "chat" | "completion" | "embedding" | "tool" | "other";
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: {
    amount: number;
    currency: string;
  };
  metadata: {
    requestId?: string;
    userAgent?: string;
    ip?: string;
    timestamp: Date;
  };
  createdAt: Date;
}

export type ITokenUsageDocument = Document & TokenUsageSchema;

const TokenUsageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      index: true,
    },
    provider: {
      type: String,
      required: true,
      maxlength: 50,
    },
    model: {
      type: String,
      required: true,
      maxlength: 100,
    },
    operation: {
      type: String,
      enum: ["chat", "completion", "embedding", "tool", "other"],
      default: "chat",
    },
    tokens: {
      prompt: {
        type: Number,
        required: true,
        min: 0,
      },
      completion: {
        type: Number,
        required: true,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    cost: {
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    metadata: {
      requestId: String,
      userAgent: String,
      ip: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "token_usage",
  },
);

// Indexes for analytics and billing
TokenUsageSchema.index({ userId: 1, createdAt: -1 });
TokenUsageSchema.index({ userId: 1, provider: 1, createdAt: -1 });
TokenUsageSchema.index({ conversationId: 1, createdAt: -1 });
TokenUsageSchema.index({ createdAt: -1 }); // For cleanup and analytics

export const TokenUsage = mongoose.model<ITokenUsageDocument>("TokenUsage", TokenUsageSchema);

// ============================================================================
// USER CHAT HISTORY MODEL (for quick access)
// ============================================================================

export interface ChatHistorySchema {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  conversations: Array<{
    conversationId: Types.ObjectId;
    title: string;
    lastMessage: string;
    lastMessageAt: Date;
    messageCount: number;
    totalTokens: number;
  }>;
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IChatHistoryDocument = Document & ChatHistorySchema;

const ChatHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    conversations: [
      {
        conversationId: {
          type: Schema.Types.ObjectId,
          ref: "Conversation",
          required: true,
        },
        title: {
          type: String,
          required: true,
          maxlength: 200,
        },
        lastMessage: {
          type: String,
          maxlength: 500,
        },
        lastMessageAt: Date,
        messageCount: {
          type: Number,
          default: 0,
        },
        totalTokens: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalConversations: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMessages: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "chat_history",
  },
);

export const ChatHistory = mongoose.model<IChatHistoryDocument>("ChatHistory", ChatHistorySchema);

// ============================================================================
// MODEL EXPORTS
// ============================================================================

// Export only the schemas, not the document types to avoid conflicts
