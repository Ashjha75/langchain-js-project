// Base types for the application
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  subscription: SubscriptionTier;
}

export type UserRole = 'user' | 'premium' | 'admin';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  chat: ChatPreferences;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface ChatPreferences {
  model: string;
  temperature: number;
  maxTokens: number;
  autoSave: boolean;
  showTypingIndicator: boolean;
  enableVoiceInput: boolean;
  enableSuggestions: boolean;
}

// Conversation types
export interface Conversation extends BaseEntity {
  title: string;
  userId: string;
  status: ConversationStatus;
  messageCount: number;
  lastMessageAt: Date;
  settings: ConversationSettings;
  metadata: ConversationMetadata;
}

export type ConversationStatus = 'active' | 'archived' | 'deleted';

export interface ConversationSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  enableTools: boolean;
  enableMemory: boolean;
  contextWindow: number;
}

export interface ConversationMetadata {
  tags: string[];
  category?: string;
  isShared: boolean;
  isPinned: boolean;
  lastActivity: Date;
  messageCount: number;
  tokensUsed: number;
  estimatedCost: number;
}

// Message types
export interface Message extends BaseEntity {
  conversationId: string;
  content: string;
  role: MessageRole;
  metadata: MessageMetadata;
  attachments: Attachment[];
  toolCalls?: ToolCall[];
  isStreaming: boolean;
  isOptimistic: boolean;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageMetadata {
  tokens?: TokenUsage;
  model?: string;
  finishReason?: string;
  processingTime?: number;
  confidence?: number;
  citations?: Citation[];
  emotions?: EmotionAnalysis;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Citation {
  id: string;
  url: string;
  title: string;
  snippet: string;
  relevance: number;
}

export interface EmotionAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: Array<{
    emotion: string;
    intensity: number;
  }>;
}

// Attachment types
export interface Attachment extends BaseEntity {
  messageId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata: AttachmentMetadata;
}

export interface AttachmentMetadata {
  width?: number;
  height?: number;
  duration?: number;
  extractedText?: string;
  language?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

// Tool types
export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: ToolCategory;
  isEnabled: boolean;
  version: string;
  documentation: string;
}

export type ToolCategory = 
  | 'web_search'
  | 'code_execution'
  | 'file_manipulation'
  | 'data_analysis'
  | 'image_generation'
  | 'api_integration'
  | 'productivity'
  | 'development'
  | 'utility';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
  enum?: string[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: ToolResult;
  status: ToolCallStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
  metadata?: {
    executionTime: number;
    resourcesUsed: Record<string, any>;
    outputType: string;
  };
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  processingTime: number;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// WebSocket types
export interface SocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  id: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageStreamEvent {
  conversationId: string;
  messageId: string;
  content: string;
  isComplete: boolean;
  metadata?: Partial<MessageMetadata>;
}

// UI State types
export interface ChatUIState {
  sidebarOpen: boolean;
  currentConversationId: string | null;
  isTyping: boolean;
  typingUsers: string[];
  selectedMessages: string[];
  searchQuery: string;
  filterStatus: ConversationStatus | 'all';
  sortBy: 'lastActivity' | 'created' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface LoadingState {
  conversations: boolean;
  messages: boolean;
  sending: boolean;
  deleting: boolean;
  archiving: boolean;
  tools: boolean;
}

export interface ErrorState {
  conversations: string | null;
  messages: string | null;
  sending: string | null;
  connection: string | null;
  general: string | null;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ConversationForm {
  title: string;
  firstMessage: string;
  settings: Partial<ConversationSettings>;
}

export interface MessageForm {
  content: string;
  attachments: File[];
}

export interface SettingsForm {
  preferences: UserPreferences;
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    avatar?: File;
  };
  notifications: NotificationSettings;
  chat: ChatPreferences;
}

// Search types
export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
  pagination: Pick<PaginationInfo, 'page' | 'limit'>;
}

export interface SearchFilters {
  conversationId?: string;
  userId?: string;
  role?: MessageRole;
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasAttachments?: boolean;
  hasToolCalls?: boolean;
}

export interface SearchSort {
  field: 'relevance' | 'date' | 'conversation';
  order: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  type: 'message' | 'conversation';
  title: string;
  content: string;
  conversationId: string;
  conversationTitle: string;
  timestamp: Date;
  relevance: number;
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

// Analytics types
export interface AnalyticsEvent {
  type: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface ChatMetrics {
  totalMessages: number;
  totalConversations: number;
  averageResponseTime: number;
  tokensUsed: number;
  popularTools: Array<{
    name: string;
    usage: number;
  }>;
  userSatisfaction: number;
  errorRate: number;
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Component prop types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IconProps {
  size?: number | string;
  className?: string;
  color?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface InputProps extends ComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}