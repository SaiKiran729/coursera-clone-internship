export const REMINDERS_KEY = 'course_reminders';

export interface RemindersMap {
  [courseId: string]: { reminderAt: number };
}

export function getReminders(): RemindersMap {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Corrupt reminders data", e);
    return {};
  }
}

export function setReminder(courseId: string, timestamp: number) {
  const reminders = getReminders();
  reminders[courseId] = { reminderAt: timestamp };
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('remindersUpdated'));
}

export function cancelReminder(courseId: string) {
  const reminders = getReminders();
  if (reminders[courseId]) {
    delete reminders[courseId];
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('remindersUpdated'));
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  
  return await Notification.requestPermission();
}
