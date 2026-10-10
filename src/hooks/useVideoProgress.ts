import { useState, useEffect } from 'react';

const PROGRESS_PREFIX = 'video_progress_';

interface VideoProgressData {
  timestamp: number;
  updatedAt: string;
}

export function useVideoProgress(courseId: string, moduleIndex: number) {
  const [savedTimestamp, setSavedTimestamp] = useState<number | null>(null);
  const storageKey = `${PROGRESS_PREFIX}${courseId}_${moduleIndex}`;

  useEffect(() => {
    try {
      const dataStr = localStorage.getItem(storageKey);
      if (dataStr) {
        const data: VideoProgressData = JSON.parse(dataStr);
        if (data && typeof data.timestamp === 'number') {
           setSavedTimestamp(data.timestamp);
        }
      } else {
        setSavedTimestamp(null);
      }
    } catch (e) {
      console.warn("Could not read video progress", e);
      setSavedTimestamp(null);
    }
  }, [courseId, moduleIndex, storageKey]);

  const saveProgress = (timestamp: number, duration: number) => {
    // Basic validation
    if (timestamp < 0 || isNaN(timestamp) || isNaN(duration)) return;
    
    // If greater than duration or very close to the end, reset it so next time it starts fresh
    if (duration > 0 && timestamp >= duration - 2) {
      localStorage.removeItem(storageKey);
      return;
    }

    try {
      const data: VideoProgressData = {
        timestamp,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSavedTimestamp(timestamp);
    } catch (e) {
      console.warn("Could not save video progress", e);
    }
  };

  const clearProgress = () => {
    localStorage.removeItem(storageKey);
    setSavedTimestamp(null);
  };

  return { savedTimestamp, saveProgress, clearProgress };
}
