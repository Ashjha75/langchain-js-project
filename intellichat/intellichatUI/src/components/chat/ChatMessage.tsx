'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Copy, Check } from 'lucide-react';
import { Message } from './types';
import { cn } from '@/lib/utils';
import { CodeBlock } from './CodeBlock';
import { Logo } from '@/components/ui/Logo';
import 'katex/dist/katex.min.css';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
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

  const markdownComponents = {
    // Enhanced code block rendering
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      // Debug logging
      console.log('🔍 Code block debug:', {
        inline,
        className,
        childrenType: typeof children,
        isArray: Array.isArray(children),
        children: children,
        match: match ? match[1] : null
      });
      
      // Convert children to string safely - handle all cases
      let codeString = '';
      if (Array.isArray(children)) {
        codeString = children.map(child => {
          if (typeof child === 'string') return child;
          if (child?.props?.children) return child.props.children;
          return String(child);
        }).join('');
      } else if (typeof children === 'string') {
        codeString = children;
      } else if (children?.props?.children) {
        codeString = String(children.props.children);
      } else {
        codeString = String(children || '');
      }
      
      
      if (!inline && match && match[1]) {
        return (
          <div className="my-4">
            <CodeBlock
              language={match[1]}
              value={codeString.replace(/\n$/, '')}
            />
          </div>
        );
      }
      return (
        <code className="bg-[#2d2d2d] text-[#e8eaed] px-2 py-1 rounded-md text-sm font-mono border border-[#3c4043]">
          {codeString}
        </code>
      );
    },
    
    // Enhanced paragraph styling
    p({ children }: any) {
      return (
        <p className="mb-4 leading-7 text-[#e8eaed] last:mb-0">
          {children}
        </p>
      );
    },
    
    // Enhanced heading styles
    h1({ children }: any) {
      return (
        <h1 className="text-2xl font-bold mb-4 text-[#e8eaed] border-b border-[#3c4043] pb-2">
          {children}
        </h1>
      );
    },
    h2({ children }: any) {
      return (
        <h2 className="text-xl font-semibold mb-3 text-[#e8eaed] mt-6">
          {children}
        </h2>
      );
    },
    h3({ children }: any) {
      return (
        <h3 className="text-lg font-semibold mb-2 text-[#e8eaed] mt-4">
          {children}
        </h3>
      );
    },
    
    // Enhanced list styling
    ul({ children }: any) {
      return (
        <ul className="list-disc list-inside mb-4 space-y-2 text-[#e8eaed] ml-4">
          {children}
        </ul>
      );
    },
    ol({ children }: any) {
      return (
        <ol className="list-decimal list-inside mb-4 space-y-2 text-[#e8eaed] ml-4">
          {children}
        </ol>
      );
    },
    li({ children }: any) {
      return (
        <li className="leading-7">
          {children}
        </li>
      );
    },
    
    // Enhanced blockquote
    blockquote({ children }: any) {
      return (
        <blockquote className="border-l-4 border-[#4285f4] pl-4 my-4 italic text-[#bdc1c6] bg-[#1e1e1e] p-3 rounded-r-lg">
          {children}
        </blockquote>
      );
    },
    
    // Enhanced table styling
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse border border-[#3c4043] rounded-lg">
            {children}
          </table>
        </div>
      );
    },
    th({ children }: any) {
      return (
        <th className="border border-[#3c4043] bg-[#2d2d2d] px-4 py-2 text-left font-semibold text-[#e8eaed]">
          {children}
        </th>
      );
    },
    td({ children }: any) {
      return (
        <td className="border border-[#3c4043] px-4 py-2 text-[#e8eaed]">
          {children}
        </td>
      );
    },
    
    // Enhanced link styling
    a({ href, children }: any) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#8ab4f8] hover:text-[#aecbfa] underline underline-offset-2 transition-colors"
        >
          {children}
        </a>
      );
    },
    
    // Enhanced strong/bold
    strong({ children }: any) {
      return (
        <strong className="font-semibold text-[#f8f9fa]">
          {children}
        </strong>
      );
    },
    
    // Enhanced emphasis/italic
    em({ children }: any) {
      return (
        <em className="italic text-[#e8eaed]">
          {children}
        </em>
      );
    },
  };

  return (
    <div className={cn('flex items-start gap-4 mb-6 group relative', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0">
          <Logo size="sm" variant="icon" />
        </div>
      )}
      <div
        className={cn(
          'relative p-4 rounded-2xl max-w-4xl shadow-lg transition-all duration-200 hover:shadow-xl',
          isUser
            ? 'bg-[#2d2d2d] rounded-br-none border border-[#3c4043]'
            : 'bg-[#1e1e1e] rounded-bl-none border border-[#3c4043]'
        )}
      >
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100',
            'bg-[#3c4043] hover:bg-[#4c5053] text-[#e8eaed]',
            copied && 'opacity-100 bg-green-600 hover:bg-green-700'
          )}
          aria-label="Copy message"
          title={copied ? 'Copied!' : 'Copy message'}
        >
          {copied ? (
            <Check size={14} className="text-white" />
          ) : (
            <Copy size={14} />
          )}
        </button>

        <article className="prose prose-invert prose-sm max-w-none overflow-hidden">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]} 
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={markdownComponents}
            className="markdown-content"
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#db4437] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-lg">
          U
        </div>
      )}
    </div>
  );
}
