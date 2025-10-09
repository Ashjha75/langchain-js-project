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
        <defs>
          {/* Animated gradient definitions */}
          <linearGradient id={`primaryGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}}>
              <animate attributeName="stop-color" 
                values="#667eea;#764ba2;#f093fb;#f5576c;#4facfe;#00f2fe;#667eea" 
                dur="4s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" style={{stopColor:'#764ba2', stopOpacity:1}}>
              <animate attributeName="stop-color" 
                values="#764ba2;#f093fb;#f5576c;#4facfe;#00f2fe;#667eea;#764ba2" 
                dur="4s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" style={{stopColor:'#f093fb', stopOpacity:1}}>
              <animate attributeName="stop-color" 
                values="#f093fb;#f5576c;#4facfe;#00f2fe;#667eea;#764ba2;#f093fb" 
                dur="4s" repeatCount="indefinite"/>
            </stop>
          </linearGradient>

          {/* Glow effect */}
          <radialGradient id={`glowGradient-${size}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:0.3}}/>
            <stop offset="70%" style={{stopColor:'#667eea', stopOpacity:0.1}}/>
            <stop offset="100%" style={{stopColor:'#000000', stopOpacity:0}}/>
          </radialGradient>

          {/* Shadow filter */}
          <filter id={`dropShadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="1" dy="2" result="offset"/>
            <feFlood floodColor="#000000" floodOpacity="0.25"/>
            <feComposite in2="offset" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Glow filter */}
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circle with animated gradient */}
        <circle 
          cx="100" 
          cy="100" 
          r="95" 
          fill={`url(#primaryGradient-${size})`} 
          filter={`url(#dropShadow-${size})`}
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="20s"
            repeatCount="indefinite"/>
        </circle>

        {/* Inner glow circle */}
        <circle 
          cx="100" 
          cy="100" 
          r="85" 
          fill={`url(#glowGradient-${size})`} 
          opacity="0.6"
        />

        {/* Main chat bubble with modern design */}
        <path 
          d="M 45 70 Q 45 45 70 45 L 130 45 Q 155 45 155 70 L 155 105 Q 155 130 130 130 L 85 130 L 65 150 L 75 130 Q 45 130 45 105 Z" 
          fill="rgba(255,255,255,0.95)" 
          filter={`url(#glow-${size})`}
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="1"
        >
          <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite"/>
        </path>

        {/* AI Text with professional typography */}
        <g filter={`url(#dropShadow-${size})`}>
          {/* Letter A */}
          <path 
            d="M 70 110 L 80 80 L 90 110 M 73 100 L 87 100" 
            stroke={`url(#primaryGradient-${size})`}
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate attributeName="stroke-width" values="6;8;6" dur="2s" repeatCount="indefinite"/>
          </path>
          
          {/* Letter I */}
          <path 
            d="M 105 80 L 105 110 M 100 80 L 110 80 M 100 110 L 110 110" 
            stroke={`url(#primaryGradient-${size})`}
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
          >
            <animate attributeName="stroke-width" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.5s"/>
          </path>
        </g>

        {/* Floating particles for modern effect */}
        <circle cx="60" cy="60" r="2" fill="#ffffff" opacity="0.7">
          <animate attributeName="cy" values="60;50;60" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="140" cy="65" r="1.5" fill="#ffffff" opacity="0.6">
          <animate attributeName="cy" values="65;55;65" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="50" cy="140" r="1.8" fill="#ffffff" opacity="0.5">
          <animate attributeName="cy" values="140;130;140" dur="3.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.5s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="150" cy="135" r="1.2" fill="#ffffff" opacity="0.8">
          <animate attributeName="cy" values="135;125;135" dur="2.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2.8s" repeatCount="indefinite"/>
        </circle>

        {/* Pulse ring effect */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1">
          <animate attributeName="r" values="90;100;90" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite"/>
        </circle>
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
        <span 
          className={cn(
            'font-bold bg-gradient-to-r from-[#667eea] via-[#764ba2] via-[#f093fb] via-[#f5576c] to-[#4facfe] bg-clip-text text-transparent',
            textSizes[size]
          )}
          style={{
            backgroundSize: '300% 100%',
            animation: 'gradientShift 4s ease-in-out infinite'
          }}
        >
          IntelliChat
        </span>
      )}
    </div>
  );
}