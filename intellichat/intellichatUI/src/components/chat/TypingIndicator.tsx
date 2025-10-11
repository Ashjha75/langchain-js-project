'use client';

import React, { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';

interface TypingIndicatorProps {
  variant?: 'default' | 'compact';
}

const thinkingMessages = [
  'Thinking...',
  'Analyzing...',
  'Processing...',
  'Understanding...',
  'Formulating response...',
  'Searching knowledge...',
];

export function TypingIndicator({ variant = 'default' }: TypingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % thinkingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-[#9aa0a6] text-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#9aa0a6] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#9aa0a6] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#9aa0a6] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="animate-pulse">{thinkingMessages[messageIndex]}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start max-w-3xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
        <Logo size="sm" showText={false} />
      </div>

      {/* Typing Animation */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce" 
              style={{ animationDelay: '0ms', animationDuration: '1s' }} 
            />
            <span 
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce" 
              style={{ animationDelay: '150ms', animationDuration: '1s' }} 
            />
            <span 
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce" 
              style={{ animationDelay: '300ms', animationDuration: '1s' }} 
            />
          </div>
          <span className="text-sm text-[#9aa0a6] font-medium animate-pulse transition-all duration-500">
            {thinkingMessages[messageIndex]}
          </span>
        </div>
        
        {/* Skeleton loader for content */}
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-[#2d2e30] rounded w-3/4" />
          <div className="h-3 bg-[#2d2e30] rounded w-5/6" />
          <div className="h-3 bg-[#2d2e30] rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
