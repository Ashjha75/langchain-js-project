'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'icon' | 'text';
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

const textSizes = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl', 
  xl: 'text-3xl'
};

export function Logo({ 
  size = 'md', 
  variant = 'default', 
  className = '', 
  showText = true 
}: LogoProps) {
  
  const LogoIcon = () => (
    <div className={cn(sizeClasses[size], 'relative')}>
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="#282a2c"/>
        
        {/* Dashed border */}
        <circle 
          cx="100" 
          cy="100" 
          r="85" 
          fill="none" 
          stroke="#4285f4" 
          strokeWidth="3"
          strokeDasharray="6,3"
          className="animate-pulse"
        />
        
        {/* Chat bubble */}
        <path 
          d="M 50 60 Q 50 40 70 40 L 130 40 Q 150 40 150 60 L 150 100 Q 150 120 130 120 L 80 120 L 60 140 L 70 120 Q 50 120 50 100 Z" 
          fill="#4285f4" 
          opacity="0.9"
        />
        
        {/* AI Text */}
        <g fill="white">
          {/* A */}
          <path 
            d="M 70 85 L 80 60 L 90 85 M 73 77 L 87 77" 
            stroke="white" 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* I */}
          <path 
            d="M 100 60 L 100 85 M 95 60 L 105 60 M 95 85 L 105 85" 
            stroke="white" 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round"
          />
        </g>
        
        {/* Decorative dots */}
        <circle cx="40" cy="50" r="3" fill="#34a853" opacity="0.7"/>
        <circle cx="160" cy="70" r="3" fill="#ea4335" opacity="0.7"/>
        <circle cx="45" cy="150" r="3" fill="#fbbc04" opacity="0.7"/>
        <circle cx="155" cy="140" r="3" fill="#4285f4" opacity="0.7"/>
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <span className={cn(
          'font-bold bg-gradient-to-r from-[#4285f4] to-[#34a853] bg-clip-text text-transparent',
          textSizes[size]
        )}>
          IntelliChat
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoIcon />
      {showText && (
        <span className={cn(
          'font-bold bg-gradient-to-r from-[#4285f4] to-[#34a853] bg-clip-text text-transparent',
          textSizes[size]
        )}>
          IntelliChat
        </span>
      )}
    </div>
  );
}