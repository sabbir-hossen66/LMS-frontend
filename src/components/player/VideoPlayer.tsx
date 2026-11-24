'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  Tv,
  PictureInPicture,
  Loader2,
  AlertCircle,
  SkipForward,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { User } from '@/types';

interface VideoPlayerProps {
  videoId: string;
  streamUrl: string;
  title: string;
  duration?: number;
  initialTime?: number;
  user?: User | null;
  onTimeUpdate?: (currentTime: number, watchedSeconds: number) => void;
  onEnded?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  nextLessonTitle?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoPlayer({
  videoId,
  streamUrl,
  title,
  duration = 0,
  initialTime = 0,
  user,
  onTimeUpdate,
  onEnded,
  onNext,
  hasNext = false,
  nextLessonTitle,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Player States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(duration);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<string | null>(null);

  // Hover Seek Tooltip
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  // Double-tap skip indicator
  const [skipIndicator, setSkipIndicator] = useState<{
    type: 'left' | 'right';
    id: number;
    amount: number;
  } | null>(null);

  // Autoplay Countdown
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);

  // Watermark coordinates (subtle drifting)
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });

  // 1. Load saved preferences from LocalStorage
  useEffect(() => {
    const savedVol = localStorage.getItem('lms_player_volume');
    if (savedVol !== null) {
      const v = parseFloat(savedVol);
      setVolume(v);
      if (videoRef.current) videoRef.current.volume = v;
    }

    const savedSpeed = localStorage.getItem('lms_player_speed');
    if (savedSpeed !== null) {
      const s = parseFloat(savedSpeed);
      setPlaybackSpeed(s);
      if (videoRef.current) videoRef.current.playbackRate = s;
    }

    // Check last watched position for this video
    const savedPos = localStorage.getItem(`lms_video_pos_${videoId}`);
    if (savedPos !== null && !initialTime) {
      const p = parseFloat(savedPos);
      if (p > 5 && videoRef.current) {
        videoRef.current.currentTime = p;
        setCurrentTime(p);
      }
    }
  }, [videoId, initialTime]);

  // Periodic slow drift for piracy watermark
  useEffect(() => {
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 65) + 12;
      const left = Math.floor(Math.random() * 60) + 10;
      setWatermarkPos({ top, left });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Controls auto-hide
  const triggerControlsActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => {
        console.warn('Playback error', err);
      });
      setIsPlaying(true);
      setAutoplayCountdown(null);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    triggerControlsActivity();
  }, [triggerControlsActivity]);

  // Skip time
  const skip = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      const targetTime = Math.min(
        Math.max(videoRef.current.currentTime + seconds, 0),
        videoDuration,
      );
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);

      setSkipIndicator({
        type: seconds > 0 ? 'right' : 'left',
        id: Date.now(),
        amount: Math.abs(seconds),
      });
      setTimeout(() => setSkipIndicator(null), 600);
      triggerControlsActivity();
    },
    [videoDuration, triggerControlsActivity],
  );

  // Jump to percentage (keys 0-9)
  const jumpToPercent = useCallback(
    (percent: number) => {
      if (!videoRef.current || !videoDuration) return;
      const target = (percent / 100) * videoDuration;
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      triggerControlsActivity();
    },
    [videoDuration, triggerControlsActivity],
  );

  // Volume Change
  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    if (videoRef.current) {
      videoRef.current.volume = clamped;
      videoRef.current.muted = clamped === 0;
    }
    localStorage.setItem('lms_player_volume', clamped.toString());
    triggerControlsActivity();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      const v = volume === 0 ? 0.8 : volume;
      videoRef.current.muted = false;
      videoRef.current.volume = v;
      setIsMuted(false);
      setVolume(v);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
    triggerControlsActivity();
  };

  // Speed Change
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    localStorage.setItem('lms_player_speed', speed.toString());
    setShowSpeedMenu(false);
    triggerControlsActivity();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    triggerControlsActivity();
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not supported or rejected', e);
    }
  };

  // Seek bar hover calculation
  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoDuration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * videoDuration);
    setHoverPosition(pos * 100);
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !videoDuration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = pos * videoDuration;
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    triggerControlsActivity();
  };

  // Mobile Touch Double-Tap
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const touch = e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    if (now - lastTapRef.current.time < 300) {
      if (touchX < rect.width / 2) {
        skip(-10);
      } else {
        skip(10);
      }
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      lastTapRef.current = { time: now, x: touchX };
      triggerControlsActivity();
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(5);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(volume + 0.05);
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(volume - 0.05);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          setIsTheater((prev) => !prev);
          break;
        case '<':
        case ',':
          if (e.shiftKey) {
            e.preventDefault();
            const currIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
            if (currIdx > 0) changeSpeed(SPEED_OPTIONS[currIdx - 1]);
          }
          break;
        case '>':
        case '.':
          if (e.shiftKey) {
            e.preventDefault();
            const currIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
            if (currIdx < SPEED_OPTIONS.length - 1) changeSpeed(SPEED_OPTIONS[currIdx + 1]);
          }
          break;
        default:
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            jumpToPercent(parseInt(e.key, 10) * 10);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, volume, playbackSpeed, jumpToPercent]);

  // Video Events
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (!isNaN(dur) && dur > 0) {
      setVideoDuration(dur);
      // Auto-heal DB duration if it was originally 0
      if ((!duration || duration === 0) && videoId && typeof window !== 'undefined') {
        import('@/lib/api-client').then(({ apiClient }) => {
          apiClient.patch(`/videos/${videoId}`, { duration: Math.round(dur) }).catch(() => {});
        });
      }
    }

    const savedPos = localStorage.getItem(`lms_video_pos_${videoId}`);
    const posToResume = initialTime > 0 ? initialTime : savedPos ? parseFloat(savedPos) : 0;
    if (posToResume > 0 && posToResume < dur - 3) {
      videoRef.current.currentTime = posToResume;
      setCurrentTime(posToResume);
    }

    setIsLoading(false);
  };

  const handleProgress = () => {
    if (!videoRef.current) return;
    const buf = videoRef.current.buffered;
    if (buf.length > 0) {
      setBufferedEnd(buf.end(buf.length - 1));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    if (Math.round(current) % 3 === 0) {
      localStorage.setItem(`lms_video_pos_${videoId}`, current.toString());
    }

    if (onTimeUpdate) {
      onTimeUpdate(current, Math.round(current));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    localStorage.removeItem(`lms_video_pos_${videoId}`);
    if (onEnded) onEnded();

    if (hasNext && onNext) {
      setAutoplayCountdown(5);
    }
  };

  useEffect(() => {
    if (autoplayCountdown === null) return;
    if (autoplayCountdown <= 0) {
      setAutoplayCountdown(null);
      if (onNext) onNext();
      return;
    }

    const timer = setTimeout(() => {
      setAutoplayCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoplayCountdown, onNext]);

  // Detect if streamUrl is a YouTube link
  const youtubeEmbedUrl = React.useMemo(() => {
    if (!streamUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = streamUrl.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`
      : null;
  }, [streamUrl]);

  if (youtubeEmbedUrl) {
    return (
      <div
        className={`relative group select-none overflow-hidden bg-black rounded-2xl shadow-2xl transition-all duration-300 ${
          isTheater ? 'w-full max-h-[85vh] aspect-[21/9]' : 'w-full aspect-video'
        }`}
      >
        <iframe
          src={youtubeEmbedUrl}
          title={title}
          className="w-full h-full border-0 rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {/* Dynamic Watermark Overlay */}
        {user && (
          <div
            style={{
              top: `${watermarkPos.top}%`,
              left: `${watermarkPos.left}%`,
            }}
            className="absolute pointer-events-none z-20 text-[11px] font-mono text-white/30 select-none bg-black/40 px-2.5 py-0.5 rounded backdrop-blur-xs transition-all duration-1000"
          >
            {user.email || user.name} • Sabbir Academy
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsActivity}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchEnd={handleTouchEnd}
      className={`relative group select-none overflow-hidden bg-black rounded-2xl shadow-2xl transition-all duration-300 ${
        isTheater ? 'w-full max-h-[85vh] aspect-[21/9]' : 'w-full aspect-video'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={streamUrl}
        crossOrigin="use-credentials"
        playsInline
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={(e) => {
          setIsLoading(false);
          const mediaError = (e.currentTarget as HTMLVideoElement).error;
          if (mediaError?.code === 4) {
            setHasError(
              'Video media file is currently unavailable or unsupported by browser. Tip: Use .mp4 or YouTube/URL link for zero-delay streaming.',
            );
          } else {
            setHasError(
              'Unable to stream media. Please verify video status or course enrollment.',
            );
          }
        }}
        onClick={togglePlay}
        onDoubleClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX < rect.width / 2) {
            skip(-10);
          } else {
            skip(10);
          }
        }}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Dynamic Watermark Overlay (Anti-Piracy) */}
      {user && (
        <div
          style={{
            top: `${watermarkPos.top}%`,
            left: `${watermarkPos.left}%`,
            transition: 'top 3s ease-in-out, left 3s ease-in-out',
          }}
          className="absolute pointer-events-none select-none z-20 text-[11px] font-mono tracking-wider font-extrabold text-white/35 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        >
          <p>{user.email}</p>
          <p>{user.phone}</p>
        </div>
      )}

      {/* Skip Feedback Animation */}
      {skipIndicator && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-5 rounded-full bg-black/75 text-white animate-scale-in pointer-events-none z-30 ${
            skipIndicator.type === 'left' ? 'left-10' : 'right-10'
          }`}
        >
          {skipIndicator.type === 'left' ? (
            <RotateCcw className="w-8 h-8 text-primary" />
          ) : (
            <RotateCw className="w-8 h-8 text-primary" />
          )}
          <span className="text-[11px] font-bold mt-1">
            {skipIndicator.type === 'left' ? '-' : '+'}
            {skipIndicator.amount}s
          </span>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-30">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white z-30 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-3" />
          <h4 className="text-base sm:text-lg font-bold">Stream Access Denied</h4>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 max-w-md">{hasError}</p>
        </div>
      )}

      {/* Autoplay Next Video Countdown Modal */}
      {autoplayCountdown !== null && hasNext && (
        <div className="absolute bottom-16 right-6 z-30 p-4 rounded-2xl bg-neutral-900/95 border border-white/20 text-white shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in">
          <p className="text-xs text-gray-400 uppercase font-semibold">Up Next</p>
          <h4 className="text-sm font-bold truncate mt-0.5">{nextLessonTitle || 'Next Lesson'}</h4>
          <p className="text-xs text-primary font-medium mt-1">
            Playing in {autoplayCountdown} seconds...
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={() => {
                setAutoplayCountdown(null);
                if (onNext) onNext();
              }}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center space-x-1"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Play Now</span>
            </button>
            <button
              onClick={() => setAutoplayCountdown(null)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Control Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-3 sm:p-5 pointer-events-none transition-opacity duration-300 z-20 bg-gradient-to-t from-black/90 via-transparent to-black/50 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between text-white drop-shadow pointer-events-auto">
          <h3 className="text-xs sm:text-sm font-bold truncate pr-4">{title}</h3>
          {user && (
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-white/90 font-mono">
              Student ID: {user.name}
            </span>
          )}
        </div>

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && !isLoading && !hasError && (
          <div className="self-center pointer-events-auto">
            <button
              onClick={togglePlay}
              className="p-4 sm:p-5 rounded-full bg-primary/90 text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-transform"
            >
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div className="flex flex-col space-y-2 pointer-events-auto">
          {/* Seek Bar with Buffered Progress & Hover Timestamp */}
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            onMouseMove={handleProgressBarMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            className="relative w-full h-3 flex items-center cursor-pointer group/seek"
          >
            {/* Background Track */}
            <div className="absolute w-full h-1 group-hover/seek:h-2 bg-white/20 rounded-full transition-all" />

            {/* Buffered Track */}
            <div
              className="absolute h-1 group-hover/seek:h-2 bg-white/40 rounded-full transition-all"
              style={{
                width: `${videoDuration > 0 ? (bufferedEnd / videoDuration) * 100 : 0}%`,
              }}
            />

            {/* Played Track */}
            <div
              className="absolute h-1 group-hover/seek:h-2 bg-primary rounded-full transition-all flex items-center justify-end"
              style={{
                width: `${videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow scale-0 group-hover/seek:scale-100 transition-transform -mr-1.5" />
            </div>

            {/* Hover Tooltip */}
            {hoverTime !== null && (
              <div
                style={{ left: `${hoverPosition}%` }}
                className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-[10px] font-mono shadow pointer-events-none"
              >
                {formatDuration(hoverTime)}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between text-white text-xs sm:text-sm">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="hover:text-primary transition-colors p-1"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
              </button>

              {/* Skip backward 10s */}
              <button
                onClick={() => skip(-10)}
                title="Rewind 10s (J)"
                className="hover:text-primary transition-colors p-1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Skip forward 10s */}
              <button
                onClick={() => skip(10)}
                title="Forward 10s (L)"
                className="hover:text-primary transition-colors p-1"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Next Lesson Button */}
              {hasNext && (
                <button
                  onClick={onNext}
                  title="Next Lesson"
                  className="hover:text-primary transition-colors p-1 hidden sm:inline"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}

              {/* Volume & Mute */}
              <div className="flex items-center space-x-1.5 group/vol">
                <button
                  onClick={toggleMute}
                  aria-label="Mute"
                  className="hover:text-primary transition-colors p-1"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-destructive" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-14 sm:w-20 h-1.5 cursor-pointer accent-primary hidden sm:inline-block"
                />
              </div>

              {/* Timestamp */}
              <div className="text-[11px] sm:text-xs text-white/90 font-mono tracking-wide pl-1">
                <span>{formatDuration(currentTime)}</span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-white/60">{formatDuration(videoDuration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu((prev) => !prev)}
                  className="px-2 py-1 text-xs font-semibold rounded hover:bg-white/10 transition-colors flex items-center space-x-1"
                >
                  <Settings className="w-3.5 h-3.5 mr-0.5" />
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-9 right-0 bg-neutral-900/95 border border-white/15 rounded-xl shadow-2xl p-1.5 min-w-[100px] z-30 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1">
                      Playback Speed
                    </p>
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        onClick={() => changeSpeed(spd)}
                        className={`w-full text-left px-2.5 py-1 text-xs rounded-lg hover:bg-white/10 transition-colors ${
                          playbackSpeed === spd
                            ? 'text-primary font-bold bg-white/10'
                            : 'text-gray-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PiP */}
              <button
                onClick={togglePiP}
                title="Picture in Picture"
                className="hidden sm:inline hover:text-primary transition-colors p-1"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>

              {/* Theater Mode */}
              <button
                onClick={() => setIsTheater((prev) => !prev)}
                title="Theater Mode (T)"
                className="hidden md:inline hover:text-primary transition-colors p-1"
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                title="Fullscreen (F)"
                className="hover:text-primary transition-colors p-1"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
