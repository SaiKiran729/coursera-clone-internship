import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
import { useRouter } from "next/router";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { recordLearningActivity } from "@/utils/learningActivity";
import { Play, RotateCcw, Clock, CheckCircle2 } from "lucide-react";

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

  const { savedTimestamp, saveProgress, clearProgress } = useVideoProgress(courseId, moduleIndex);

  // Resume overlay state: show whenever savedTimestamp exists and is > 0
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(() => {
    return !!savedTimestamp && savedTimestamp > 0;
  });

  const [currentDisplayTime, setCurrentDisplayTime] = useState<number>(0);
  const [durationDisplay, setDurationDisplay] = useState<number>(0);
  const [hasPromptBeenHandled, setHasPromptBeenHandled] = useState(false);

  useEffect(() => {
    if (savedTimestamp && savedTimestamp > 0 && !hasPromptBeenHandled) {
      setShowResumePrompt(true);
      currentTimeRef.current = savedTimestamp;
      setCurrentDisplayTime(savedTimestamp);
    }
  }, [savedTimestamp, hasPromptBeenHandled]);

  // Synchronously flush the current position to localStorage
  const flushCurrentProgress = () => {
    try {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration() || durationRef.current;
        if (time > 0) {
          currentTimeRef.current = time;
          durationRef.current = duration;
        }
      }
    } catch (e) {}

    const time = currentTimeRef.current;
    const dur = durationRef.current;
    if (time > 0 && saveProgress) {
      saveProgress(time, dur);
    }
  };

  // 1. Immediately pause video and save progress when user navigates away to another page
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
  }, [router, saveProgress]);

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
  }, [saveProgress]);

  // 3. Pause video and save progress on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
          if (typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
          }
        } catch (e) {}
      }
      flushCurrentProgress();
    };
  }, [saveProgress]);

  const onReady = (event: any) => {
    playerRef.current = event.target;
    try {
      const dur = event.target.getDuration();
      if (dur > 0) {
        durationRef.current = dur;
        setDurationDisplay(dur);
      }
    } catch (e) {}

    // If there is a saved progress prompt, ensure player is paused and ready
    if (savedTimestamp && savedTimestamp > 0 && !hasPromptBeenHandled) {
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
      // Only dismiss prompt if user has interacted or chose an action
      if (hasPromptBeenHandled) {
        setShowResumePrompt(false);
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        try {
          const time = player.getCurrentTime();
          const dur = player.getDuration() || durationRef.current;
          if (time > 0) {
            currentTimeRef.current = time;
            setCurrentDisplayTime(time);
            if (saveProgress) {
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
          if (saveProgress) {
            saveProgress(time, dur);
          }
        }
      } catch (e) {}
    } 
    else if (event.data === 0) { // Ended
      if (intervalRef.current) clearInterval(intervalRef.current);
      currentTimeRef.current = 0;
      setCurrentDisplayTime(0);
      if (clearProgress) clearProgress();
      recordLearningActivity();
      if (onComplete) onComplete();
    }
  };

  const handleResume = () => {
    setHasPromptBeenHandled(true);
    setShowResumePrompt(false);
    if (playerRef.current && savedTimestamp) {
      try {
        playerRef.current.seekTo(savedTimestamp, true);
        playerRef.current.playVideo();
      } catch (e) {
        console.warn("Error seeking in player", e);
      }
      recordLearningActivity();
    }
  };

  const handleStartOver = () => {
    setHasPromptBeenHandled(true);
    setShowResumePrompt(false);
    currentTimeRef.current = 0;
    setCurrentDisplayTime(0);
    if (clearProgress) {
      clearProgress();
    }
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
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xl relative bg-black border border-gray-800">
        {/* Guaranteed Resume Watching Overlay */}
        {showResumePrompt && savedTimestamp && savedTimestamp > 0 && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 transition-all">
            <div className="bg-blue-600/20 text-blue-400 p-3 rounded-full mb-3 ring-1 ring-blue-500/40">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Resume Watching?</h3>
            <p className="text-gray-300 text-sm mb-6 text-center max-w-sm">
              You previously stopped at <span className="font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">{formatTime(savedTimestamp)}</span>. Would you like to resume or restart?
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
              <button 
                id="btn-resume-watching"
                onClick={handleResume}
                className="w-full sm:flex-1 px-5 py-3 bg-[#0056D2] hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 transition-all transform hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume from {formatTime(savedTimestamp)}</span>
              </button>
              <button 
                id="btn-start-beginning"
                onClick={handleStartOver}
                className="w-full sm:flex-1 px-5 py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-gray-200 hover:text-white rounded-lg font-semibold flex items-center justify-center space-x-2 border border-gray-700 transition-all transform hover:scale-[1.02]"
              >
                <RotateCcw className="w-4 h-4" />
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
          {savedTimestamp && savedTimestamp > 0 && (
            <span className="hidden sm:inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
              Saved at {formatTime(savedTimestamp)}
            </span>
          )}
        </div>
        
        {currentDisplayTime > 0 && (
          <button 
            onClick={handleStartOver}
            className="text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition-colors text-xs font-medium"
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
