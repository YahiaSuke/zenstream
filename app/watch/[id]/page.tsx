'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function WatchPlayerPage() {
  const params = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 1);
      // Skip intro cue points check (e.g. 5s to 20s)
      setShowSkipIntro(video.currentTime >= 5 && video.currentTime <= 20);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 20;
      setShowSkipIntro(false);
    }
  };

  return (
    <div className="player-screen">
      <video
        ref={videoRef}
        autoPlay
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        className="player-video"
      />

      {showSkipIntro && (
        <button
          onClick={handleSkipIntro}
          className="skip-intro-btn"
        >
          Skip Intro
        </button>
      )}

      <div className="player-overlay">
        <div className="player-header">
          <Link href="/browse" className="btn btn-icon text-xl">
            ←
          </Link>
          <h2 className="text-lg font-bold text-white">Streaming Title</h2>
        </div>

        <div className="player-footer">
          <div className="scrub-bar-track">
            <div
              className="scrub-bar-progress"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="player-controls-row">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (videoRef.current?.paused) {
                    videoRef.current.play();
                    setIsPlaying(true);
                  } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                  }
                }}
                className="btn btn-icon text-lg"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="text-xs text-neutral-400 font-mono">
                {Math.floor(currentTime / 60)}:
                {String(Math.floor(currentTime % 60)).padStart(2, '0')} /{' '}
                {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
