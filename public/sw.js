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
        // Cache the valid response
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If it's a navigation request and we are offline, try to return the cached root HTML or page HTML
        if (event.request.mode === 'navigate') {
           const rootCache = await caches.match(event.request.url) || await caches.match('/');
           if (rootCache) return rootCache;
        }
      })
  );
});
