const CACHE_NAME = 'crypto-collective-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event: Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: Serve from cache if offline, otherwise fetch fresh
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (e.g., API POSTs)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Clone the request for API calls (CoinGecko etc.)
        return fetch(event.request).then((fetchResponse) => {
          // Check if it's a successful response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Clone and cache the response for future offline use
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return fetchResponse;
        }).catch(() => {
          // Offline fallback: Show a custom offline message for API routes
          if (event.request.url.includes('coingecko.com') || event.request.url.includes('alternative.me')) {
            return new Response('Offline: Market data unavailable. Please check your connection.', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          }
          // For other assets, return cached or empty
          return caches.match(event.request) || new Response('Offline');
        });
      })
  );
});

// Activate event: Clean up old caches
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
    })
  );
});
