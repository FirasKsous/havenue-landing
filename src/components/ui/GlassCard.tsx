import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  noBlur?: boolean;
  style?: React.CSSProperties;
}

export function GlassCard({ children, className, hoverEffect = true, noBlur = false, style }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white/[0.03] border border-white/10 rounded-lg',
        !noBlur && 'backdrop-blur-sm',
        hoverEffect && 'transition-colors duration-300 hover:bg-white/[0.05] hover:border-white/20',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
