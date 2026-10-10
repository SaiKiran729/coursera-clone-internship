const CACHE_NAME = 'coursera-clone-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignore API calls, external resources, and videos
  if (
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('youtu.be') ||
    event.request.method !== 'GET'
  ) {
    return; // Let the browser handle it
  }

  // Use Network First strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the valid response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});
