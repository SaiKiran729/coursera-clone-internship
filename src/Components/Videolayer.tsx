import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
import { useVideoProgress } from "@/hooks/useVideoProgress";

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

const Videolayer = ({ videoId, title, courseId, moduleIndex, onComplete }: any) => {
  const parsedId = extractYouTubeId(videoId);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { savedTimestamp, saveProgress } = useVideoProgress(courseId, moduleIndex);

  const onSaveProgress = (time: number, duration: number) => {
    saveProgress(time, duration);
  };

  useEffect(() => {
    setShowResumePrompt(!!savedTimestamp && savedTimestamp > 0);
  }, [videoId, savedTimestamp]);

  useEffect(() => {
    return () => {
      // Save on unmount
      if (playerRef.current && onSaveProgress) {
        try {
           const time = playerRef.current.getCurrentTime();
           const duration = playerRef.current.getDuration();
           if (time > 0) onSaveProgress(time, duration);
        } catch(e) {}
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onSaveProgress]);

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const onStateChange = (event: any) => {
    const player = event.target;
    
    if (event.data === 1) { // Playing
      setShowResumePrompt(false);
      intervalRef.current = setInterval(() => {
         const time = player.getCurrentTime();
         const duration = player.getDuration();
         if (time > 0 && onSaveProgress) onSaveProgress(time, duration);
      }, 5000);
    } 
    else if (event.data === 2) { // Paused
      if (intervalRef.current) clearInterval(intervalRef.current);
      const time = player.getCurrentTime();
      const duration = player.getDuration();
      if (time > 0 && onSaveProgress) onSaveProgress(time, duration);
    }
    else if (event.data === 0) { // Ended
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (onComplete) onComplete();
    }
  };

  const handleResume = () => {
    if (playerRef.current && savedTimestamp) {
      playerRef.current.seekTo(savedTimestamp);
      playerRef.current.playVideo();
      setShowResumePrompt(false);
    }
  };

  const handleStartOver = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
      setShowResumePrompt(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      rel: 0,
      modestbranding: 1
    },
  };

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg relative bg-black">
      {showResumePrompt && savedTimestamp && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white p-4">
          <h3 className="text-xl font-semibold mb-6">Resume Watching?</h3>
          <div className="flex space-x-4">
            <button 
              onClick={handleResume}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
            >
              Resume ({formatTime(savedTimestamp)})
            </button>
            <button 
              onClick={handleStartOver}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-medium transition-colors"
            >
              Start from Beginning
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
  );
};

export default Videolayer;
