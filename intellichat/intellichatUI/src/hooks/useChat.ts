/**
 * useChat Hook
 * Manages chat state and API interactions
 * Provider-agnostic: Works with any backend (Groq, LangChain, LangGraph)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import chatAPI, {
  Conversation,
  Message,
  SendMessageRequest,
  StreamChunk,
  ConversationConfig,
} from '@/lib/chat-api';

export interface UseChatOptions {
  conversationId?: string;
  autoLoadMessages?: boolean;
  streamingEnabled?: boolean;
}

export interface UseChatReturn {
  // State
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isStreaming: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (
    content: string, 
    attachments?: any[], 
    config?: ConversationConfig,
    model?: string,
    systemPrompt?: string
  ) => Promise<void>;
  createNewChat: (model: string, config?: ConversationConfig) => Promise<string>;
  loadMessages: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  updateConversationTitle: (title: string) => Promise<void>;
  deleteConversation: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  retryLastMessage: () => Promise<void>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    conversationId,
    autoLoadMessages = true,
    streamingEnabled = true,
  } = options;

  const router = useRouter();
  
  // State
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingMessageRef = useRef<string>('');
  const lastUserMessageRef = useRef<string>('');

  // ============================================================================
  // LOAD CONVERSATION & MESSAGES
  // ============================================================================

  const loadConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const conv = await chatAPI.getConversationById(id);
      setConversation(conv);
      
      if (autoLoadMessages) {
        await loadMessages();
      }
    } catch (err: any) {
      console.error('Error loading conversation:', err);
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [autoLoadMessages]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { messages: loadedMessages } = await chatAPI.getMessages(conversationId);
      setMessages(loadedMessages);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Load conversation on mount or when ID changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      setConversation(null);
      setMessages([]);
    }
  }, [conversationId, loadConversation]);

  // ============================================================================
  // CREATE NEW CHAT
  // ============================================================================

  const createNewChat = useCallback(async (
    model: string,
    config?: ConversationConfig
  ): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payload: any = {
        title: 'New Conversation',
        model,
      };
      
      if (config) {
        payload.config = config;
      }
      
      const newConversation = await chatAPI.createConversation(payload);
      
      setConversation(newConversation);
      setMessages([]);
      
      // Navigate to new conversation
      router.push(`/chat/${newConversation._id}`);
      
      return newConversation._id;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.response?.data?.message || 'Failed to create conversation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ============================================================================
  // SEND MESSAGE (NON-STREAMING)
  // ============================================================================

  const sendMessageNonStreaming = useCallback(async (
    content: string,
    attachments?: any[],
    config?: ConversationConfig,
    model?: string,
    systemPrompt?: string
  ) => {
    if (!conversationId) {
      throw new Error('No conversation selected');
    }

    lastUserMessageRef.current = content;

    // Add user message optimistically
    const userMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to backend
    const payload: SendMessageRequest = { content };
    if (model) {
      payload.model = model;
    }
    if (systemPrompt) {
      payload.systemPrompt = systemPrompt;
    }
    if (config) {
      payload.config = config;
    }
    if (attachments) {
      payload.attachments = attachments;
    }
    
    const response = await chatAPI.sendMessage(conversationId, payload);

    // Replace temp message with real one
    setMessages((prev) => prev.filter((msg) => msg._id !== userMessage._id));
    
    // Reload messages to get both user and assistant messages
    await loadMessages();
  }, [conversationId, loadMessages]);

  // ============================================================================
  // SEND MESSAGE (STREAMING)
  // ============================================================================

  const sendMessageStreaming = useCallback(async (
    content: string,
    attachments?: any[],
    config?: ConversationConfig,
    model?: string,
    systemPrompt?: string
  ) => {
    if (!conversationId) {
      throw new Error('No conversation selected');
    }

    lastUserMessageRef.current = content;
    streamingMessageRef.current = '';

    // Add user message optimistically
    const userMessage: Message = {
      _id: `user-${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add assistant placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      _id: assistantMessageId,
      conversationId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    // Close any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Prepare request payload
    const payload: SendMessageRequest = { content };
    if (model) {
      payload.model = model;
    }
    if (systemPrompt) {
      payload.systemPrompt = systemPrompt;
    }
    if (config) {
      payload.config = config;
    }
    if (attachments) {
      payload.attachments = attachments;
    }

    // Start new stream
    eventSourceRef.current = chatAPI.sendMessageStream(
      conversationId,
      payload,
      
      // onChunk
      (chunk: StreamChunk) => {
        if (chunk.type === 'token' && chunk.content) {
          streamingMessageRef.current += chunk.content;
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === assistantMessageId
                ? { ...msg, content: streamingMessageRef.current }
                : msg
            )
          );
        } else if (chunk.type === 'metadata' && chunk.message) {
          // Update with final message data
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === assistantMessageId
                ? { ...msg, ...chunk.message }
                : msg
            )
          );
        }
      },
      
      // onError
      (err: Error) => {
        console.error('Streaming error:', err);
        setError(err.message || 'Streaming failed');
        setIsStreaming(false);
        
        // Remove incomplete assistant message
        setMessages((prev) => prev.filter((msg) => msg._id !== assistantMessageId));
      },
      
      // onComplete
      () => {
        setIsStreaming(false);
        streamingMessageRef.current = '';
        
        // Reload to get final message from database
        loadMessages();
      }
    );
  }, [conversationId, loadMessages]);

  // ============================================================================
  // SEND MESSAGE (MAIN FUNCTION)
  // ============================================================================

  const sendMessage = useCallback(async (
    content: string,
    attachments?: any[],
    config?: ConversationConfig,
    model?: string,
    systemPrompt?: string
  ) => {
    if (!content.trim()) return;

    try {
      setIsSending(true);
      setError(null);

      if (streamingEnabled && conversation?.config?.stream !== false) {
        await sendMessageStreaming(content, attachments, config, model, systemPrompt);
      } else {
        await sendMessageNonStreaming(content, attachments, config, model, systemPrompt);
      }

      // Update conversation's last message time
      if (conversation) {
        setConversation({
          ...conversation,
          lastMessageAt: new Date().toISOString(),
          messageCount: conversation.messageCount + 2, // user + assistant
        });
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [conversation, streamingEnabled, sendMessageStreaming, sendMessageNonStreaming]);

  // ============================================================================
  // UPDATE & DELETE
  // ============================================================================

  const updateConversationTitle = useCallback(async (title: string) => {
    if (!conversationId) return;

    try {
      const updated = await chatAPI.updateConversation(conversationId, { title });
      setConversation(updated);
    } catch (err: any) {
      console.error('Error updating conversation:', err);
      setError(err.response?.data?.message || 'Failed to update conversation');
    }
  }, [conversationId]);

  const deleteConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      await chatAPI.deleteConversation(conversationId);
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
      setError(err.response?.data?.message || 'Failed to delete conversation');
    }
  }, [conversationId, router]);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    // State
    conversation,
    messages,
    isLoading,
    isSending,
    isStreaming,
    error,
    
    // Actions
    sendMessage,
    createNewChat,
    loadMessages,
    loadConversation,
    updateConversationTitle,
    deleteConversation,
    clearError,
    
    // Utilities
    retryLastMessage,
  };
}

export default useChat;