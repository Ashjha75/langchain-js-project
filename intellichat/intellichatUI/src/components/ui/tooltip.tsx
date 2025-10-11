'use client';

import { FC, ReactNode, useState, useRef, useEffect } from 'react';

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

export const SimpleTooltip: FC<SimpleTooltipProps> = ({ content, children, side = 'right', sideOffset = 8 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({});

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const newPosition: React.CSSProperties = {};

      if (rect.right > window.innerWidth) {
        newPosition.right = 0;
      }
      if (rect.left < 0) {
        newPosition.left = 0;
      }
      if (rect.bottom > window.innerHeight) {
        newPosition.bottom = '100%';
      }
      if (rect.top < 0) {
        newPosition.top = 0;
      }
      setPosition(newPosition);
    }
  }, [isVisible]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 pointer-events-none rounded-md px-3 py-1.5 text-xs bg-[#000] text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] ${
            side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' :
            side === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' :
            side === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
            'left-full top-1/2 -translate-y-1/2 ml-2'
          }`}
          style={{
            ...position,
            [side === 'left' ? 'marginRight' : 'marginLeft']: `${sideOffset}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default TooltipProvider;
