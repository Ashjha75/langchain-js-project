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
import { Logo } from '@/components/ui/Logo';
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
  onRetry: () => void;
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const { role, content } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleRetry = () => {
    onRetry();
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-[#2d2d2d] text-[#e8eaed] px-2 py-1 rounded-md text-sm font-mono border border-[#3c4043]">
          {children}
        </code>
      );
    },
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4 text-[#ececec] border-b border-[#444] pb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-semibold mb-3 text-[#ececec] mt-6">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-semibold mb-2 text-[#e8eaed] mt-4">{children}</h3>,
    p: ({ children }: any) => <p className="mb-4 leading-7 text-[#e8eaed] last:mb-0">{children}</p>,
    a: ({ href, children }: any) => <a href={href} className="text-[#8ab4f8] underline" target="_blank" rel="noopener noreferrer">{children}</a>,
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-2 text-[#e8eaed] ml-4">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-2 text-[#e8eaed] ml-4">{children}</ol>,
    li: ({ children }: any) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }: any) => <blockquote className="border-l-4 border-[#4285f4] pl-4 my-4 italic text-[#bdc1c6] bg-[#1e1e1e] p-3 rounded-r-lg">{children}</blockquote>,
    table: ({ children }: any) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-[#3c4043] rounded-lg">{children}</table></div>,
    th: ({ children }: any) => <th className="border border-[#3c4043] bg-[#2d2d2d] px-4 py-2 text-left font-semibold text-[#e8eaed]">{children}</th>,
    td: ({ children }: any) => <td className="border border-[#3c4043] px-4 py-2 text-[#e8eaed]">{children}</td>,
    strong: ({ children }: any) => <strong className="font-semibold text-[#f8f9fa]">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-[#e8eaed]">{children}</em>,
    pre: ({ children }: any) => <pre className="bg-[#1e1e1e] border border-[#444] rounded-lg p-4 overflow-x-auto">{children}</pre>,
  };

  return (
    <div className={cn('flex items-start gap-4 mb-6 group relative', isUser ? 'justify-end' : 'justify-start')}>
      {/* {!isUser && (
        <div className="flex-shrink-0">
          <Logo size="sm" variant="icon" />
        </div>
      )} */}
      <div
        className={cn(
          'relative p-4 rounded-2xl max-w-4xl shadow-lg transition-all duration-200 hover:shadow-xl',
          isUser
            ? 'bg-[#2d2d2d] rounded-br-none'
            : 'bg-[#1e1e1e] rounded-bl-none'
        )}
      >
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <TooltipProvider>
            {isUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRetry}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  >
                    <RefreshCw size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Retry</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <article className="prose prose-invert prose-sm max-w-none overflow-hidden pt-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
      {/* {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#db4437] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-lg">
          U
        </div>
      )} */}
    </div>
  );
}
