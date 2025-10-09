'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './types';
import { ChatMessage } from './ChatMessage';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
