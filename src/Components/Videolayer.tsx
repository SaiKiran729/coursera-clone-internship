import React, { useState, useRef, useEffect, useCallback } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
import { useRouter } from "next/router";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { recordLearningActivity } from "@/utils/learningActivity";
import { Play, RotateCcw, Clock, WifiOff } from "lucide-react";

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

  // Active saved timestamp: either from hook or direct storage read
  const [activeSavedTime, setActiveSavedTime] = useState<number>(() => {
    return (savedTimestamp && savedTimestamp >= 2) ? savedTimestamp : readStorageTime();
  });

  // Prompt state: show whenever a valid saved timestamp (>= 2s) exists
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(() => {
    const time = (savedTimestamp && savedTimestamp >= 2) ? savedTimestamp : readStorageTime();
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

  // Sync state whenever savedTimestamp changes or module switches
  useEffect(() => {
    const time = (savedTimestamp && savedTimestamp >= 2) ? savedTimestamp : readStorageTime();
    if (time >= 2) {
      setActiveSavedTime(time);
      setShowResumePrompt(true);
      currentTimeRef.current = time;
      setCurrentDisplayTime(time);
    } else {
      setActiveSavedTime(0);
      setShowResumePrompt(false);
    }
  }, [savedTimestamp, courseId, moduleIndex, readStorageTime]);

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

    // If there is an active resume prompt, ensure video is kept paused initially
    const stored = readStorageTime();
    if (stored >= 2) {
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
        setActiveSavedTime(0);
        setShowResumePrompt(false);
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
    setShowResumePrompt(false);
    const targetTime = activeSavedTime || readStorageTime();
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
    setShowResumePrompt(false);
    setActiveSavedTime(0);
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
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xl relative bg-[#090d16] border border-gray-800">
        {/* Offline Fallback Banner for Task 3 */}
        {!isOnline && (
          <div className="absolute inset-0 z-50 bg-[#0a0f1d] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-full mb-3 text-amber-400">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Offline Mode Active</h3>
            <p className="text-gray-300 text-sm max-w-sm">
              Video streaming requires an active internet connection. All course modules, syllabus materials, and your saved learning progress are available offline.
            </p>
          </div>
        )}

        {/* 100% Solid Opaque Resume Overlay (No YouTube Play Button or Text Bleed-Through) */}
        {showResumePrompt && activeSavedTime >= 2 && (
          <div 
            id="video-resume-overlay"
            className="absolute inset-0 z-40 bg-[#0a0f1d] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none shadow-2xl transition-all"
          >
            {/* Elegant Compact Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2 sm:mb-3 shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Resume Available</span>
            </div>

            {/* Clear Heading */}
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 tracking-tight">
              Resume Watching?
            </h3>

            {/* Explanatory text */}
            <p className="text-gray-300 text-xs sm:text-sm max-w-sm sm:max-w-md mb-4 sm:mb-5 leading-relaxed">
              You previously stopped at{" "}
              <span className="font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/60 text-xs sm:text-sm">
                {formatTime(activeSavedTime)}
              </span>
              . Would you like to resume or start from the beginning?
            </p>

            {/* Action Buttons: 100% Visible, Proportional, Never Cut Off */}
            <div className="flex flex-row items-center justify-center gap-3 w-full max-w-sm sm:max-w-md px-2">
              <button 
                id="btn-resume-watching"
                onClick={handleResume}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-[#0056D2] hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-blue-900/40 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current flex-shrink-0" />
                <span className="truncate">Resume from {formatTime(activeSavedTime)}</span>
              </button>
              <button 
                id="btn-start-beginning"
                onClick={handleStartOver}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-gray-200 hover:text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-700 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Start from Beginning</span>
              </button>
            </div>
          </div>
        )}

        <YouTube 
          videoId={parsedId} 
          opts={opts} 
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
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
          {activeSavedTime >= 2 && (
            <span className="hidden sm:inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium ml-2 border border-blue-200">
              Saved at {formatTime(activeSavedTime)}
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
