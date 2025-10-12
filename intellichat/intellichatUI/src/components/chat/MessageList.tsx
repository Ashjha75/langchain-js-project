'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Message } from './types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  isRetrying?: boolean;
  onRetry?: (messageContent: string) => void;
}

export function MessageList({ messages, isLoading = false, isStreaming = false, isRetrying = false, onRetry }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showGoToBottom, setShowGoToBottom] = useState(false);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
      setShowGoToBottom(!isAtBottom && !isLoading && !isStreaming);
    }
  };

  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    currentScrollRef?.addEventListener('scroll', handleScroll);
    return () => {
      currentScrollRef?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const showTypingIndicator = (isLoading || isStreaming) && messages.length > 0;

  const sortedMessages = [...messages].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="flex-1 relative">
      <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 pb-8">
        <div className="max-w-3xl mx-auto space-y-6 pb-6">
          {sortedMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              {...(onRetry && { onRetry })}
              isLoading={isLoading || isStreaming}
              isRetrying={isRetrying}
            />
          ))}
          {showTypingIndicator && <TypingIndicator />}
        </div>
      </div>
      {showGoToBottom && (
        <div className="absolute bottom-10 right-10 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollToBottom}
                  className="rounded-full"
                >
                  <ArrowDown size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to bottom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
