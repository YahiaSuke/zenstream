import React from 'react';

export interface TitleCardProps {
  title: string;
  thumbnailUrl: string;
  matchScore?: number;
  maturityRating?: string;
  durationOrSeasons?: string;
  progressPercent?: number;
  rankNumber?: number;
  onClick?: () => void;
  onPlay?: () => void;
  onAddToList?: () => void;
}

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  thumbnailUrl,
  matchScore = 96,
  maturityRating = '16+',
  durationOrSeasons = '2 Seasons',
  progressPercent,
  rankNumber,
  onClick,
  onPlay,
  onAddToList,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex-none w-52 sm:w-64 aspect-video rounded-sm overflow-hidden bg-surface cursor-pointer select-none transition-transform duration-base hover:scale-105 hover:z-20 shadow-card"
    >
      <img
        src={thumbnailUrl}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover"
      />

      {rankNumber && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-accent text-white font-black text-xs rounded-sm shadow-subtle">
          #{rankNumber}
        </div>
      )}

      {/* Continue watching progress bar */}
      {progressPercent !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-elevated">
          <div
            className="h-full bg-accent transition-all duration-base"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}

      {/* Quick hover action overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-fast flex flex-col justify-end p-3">
        <h4 className="text-sm font-bold text-white truncate">{title}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="text-success font-bold">{matchScore}% Match</span>
          <span className="text-text-muted border border-border-input/60 px-1 py-0.2 rounded-xs text-[10px]">
            {maturityRating}
          </span>
          <span className="text-text-muted">{durationOrSeasons}</span>
        </div>
      </div>
    </div>
  );
};
