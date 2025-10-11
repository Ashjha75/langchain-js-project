'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
}

export function MessageList({ messages, isLoading = false, isStreaming = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isStreaming]);

  const showTypingIndicator = (isLoading || isStreaming) && messages.length > 0;

  const sortedMessages = [...messages].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-8">
      <div className="max-w-3xl mx-auto space-y-6 pb-6">
        {sortedMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {showTypingIndicator && <TypingIndicator />}
      </div>
    </div>
  );
}
