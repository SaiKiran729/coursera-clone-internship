const CACHE_NAME = 'coursera-clone-cache-v4';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache root page and favicon for safe fallback
      return cache.addAll(['/', '/favicon.ico']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore non-HTTP/HTTPS schemes (e.g. chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Bypass external video streams, non-GET, and APIs
  if (
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('youtu.be') ||
    event.request.url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 1. Handle Navigation Requests (e.g. opening or refreshing a course page)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            }).catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback for navigation
          const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
          if (cachedResponse) {
            return cachedResponse;
          }

          try {
            const url = new URL(event.request.url);
            const path = url.pathname;
            const pathCache = await caches.match(path);
            if (pathCache) return pathCache;

            // If navigating to root, return root
            if (path === '/') {
              const rootCache = await caches.match('/');
              if (rootCache) return rootCache;
            }
          } catch(e) {}

          return new Response(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline — Coursera Clone</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,-apple-system,sans-serif;padding:2rem;text-align:center;color:#1f2937}h1{color:#0056D2}p{margin:1rem 0}a{display:inline-block;padding:0.75rem 1.5rem;background:#0056D2;color:#fff;text-decoration:none;border-radius:0.5rem}</style></head><body><h1>Offline Mode Active</h1><p>This page has not been downloaded for offline access. Please reconnect to view new courses.</p><a href="/">Return to Home</a></body></html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
    );
    return;
  }

  // 2. Handle Next.js Versioned Static Assets (JavaScript chunks, CSS stylesheets, fonts)
  // Strategy: Network-First with Cache Fallback (guarantees fresh code online, working assets offline)
  if (event.request.url.includes('/_next/static/') || event.request.url.includes('/_next/data/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response('', { status: 404, statusText: 'Not in Offline Cache' });
        })
    );
    return;
  }

  // 3. Handle Other Static Assets (Images, fonts, icons)
  // Strategy: Cache-First with Network Fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return networkResponse;
      }).catch(() => {
        return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
      });
    })
  );
});

// Handle Notification Clicks (Android Chrome and Desktop)
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if a tab is already open with the course URL and focus it
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Web Push event listener (supports server-sent push when browser tab is closed)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  let data = {
    title: 'Coursera Reminder 🎓',
    body: "It's time to continue your learning journey!",
    url: '/'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'course-reminder-push',
    renotify: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
