import { useState, useEffect } from 'react';
import { getLocalDateKey } from '@/utils/date';
import { recordLearningActivity } from '@/utils/learningActivity';
import { cancelReminder } from '@/utils/notifications';

export interface CourseProgress {
  courseId: string;
  completedModules: number[];
  currentModuleIndex: number;
  isCompleted: boolean;
  completedAt?: string;
  lastActivityDate?: string;
}

export function useCourseProgress(courseId: string, totalModules: number) {
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  // Load progress from localStorage on mount
  useEffect(() => {
    if (!courseId) return;
    
    try {
      const storageKey = `course_progress_${courseId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        setProgress(JSON.parse(savedData));
      } else {
        // Initialize for first-time users
        setProgress({
          courseId,
          completedModules: [],
          currentModuleIndex: 0,
          isCompleted: false,
        });
      }
    } catch (e) {
      console.error("Failed to load course progress", e);
      setProgress({
        courseId,
        completedModules: [],
        currentModuleIndex: 0,
        isCompleted: false,
      });
    }
  }, [courseId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!progress) return;
    
    try {
      const storageKey = `course_progress_${courseId}`;
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save course progress", e);
    }
  }, [progress, courseId]);

  const markModuleComplete = (moduleIndex: number) => {
    setProgress((prev) => {
      if (!prev) return null;
      
      const newCompletedModules = [...new Set([...prev.completedModules, moduleIndex])];
      const isCompleted = newCompletedModules.length >= totalModules;
      
      // Record learning activity whenever a meaningful milestone occurs (module complete)
      recordLearningActivity();
      
      // If course just became completed, deactivate any pending reminders
      if (isCompleted && !prev.isCompleted) {
        cancelReminder(courseId);
      }
      
      return {
        ...prev,
        completedModules: newCompletedModules,
        isCompleted,
        completedAt: isCompleted && !prev.isCompleted ? new Date().toISOString() : prev.completedAt,
        lastActivityDate: getLocalDateKey()
      };
    });
  };

  const markModuleIncomplete = (moduleIndex: number) => {
    setProgress((prev) => {
      if (!prev) return null;
      
      const newCompletedModules = prev.completedModules.filter(idx => idx !== moduleIndex);
      
      return {
        ...prev,
        completedModules: newCompletedModules,
        isCompleted: false,
        completedAt: undefined,
        lastActivityDate: getLocalDateKey()
      };
    });
  };

  const setCurrentModule = (moduleIndex: number) => {
    setProgress((prev) => {
      if (!prev) return null;
      return { ...prev, currentModuleIndex: moduleIndex };
    });
  };

  const resetProgress = () => {
    setProgress({
      courseId,
      completedModules: [],
      currentModuleIndex: 0,
      isCompleted: false,
      lastActivityDate: getLocalDateKey()
    });
  };

  return {
    progress,
    markModuleComplete,
    markModuleIncomplete,
    setCurrentModule,
    resetProgress,
    completedModules: progress?.completedModules || [],
    isCompleted: progress?.isCompleted || false,
    completedAt: progress?.completedAt,
    currentModuleIndex: progress?.currentModuleIndex || 0,
  };
}
