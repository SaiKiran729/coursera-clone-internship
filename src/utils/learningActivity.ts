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

function getYesterdayDateKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateKey(yesterday);
}

function getTwoDaysAgoDateKey(): string {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  return getLocalDateKey(twoDaysAgo);
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, badges: [] };
  }

  try {
    const data = localStorage.getItem(STREAK_KEY);
    if (data) {
      const parsed: StreakData = JSON.parse(data);
      // If user missed more than 1 day, the current active streak has reset to 0
      if (parsed.lastActivityDate) {
        const today = getLocalDateKey();
        const todayDate = parseLocalDate(today);
        const lastActivity = parseLocalDate(parsed.lastActivityDate);
        const diffTime = Math.abs(todayDate.getTime() - lastActivity.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1 && parsed.currentStreak > 0) {
          parsed.currentStreak = 0;
          try {
            localStorage.setItem(STREAK_KEY, JSON.stringify(parsed));
          } catch (e) {}
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

  // If activity was already recorded today, do not increase streak twice on the same day
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
      // Consecutive day!
      newCurrentStreak = (data.currentStreak || 0) + 1;
    } else {
      // Day was missed; streak resets to 1 on this new activity
      newCurrentStreak = 1;
    }
  }

  const newLongestStreak = Math.max(data.longestStreak || 0, newCurrentStreak);
  const newBadges = [...(data.badges || [])];

  const milestones = [
    { days: 3, name: '3-Day Streak' },
    { days: 7, name: '7-Day Streak' },
    { days: 14, name: '14-Day Streak' },
    { days: 30, name: '30-Day Streak' },
  ];

  milestones.forEach(({ days, name }) => {
    if (newCurrentStreak >= days && !newBadges.includes(name)) {
      newBadges.push(name);
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

  // Notify listeners across app (Navbar, Profile, CourseDetails)
  window.dispatchEvent(new Event('streakUpdated'));

  return updatedData;
}

// ==========================================
// TEST DATA & SIMULATION HELPERS FOR TASK 4
// ==========================================

export function simulateStreak(days: number): StreakData {
  const today = getLocalDateKey();
  const badges: string[] = [];
  if (days >= 3) badges.push('3-Day Streak');
  if (days >= 7) badges.push('7-Day Streak');
  if (days >= 14) badges.push('14-Day Streak');
  if (days >= 30) badges.push('30-Day Streak');

  const data: StreakData = {
    currentStreak: days,
    longestStreak: Math.max(days, 7),
    lastActivityDate: today,
    badges,
  };

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('streakUpdated'));
  }
  return data;
}

export function simulateMissedDay(): StreakData {
  const current = getStreakData();
  const twoDaysAgo = getTwoDaysAgoDateKey();

  const data: StreakData = {
    ...current,
    currentStreak: 0,
    lastActivityDate: twoDaysAgo,
  };

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('streakUpdated'));
  }
  return data;
}

export function simulateYesterdayActive(streakBeforeToday = 6): StreakData {
  const yesterday = getYesterdayDateKey();
  const current = getStreakData();
  const badges = [...current.badges];
  if (streakBeforeToday >= 3 && !badges.includes('3-Day Streak')) {
    badges.push('3-Day Streak');
  }

  const data: StreakData = {
    currentStreak: streakBeforeToday,
    longestStreak: Math.max(current.longestStreak, streakBeforeToday),
    lastActivityDate: yesterday,
    badges,
  };

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('streakUpdated'));
  }
  return data;
}

export function resetStreakData(): StreakData {
  const data: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    badges: [],
  };

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('streakUpdated'));
  }
  return data;
}
