import Fotter from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { getReminders, cancelReminder } from "@/utils/notifications";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Service worker logic
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          },
          function (err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }

    // Reminder logic
    const checkReminders = () => {
      const reminders = getReminders();
      const now = Date.now();
      for (const courseId in reminders) {
        if (reminders[courseId].reminderAt <= now) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Coursera Clone Reminder', {
              body: `It's time to continue your learning journey!`,
              icon: '/favicon.ico'
            });
          }
          // Remove it after triggering so it doesn't fire again
          cancelReminder(courseId);
        }
      }
    };

    checkReminders(); // check on load (catches ones that expired while closed)
    const interval = setInterval(checkReminders, 60000); // check every minute while open

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Component {...pageProps} />
      <Fotter/>
    </div>
  );
}
