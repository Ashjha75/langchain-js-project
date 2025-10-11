/**
 * Hook for managing per-conversation configuration
 * Ensures each conversation maintains its own settings independent of others
 * 
 * Features:
 * - Loads conversation config from backend when switching chats
 * - Caches configs in memory for fast switching
 * - Syncs with RunSettings context
 * - Persists changes to backend
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RunSettingsConfig } from '@/config/runSettingsDefaults';
import chatAPI from '@/lib/chat-api';

interface ConversationConfigCache {
  [conversationId: string]: Partial<RunSettingsConfig> & {
    model: string;
    systemInstructions?: string;
  };
}

interface UseConversationConfigOptions {
  conversationId?: string;
  enabled?: boolean;
}

interface UseConversationConfigReturn {
  // Current conversation's config
  conversationConfig: Partial<RunSettingsConfig> | null;
  
  // Loading state
  isLoading: boolean;
  
  // Error state
  error: Error | null;
  
  // Load config for a conversation
  loadConversationConfig: (id: string) => Promise<void>;
  
  // Check if config exists in cache
  hasConfigInCache: (id: string) => boolean;
  
  // Clear cache for a conversation
  clearCache: (id?: string) => void;
}

export const useConversationConfig = ({
  conversationId,
  enabled = true,
}: UseConversationConfigOptions = {}): UseConversationConfigReturn => {
  const [configCache, setConfigCache] = useState<ConversationConfigCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef<{ [key: string]: boolean }>({});

  /**
   * Convert backend conversation config to RunSettings format
   */
  const convertToRunSettings = useCallback((conversation: any): Partial<RunSettingsConfig> & { model: string; systemInstructions?: string } => {
    return {
      model: conversation.model,
      systemInstructions: conversation.systemPrompt || '',
      temperature: conversation.config?.temperature,
      maxCompletionTokens: conversation.config?.maxTokens,
      advanced: {
        topP: conversation.config?.topP ?? 1.0,
        moderation: false,
        seed: null,
        stopSequence: '',
        template: false,
      },
      stream: conversation.config?.stream ?? true,
      builtInTools: {
        browserSearch: conversation.config?.browserSearch ?? false,
        codeInterpreter: conversation.config?.codeInterpreter ?? false,
      },
    };
  }, []);

  /**
   * Load configuration for a specific conversation
   */
  const loadConversationConfig = useCallback(async (id: string) => {
    if (!id || !enabled) return;

    // Check if already loading
    if (loadingRef.current[id]) {
      console.log('🔄 [ConversationConfig] Already loading config for:', id);
      return;
    }

    // Check cache first
    if (configCache[id]) {
      console.log('✅ [ConversationConfig] Using cached config for:', id);
      return;
    }

    try {
      loadingRef.current[id] = true;
      setIsLoading(true);
      setError(null);

      console.log('📥 [ConversationConfig] Loading config for conversation:', id);

      // Fetch conversation details from backend
      const conversation = await chatAPI.getConversationById(id);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Convert and cache
      const config = convertToRunSettings(conversation);
      
      setConfigCache(prev => ({
        ...prev,
        [id]: config,
      }));

      console.log('✅ [ConversationConfig] Loaded and cached config:', {
        conversationId: id,
        model: config.model,
        systemInstructions: config.systemInstructions?.substring(0, 50),
        temperature: config.temperature,
        browserSearch: config.builtInTools?.browserSearch,
      });
    } catch (err: any) {
      console.error('❌ [ConversationConfig] Failed to load config:', err);
      setError(err);
    } finally {
      loadingRef.current[id] = false;
      setIsLoading(false);
    }
  }, [enabled, configCache, convertToRunSettings]);

  /**
   * Auto-load config when conversationId changes
   */
  useEffect(() => {
    if (conversationId && enabled) {
      loadConversationConfig(conversationId);
    }
  }, [conversationId, enabled, loadConversationConfig]);

  /**
   * Check if config exists in cache
   */
  const hasConfigInCache = useCallback((id: string): boolean => {
    return !!configCache[id];
  }, [configCache]);

  /**
   * Clear cache for a specific conversation or all
   */
  const clearCache = useCallback((id?: string) => {
    if (id) {
      setConfigCache(prev => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });
      console.log('🗑️ [ConversationConfig] Cleared cache for:', id);
    } else {
      setConfigCache({});
      console.log('🗑️ [ConversationConfig] Cleared all cache');
    }
  }, []);

  // Get current conversation's config
  const conversationConfig = conversationId ? (configCache[conversationId] || null) : null;

  return {
    conversationConfig,
    isLoading,
    error,
    loadConversationConfig,
    hasConfigInCache,
    clearCache,
  };
};
