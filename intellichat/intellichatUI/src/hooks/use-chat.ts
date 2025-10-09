import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppStore, useActions } from '@/stores/app-store';
import type { Conversation, Message, ApiResponse } from '@/types';
import { config } from '@/config';

// API functions (these would be moved to a separate API service)
const api = {
  conversations: {
    getAll: async (): Promise<Conversation[]> => {
      const response = await fetch(`${config.api.baseUrl}/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data: ApiResponse<Conversation[]> = await response.json();
      return data.data;
    },
    
    create: async (data: { title: string; firstMessage: string }): Promise<Conversation> => {
      const response = await fetch(`${config.api.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const result: ApiResponse<Conversation> = await response.json();
      return result.data;
    },
    
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${config.api.baseUrl}/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
    },
  },
  
  messages: {
    getByConversation: async (conversationId: string): Promise<Message[]> => {
      const response = await fetch(`${config.api.baseUrl}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data: ApiResponse<Message[]> = await response.json();
      return data.data;
    },
    
    send: async (data: { conversationId: string; content: string; attachments?: File[] }): Promise<Message> => {
      const formData = new FormData();
      formData.append('content', data.content);
      
      if (data.attachments) {
        data.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      const response = await fetch(`${config.api.baseUrl}/conversations/${data.conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const result: ApiResponse<Message> = await response.json();
      return result.data;
    },
  },
};

// Query keys
export const queryKeys = {
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
} as const;

// Chat hook - main hook for chat functionality
export function useChat() {
  const { conversations, currentConversationId } = useAppStore();
  const actions = useActions();
  const queryClient = useQueryClient();
  
  // Fetch conversations
  const {
    data: fetchedConversations,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: queryKeys.conversations,
    queryFn: api.conversations.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update store when conversations are fetched
  useEffect(() => {
    if (fetchedConversations) {
      actions.setConversations(fetchedConversations);
    }
  }, [fetchedConversations, actions]);
  
  // Update loading state
  useEffect(() => {
    actions.setLoading('conversations', conversationsLoading);
  }, [conversationsLoading, actions]);
  
  // Update error state
  useEffect(() => {
    actions.setError('conversations', conversationsError?.message || null);
  }, [conversationsError, actions]);
  
  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: api.conversations.create,
    onSuccess: (newConversation) => {
      actions.addConversation(newConversation);
      actions.setCurrentConversation(newConversation.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
    onError: (error) => {
      actions.setError('conversations', error.message);
    },
  });
  
  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: api.conversations.delete,
    onSuccess: (_, conversationId) => {
      actions.deleteConversation(conversationId);
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
    onError: (error) => {
      actions.setError('conversations', error.message);
    },
  });
  
  const createNewChat = (firstMessage?: string) => {
    const title = firstMessage ? 
      firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '') : 
      'New Chat';
    
    createConversationMutation.mutate({
      title,
      firstMessage: firstMessage || '',
    });
  };
  
  const deleteConversation = (id: string) => {
    deleteConversationMutation.mutate(id);
  };
  
  const selectConversation = (id: string) => {
    actions.setCurrentConversation(id);
  };
  
  return {
    conversations,
    currentConversationId,
    isLoading: conversationsLoading,
    error: conversationsError?.message || null,
    createNewChat,
    deleteConversation,
    selectConversation,
    isCreating: createConversationMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
  };
}

// Messages hook - for handling messages in a conversation
export function useMessages(conversationId: string | null) {
  const { messages } = useAppStore();
  const actions = useActions();
  const queryClient = useQueryClient();
  
  const conversationMessages = conversationId ? messages[conversationId] || [] : [];
  
  // Fetch messages for current conversation
  const {
    data: fetchedMessages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: queryKeys.messages(conversationId!),
    queryFn: () => api.messages.getByConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  
  // Update store when messages are fetched
  useEffect(() => {
    if (fetchedMessages && conversationId) {
      actions.setMessages(conversationId, fetchedMessages);
    }
  }, [fetchedMessages, conversationId, actions]);
  
  // Update loading state
  useEffect(() => {
    actions.setLoading('messages', messagesLoading);
  }, [messagesLoading, actions]);
  
  // Update error state
  useEffect(() => {
    actions.setError('messages', messagesError?.message || null);
  }, [messagesError, actions]);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: api.messages.send,
    onMutate: async ({ conversationId, content }) => {
      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        content,
        role: 'user',
        metadata: {},
        attachments: [],
        isStreaming: false,
        isOptimistic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      actions.addMessage(conversationId, tempMessage);
      return { tempMessage };
    },
    onSuccess: (newMessage, variables) => {
      // Remove optimistic message and add real one
      const tempMessages = messages[variables.conversationId] || [];
      const filteredMessages = tempMessages.filter(m => !m.isOptimistic);
      actions.setMessages(variables.conversationId, [...filteredMessages, newMessage]);
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.messages(variables.conversationId) 
      });
    },
    onError: (error, variables, context) => {
      // Remove optimistic message on error
      if (context?.tempMessage) {
        actions.deleteMessage(variables.conversationId, context.tempMessage.id);
      }
      actions.setError('sending', error.message);
    },
  });
  
  const sendMessage = (content: string, attachments?: File[]) => {
    if (!conversationId || !content.trim()) return;
    
    actions.setError('sending', null);
    sendMessageMutation.mutate({
      conversationId,
      content: content.trim(),
      attachments,
    });
  };
  
  return {
    messages: conversationMessages,
    isLoading: messagesLoading,
    error: messagesError?.message || null,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };
}

// Real-time hook - for WebSocket connections
export function useRealTime() {
  const actions = useActions();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) return;
      
      const ws = new WebSocket(`${config.websocket.url}?token=${token}`);
      wsRef.current = ws;
      
      ws.onopen = () => {
        actions.setConnectionStatus(true);
        reconnectAttemptsRef.current = 0;
        
        // Send ping periodically
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, config.websocket.pingInterval);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message:new':
              actions.addMessage(data.conversationId, data.message);
              break;
            case 'typing:start':
              actions.addTypingUser(data.userId);
              break;
            case 'typing:stop':
              actions.removeTypingUser(data.userId);
              break;
            case 'pong':
              // Handle pong response
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        actions.setConnectionStatus(false);
        actions.clearTypingUsers();
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < config.websocket.maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, config.websocket.reconnectInterval);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        actions.setConnectionStatus(false);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      actions.setConnectionStatus(false);
    }
  };
  
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    actions.setConnectionStatus(false);
    actions.clearTypingUsers();
  };
  
  const sendTyping = (conversationId: string, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: isTyping ? 'typing:start' : 'typing:stop',
        conversationId,
      }));
    }
  };
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);
  
  return {
    connect,
    disconnect,
    sendTyping,
  };
}

// Keyboard shortcuts hook
export function useKeyboardShortcuts() {
  const actions = useActions();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, metaKey, ctrlKey, shiftKey } = event;
      const isCmd = metaKey || ctrlKey;
      
      // Cmd/Ctrl + Shift + N - New chat
      if (isCmd && shiftKey && key === 'N') {
        event.preventDefault();
        // Trigger new chat creation
      }
      
      // Cmd/Ctrl + Shift + S - Toggle sidebar
      if (isCmd && shiftKey && key === 'S') {
        event.preventDefault();
        actions.toggleSidebar();
      }
      
      // Cmd/Ctrl + K - Focus input
      if (isCmd && key === 'k') {
        event.preventDefault();
        const input = document.querySelector('[data-chat-input]') as HTMLElement;
        input?.focus();
      }
      
      // Escape - Clear selection
      if (key === 'Escape') {
        actions.clearSelectedMessages();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions]);
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue] as const;
}