import React from 'react';

export interface BadgeProps {
  label: string;
  variant?: 'rating' | 'quality' | 'rank';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'rating',
  className = '',
}) => {
  if (variant === 'rank') {
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-black tracking-wider uppercase text-white bg-accent rounded-sm shadow-subtle ${className}`}
      >
        TOP 10
      </span>
    );
  }

  if (variant === 'quality') {
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-text-muted border border-border-input/70 rounded-xs uppercase ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-xs font-semibold text-text border border-border-input rounded-xs ${className}`}
    >
      {label}
    </span>
  );
};
