'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  variant?: 'default' | 'compact';
}

const thinkingMessages = [
  'Analyzing your request...',
  'Connecting the dots...',
  'Reviewing patterns...',
  'Gathering context...',
  'Evaluating insights...',
  'Crafting a precise response...',
  'Refining the answer...',
  'Finalizing thoughts...',
];

export function TypingIndicator({ variant = 'default' }: TypingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0);

 useEffect(() => {
  const interval = setInterval(() => {
    setMessageIndex((prev) => (prev + 1) % thinkingMessages.length);
  }, 2200 + Math.random() * 1000); // small randomness for realism
  return () => clearInterval(interval);
}, []);


  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-[#9aa0a6] text-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span className="animate-pulse">{thinkingMessages[messageIndex]}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start max-w-3xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Left Spacer (aligns with AI message bubble position) */}
      <div className="w-8 h-8 flex-shrink-0" />

      {/* Typing Section */}
      <div
        className={cn(
          'flex-1 bg-[#212121]/60 backdrop-blur-sm rounded-2xl border border-[#2a2a2a]',
          'p-4 shadow-sm shadow-black/20'
        )}
      >
        {/* Dots + Text */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce"
                style={{
                  animationDelay: `${i * 180}ms`,
                  animationDuration: '1.1s',
                }}
              />
            ))}
          </div>
          <span className="text-sm text-[#a9b0b8] font-medium animate-pulse tracking-wide">
            {thinkingMessages[messageIndex]}
          </span>
        </div>

        {/* Skeleton Lines (AI response forming effect) */}
        <div className="space-y-2">
          <div className="h-3.5 bg-gradient-to-r from-[#2d2e30] via-[#3a3b3d] to-[#2d2e30] rounded w-5/6 animate-pulse" />
          <div className="h-3.5 bg-gradient-to-r from-[#2d2e30] via-[#3a3b3d] to-[#2d2e30] rounded w-3/4 animate-pulse delay-150" />
          <div className="h-3.5 bg-gradient-to-r from-[#2d2e30] via-[#3a3b3d] to-[#2d2e30] rounded w-4/5 animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
}
