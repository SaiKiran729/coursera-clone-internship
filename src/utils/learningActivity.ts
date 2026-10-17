import { getLocalDateKey } from './date';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  lastActivityType?: 'login' | 'learning' | null;
  lastLoginDate?: string | null;
  badges: string[];
}

const STREAK_KEY = 'learning_streak';
const SIMULATION_KEY = 'learning_streak_simulation';

function parseLocalDate(dateString: string | null | undefined): Date {
  if (!dateString || typeof dateString !== 'string') {
    return new Date();
  }
  const parts = dateString.split('-').map(Number);
  if (parts.length < 3 || parts.some(isNaN)) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2]); // Midnight local time
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

/**
 * Get the genuine production streak data recorded from user activity.
 */
export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, badges: [] };
  }

  try {
    const data = localStorage.getItem(STREAK_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') {
        return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, badges: [] };
      }
      if (!Array.isArray(parsed.badges)) {
        parsed.badges = [];
      }
      if (typeof parsed.currentStreak !== 'number' || isNaN(parsed.currentStreak)) {
        parsed.currentStreak = 0;
      }
      if (typeof parsed.longestStreak !== 'number' || isNaN(parsed.longestStreak)) {
        parsed.longestStreak = 0;
      }
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

/**
 * Unified daily streak engine:
 * Integrates daily logins and meaningful learning activity (module / video completion).
 * Prevents duplicate increments on the same local calendar day.
 */
export function recordStreakActivity(activityType: 'login' | 'learning'): StreakData {
  if (typeof window === 'undefined') {
    return getStreakData();
  }

  const data = getStreakData();
  const today = getLocalDateKey();

  // If activity was already recorded today, do not increment streak twice on the same day
  if (data.lastActivityDate === today) {
    // Still record login timestamp if this was a login action
    if (activityType === 'login' && data.lastLoginDate !== today) {
      data.lastLoginDate = today;
      try {
        localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      } catch (e) {}
    }
    return data;
  }

  let newCurrentStreak = 1;

  if (data.lastActivityDate) {
    const todayDate = parseLocalDate(today);
    const lastActivity = parseLocalDate(data.lastActivityDate);
    
    // Calculate full day difference in user's local timezone
    const diffTime = Math.abs(todayDate.getTime() - lastActivity.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      // Consecutive calendar day!
      newCurrentStreak = (data.currentStreak || 0) + 1;
    } else {
      // Day was missed (> 1 day gap); streak resets to 1 on this new activity
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
    lastActivityType: activityType,
    lastLoginDate: activityType === 'login' ? today : data.lastLoginDate,
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

/**
 * Record a genuine daily login session event when the user signs in.
 */
export function recordDailyLogin(): StreakData {
  return recordStreakActivity('login');
}

/**
 * Record meaningful learning activity when user completes a module or video milestone.
 */
export function recordLearningActivity(): StreakData {
  return recordStreakActivity('learning');
}

// =========================================================================
// ISOLATED EVALUATION SIMULATION SANDBOX (DOES NOT MUTATE REAL USER DATA)
// =========================================================================

export function getSimulatedStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, badges: [] };
  }

  try {
    const data = localStorage.getItem(SIMULATION_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return {
          currentStreak: Number(parsed.currentStreak) || 0,
          longestStreak: Number(parsed.longestStreak) || 0,
          lastActivityDate: parsed.lastActivityDate || null,
          badges: Array.isArray(parsed.badges) ? parsed.badges : []
        };
      }
    }
  } catch (e) {}

  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    badges: [],
  };
}

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
    lastActivityType: 'learning',
    badges,
  };

  try {
    localStorage.setItem(SIMULATION_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('simulationUpdated'));
  }
  return data;
}

export function simulateMissedDay(): StreakData {
  const current = getSimulatedStreakData();
  const twoDaysAgo = getTwoDaysAgoDateKey();

  const data: StreakData = {
    ...current,
    currentStreak: 0,
    lastActivityDate: twoDaysAgo,
  };

  try {
    localStorage.setItem(SIMULATION_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('simulationUpdated'));
  }
  return data;
}

export function simulateYesterdayActive(streakBeforeToday = 6): StreakData {
  const yesterday = getYesterdayDateKey();
  const current = getSimulatedStreakData();
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
    localStorage.setItem(SIMULATION_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('simulationUpdated'));
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
    localStorage.removeItem(STREAK_KEY);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('streakUpdated'));
  }
  return data;
}

export function recordSimulatedLearningActivity(): StreakData {
  const current = getSimulatedStreakData();
  const today = getLocalDateKey();

  if (current.lastActivityDate === today) {
    return current;
  }

  let newCurrentStreak = 1;
  if (current.lastActivityDate) {
    const todayDate = parseLocalDate(today);
    const lastActivity = parseLocalDate(current.lastActivityDate);
    const diffTime = Math.abs(todayDate.getTime() - lastActivity.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newCurrentStreak = (current.currentStreak || 0) + 1;
    } else {
      newCurrentStreak = 1;
    }
  }

  const badges = [...current.badges];
  if (newCurrentStreak >= 3 && !badges.includes('3-Day Streak')) badges.push('3-Day Streak');
  if (newCurrentStreak >= 7 && !badges.includes('7-Day Streak')) badges.push('7-Day Streak');
  if (newCurrentStreak >= 14 && !badges.includes('14-Day Streak')) badges.push('14-Day Streak');
  if (newCurrentStreak >= 30 && !badges.includes('30-Day Streak')) badges.push('30-Day Streak');

  const updated: StreakData = {
    currentStreak: newCurrentStreak,
    longestStreak: Math.max(current.longestStreak, newCurrentStreak),
    lastActivityDate: today,
    lastActivityType: 'learning',
    badges,
  };

  try {
    localStorage.setItem(SIMULATION_KEY, JSON.stringify(updated));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('simulationUpdated'));
  }
  return updated;
}

export function resetSimulatedStreakData(): StreakData {
  const data: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    badges: [],
  };

  try {
    localStorage.setItem(SIMULATION_KEY, JSON.stringify(data));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('simulationUpdated'));
  }
  return data;
}
