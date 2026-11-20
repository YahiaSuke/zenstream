import React, { useState, useRef } from 'react';
import { Button } from './Button';

export interface VideoPlayerProps {
  title: string;
  videoSrc: string;
  introStartSec?: number;
  introEndSec?: number;
  onBack?: () => void;
  onNextEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  videoSrc,
  introStartSec,
  introEndSec,
  onBack,
  onNextEpisode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const showSkipIntro =
    introStartSec !== undefined &&
    introEndSec !== undefined &&
    currentTime >= introStartSec &&
    currentTime <= introEndSec;

  const handleSkipIntro = () => {
    if (videoRef.current && introEndSec) {
      videoRef.current.currentTime = introEndSec;
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
      onMouseMove={() => setIsControlsVisible(true)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
          }
        }}
        onClick={togglePlay}
      />

      {/* Top Header Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4 transition-opacity duration-base ${
          isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <h2 className="text-lg font-bold text-white truncate">{title}</h2>
      </div>

      {/* Skip Intro Overlay Button */}
      {showSkipIntro && (
        <div className="absolute bottom-28 right-8 z-30 animate-in fade-in">
          <Button
            variant="secondary"
            size="md"
            onClick={handleSkipIntro}
            className="border border-white/60 text-white font-bold tracking-wider uppercase text-xs px-5 py-2.5"
          >
            Skip Intro
          </Button>
        </div>
      )}

      {/* Bottom Transport Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-3 transition-opacity duration-base ${
          isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrub Bar */}
        <div className="relative w-full h-1.5 bg-neutral-600 rounded-full cursor-pointer group">
          <div
            className="h-full bg-accent rounded-full relative"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={togglePlay}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => skipSeconds(-10)}>
              ↺ 10s
            </Button>
            <Button variant="ghost" size="sm" onClick={() => skipSeconds(10)}>
              ↻ 10s
            </Button>
            <span className="text-xs text-text-muted font-mono">
              {Math.floor(currentTime / 60)}:
              {String(Math.floor(currentTime % 60)).padStart(2, '0')} /{' '}
              {Math.floor(duration / 60)}:
              {String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onNextEpisode && (
              <Button variant="ghost" size="sm" onClick={onNextEpisode}>
                Next Episode ⏭
              </Button>
            )}
            <Button variant="ghost" size="sm">
              Subtitles
            </Button>
            <Button variant="ghost" size="sm">
              ⛶ Fullscreen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
