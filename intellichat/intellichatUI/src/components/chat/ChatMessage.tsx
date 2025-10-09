'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from './types';
import { cn } from '@/lib/utils';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content } = message;
  const isUser = role === 'user';

  const renderers = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match) {
        return (
          <CodeBlock
            language={match[1]}
            value={String(children).replace(/\n$/, '')}
            {...props}
          />
        );
      }
      return (
        <code className="bg-[#333537] text-[#e8eaed] px-1.5 py-0.5 rounded-md text-sm">
          {children}
        </code>
      );
    },
  };

  return (
    <div className={cn('flex items-start gap-4 mb-6', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#4285f4] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          IC
        </div>
      )}
      <div
        className={cn(
          'p-4 rounded-2xl max-w-2xl',
          isUser
            ? 'bg-[#333537] rounded-br-none'
            : 'bg-[#282a2c] rounded-bl-none'
        )}
      >
        <article className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#4285f4] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          A
        </div>
      )}
    </div>
  );
}
