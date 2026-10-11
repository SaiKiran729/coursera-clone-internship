import React, { useState, useRef, useEffect, useCallback } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
import { useRouter } from "next/router";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { recordLearningActivity } from "@/utils/learningActivity";
import { Play, RotateCcw, Clock, WifiOff, X } from "lucide-react";

const extractYouTubeId = (urlOrId: string) => {
  if (!urlOrId) return "";

  // Clean up full URLs
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }

  // Clean up query params from raw IDs
  const idOnly = urlOrId.split('?')[0];
  if (idOnly.length === 11) {
    return idOnly;
  }

  return urlOrId;
};

interface VideolayerProps {
  videoId: string;
  title?: string;
  courseId: string;
  moduleIndex: number;
  onComplete?: () => void;
}

const Videolayer = ({ videoId, title, courseId, moduleIndex, onComplete }: VideolayerProps) => {
  const router = useRouter();
  const parsedId = extractYouTubeId(videoId);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const storageKey = `video_progress_${courseId}_${moduleIndex}`;
  const { savedTimestamp, saveProgress, clearProgress } = useVideoProgress(courseId, moduleIndex);

  // Directly check localStorage to ensure instantaneous availability across any redirect
  const readStorageTime = useCallback((): number => {
    if (typeof window === 'undefined' || !courseId) return 0;
    try {
      const dataStr = localStorage.getItem(`video_progress_${courseId}_${moduleIndex}`);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && typeof data.timestamp === 'number' && data.timestamp >= 2) {
          return data.timestamp;
        }
      }
    } catch (e) {}
    return 0;
  }, [courseId, moduleIndex]);

  // Track if prompt was already handled in THIS page visit
  // CRITICAL: Once handled or dismissed on this page, NEVER prompt again while user stays on the same page!
  const hasHandledPromptThisVisit = useRef<boolean>(false);

  // Active saved timestamp captured AT MOUNT TIME
  const [initialSavedTime, setInitialSavedTime] = useState<number>(() => {
    return readStorageTime();
  });

  // Prompt state: ONLY true on mount if initialSavedTime >= 2
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(() => {
    const time = readStorageTime();
    return time >= 2;
  });

  const [currentDisplayTime, setCurrentDisplayTime] = useState<number>(0);
  const [durationDisplay, setDurationDisplay] = useState<number>(0);

  // Online status check for PWA/offline mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // When moduleIndex or courseId changes (switching to a different module), re-check for that module
  useEffect(() => {
    hasHandledPromptThisVisit.current = false;
    const time = readStorageTime();
    setInitialSavedTime(time);
    if (time >= 2) {
      setShowResumePrompt(true);
      currentTimeRef.current = time;
      setCurrentDisplayTime(time);
    } else {
      setShowResumePrompt(false);
      currentTimeRef.current = 0;
      setCurrentDisplayTime(0);
    }
  }, [courseId, moduleIndex, readStorageTime]);

  // Synchronously flush the current position to localStorage
  const flushCurrentProgress = useCallback(() => {
    let time = currentTimeRef.current;
    let dur = durationRef.current;
    try {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const playerTime = playerRef.current.getCurrentTime();
        const playerDur = playerRef.current.getDuration ? playerRef.current.getDuration() : 0;
        if (typeof playerTime === 'number' && playerTime > 0) {
          time = playerTime;
          currentTimeRef.current = playerTime;
        }
        if (typeof playerDur === 'number' && playerDur > 0) {
          dur = playerDur;
          durationRef.current = playerDur;
        }
      }
    } catch (e) {}

    // Only save if meaningful progress (>= 2s) and not at the end of the video
    if (time >= 2 && (!dur || time < dur - 3)) {
      try {
        const roundedTime = Math.round(time);
        const data = {
          timestamp: roundedTime,
          duration: Math.round(dur || 0),
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        if (saveProgress) {
          saveProgress(roundedTime, dur);
        }
      } catch (e) {}
    }
  }, [courseId, moduleIndex, saveProgress, storageKey]);

  // 1. Immediately pause video and save progress when navigating away to another page (N times)
  useEffect(() => {
    const handleRouteChange = () => {
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
      flushCurrentProgress();
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, flushCurrentProgress]);

  // 2. Pause video and save progress when user switches tabs or window is minimized
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (playerRef.current) {
          try {
            playerRef.current.pauseVideo();
          } catch (e) {}
        }
        flushCurrentProgress();
      }
    };

    const handleBeforeUnload = () => {
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
      flushCurrentProgress();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [flushCurrentProgress]);

  // 3. Pause video and save progress on unmount (DO NOT call stopVideo as it clears playback state)
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      flushCurrentProgress();
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
    };
  }, [flushCurrentProgress]);

  const onReady = (event: any) => {
    playerRef.current = event.target;
    try {
      const dur = event.target.getDuration();
      if (dur > 0) {
        durationRef.current = dur;
        setDurationDisplay(dur);
      }
    } catch (e) {}

    // If resume prompt is active, ensure video is kept paused initially
    if (showResumePrompt) {
      try {
        event.target.pauseVideo();
      } catch (e) {}
    }
  };

  const onStateChange = (event: any) => {
    const player = event.target;

    try {
      const dur = player.getDuration();
      if (dur > 0) {
        durationRef.current = dur;
        setDurationDisplay(dur);
      }
    } catch (e) {}

    if (event.data === 1) { // Playing
      // If resume overlay is currently displayed, do not allow background autoplay
      if (showResumePrompt) {
        try {
          player.pauseVideo();
        } catch (e) {}
        return;
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        try {
          const time = player.getCurrentTime();
          const dur = player.getDuration() || durationRef.current;
          if (time > 0) {
            currentTimeRef.current = time;
            setCurrentDisplayTime(time);
            // Save in background without re-triggering prompt on same page
            if (time >= 2 && saveProgress) {
              saveProgress(time, dur);
            }
            // Once user watches for 15+ seconds, record daily learning activity
            if (time >= 15) {
              recordLearningActivity();
            }
          }
        } catch (e) {}
      }, 1000);
    }
    else if (event.data === 2) { // Paused
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        const time = player.getCurrentTime();
        const dur = player.getDuration() || durationRef.current;
        if (time > 0) {
          currentTimeRef.current = time;
          setCurrentDisplayTime(time);
          if (time >= 2 && saveProgress) {
            saveProgress(time, dur);
          }
        }
      } catch (e) {}
    }
    else if (event.data === 0) { // Ended
      if (intervalRef.current) clearInterval(intervalRef.current);
      const cur = currentTimeRef.current;
      const dur = durationRef.current;
      // Only clear if user genuinely reached the end of the video
      if (dur > 0 && cur >= dur - 3) {
        currentTimeRef.current = 0;
        setCurrentDisplayTime(0);
        setInitialSavedTime(0);
        setShowResumePrompt(false);
        hasHandledPromptThisVisit.current = true;
        if (clearProgress) clearProgress();
        try {
          localStorage.removeItem(storageKey);
        } catch (e) {}
        if (onComplete) onComplete();
      }
      recordLearningActivity();
    }
  };

  const handleResume = () => {
    hasHandledPromptThisVisit.current = true;
    setShowResumePrompt(false);
    const targetTime = initialSavedTime || readStorageTime();
    if (playerRef.current && targetTime >= 2) {
      try {
        playerRef.current.seekTo(targetTime, true);
        playerRef.current.playVideo();
      } catch (e) {
        console.warn("Error seeking in player", e);
      }
      recordLearningActivity();
    }
  };

  const handleStartOver = () => {
    hasHandledPromptThisVisit.current = true;
    setShowResumePrompt(false);
    setInitialSavedTime(0);
    currentTimeRef.current = 0;
    setCurrentDisplayTime(0);
    if (clearProgress) {
      clearProgress();
    }
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
      } catch (e) {
        console.warn("Error restarting video", e);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      rel: 0,
      modestbranding: 1,
      enablejsapi: 1
    },
  };

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Theater Container with guaranteed aspect-ratio and generous responsive minimum height */}
      <div
        className="w-full aspect-video min-h-[240px] sm:min-h-[380px] md:min-h-[450px] rounded-2xl overflow-hidden shadow-2xl relative bg-[#090d16] border border-gray-800"
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          position: 'relative',
        }}
      >
        {/* Offline Fallback Banner for Task 3 */}
        {!isOnline && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 60,
              backgroundColor: '#0a0f1d',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#ffffff'
            }}
          >
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-full mb-3 text-amber-400">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Offline Mode Active</h3>
            <p className="text-gray-300 text-sm max-w-sm">
              Video streaming requires an active internet connection. All course modules, syllabus materials, and your saved learning progress are available offline.
            </p>
          </div>
        )}

        {/* 100% Solid Opaque Resume Overlay: NEVER shows while user is in the same page watching; ONLY shows on route re-entry */}
        {showResumePrompt && initialSavedTime >= 2 && (
          <div
            id="video-resume-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              backgroundColor: '#090d16',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              userSelect: 'none',
              boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 86, 210, 0.18)',
                border: '1px solid rgba(0, 86, 210, 0.45)',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
              <span>Resume Watching</span>
            </div>

            {/* Clear Heading */}
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Pick up where you left off
            </h3>

            {/* Explanatory text */}
            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                maxWidth: '28rem',
                marginBottom: '1.75rem',
                lineHeight: 1.5,
              }}
            >
              You previously stopped at{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: '#93c5fd',
                  backgroundColor: 'rgba(30, 58, 138, 0.7)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                {formatTime(initialSavedTime)}
              </span>
              . Would you like to resume or start from the beginning?
            </p>

            {/* Action Buttons: 100% Solid, High Contrast, Guaranteed Visibility & Responsive Stacking */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-md px-2"
            >
              <button
                id="btn-resume-watching"
                onClick={handleResume}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0056D2] hover:bg-[#00419e] text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border-0 cursor-pointer shadow-md transition-colors min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-current flex-shrink-0" />
                <span>Resume from {formatTime(initialSavedTime)}</span>
              </button>

              <button
                id="btn-start-beginning"
                onClick={handleStartOver}
                className="w-full sm:flex-1 py-3 px-4 bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#334155] cursor-pointer transition-colors min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0" />
                <span>Start from Beginning</span>
              </button>
            </div>
          </div>
        )}

        <YouTube
          videoId={parsedId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full absolute inset-0"
          iframeClassName="w-full h-full absolute inset-0 border-0"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        />
      </div>

      {/* Progress & Video Status Bar */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 px-1 py-1">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            Current position: <span className="font-medium text-gray-800">{formatTime(currentDisplayTime)}</span>
            {durationDisplay > 0 && ` / ${formatTime(durationDisplay)}`}
          </span>
          {initialSavedTime >= 2 && (
            <span className="hidden sm:inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium ml-2 border border-blue-200">
              Saved at {formatTime(initialSavedTime)}
            </span>
          )}
        </div>

        {currentDisplayTime > 0 && (
          <button
            id="btn-quick-restart"
            onClick={handleStartOver}
            className="text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition-colors text-xs font-medium cursor-pointer"
            title="Restart video from 0:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart (0:00)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Videolayer;
