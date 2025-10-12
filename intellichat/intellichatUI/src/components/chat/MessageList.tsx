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
  onRetry: () => void;
}

export function MessageList({ messages, isLoading = false, isStreaming = false, onRetry }: MessageListProps) {
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
      setShowGoToBottom(!isAtBottom);
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
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-8 relative">
      <div className="max-w-3xl mx-auto space-y-6 pb-6">
        {sortedMessages.map((message) => (
          <ChatMessage key={message.id} message={message} onRetry={onRetry} />
        ))}
        {showTypingIndicator && <TypingIndicator />}
      </div>
      {showGoToBottom && (
        <div className="absolute bottom-10 right-10">
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
