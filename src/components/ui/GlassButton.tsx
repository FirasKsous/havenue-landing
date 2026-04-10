import React from 'react';
import { cn } from '../../lib/utils';

interface GlassButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function GlassButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  disabled = false,
}: GlassButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[#2F8F4E]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]',
    variant === 'primary' && [
      'relative bg-[#2F8F4E] text-[#0A0A0A] font-semibold',
      'shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),0_0_30px_rgba(47,143,78,0.35),0_0_60px_rgba(47,143,78,0.12)]',
      'hover:bg-[#36A458] hover:-translate-y-[2px]',
      'hover:shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2),0_0_44px_rgba(47,143,78,0.55),0_0_80px_rgba(47,143,78,0.18)]',
      'active:translate-y-0 active:scale-[0.98]',
      'transition-[transform,box-shadow,background-color] duration-200 ease-out',
    ],
    variant === 'secondary' && [
      'bg-white/[0.06] text-white border border-white/15 backdrop-blur-sm',
      'hover:bg-white/[0.1] hover:border-[#2F8F4E]/40 hover:-translate-y-px',
      'hover:shadow-[0_6px_20px_rgba(0,0,0,0.35),0_0_24px_rgba(47,143,78,0.25)]',
      'active:translate-y-0 active:scale-[0.98]',
      'transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out',
    ],
    variant === 'ghost' && [
      'bg-transparent text-white border border-white/20',
      'hover:bg-white/5 hover:border-white/30',
      'active:scale-[0.98]',
    ],
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClasses}>
      {children}
    </button>
  );
}
