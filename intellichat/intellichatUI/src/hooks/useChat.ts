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
      conversationId: conversationId || '',
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
    
    console.log('📤 [Non-Streaming] Sending message to backend...');
    
    const response = await chatAPI.sendMessage(conversationId, payload);

    console.log('✅ [Non-Streaming] Message sent successfully, reloading messages...');

    // Replace temp message with real one
    setMessages((prev) => prev.filter((msg) => msg._id !== userMessage._id));
    
    // 🔥 CRITICAL FIX: Reload messages to get both user and assistant messages from backend
    await loadMessages();
    
    console.log('✅ [Non-Streaming] Messages reloaded from backend');
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
    
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    console.log('📡 [Streaming] Starting stream connection...');

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

    // 🔥 Add timeout fallback in case stream hangs
    let streamTimeout: NodeJS.Timeout | null = null;
    let streamStarted = false;

    const cleanupStream = () => {
      if (streamTimeout) {
        clearTimeout(streamTimeout);
        streamTimeout = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    // Set timeout: if no data received in 10 seconds, fallback to reload
    streamTimeout = setTimeout(async () => {
      if (!streamStarted) {
        console.warn('⚠️ [Streaming] No data received in 10s, falling back to reload...');
        cleanupStream();
        setIsStreaming(false);
        
        // Reload messages from backend as fallback
        await loadMessages();
        console.log('✅ [Streaming Fallback] Messages reloaded from backend');
      }
    }, 10000);

    // Start new stream
    try {
      eventSourceRef.current = chatAPI.sendMessageStream(
        conversationId,
        payload,
        
        // onChunk
        (chunk: StreamChunk) => {
          streamStarted = true; // Mark that we received data
          
          if (chunk.type === 'token' && chunk.content) {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                return prev.map((msg, index) =>
                  index === prev.length - 1
                    ? { ...msg, content: msg.content + chunk.content }
                    : msg
                );
              } else {
                const newAssistantMessage: Message = {
                  _id: `assistant-${Date.now()}`,
                  conversationId,
                  role: 'assistant',
                  content: chunk.content ?? '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                return [...prev, newAssistantMessage];
              }
            });
          } else if (chunk.type === 'metadata' && chunk.message) {
            // Update with final message data
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id.startsWith('assistant-')
                  ? { ...msg, ...chunk.message }
                  : msg
              )
            );
          }
        },
        
        // onError
        async (err: Error) => {
          console.error('❌ [Streaming] Error:', err);
          setError(err.message || 'Streaming failed');
          setIsStreaming(false);
          cleanupStream();
          
          // 🔥 CRITICAL FIX: On error, reload messages from backend as fallback
          console.log('🔄 [Streaming Error] Reloading messages from backend...');
          await loadMessages();
          console.log('✅ [Streaming Error Recovery] Messages reloaded');
        },
        
        // onComplete
        async () => {
          console.log('✅ [Streaming] Stream completed');
          setIsStreaming(false);
          streamingMessageRef.current = '';
          cleanupStream();
          
          // 🔥 CRITICAL FIX: Always reload messages after stream completes
          // This ensures we have the final, saved message with proper IDs from DB
          console.log('🔄 [Streaming Complete] Reloading messages from backend...');
          await loadMessages();
          console.log('✅ [Streaming Complete] Messages reloaded with final data');
        }
      );
    } catch (err) {
      console.error('❌ [Streaming] Failed to start stream:', err);
      cleanupStream();
      setIsStreaming(false);
      setError('Failed to start streaming');
      
      // Fallback: reload messages
      await loadMessages();
    }
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

      // The decision to stream is now based purely on the config passed with the message
      console.log('📨 [useChat] sendMessage called with config:', { 
        stream: config?.stream, 
        model, 
        hasSystemPrompt: !!systemPrompt,
        conversationId 
      });

      if (config?.stream) {
        console.log('🌊 [useChat] Using STREAMING mode');
        await sendMessageStreaming(content, attachments, config, model, systemPrompt);
      } else {
        console.log('📮 [useChat] Using NON-STREAMING mode');
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

      console.log('✅ [useChat] sendMessage completed successfully');
    } catch (err: any) {
      console.error('❌ [useChat] Error sending message:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [conversation, sendMessageStreaming, sendMessageNonStreaming]);

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
