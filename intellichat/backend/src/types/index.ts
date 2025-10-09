/**
 * Core TypeScript Types for IntelliChat Backend
 * Comprehensive type definitions following best practices
 */

import { Request } from 'express';
import { Types } from 'mongoose';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ObjectId = Types.ObjectId;

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data?: T;
  meta?: any;
  timestamp: string;
}

export interface ErrorDetails {
  field?: string;
  message: string;
  code?: string;
  value?: any;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'user' | 'premium' | 'admin';

export const UserRole = {
  USER: 'user' as const,
  PREMIUM: 'premium' as const,
  ADMIN: 'admin' as const,
} as const;
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type Theme = 'light' | 'dark' | 'auto';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
}

export interface ChatPreferences {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableTools: boolean;
  enabledTools: string[];
  systemPrompt?: string;
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  notifications: NotificationSettings;
  chatSettings: ChatPreferences;
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  tokensUsed: number;
  tokensLimit: number;
  billingCycle?: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  timezone: string;
}

export interface User {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  profile: UserProfile;
  role: UserRole;
  permissions?: Permission[];
  isVerified: boolean;
  preferences: UserPreferences;
  subscription: UserSubscription;
  lastLogin: Date;
  loginCount: number;
  resetPasswordToken?: string;
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  preferences?: Partial<UserPreferences>;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends CreateUserInput {}

// ============================================================================
// AUTH TYPES
// ============================================================================

export type Permission = 
  | 'read:conversations'
  | 'write:conversations'
  | 'delete:conversations'
  | 'read:messages'
  | 'write:messages'
  | 'delete:messages'
  | 'read:tools'
  | 'execute:tools'
  | 'admin:users'
  | 'admin:system';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
    tokenId?: string;
  };
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
  jti?: string;
}

export interface IRefreshTokenPayload {
  userId: string;
  tokenFamily: string;
  iat: number;
  exp: number;
}

export interface IUserWithoutPassword extends Omit<User, 'password'> {
  _id: ObjectId;
}

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

export type ConversationStatus = 'active' | 'archived' | 'deleted';

export interface ConversationSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt?: string;
  toolsEnabled: boolean;
  enabledTools: string[];
}

export interface MessageSummary {
  messageId: ObjectId;
  role: string;
  contentPreview: string;
  timestamp: Date;
}

export interface ConversationMetadata {
  messageCount: number;
  totalTokens: number;
  lastMessageAt: Date;
  avgResponseTime: number;
  userRating?: number;
  tags: string[];
  isBookmarked: boolean;
  isShared: boolean;
  shareUrl?: string;
}

export interface ConversationContext {
  sessionId: string;
  conversationHistory: MessageSummary[];
  contextWindow: number;
  lastContextUpdate: Date;
}

export interface Conversation {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  status: ConversationStatus;
  settings: ConversationSettings;
  metadata: ConversationMetadata;
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationInput {
  title?: string;
  description?: string;
  settings?: Partial<ConversationSettings>;
  firstMessage?: string;
}

export interface UpdateConversationInput {
  title?: string;
  description?: string;
  settings?: Partial<ConversationSettings>;
  status?: ConversationStatus;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';
export type ContentType = 'text' | 'markdown' | 'code' | 'image' | 'file';
export type FinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter';

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface MessageMetadata {
  tokens: TokenUsage;
  model: string;
  temperature: number;
  responseTime: number;
  isStreaming: boolean;
  isCompleted: boolean;
  error?: string;
  finishReason?: FinishReason;
}

export interface FileAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface ToolCall {
  id: string;
  toolName: string;
  input: any;
  output?: any;
  executionTime?: number;
  success?: boolean;
  error?: string;
}

export interface UserReaction {
  userId: ObjectId;
  type: 'like' | 'dislike' | 'love' | 'laugh' | 'angry';
  timestamp: Date;
}

export interface EditRecord {
  editedAt: Date;
  originalContent: string;
  editedContent: string;
  reason?: string;
}

export interface MessageFlags {
  isEdited: boolean;
  isDeleted: boolean;
  isFlagged: boolean;
  isBookmarked: boolean;
}

export interface Message {
  _id: ObjectId;
  conversationId: ObjectId;
  userId: ObjectId;
  role: MessageRole;
  content: string;
  contentType: ContentType;
  metadata: MessageMetadata;
  attachments: FileAttachment[];
  toolCalls?: ToolCall[];
  reactions: UserReaction[];
  flags: MessageFlags;
  editHistory: EditRecord[];
  parentMessageId?: ObjectId;
  childMessageIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageInput {
  conversationId: string;
  content: string;
  contentType?: ContentType;
  attachments?: FileAttachment[];
  parentMessageId?: string;
}

export interface UpdateMessageInput {
  content?: string;
  flags?: Partial<MessageFlags>;
}

// ============================================================================
// TOOL TYPES
// ============================================================================

export type ToolCategory = 'search' | 'calculation' | 'code' | 'file' | 'api' | 'utility';
export type RequiredRole = 'user' | 'premium' | 'admin';
export type Environment = 'node' | 'browser' | 'both';

export interface RateLimit {
  maxCalls: number;
  windowMs: number;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
  schema?: any;
}

export interface ToolConfig {
  endpoint?: string;
  timeout: number;
  rateLimit: RateLimit;
  parameters: ToolParameter[];
}

export interface ToolPermissions {
  requiredRole: RequiredRole;
  allowedUsers?: ObjectId[];
  maxUsagePerDay?: number;
}

export interface ToolUsage {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  lastUsed: Date;
}

export interface ToolCode {
  handler: string;
  dependencies: string[];
  environment: Environment;
}

export interface Tool {
  _id: ObjectId;
  name: string;
  displayName: string;
  description: string;
  category: ToolCategory;
  version: string;
  isActive: boolean;
  isPublic: boolean;
  author: ObjectId;
  config: ToolConfig;
  permissions: ToolPermissions;
  usage: ToolUsage;
  code: ToolCode;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateToolInput {
  name: string;
  displayName: string;
  description: string;
  category: ToolCategory;
  config: Partial<ToolConfig>;
  permissions?: Partial<ToolPermissions>;
  code: ToolCode;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export type ContextType = 'session' | 'conversation' | 'user' | 'knowledge' | 'tool' | 'temporal';

export interface SessionInfo {
  sessionStart: Date;
  device: string;
  location: string;
  userAgent: string;
}

export interface ConversationInfo {
  topic: string;
  participants: string[];
  duration: number;
  messageCount: number;
}

export interface UserInfo {
  userId: ObjectId;
  role: string;
  preferences: any;
  history: any[];
}

export interface KnowledgeInfo {
  domain: string;
  facts: any[];
  sources: string[];
  confidence: number;
}

export interface ToolInfo {
  availableTools: string[];
  recentUsage: any[];
  preferences: any;
}

export interface TemporalInfo {
  timestamp: Date;
  timezone: string;
  dayOfWeek: string;
  timeContext: string;
}

export interface ContextData {
  session?: SessionInfo;
  conversation?: ConversationInfo;
  user?: UserInfo;
  knowledge?: KnowledgeInfo;
  tool?: ToolInfo;
  temporal?: TemporalInfo;
}

export interface ContextMetadata {
  priority: number;
  relevance: number;
  confidence: number;
  source: string;
  tags: string[];
}

export interface Context {
  _id: ObjectId;
  userId: ObjectId;
  sessionId: string;
  conversationId?: ObjectId;
  type: ContextType;
  data: ContextData;
  metadata: ContextMetadata;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export type SessionStatus = 'active' | 'inactive' | 'expired';

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  timezone: string;
}

export interface SessionActivity {
  firstSeen: Date;
  lastSeen: Date;
  totalDuration: number;
  pageViews: number;
  messagesExchanged: number;
}

export interface SessionSecurity {
  riskScore: number;
  ipAddress: string;
  lastSecurityCheck: Date;
}

export interface SessionPreferences {
  theme: 'light' | 'dark';
  language: string;
}

export interface Session {
  _id: ObjectId;
  sessionId: string;
  userId?: ObjectId;
  status: SessionStatus;
  deviceInfo: DeviceInfo;
  activity: SessionActivity;
  security: SessionSecurity;
  preferences: SessionPreferences;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AI SERVICE TYPES
// ============================================================================

export interface AIModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface AIMessage {
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
}

export interface AIResponse {
  content: string;
  role: MessageRole;
  finishReason: FinishReason;
  usage: TokenUsage;
  toolCalls?: ToolCall[];
  model: string;
  responseTime: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  usage?: TokenUsage;
}

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

export interface AuthRequest extends Request {
  user?: User;
  requestId?: string;
  startTime?: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
}

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    external: 'up' | 'down';
  };
  details?: any;
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export interface SocketUser {
  id: string;
  userId?: string;
  rooms: string[];
  connectedAt: Date;
}

export interface SocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  roomId?: string;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Add any additional type exports here
};

// Type guards
export const isValidObjectId = (id: any): id is ObjectId => {
  return Types.ObjectId.isValid(id);
};

export const isUser = (obj: any): obj is User => {
  return obj && typeof obj._id !== 'undefined' && typeof obj.email === 'string';
};

export const isMessage = (obj: any): obj is Message => {
  return obj && typeof obj._id !== 'undefined' && typeof obj.content === 'string';
};

export const isConversation = (obj: any): obj is Conversation => {
  return obj && typeof obj._id !== 'undefined' && typeof obj.title === 'string';
};