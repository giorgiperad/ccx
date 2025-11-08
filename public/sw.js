const CACHE_NAME = 'crypto-collective-v3';
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

// Fetch event: Network first for API calls, cache first for static assets
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For API calls (CoinGecko, alternative.me, Vercel proxy): Always fetch fresh (Network First)
  if (event.request.url.includes('coingecko.com') || 
      event.request.url.includes('alternative.me') ||
      event.request.url.includes('/api/crypto')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response('Offline: Market data unavailable.', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
    );
    return;
  }

  // For static assets (HTML, CSS, images): Cache First
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
caches.open(CACHE_NAME)
    .then((cache) => {
        // Only cache http/https requests
        if (event.request.url.startsWith('http')) {
            cache.put(event.request, responseToCache);
        }
    })
    .catch((err) => console.log('Cache error:', err));
          return fetchResponse;
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  return self.clients.claim();
});
