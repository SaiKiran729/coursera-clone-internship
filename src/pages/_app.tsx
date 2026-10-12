import Fotter from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect, useState, useRef, Component as ReactComponent, ErrorInfo } from "react";
import { getReminders, cancelReminder, deliverCourseNotification } from "@/utils/notifications";
import { BellRing, X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends ReactComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[App ErrorBoundary] Caught client exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 text-sm max-w-md mb-4">
            A temporary client exception occurred. Please reload to refresh the page.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.location.reload();
            }}
            className="px-5 py-2.5 bg-[#0056D2] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm min-h-[44px]"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  // In-app visual reminder toast state
  const [activeToast, setActiveToast] = useState<{
    courseId: string;
    courseTitle: string;
    body: string;
  } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeProcessingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Service worker registration with fallback if load already fired
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('[SW] Service Worker registered successfully with scope:', registration.scope);
            registration.update().catch(() => {});
          },
          (err) => {
            console.warn('[SW] Service Worker registration failed:', err);
          }
        );
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 2. Listen for in-app reminder events to display visual toast in foreground
    const handleReminderFired = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId: string; courseTitle: string; body: string }>;
      if (customEvent.detail) {
        console.log('[Reminders] Displaying in-app toast for:', customEvent.detail);
        setActiveToast(customEvent.detail);
      }
    };
    window.addEventListener('courseReminderFired', handleReminderFired);

    // 3. Exact Reminder scheduling & Overdue checking logic
    const checkReminders = async () => {
      const reminders = getReminders();
      const now = Date.now();
      let earliestNextTimestamp: number | null = null;

      for (const courseId in reminders) {
        const item = reminders[courseId];
        if (!item || typeof item.reminderAt !== 'number') continue;

        if (item.reminderAt <= now) {
          // Prevent race conditions and duplicate triggers
          if (activeProcessingRef.current.has(courseId)) continue;
          activeProcessingRef.current.add(courseId);

          console.log(`[Reminders] Reminder due for course "${courseId}" (scheduled: ${new Date(item.reminderAt).toLocaleTimeString()}, now: ${new Date(now).toLocaleTimeString()})`);

          try {
            await deliverCourseNotification(courseId, item.courseTitle);
          } catch (e) {
            console.error('[Reminders] Failed to deliver course notification:', e);
          } finally {
            // Remove reminder so it never fires again
            cancelReminder(courseId);
            activeProcessingRef.current.delete(courseId);
          }
        } else {
          // Track upcoming reminders to schedule precise timer
          if (earliestNextTimestamp === null || item.reminderAt < earliestNextTimestamp) {
            earliestNextTimestamp = item.reminderAt;
          }
        }
      }

      // Schedule exact setTimeout for the next closest reminder
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (earliestNextTimestamp !== null) {
        const timeUntil = Math.max(100, earliestNextTimestamp - Date.now());
        // Only set timeout if within next 2 hours to avoid large 32-bit integer overflow
        if (timeUntil < 2 * 60 * 60 * 1000) {
          console.log(`[Reminders] Scheduling precise timer to trigger in ${Math.round(timeUntil / 1000)}s`);
          timeoutRef.current = setTimeout(() => {
            checkReminders();
          }, timeUntil + 50); // slight buffer to ensure reminderAt <= now is true
        }
      }
    };

    checkReminders();
    window.addEventListener('remindersUpdated', checkReminders);
    // Interval check every 3 seconds as a safety net for background recovery
    const interval = setInterval(checkReminders, 3000);

    return () => {
      window.removeEventListener('remindersUpdated', checkReminders);
      window.removeEventListener('courseReminderFired', handleReminderFired);
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Auto-dismiss in-app toast after 8 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  return (
    <div className="bg-white min-h-screen relative">
      <Navbar />

      {/* Floating In-App Reminder Toast Banner (Ensures 100% visible feedback on Mobile & Desktop) */}
      {activeToast && (
        <div 
          id="course-reminder-toast"
          className="fixed bottom-4 right-4 sm:top-20 sm:bottom-auto z-[999] max-w-sm sm:max-w-md w-[calc(100%-2rem)] mx-auto bg-white border-2 border-blue-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 sm:slide-in-from-top-5 duration-300 flex items-start space-x-3.5"
        >
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl flex-shrink-0 animate-bounce">
            <BellRing className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
              <span>Coursera Reminder</span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Active</span>
            </h4>
            <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-snug">
              {activeToast.body}
            </p>
            <div className="mt-2.5 flex items-center space-x-3">
              <Link
                href={`/course/${activeToast.courseId}`}
                onClick={() => setActiveToast(null)}
                className="inline-flex items-center text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center flex-shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
      <Fotter />
    </div>
  );
}
