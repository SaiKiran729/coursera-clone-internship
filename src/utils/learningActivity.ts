import { getLocalDateKey } from './date';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  badges: string[];
}

const STREAK_KEY = 'learning_streak';

function parseLocalDate(dateString: string): Date {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d); // Midnight local time
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, badges: [] };
  }

  try {
    const data = localStorage.getItem(STREAK_KEY);
    if (data) {
      const parsed: StreakData = JSON.parse(data);
      // If user missed more than 1 day, the current active streak is 0 until new activity
      if (parsed.lastActivityDate) {
        const today = getLocalDateKey();
        const todayDate = parseLocalDate(today);
        const lastActivity = parseLocalDate(parsed.lastActivityDate);
        const diffTime = Math.abs(todayDate.getTime() - lastActivity.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          parsed.currentStreak = 0;
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error("Corrupt streak data in localStorage", e);
  }
  
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    badges: [],
  };
}

export function recordLearningActivity(): StreakData {
  if (typeof window === 'undefined') {
    return getStreakData();
  }

  const data = getStreakData();
  const today = getLocalDateKey();

  if (data.lastActivityDate === today) {
    return data;
  }

  let newCurrentStreak = 1;

  if (data.lastActivityDate) {
    const todayDate = parseLocalDate(today);
    const lastActivity = parseLocalDate(data.lastActivityDate);
    
    // Calculate full day difference in local time
    const diffTime = Math.abs(todayDate.getTime() - lastActivity.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      newCurrentStreak = data.currentStreak + 1;
    } else {
      newCurrentStreak = 1;
    }
  }

  const newLongestStreak = Math.max(data.longestStreak, newCurrentStreak);
  const newBadges = [...data.badges];

  const milestones = [3, 7, 14, 30];
  milestones.forEach(milestone => {
    const badgeName = `${milestone}-Day`;
    if (newCurrentStreak >= milestone && !newBadges.includes(badgeName)) {
      newBadges.push(badgeName);
    }
  });

  const updatedData: StreakData = {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: today,
    badges: newBadges,
  };

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(updatedData));
  } catch (e) {
    console.error("Could not save streak data", e);
  }

  // Notify listeners that streak was updated
  window.dispatchEvent(new Event('streakUpdated'));

  return updatedData;
}
