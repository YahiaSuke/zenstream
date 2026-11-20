import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  variant?: 'floating' | 'search';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'floating',
  value,
  onChange,
  className = '',
  id,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const val = value !== undefined ? value : internalValue;
  const isFilled = String(val).length > 0;

  if (variant === 'search') {
    return (
      <div className={`relative flex items-center ${className}`}>
        <input
          id={inputId}
          type="text"
          value={val}
          onChange={(e) => {
            if (value === undefined) setInternalValue(e.target.value);
            onChange?.(e);
          }}
          placeholder={label}
          className="w-full h-9 pl-9 pr-8 text-sm text-white bg-black/75 border border-white/50 rounded-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-text-muted"
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      <div className="relative">
        <input
          id={inputId}
          value={val}
          onChange={(e) => {
            if (value === undefined) setInternalValue(e.target.value);
            onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-14 pt-4 px-4 text-base text-white bg-surface border rounded-sm outline-none transition-all placeholder-transparent ${
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-border-input'
          }`}
          placeholder={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute left-4 transition-all pointer-events-none ${
            isFocused || isFilled
              ? 'top-2 text-xs text-text-muted font-medium'
              : 'top-4 text-base text-text-muted'
          }`}
        >
          {label}
        </label>
      </div>
      {error && (
        <span id={`${inputId}-error`} className="mt-1.5 text-xs text-danger font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
