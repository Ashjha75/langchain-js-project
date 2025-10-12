import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ConversationConfig, Message as ApiMessage } from '@/lib/chat-api';
import { DEFAULT_RUN_SETTINGS } from '@/config/runSettingsDefaults';

interface ConversationConfigSnapshot {
  model: string;
  systemInstructions: string;
  config: ConversationConfig;
}

interface ChatState {
  // Messages in the active view (optional helper)
  messages: ApiMessage[];

  // Global current config snapshot (mirrors UI settings)
  currentModel: string;
  currentSystemInstructions: string;
  currentConfig: ConversationConfig;

  // Per-conversation saved snapshots
  perConversationConfigs: Record<string, ConversationConfigSnapshot>;

  // Retry tracking
  retryCount: number;

  // Message helpers
  setMessages: (messages: ApiMessage[]) => void;
  addMessage: (message: ApiMessage) => void;
  updateMessage: (id: string, content: string) => void;

  // Config helpers
  setCurrentConfig: (config: ConversationConfig) => void;
  setConfigPartial: (partial: Partial<ConversationConfig>) => void;
  setModel: (model: string) => void;
  setSystemInstructions: (text: string) => void;
  resetConfigToDefaults: () => void;

  // Per-conversation helpers
  saveConversationConfig: (conversationId: string, snapshot: ConversationConfigSnapshot) => void;
  setConversationConfig: (conversationId: string, snapshot: ConversationConfigSnapshot) => void;
  loadConversationConfig: (conversationId: string) => ConversationConfigSnapshot | null;

  // Retry helpers
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    immer((set) => ({
      messages: [],

      // Initialize current config from defaults
      currentModel: DEFAULT_RUN_SETTINGS.model,
      currentSystemInstructions: DEFAULT_RUN_SETTINGS.systemInstructions,
      currentConfig: {
        temperature: DEFAULT_RUN_SETTINGS.temperature,
        maxTokens: DEFAULT_RUN_SETTINGS.maxCompletionTokens,
        topP: DEFAULT_RUN_SETTINGS.advanced.topP,
        stream: DEFAULT_RUN_SETTINGS.stream,
        browserSearch: DEFAULT_RUN_SETTINGS.builtInTools.browserSearch,
        codeInterpreter: DEFAULT_RUN_SETTINGS.builtInTools.codeInterpreter,
      },

      perConversationConfigs: {},
      retryCount: 0,
      setMessages: (messages: ApiMessage[]) => set({ messages }),
      addMessage: (message: ApiMessage) =>
        set((state) => {
          state.messages.push(message);
        }),
      updateMessage: (id: string, content: string) =>
        set((state) => {
          const message = state.messages.find((m: ApiMessage) => m._id === id);
          if (message) {
            message.content = content;
          }
        }),
      setCurrentConfig: (config: ConversationConfig) => set({ currentConfig: config }),
      setConfigPartial: (partial: Partial<ConversationConfig>) =>
        set((state) => {
          state.currentConfig = { ...state.currentConfig, ...partial } as ConversationConfig;
        }),
      setModel: (model: string) => set({ currentModel: model }),
      setSystemInstructions: (text: string) => set({ currentSystemInstructions: text }),
      resetConfigToDefaults: () =>
        set(() => ({
          currentModel: DEFAULT_RUN_SETTINGS.model,
          currentSystemInstructions: DEFAULT_RUN_SETTINGS.systemInstructions,
          currentConfig: {
            temperature: DEFAULT_RUN_SETTINGS.temperature,
            maxTokens: DEFAULT_RUN_SETTINGS.maxCompletionTokens,
            topP: DEFAULT_RUN_SETTINGS.advanced.topP,
            stream: DEFAULT_RUN_SETTINGS.stream,
            browserSearch: DEFAULT_RUN_SETTINGS.builtInTools.browserSearch,
            codeInterpreter: DEFAULT_RUN_SETTINGS.builtInTools.codeInterpreter,
          },
        })),

      saveConversationConfig: (conversationId: string, snapshot: ConversationConfigSnapshot) =>
        set((state) => {
          state.perConversationConfigs[conversationId] = snapshot;
        }),
      setConversationConfig: (conversationId: string, snapshot: ConversationConfigSnapshot) =>
        set((state) => {
          state.perConversationConfigs[conversationId] = snapshot;
          state.currentModel = snapshot.model;
          state.currentSystemInstructions = snapshot.systemInstructions;
          state.currentConfig = snapshot.config;
        }),
      loadConversationConfig: (conversationId: string) => {
        // This function is wrapped by persist, so we can't read state directly here.
        // We'll override in persist's returned state via getState accessor.
        return null;
      },
      incrementRetryCount: () =>
        set((state) => {
          state.retryCount += 1;
        }),
      resetRetryCount: () => set({ retryCount: 0 }),
    })),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist configs and per-conversation snapshots; messages can be large and are fetched from API
        currentModel: state.currentModel,
        currentSystemInstructions: state.currentSystemInstructions,
        currentConfig: state.currentConfig,
        perConversationConfigs: state.perConversationConfigs,
        retryCount: state.retryCount,
      }),
      onRehydrateStorage: () => (state) => {
        // Patch loadConversationConfig now that state is available
        if (!state) return;
        (state as any).loadConversationConfig = (conversationId: string) => {
          const snap = (useChatStore.getState().perConversationConfigs || {})[conversationId];
          return snap || null;
        };
      },
    }
  )
);
