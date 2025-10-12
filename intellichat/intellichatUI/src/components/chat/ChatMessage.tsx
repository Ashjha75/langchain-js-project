'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Message } from './types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import 'katex/dist/katex.min.css';

interface ChatMessageProps {
  message: Message;
  isLoading: boolean;
  onRetry?: () => void;
}

export function ChatMessage({ message, isLoading, onRetry }: ChatMessageProps) {
  const { role, content } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [codeCopied, setCodeCopied] = useState<{ [key: number]: boolean }>({});

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleRetry = async () => {
    if (!onRetry) return;
    try {
      setRetrying(true);
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const handleCodeCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied({ ...codeCopied, [index]: true });
      setTimeout(() => {
        const newState = { ...codeCopied };
        delete newState[index];
        setCodeCopied(newState);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      const lang = match ? match[1] : 'text';
      const codeIndex = node?.position?.start?.line || 0;

      return !inline && match ? (
        <div className="relative group my-4 rounded-lg bg-[#171717] overflow-hidden">
          {/* Top Label */}
          <div className=" bg-[#0d0e0e] height-[1rem]">
            <div className="absolute  top-2 left-3 text-xs text-gray-400 uppercase tracking-wider  text-blue-300 mb-1 pb-2">
              {lang}
            </div>

            {/* Copy Button */}
            <div className="absolute top-2 right-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCodeCopy(codeString, codeIndex)}
                      className="h-7 w-7 bg-transparent hover:bg-[#2d2d2d] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {codeCopied[codeIndex] ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} className="text-gray-300" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{codeCopied[codeIndex] ? 'Copied!' : 'Copy code'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <SyntaxHighlighter
            style={tomorrow}
            language={lang}
            PreTag="div"
            wrapLongLines
            customStyle={{
              background: '#0d0e0e',
              padding: '1.25rem',
              margin: 0,
              fontSize: '0.9rem',
              borderRadius: 0,
              lineHeight: 1.6,
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-[#2d2d2d] text-[#e8eaed] px-2 py-1 rounded-md text-sm font-mono">
          {children}
        </code>
      );
    },

    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full text-sm border-collapse border border-transparent">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-[#2d2d2d] bg-[#202124] px-4 py-2 text-left font-semibold text-[#e8eaed]">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-[#2d2d2d] px-4 py-2 text-[#e8eaed]">
        {children}
      </td>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#4285f4] pl-4 my-4 italic text-[#bdc1c6]">
        {children}
      </blockquote>
    ),
    p: ({ children }: any) => (
      <p className="leading-7 text-[#e8eaed] mb-4 last:mb-0">{children}</p>
    ),
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-6 transition-all duration-200',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-3xl w-full transition-all duration-300 rounded-2xl p-4 relative',
          isUser
            ? 'bg-[#303030] shadow-sm shadow-black/30 text-left w-[69%]'
            : 'bg-transparent text-left'
        )}
      >
        {/* Markdown Rendering */}
        <article className="prose prose-invert prose-sm max-w-none leading-relaxed tracking-wide font-[Inter] bg-transparent">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </article>

        {/* Copy & Retry Buttons */}
        <div
          className={cn(
            'mt-3 flex gap-2 opacity-0 hover:opacity-100 transition-opacity',
            isUser ? 'justify-end' : 'justify-end'
          )}
        >
          {/* Copy */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-7 w-7 bg-transparent hover:bg-[#2d2d2d]"
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy text'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Retry (AI only) */}
          {!isUser && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={retrying}
                    onClick={handleRetry}
                    className="h-7 w-7 bg-transparent hover:bg-[#2d2d2d]"
                  >
                    {retrying ? (
                      <RefreshCw size={14} className="animate-spin text-blue-400" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{retrying ? 'Retrying...' : 'Retry response'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
