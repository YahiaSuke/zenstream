import React from 'react';

export interface ProfileAvatarProps {
  name: string;
  avatarUrl: string;
  size?: 'sm' | 'md' | 'lg';
  isKid?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  isKid = false,
  isEditing = false,
  onClick,
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 rounded-sm',
    md: 'w-24 h-24 sm:w-28 sm:h-28 rounded-md',
    lg: 'w-32 h-32 sm:w-36 sm:h-36 rounded-md',
  };

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
  };

  return (
    <div
      onClick={onClick}
      className="group flex flex-col items-center gap-2.5 cursor-pointer select-none transition-all duration-fast"
    >
      <div
        className={`relative overflow-hidden border-2 border-transparent group-hover:border-white transition-all duration-fast ${sizeStyles[size]}`}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        {isKid && (
          <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[9px] font-black uppercase tracking-wider bg-accent text-white rounded-xs">
            KIDS
          </span>
        )}
        {isEditing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
            <span className="text-lg">✎</span>
          </div>
        )}
      </div>
      <span
        className={`font-medium text-text-muted group-hover:text-white transition-colors duration-fast ${fontSizes[size]}`}
      >
        {name}
      </span>
    </div>
  );
};
