import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'icon' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-fast select-none outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-sm',
    md: 'h-10 px-4 text-sm gap-2 rounded-sm',
    lg: 'h-12 px-6 text-md gap-3 rounded-sm',
  };

  const iconSizeStyles = {
    sm: 'h-8 w-8 rounded-full p-1',
    md: 'h-10 w-10 rounded-full p-2',
    lg: 'h-12 w-12 rounded-full p-2.5',
  };

  const variantStyles = {
    primary:
      'bg-white text-bg hover:bg-neutral-200 active:scale-98 shadow-subtle',
    secondary:
      'bg-neutral-600/70 text-white hover:bg-neutral-600/90 active:scale-98 backdrop-blur-sm',
    accent:
      'bg-accent text-on-accent hover:bg-accent-hover active:scale-98 shadow-card',
    ghost:
      'bg-transparent text-white hover:bg-surface-elevated active:bg-surface',
    icon:
      'bg-surface/60 text-white border border-border-input hover:border-white hover:bg-surface active:scale-95 backdrop-blur-md',
    danger:
      'bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 active:scale-98',
  };

  const currentSize = variant === 'icon' ? iconSizeStyles[size] : sizeStyles[size];

  return (
    <button
      className={`${baseStyles} ${currentSize} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
};
