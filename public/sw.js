const CACHE_NAME = 'coursera-clone-cache-v3';

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
            console.log('[SW] Deleting stale cache:', cacheName);
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

  // CRITICAL: NEVER intercept or synthesize 503 text for Next.js internal assets, chunks, APIs, or video streams.
  // Next.js handles immutable chunk caching natively. Intercepting _next/ causes ChunkLoadError and SyntaxError when deployments update.
  if (
    event.request.url.includes('/_next/') ||
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('youtu.be') ||
    event.request.url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    return; // Pass through directly to browser network
  }

  // Handle navigation requests (e.g. user opening or refreshing a page)
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
          // Offline fallback
          const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
          if (cachedResponse) {
            return cachedResponse;
          }

          try {
            const path = new URL(event.request.url).pathname;
            const pathCache = await caches.match(path);
            if (pathCache) return pathCache;

            // Only return root cache if navigating to root '/'
            if (path === '/') {
              const rootCache = await caches.match('/');
              if (rootCache) return rootCache;
            }
          } catch(e) {}

          return new Response('Network unavailable and page not cached for offline access.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        })
    );
    return;
  }

  // For static assets (images, fonts, offline downloads)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.match(event.request).then((has) => {
              if (has) cache.put(event.request, res.clone()).catch(() => {});
            });
          }).catch(() => {});
        }
        return res;
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
