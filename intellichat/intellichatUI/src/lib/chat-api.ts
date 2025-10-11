/**
 * Chat API Client
 * Handles all API calls related to conversations and messages
 * Provider-agnostic: Works with Groq, LangChain, LangGraph, or any backend implementation
 */

import api from './api';

// Toast notification utility (will be replaced with actual toast hook where needed)
let toastFn: ((message: string, type: 'success' | 'error' | 'warning' | 'info') => void) | null = null;

export const setToastFunction = (fn: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void) => {
  toastFn = fn;
};

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
  if (toastFn) {
    toastFn(message, type);
  } else {
    console[type === 'error' ? 'error' : 'log'](message);
  }
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ConversationConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface CreateConversationRequest {
  title?: string;
  model: string;
  systemPrompt?: string;
  config?: ConversationConfig;
}

export interface SendMessageRequest {
  content: string;
  attachments?: Array<{
    type: 'file' | 'image' | 'url';
    content: string;
    metadata?: Record<string, any>;
  }>;
}

export interface SendNewChatRequest extends SendMessageRequest {
  model: string;
  systemPrompt?: string;
  config?: ConversationConfig;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  model: string;
  systemPrompt?: string;
  config: ConversationConfig;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  totalTokens: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata?: {
    model?: string;
    provider?: string;
    finishReason?: string;
    timestamp: string;
    responseTime?: number;
  };
  attachments?: Array<{
    type: 'file' | 'image' | 'url';
    content: string;
    metadata?: Record<string, any>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StreamChunk {
  type: 'start' | 'token' | 'done' | 'error' | 'metadata';
  content?: string;
  message?: Partial<Message>;
  metadata?: Record<string, any>;
  error?: string;
  conversationId?: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Create a new conversation
 * Backend handles provider (Groq/LangChain/LangGraph) automatically
 */
export const createConversation = async (
  request: CreateConversationRequest
): Promise<Conversation> => {
  try {
    const response = await api.post('/chat/conversations', request);
    showToast('Conversation created successfully', 'success');
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create conversation';
    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Get all conversations for the user
 */
export const getConversations = async (
  page = 1,
  limit = 20,
  status: 'active' | 'archived' | 'deleted' = 'active',
  search?: string
): Promise<ConversationListResponse> => {
  try {
    const response = await api.get('/chat/conversations', {
      params: { page, limit, status, search },
    });
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load conversations';
    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Get a specific conversation by ID
 */
export const getConversationById = async (id: string): Promise<Conversation> => {
  try {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load conversation';
    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Update conversation details (title, config, etc.)
 */
export const updateConversation = async (
  id: string,
  updates: Partial<CreateConversationRequest>
): Promise<Conversation> => {
  try {
    const response = await api.put(`/chat/conversations/${id}`, updates);
    showToast('Conversation updated successfully', 'success');
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update conversation';
    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Delete/archive a conversation
 */
export const deleteConversation = async (id: string): Promise<void> => {
  try {
    await api.delete(`/chat/conversations/${id}`);
    showToast('Conversation deleted successfully', 'success');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete conversation';
    showToast(errorMessage, 'error');
    throw error;
  }
};

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Send first message and create conversation in one call
 * Backend will use configured provider (Groq/LangChain/LangGraph)
 */
export const sendNewChat = async (
  request: SendNewChatRequest
): Promise<{ conversation: Conversation; message: Message }> => {
  try {
    console.log('Sending new chat request:', request);
    const response = await api.post('/chat/send', request);
    console.log('New chat response:', response.data);
    
    if (!response.data.data.conversation?._id) {
      console.error('Invalid response - missing conversation ID:', response.data);
      throw new Error('Invalid response from server - no conversation ID');
    }
    
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Send message to existing conversation
 * Non-streaming response
 */
export const sendMessage = async (
  conversationId: string,
  request: SendMessageRequest
): Promise<Message> => {
  try {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      request
    );
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * Send message with streaming response
 * Returns EventSource for Server-Sent Events
 * Provider-agnostic: Backend handles Groq/LangChain/LangGraph streaming
 */
export const sendMessageStream = (
  conversationId: string,
  request: SendMessageRequest,
  onChunk: (chunk: StreamChunk) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): EventSource => {
  // Get auth token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // First, send the message via POST to initiate the stream
  // Create EventSource with auth header and message content as query params
  const url = new URL(
    `/api/chat/conversations/${conversationId}/messages/stream`,
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
  );
  
  if (token) {
    url.searchParams.set('token', token);
  }
  
  // Encode message content in URL (not ideal but EventSource limitation)
  url.searchParams.set('content', request.content);
  
  if (request.attachments) {
    url.searchParams.set('attachments', JSON.stringify(request.attachments));
  }

  const eventSource = new EventSource(url.toString());

  // Handle incoming messages
  eventSource.onmessage = (event) => {
    try {
      const chunk: StreamChunk = JSON.parse(event.data);
      
      if (chunk.type === 'done') {
        onComplete();
        eventSource.close();
      } else if (chunk.type === 'error') {
        onError(new Error(chunk.error || 'Stream error'));
        eventSource.close();
      } else {
        onChunk(chunk);
      }
    } catch (error) {
      console.error('Error parsing stream chunk:', error);
      onError(error as Error);
    }
  };

  // Handle errors
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    onError(new Error('Stream connection error'));
    eventSource.close();
  };

  // Send the message via POST (EventSource is just for receiving)
  api.post(`/chat/conversations/${conversationId}/messages/stream`, request)
    .catch((error) => {
      console.error('Error sending message:', error);
      onError(error);
      eventSource.close();
    });

  return eventSource;
};

/**
 * Get messages from a conversation with pagination
 */
export const getMessages = async (
  conversationId: string,
  limit = 50,
  before?: string
): Promise<MessagesResponse> => {
  try {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { limit, before },
      }
    );
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load messages';
    showToast(errorMessage, 'error');
    throw error;
  }
};

// ============================================================================
// SEARCH & DISCOVERY
// ============================================================================

/**
 * Search across conversations and messages
 */
export const searchChat = async (
  query: string,
  type: 'conversations' | 'messages' | 'all' = 'all',
  page = 1,
  limit = 10
): Promise<any> => {
  try {
    const response = await api.get('/chat/search', {
      params: { q: query, type, page, limit },
    });
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to search';
    showToast(errorMessage, 'error');
    throw error;
  }
};

// ============================================================================
// TOKEN USAGE & STATISTICS
// ============================================================================

/**
 * Get user's token usage statistics
 */
export const getTokenUsage = async (): Promise<any> => {
  try {
    const response = await api.get('/chat/usage');
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load token usage';
    showToast(errorMessage, 'error');
    throw error;
  }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check chat service health
 */
export const healthCheck = async (): Promise<{ status: string; provider: string }> => {
  try {
    const response = await api.get('/chat/health');
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Health check failed';
    showToast(errorMessage, 'error');
    throw error;
  }
};

// ============================================================================
// EXPORT ALL
// ============================================================================

const chatAPI = {
  // Conversations
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
  
  // Messages
  sendNewChat,
  sendMessage,
  sendMessageStream,
  getMessages,
  
  // Utility
  searchChat,
  getTokenUsage,
  healthCheck,
};

export default chatAPI;