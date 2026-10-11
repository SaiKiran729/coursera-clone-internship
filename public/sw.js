const CACHE_NAME = 'coursera-clone-cache-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache the root page for offline fallback
      return cache.addAll(['/']);
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

  // Ignore API calls, external resources, and videos
  if (
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('youtu.be') ||
    event.request.url.includes('/api/') || // Ignore Next.js API routes if any
    event.request.method !== 'GET'
  ) {
    return; // Let the browser handle it
  }

  // Use Network First strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the valid basic response
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If it's a navigation request and we are offline, try to return the cached root HTML or page HTML
        if (event.request.mode === 'navigate') {
          try {
            const path = new URL(event.request.url).pathname;
            const pathCache = await caches.match(path) || await caches.match(event.request.url, { ignoreSearch: true });
            if (pathCache) return pathCache;
          } catch(e) {}

          const rootCache = await caches.match('/');
          if (rootCache) return rootCache;
        }

        // Return a clean fallback Response to prevent Chrome Uncaught TypeError in respondWith
        return new Response('Network unavailable and resource not cached.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
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
