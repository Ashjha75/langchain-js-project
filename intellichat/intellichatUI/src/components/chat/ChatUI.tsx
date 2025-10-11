'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Settings, X, AlertCircle, Coins } from 'lucide-react';
import { ChatInput } from '../homepage/ChatInput';
import { MessageList } from './MessageList';
import { Message } from './types';
import { Button } from '../ui/button';
import { SimpleTooltip } from '../ui/tooltip';
import { useChat } from '@/hooks/useChat';
import { useRouter } from 'next/navigation';
import chatAPI from '@/lib/chat-api';

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
  const router = useRouter();

  // Validate conversation ID - must be a valid MongoDB ObjectId (24 hex chars)
  const isValidConversationId = conversationId && /^[0-9a-fA-F]{24}$/.test(conversationId);

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

  // Convert backend messages to UI format (filter out system messages)
  const uiMessages: Message[] = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      id: msg._id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

  // Handle initial message (from homepage)
  useEffect(() => {
    if (initialMessage && !isValidConversationId) {
      // Create new chat with the initial message
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, isValidConversationId]);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim() || isCreatingChat) return;

    setInput('');

    try {
      if (!isValidConversationId) {
        // First message: create conversation and send message in one API call
        setIsCreatingChat(true);
        const defaultModel = process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'openai/gpt-oss-120b';
        
        try {
          const result = await chatAPI.sendNewChat({
            content: messageToSend,
            model: defaultModel,
            config: {
              temperature: 0.7,
              maxTokens: 4096,
              stream: false, // For first message, use non-streaming to ensure creation
            },
          });
          
          console.log('Conversation created:', result.conversation._id);
          
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
        // Existing conversation: just send message with streaming
        await sendMessage(messageToSend);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setIsCreatingChat(false);
      // The error will be shown by the hook or we show it here
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1b1c1d]">
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
          {conversation && conversation.totalTokens > 0 && (
            <SimpleTooltip content={
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
            }>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2d2e30] rounded-lg hover:bg-[#333537] transition-colors cursor-help">
                <Coins size={14} className="text-[#9aa0a6]" />
                <span className="text-xs font-mono text-[#e8eaed]">
                  {conversation.totalTokens.toLocaleString()}
                </span>
              </div>
            </SimpleTooltip>
          )}
          <Button 
            variant="ghost" 
            onClick={() => setRunSettingsOpen(true)} 
            className="flex items-center gap-2 hover:bg-[#333537]"
            aria-label="Open settings"
          >
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </Button>
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
        <div className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto">
          {/* Animated Loading Messages */}
          {[
            { delay: '0ms', text: 'Opening conversation...' },
            { delay: '400ms', text: 'Loading messages...' },
            { delay: '800ms', text: 'Almost there...' }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="flex gap-3 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: item.delay, animationDuration: '400ms' }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#2d2e30] rounded animate-pulse w-32" />
                <div className="h-3 bg-[#2d2e30] rounded animate-pulse w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message List */}
      {(!isLoading && !isTransitioning) || messages.length > 0 ? (
        <MessageList messages={uiMessages} />
      ) : null}

      {/* Chat Input */}
      <div className="w-full max-w-3xl mx-auto p-4">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={() => handleSendMessage()}
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