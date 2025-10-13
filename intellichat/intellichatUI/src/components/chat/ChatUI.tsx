'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Settings, X, AlertCircle, Coins, Copy, Check } from 'lucide-react';
import { ChatInput } from '../homepage/ChatInput';
import { MessageList } from './MessageList';
import { Message } from './types';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useChat } from '@/hooks/useChat';
import { useRouter } from 'next/navigation';
import chatAPI from '@/lib/chat-api';
import { useAppStore } from '@/stores/app-store';
import { useToast } from '@/components/ui/toast';

interface ChatUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  initialMessage: string | null;
  setRunSettingsOpen: (open: boolean) => void;
  conversationId?: string;
}

export function ChatUI({ 
  sidebarOpen, 
  setSidebarOpen, 
  initialMessage, 
  setRunSettingsOpen,
  conversationId 
}: ChatUIProps) {
  const [input, setInput] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const router = useRouter();
  
  const { currentChatConfig: settings, actions } = useAppStore();
  const { setCurrentChatConfig } = actions;
  const { showToast } = useToast();

  // Validate conversation ID - must be a valid MongoDB ObjectId (24 hex chars)
  const isValidConversationId = conversationId && /^[0-9a-fA-F]{24}$/.test(conversationId);

  // ✅ NEW: Check if current settings differ from conversation's saved config
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // Use the chat hook for all API interactions - Provider agnostic!
  const {
    conversation,
    messages,
    isLoading,
    isSending,
    isStreaming,
    error,
    sendMessage,
    createNewChat,
    clearError,
    retryLastMessage,
  } = useChat({
    ...(isValidConversationId && { 
      conversationId,
      autoLoadMessages: true 
    }),
    ...(!isValidConversationId && {
      autoLoadMessages: false
    }),
    streamingEnabled: true, // Works with Groq, LangChain, LangGraph - all providers
  });

  // ✅ NEW: Detect when user changes settings
  useEffect(() => {
    if (error === 'Max retries exceeded.') {
      showToast('Failed to get a response from the server. Please try again later.', 'error');
    }
  }, [error, showToast]);

  useEffect(() => {
    if (!conversation || !isValidConversationId) {
      setHasUnappliedChanges(false);
      return;
    }

    // Check if any setting differs from conversation's saved config
    const configsDiffer = 
      settings.model !== conversation.model ||
      settings.systemInstructions !== (conversation.systemPrompt || '') ||
      settings.temperature !== conversation.config.temperature ||
      settings.maxCompletionTokens !== conversation.config.maxTokens ||
      settings.advanced.topP !== conversation.config.topP ||
      settings.builtInTools.browserSearch !== conversation.config.browserSearch ||
      settings.builtInTools.codeInterpreter !== conversation.config.codeInterpreter;

    setHasUnappliedChanges(configsDiffer);
  }, [settings, conversation, isValidConversationId]);

  // Set transitioning state immediately when conversationId changes
  useEffect(() => {
    if (isValidConversationId) {
      setIsTransitioning(true);
      // Clear transitioning state after a short delay to let the hook's isLoading take over
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [conversationId, isValidConversationId]);

  // Convert backend messages to UI format (filter out system messages)
  const uiMessages: Message[] = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      id: msg._id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

  // Debug: Log message order
  useEffect(() => {
    if (uiMessages.length > 0) {
      // console.log('📋 Message Order Check:', {
      //   count: uiMessages.length,
      //   order: uiMessages.map((m, idx) => ({
      //     index: idx,
      //     id: m.id.substring(0, 8),
      //     role: m.role,
      //     preview: m.content.substring(0, 50).replace(/\n/g, ' ')
      //   }))
      // });
    }
  }, [uiMessages.length]);

  // Handle initial message (from homepage)
  useEffect(() => {
    if (initialMessage && !isValidConversationId && !initialMessageSent) {
      // Create new chat with the initial message
      setInitialMessageSent(true);
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, isValidConversationId, initialMessageSent]);

  const handleSendMessage = async (message?: string, attachments?: { type: 'document'; content: string }[]) => {
    const typedAttachments = attachments as { type: "file" | "image" | "url"; content: string; metadata?: Record<string, any> }[] | undefined;
    const messageToSend = message || input;
    if (!messageToSend.trim() || isCreatingChat) return;

    setInput('');

    // Prepare config from run settings - READ FRESH ON EVERY SEND
    const messageConfig = {
      temperature: settings.temperature,
      maxTokens: settings.maxCompletionTokens,
      topP: settings.advanced.topP,
      stream: settings.stream,
      browserSearch: settings.builtInTools.browserSearch,
      codeInterpreter: settings.builtInTools.codeInterpreter,
    };
    
    console.log('📊 [ChatUI] Sending message with CURRENT settings:', {
      model: settings.model,
      systemInstructions: settings.systemInstructions,
      messageConfig: messageConfig,
      browserSearch: settings.builtInTools.browserSearch,
      fullSettings: settings,
    });

    try {
      if (!isValidConversationId) {
        // First message: create conversation with CURRENT model and settings
        setIsCreatingChat(true);
        
        try {
          const result = await chatAPI.sendNewChat({
            content: messageToSend,
            ...(typedAttachments && { attachments: typedAttachments }),
            model: settings.model, // ✅ USE MODEL FROM SETTINGS
            systemPrompt: settings.systemInstructions, // ✅ USE SYSTEM INSTRUCTIONS
            config: messageConfig,
          });
          
          console.log('✅ Conversation created with model:', settings.model, result.conversation._id);
          
          // Navigate to the new conversation with the real MongoDB ObjectId
          router.push(`/chat/${result.conversation._id}`);
        } catch (err: any) {
          console.error('Error creating conversation:', err);
          setIsCreatingChat(false);
          // Let error propagate to outer catch
          throw err;
        }
        
        setIsCreatingChat(false);
      } else {
        // Existing conversation: send message with current run settings INCLUDING model and system prompt
        console.log('📤 Sending to existing conversation - Model:', settings.model, 'Browser:', messageConfig.browserSearch);
        await sendMessage(
          messageToSend,
          typedAttachments,
          messageConfig,
          settings.model, // ✅ PASS MODEL
          settings.systemInstructions // ✅ PASS SYSTEM INSTRUCTIONS
        );
      }
    } catch (err: any) {
      console.error('❌ Error sending message:', err);
      setIsCreatingChat(false);
      // The error will be shown by the hook or we show it here
    }
  };

  const handleCopyConversation = async () => {
    if (!messages.length) return;

    const conversationText = uiMessages
      .map((msg) => {
        const role = msg.role === 'user' ? 'You' : 'AI';
        return `${role}:\n${msg.content}\n`;
      })
      .join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(conversationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy conversation:', err);
    }
  };

  const handleRetryMessage = async (messageContent: string) => {
    if (isRetrying || isSending || isStreaming) {
      console.log('⚠️ [ChatUI] Retry blocked - already processing');
      return;
    }
    
    console.log('🔄 [ChatUI] Retry initiated with message:', messageContent.substring(0, 50));
    
    setIsRetrying(true);
    try {
      await handleSendMessage(messageContent);
      console.log('✅ [ChatUI] Retry completed successfully');
    } catch (err) {
      console.error('❌ [ChatUI] Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#212121]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333537]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#333537] transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-[#e8eaed] text-lg font-semibold max-w-md truncate">
                {conversation?.title || 'New Chat'}
              </h1>
              <span className="text-xs px-2 py-0.5 bg-[#4285f4] text-white rounded-full font-medium">
                PRO
              </span>
            </div>
            {conversation && (
              <>
                <span className="text-[#5f6368]">•</span>
                <span className="text-xs text-[#9aa0a6] font-mono">
                  {conversation.model.split('/').pop() || conversation.model}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation && messages.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  onClick={handleCopyConversation}
                  className="flex items-center gap-2 hover:bg-[#333537] px-3"
                  aria-label="Copy conversation"
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy entire conversation</p>
              </TooltipContent>
            </Tooltip>
          )}
          {conversation && conversation.totalTokens > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2d2e30] rounded-lg hover:bg-[#333537] transition-colors cursor-help">
                  <Coins size={14} className="text-[#9aa0a6]" />
                  <span className="text-xs font-mono text-[#e8eaed]">
                    {conversation.totalTokens.toLocaleString()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <div className="font-semibold mb-2">Token Usage</div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#9aa0a6]">Total tokens:</span>
                    <span className="font-mono">{conversation.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#9aa0a6]">Messages:</span>
                    <span className="font-mono">{conversation.messageCount}</span>
                  </div>
                  <div className="text-[#9aa0a6] pt-1 border-t border-[#333537] mt-2">
                    Avg per message: {Math.round(conversation.totalTokens / conversation.messageCount)}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                onClick={() => setRunSettingsOpen(true)} 
                className="flex items-center gap-2 hover:bg-[#333537] relative"
                aria-label="Open settings"
              >
                <Settings size={16} />
                <span className="text-sm">Settings</span>
                {hasUnappliedChanges && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-[#212121]" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasUnappliedChanges ? (
                <div className="text-xs">
                  <div className="font-semibold mb-1">⚠️ Settings Changed</div>
                  <div className="text-[#9aa0a6]">
                    Your next message will use the new settings.<br />
                    The conversation config will be updated automatically.
                  </div>
                </div>
              ) : (
                <p>Configure run settings</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-900/20 border-b border-red-500/30 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3 text-red-300">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">Unable to connect</div>
              <div className="text-xs text-red-400 mt-0.5">{error}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={retryLastMessage}
              className="text-red-300 hover:text-red-200 hover:bg-red-900/30 text-xs px-3 py-1"
            >
              Retry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-300 hover:text-red-200 hover:bg-red-900/30 p-1"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(isLoading || isTransitioning) && messages.length === 0 && (
  <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-6 py-10">
    <div className="w-full max-w-3xl space-y-8">
      {[
        { delay: '0ms', text: 'Opening conversation...' },
        { delay: '400ms', text: 'Loading messages...' },
        { delay: '800ms', text: 'Almost there...' },
      ].map((item, idx) => (
        <div
          key={idx}
          className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: item.delay, animationDuration: '400ms' }}
        >
          {/* AI Avatar Pulse (matches AI bubble look) */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shadow-inner">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse" />
          </div>

          {/* AI Message Placeholder */}
          <div className="flex flex-col flex-1 space-y-3">
            <div className="h-4 bg-[#2d2e30] rounded-lg animate-pulse w-3/4" />
            <div className="h-4 bg-[#2d2e30] rounded-lg animate-pulse w-1/2" />
            <div className="h-4 bg-[#2d2e30] rounded-lg animate-pulse w-2/3" />
          </div>
        </div>
      ))}

      {/* Simulated User Bubble */}
      <div className="flex justify-end">
        <div className="max-w-lg bg-[#1e1f22] shadow-lg shadow-black/30 rounded-2xl p-4 animate-pulse">
          <div className="h-4 bg-[#2b2c2f] rounded w-3/4 mb-2" />
          <div className="h-4 bg-[#2b2c2f] rounded w-1/2" />
        </div>
      </div>
    </div>
  </div>
)}


      {/* Message List */}
      {(!isLoading && !isTransitioning) || messages.length > 0 ? (
        <MessageList 
          messages={uiMessages} 
          isLoading={isSending}
          isStreaming={isStreaming}
          isRetrying={isRetrying}
          onRetry={handleRetryMessage}
        />
      ) : null}

      {/* Chat Input */}
      <div className="w-full max-w-3xl mx-auto p-4">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={(attachments) => handleSendMessage(undefined, attachments)}
          disabled={isSending || isStreaming || isCreatingChat}
        />
        {(isSending || isStreaming || isCreatingChat) && (
          <div className="text-center text-xs text-[#9aa0a6] mt-2">
            {isCreatingChat ? 'Creating conversation...' : isStreaming ? 'AI is responding...' : 'Sending message...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatUI;
