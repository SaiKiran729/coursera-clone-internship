export const REMINDERS_KEY = 'course_reminders';

export interface ReminderItem {
  reminderAt: number;
  courseTitle?: string;
}

export interface RemindersMap {
  [courseId: string]: ReminderItem;
}

export function getReminders(): RemindersMap {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("[Reminders] Corrupt reminders data:", e);
    return {};
  }
}

export function setReminder(courseId: string, timestamp: number, courseTitle?: string) {
  const reminders = getReminders();
  reminders[courseId] = { reminderAt: timestamp, courseTitle };
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  console.log(`[Reminders] Reminder saved for "${courseTitle || courseId}" at timestamp ${timestamp} (${new Date(timestamp).toLocaleTimeString()})`);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('remindersUpdated'));
}

export function cancelReminder(courseId: string) {
  const reminders = getReminders();
  if (reminders[courseId]) {
    delete reminders[courseId];
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    console.log(`[Reminders] Reminder cancelled for course ${courseId}`);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('remindersUpdated'));
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[Reminders] Notification API not supported in this environment');
    return 'unsupported';
  }

  try {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';

    // Standard Promise-based permission request
    const permission = await Notification.requestPermission();
    console.log('[Reminders] Notification.requestPermission result:', permission);
    return permission;
  } catch (err) {
    console.error('[Reminders] Error requesting notification permission:', err);
    return 'unsupported';
  }
}

/**
 * Deliver a notification reliably across both Desktop and Android Chrome.
 * Android Chrome strictly requires ServiceWorkerRegistration.showNotification().
 */
export async function deliverCourseNotification(
  courseId: string,
  courseTitle?: string
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const title = 'Coursera Reminder 🎓';
  const body = courseTitle
    ? `Time to continue your learning journey in "${courseTitle}"!`
    : "It's time to continue your learning journey!";

  const options: NotificationOptions & { renotify?: boolean; [key: string]: any } = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `course-reminder-${courseId}`,
    renotify: true,
    data: {
      url: `/course/${courseId}`,
      courseId
    }
  };

  console.log('[Reminders] Delivering notification for course:', courseId, title, options);

  // Dispatch custom in-app event so UI can display a visible toast banner in foreground
  window.dispatchEvent(
    new CustomEvent('courseReminderFired', {
      detail: { courseId, courseTitle: courseTitle || 'your course', body }
    })
  );

  // If Notification API is not available or permission is not granted, we can't show system alert
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('[Reminders] System notification skipped: permission is', ('Notification' in window ? Notification.permission : 'unsupported'));
    return false;
  }

  // 1. Primary Method for Android Chrome and PWAs: ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      let reg: ServiceWorkerRegistration | undefined = await navigator.serviceWorker.getRegistration();
      if (!reg || !reg.active) {
        reg = await navigator.serviceWorker.ready;
      }

      if (reg && typeof reg.showNotification === 'function') {
        console.log('[Reminders] Showing notification via ServiceWorkerRegistration.showNotification');
        await reg.showNotification(title, options);
        return true;
      }
    } catch (swError) {
      console.warn('[Reminders] ServiceWorker showNotification failed, attempting fallback:', swError);
    }
  }

  // 2. Fallback for Desktop Browsers: new Notification()
  try {
    console.log('[Reminders] Showing notification via new Notification()');
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      if (courseId) {
        window.location.href = `/course/${courseId}`;
      }
      n.close();
    };
    return true;
  } catch (notifErr) {
    console.error('[Reminders] new Notification() failed (expected on Android Chrome if SW unavailable):', notifErr);
    return false;
  }
}
