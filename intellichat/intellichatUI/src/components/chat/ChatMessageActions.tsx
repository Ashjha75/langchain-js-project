'use client';

import React, { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatMessageActionsProps {
  isUser: boolean;
  content: string;
  onRetry: () => void;
}

export function ChatMessageActions({ isUser, content, onRetry }: ChatMessageActionsProps) {
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

  return (
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
  );
}
