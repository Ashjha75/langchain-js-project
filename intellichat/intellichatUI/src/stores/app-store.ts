import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { 
  User, 
  Conversation, 
  Message, 
  ChatUIState, 
  LoadingState, 
  ErrorState,
  UserPreferences 
} from '@/types';

// Main application state interface
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // Messages
  messages: Record<string, Message[]>;
  
  // UI state
  ui: ChatUIState;
  
  // Loading states
  loading: LoadingState;
  
  // Error states
  errors: ErrorState;
  
  // Real-time state
  isConnected: boolean;
  typingUsers: string[];
  
  // Actions
  actions: {
    // User actions
    setUser: (user: User | null) => void;
    updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
    login: (user: User) => void;
    logout: () => void;
    
    // Conversation actions
    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;
    deleteConversation: (id: string) => void;
    setCurrentConversation: (id: string | null) => void;
    
    // Message actions
    setMessages: (conversationId: string, messages: Message[]) => void;
    addMessage: (conversationId: string, message: Message) => void;
    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
    deleteMessage: (conversationId: string, messageId: string) => void;
    clearMessages: (conversationId: string) => void;
    
    // UI actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTyping: (isTyping: boolean) => void;
    setSearchQuery: (query: string) => void;
    setFilterStatus: (status: ChatUIState['filterStatus']) => void;
    setSortBy: (sortBy: ChatUIState['sortBy']) => void;
    setSortOrder: (order: ChatUIState['sortOrder']) => void;
    selectMessage: (messageId: string) => void;
    deselectMessage: (messageId: string) => void;
    clearSelectedMessages: () => void;
    
    // Loading actions
    setLoading: (key: keyof LoadingState, loading: boolean) => void;
    
    // Error actions
    setError: (key: keyof ErrorState, error: string | null) => void;
    clearErrors: () => void;
    
    // Real-time actions
    setConnectionStatus: (connected: boolean) => void;
    addTypingUser: (userId: string) => void;
    removeTypingUser: (userId: string) => void;
    clearTypingUsers: () => void;
    
    // Utility actions
    reset: () => void;
  };
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  conversations: [],
  currentConversationId: null,
  messages: {},
  ui: {
    sidebarOpen: true,
    currentConversationId: null,
    isTyping: false,
    typingUsers: [],
    selectedMessages: [],
    searchQuery: '',
    filterStatus: 'all' as const,
    sortBy: 'lastActivity' as const,
    sortOrder: 'desc' as const,
  },
  loading: {
    conversations: false,
    messages: false,
    sending: false,
    deleting: false,
    archiving: false,
    tools: false,
  },
  errors: {
    conversations: null,
    messages: null,
    sending: null,
    connection: null,
    general: null,
  },
  isConnected: false,
  typingUsers: [],
};

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        actions: {
          // User actions
          setUser: (user) => set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
          }),
          
          updateUserPreferences: (preferences) => set((state) => {
            if (state.user) {
              state.user.preferences = { ...state.user.preferences, ...preferences };
            }
          }),
          
          login: (user) => set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.errors.general = null;
          }),
          
          logout: () => set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.conversations = [];
            state.messages = {};
            state.currentConversationId = null;
            state.ui.currentConversationId = null;
          }),
          
          // Conversation actions
          setConversations: (conversations) => set((state) => {
            state.conversations = conversations;
          }),
          
          addConversation: (conversation) => set((state) => {
            state.conversations.unshift(conversation);
          }),
          
          updateConversation: (id, updates) => set((state) => {
            const index = state.conversations.findIndex(c => c.id === id);
            if (index !== -1) {
              state.conversations[index] = { ...state.conversations[index], ...updates };
            }
          }),
          
          deleteConversation: (id) => set((state) => {
            state.conversations = state.conversations.filter(c => c.id !== id);
            delete state.messages[id];
            if (state.currentConversationId === id) {
              state.currentConversationId = null;
              state.ui.currentConversationId = null;
            }
          }),
          
          setCurrentConversation: (id) => set((state) => {
            state.currentConversationId = id;
            state.ui.currentConversationId = id;
          }),
          
          // Message actions
          setMessages: (conversationId, messages) => set((state) => {
            state.messages[conversationId] = messages;
          }),
          
          addMessage: (conversationId, message) => set((state) => {
            if (!state.messages[conversationId]) {
              state.messages[conversationId] = [];
            }
            state.messages[conversationId].push(message);
            
            // Update conversation's last message time
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
              conversation.lastMessageAt = message.createdAt;
              conversation.messageCount = state.messages[conversationId].length;
            }
          }),
          
          updateMessage: (conversationId, messageId, updates) => set((state) => {
            const messages = state.messages[conversationId];
            if (messages) {
              const index = messages.findIndex(m => m.id === messageId);
              if (index !== -1) {
                messages[index] = { ...messages[index], ...updates };
              }
            }
          }),
          
          deleteMessage: (conversationId, messageId) => set((state) => {
            const messages = state.messages[conversationId];
            if (messages) {
              state.messages[conversationId] = messages.filter(m => m.id !== messageId);
            }
          }),
          
          clearMessages: (conversationId) => set((state) => {
            state.messages[conversationId] = [];
          }),
          
          // UI actions
          toggleSidebar: () => set((state) => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
          }),
          
          setSidebarOpen: (open) => set((state) => {
            state.ui.sidebarOpen = open;
          }),
          
          setTyping: (isTyping) => set((state) => {
            state.ui.isTyping = isTyping;
          }),
          
          setSearchQuery: (query) => set((state) => {
            state.ui.searchQuery = query;
          }),
          
          setFilterStatus: (status) => set((state) => {
            state.ui.filterStatus = status;
          }),
          
          setSortBy: (sortBy) => set((state) => {
            state.ui.sortBy = sortBy;
          }),
          
          setSortOrder: (order) => set((state) => {
            state.ui.sortOrder = order;
          }),
          
          selectMessage: (messageId) => set((state) => {
            if (!state.ui.selectedMessages.includes(messageId)) {
              state.ui.selectedMessages.push(messageId);
            }
          }),
          
          deselectMessage: (messageId) => set((state) => {
            state.ui.selectedMessages = state.ui.selectedMessages.filter(id => id !== messageId);
          }),
          
          clearSelectedMessages: () => set((state) => {
            state.ui.selectedMessages = [];
          }),
          
          // Loading actions
          setLoading: (key, loading) => set((state) => {
            state.loading[key] = loading;
          }),
          
          // Error actions
          setError: (key, error) => set((state) => {
            state.errors[key] = error;
          }),
          
          clearErrors: () => set((state) => {
            Object.keys(state.errors).forEach(key => {
              state.errors[key as keyof ErrorState] = null;
            });
          }),
          
          // Real-time actions
          setConnectionStatus: (connected) => set((state) => {
            state.isConnected = connected;
            if (!connected) {
              state.errors.connection = 'Connection lost';
            } else {
              state.errors.connection = null;
            }
          }),
          
          addTypingUser: (userId) => set((state) => {
            if (!state.typingUsers.includes(userId)) {
              state.typingUsers.push(userId);
            }
          }),
          
          removeTypingUser: (userId) => set((state) => {
            state.typingUsers = state.typingUsers.filter(id => id !== userId);
          }),
          
          clearTypingUsers: () => set((state) => {
            state.typingUsers = [];
          }),
          
          // Utility actions
          reset: () => set(() => ({ ...initialState })),
        },
      })),
      {
        name: 'intellichat-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            filterStatus: state.ui.filterStatus,
            sortBy: state.ui.sortBy,
            sortOrder: state.ui.sortOrder,
          },
        }),
      }
    ),
    {
      name: 'IntelliChat Store',
    }
  )
);

// Selectors for optimized access
export const useUser = () => useAppStore(state => state.user);
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);

export const useConversations = () => useAppStore(state => state.conversations);
export const useCurrentConversationId = () => useAppStore(state => state.currentConversationId);
export const useCurrentConversation = () => useAppStore(state => {
  const conversations = state.conversations;
  const currentId = state.currentConversationId;
  return currentId ? conversations.find(c => c.id === currentId) : null;
});

export const useMessages = (conversationId: string | null) => 
  useAppStore(state => conversationId ? state.messages[conversationId] || [] : []);

export const useUI = () => useAppStore(state => state.ui);
export const useSidebarOpen = () => useAppStore(state => state.ui.sidebarOpen);

export const useLoading = () => useAppStore(state => state.loading);
export const useErrors = () => useAppStore(state => state.errors);

export const useConnectionStatus = () => useAppStore(state => state.isConnected);
export const useTypingUsers = () => useAppStore(state => state.typingUsers);

export const useActions = () => useAppStore(state => state.actions);

// Compound selectors
export const useChatState = () => useAppStore(state => ({
  conversations: state.conversations,
  currentConversationId: state.currentConversationId,
  messages: state.currentConversationId ? state.messages[state.currentConversationId] || [] : [],
  isLoading: state.loading.messages || state.loading.sending,
  error: state.errors.messages || state.errors.sending,
}));

export const useAppActions = () => useAppStore(state => state.actions);