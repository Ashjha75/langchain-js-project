'use client';

import { FC, ReactNode, useState } from 'react';

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
}

export const Tooltip: FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};

interface TooltipTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export const TooltipTrigger: FC<TooltipTriggerProps> = ({ children }) => {
  return <>{children}</>;
};

interface TooltipContentProps {
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const TooltipContent: FC<TooltipContentProps> = ({ children, side = 'bottom', className = '' }) => {
  return (
    <div 
      className={`absolute z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white animate-in fade-in-0 zoom-in-95 ${className}`}
      style={{
        [side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : side === 'left' ? 'right' : 'left']: '100%',
        marginTop: side === 'bottom' ? '0.5rem' : '0',
        marginBottom: side === 'top' ? '0.5rem' : '0',
      }}
    >
      {children}
    </div>
  );
};

// Simple Tooltip wrapper with hover
interface SimpleTooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

export const SimpleTooltip: FC<SimpleTooltipProps> = ({ content, children, side = 'bottom', sideOffset = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-50 pointer-events-none rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg ${
            side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' :
            side === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' :
            side === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
            'left-full top-1/2 -translate-y-1/2 ml-2'
          }`}
          style={{
            [side === 'left' ? 'marginRight' : 'marginLeft']: `${sideOffset}px`,
          }}
        >
          {content}
          <div 
            className={`absolute w-0 h-0 ${
              side === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900' :
              side === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900' :
              side === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900' :
              'right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default TooltipProvider;
