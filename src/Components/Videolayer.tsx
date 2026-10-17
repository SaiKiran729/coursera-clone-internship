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

  // Active saved timestamp initialized safely to 0 to prevent SSR/client hydration mismatch
  const [initialSavedTime, setInitialSavedTime] = useState<number>(0);
  const [autoResumedTime, setAutoResumedTime] = useState<number | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [showAutoResumeBanner, setShowAutoResumeBanner] = useState<boolean>(false);

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

  // When moduleIndex or courseId changes, read saved time for this module
  useEffect(() => {
    hasHandledPromptThisVisit.current = false;
    const time = readStorageTime();
    setInitialSavedTime(time);
    if (time >= 2) {
      setAutoResumedTime(time);
      setShowAutoResumeBanner(true);
      currentTimeRef.current = time;
      setCurrentDisplayTime(time);
    } else {
      setAutoResumedTime(null);
      setShowAutoResumeBanner(false);
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

    const saved = initialSavedTime || readStorageTime();
    if (saved >= 2) {
      try {
        // Task 6: Automatically seek to saved timestamp and auto-resume
        event.target.seekTo(saved, true);
        setAutoResumedTime(saved);
        setShowAutoResumeBanner(true);

        const playPromise = event.target.playVideo();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err: any) => {
            console.warn('[Videolayer] Autoplay blocked by browser policy:', err);
            setAutoplayBlocked(true);
          });
        }
      } catch (e) {
        console.warn('[Videolayer] Auto-resume seek/play error:', e);
        setAutoplayBlocked(true);
      }
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
      setAutoplayBlocked(false);
      // Auto-dismiss the auto-resume banner after 6 seconds of smooth playback
      setTimeout(() => {
        setShowAutoResumeBanner(false);
      }, 6000);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        try {
          const time = player.getCurrentTime();
          const dur = player.getDuration() || durationRef.current;
          if (time > 0) {
            currentTimeRef.current = time;
            setCurrentDisplayTime(time);
            if (time >= 2 && saveProgress) {
              saveProgress(time, dur);
            }
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
      if (dur > 0 && cur >= dur - 3) {
        currentTimeRef.current = 0;
        setCurrentDisplayTime(0);
        setInitialSavedTime(0);
        setAutoResumedTime(null);
        setShowAutoResumeBanner(false);
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
    const targetTime = initialSavedTime || readStorageTime();
    if (playerRef.current && targetTime >= 2) {
      try {
        playerRef.current.seekTo(targetTime, true);
        playerRef.current.playVideo();
        setAutoplayBlocked(false);
      } catch (e) {
        console.warn("Error seeking in player", e);
      }
      recordLearningActivity();
    }
  };

  const handleStartOver = () => {
    hasHandledPromptThisVisit.current = true;
    setShowAutoResumeBanner(false);
    setAutoResumedTime(null);
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
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
      enablejsapi: 1,
      ...(initialSavedTime >= 2 ? { start: Math.floor(initialSavedTime) } : {}),
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

        {/* Task 6: Non-blocking Floating Auto-Resume Banner with Autoplay Fallback and Start Over */}
        {showAutoResumeBanner && autoResumedTime && autoResumedTime >= 2 && (
          <div
            id="video-autoresume-notification"
            className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-blue-500/40 shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg flex-shrink-0">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-white">Auto-resumed playback</div>
                <div className="text-[11px] text-gray-300">
                  Resumed from <span className="text-blue-300 font-bold">{formatTime(autoResumedTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {autoplayBlocked && (
                <button
                  id="btn-resume-watching"
                  onClick={handleResume}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                  title="Click to resume playback"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              )}

              <button
                id="btn-start-beginning"
                onClick={handleStartOver}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
                title="Restart this lesson from 0:00"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Start Over</span>
              </button>

              <button
                onClick={() => setShowAutoResumeBanner(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <YouTube
          videoId={parsedId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={(e) => console.warn('[Videolayer] YouTube Player error handled:', e)}
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
