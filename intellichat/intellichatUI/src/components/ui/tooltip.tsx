'use client';

import { FC, ReactNode } from 'react';

interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export const TooltipProvider: FC<TooltipProviderProps> = ({ 
  children, 
  delayDuration = 300 
}) => {
  return <div>{children}</div>;
};

interface TooltipProps {
  children: ReactNode;
  content?: string;
}

export const Tooltip: FC<TooltipProps> = ({ children, content }) => {
  return <div title={content}>{children}</div>;
};

export default TooltipProvider;