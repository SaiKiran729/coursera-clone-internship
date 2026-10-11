import { useState, useEffect, useCallback } from 'react';

const PROGRESS_PREFIX = 'video_progress_';

interface VideoProgressData {
  timestamp: number;
  duration?: number;
  updatedAt: string;
}

export function useVideoProgress(courseId: string, moduleIndex: number) {
  const storageKey = `${PROGRESS_PREFIX}${courseId}_${moduleIndex}`;

  const [savedTimestamp, setSavedTimestamp] = useState<number | null>(() => {
    if (typeof window === 'undefined' || !courseId) return null;
    try {
      const dataStr = localStorage.getItem(storageKey);
      if (dataStr) {
        const data: VideoProgressData = JSON.parse(dataStr);
        if (data && typeof data.timestamp === 'number' && data.timestamp > 0) {
          return data.timestamp;
        }
      }
    } catch (e) {
      console.warn("Could not read initial video progress", e);
    }
    return null;
  });

  useEffect(() => {
    if (!courseId) return;
    try {
      const dataStr = localStorage.getItem(storageKey);
      if (dataStr) {
        const data: VideoProgressData = JSON.parse(dataStr);
        if (data && typeof data.timestamp === 'number' && data.timestamp > 0) {
          setSavedTimestamp(data.timestamp);
          return;
        }
      }
      setSavedTimestamp(null);
    } catch (e) {
      console.warn("Could not read video progress", e);
      setSavedTimestamp(null);
    }
  }, [courseId, moduleIndex, storageKey]);

  const saveProgress = useCallback((timestamp: number, duration: number) => {
    if (!courseId || timestamp < 0 || isNaN(timestamp)) return;
    
    // If video finished (within last 3 seconds of duration), clear progress so it starts fresh next time
    if (duration > 0 && timestamp >= duration - 3) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
      setSavedTimestamp(null);
      return;
    }

    // Only save meaningful progress (>= 2 seconds)
    if (timestamp >= 2) {
      try {
        const roundedTime = Math.round(timestamp);
        const data: VideoProgressData = {
          timestamp: roundedTime,
          duration: Math.round(duration || 0),
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        setSavedTimestamp(roundedTime);
      } catch (e) {
        console.warn("Could not save video progress", e);
      }
    }
  }, [courseId, storageKey]);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    setSavedTimestamp(null);
  }, [storageKey]);

  return { savedTimestamp, saveProgress, clearProgress };
}
