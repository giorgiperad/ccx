// sw.js
const CACHE_NAME = 'crypto-collective-v5'; // Keep this, but we'll force update
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Add a unique cache-busting query param based on build time
const VERSION = 'v3.0.0-' + new Date().getTime(); // Or use git hash / build ID
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

// Install: Cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS.map(url => `${url}?v=${VERSION}`));
    }).then(() => self.skipWaiting()) // Force new SW to activate
  );
});

// Activate: Delete old caches + take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && !key.startsWith('dynamic-')) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages
  );
});

// Fetch: Network-first for API, Cache-first with fallback for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. API calls → always network
  if (
    url.origin.includes('coingecko.com') ||
    url.origin.includes('alternative.me') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses for 1 min
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then(cached => {
            return cached || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // 2. Static assets → cache first, then network (stale-while-revalidate)
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' || 
      event.request.destination === 'document' ||
      CORE_ASSETS.some(asset => url.pathname === new URL(asset, self.location).pathname)) {
    
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        }).catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 3. Everything else → network only
  event.respondWith(fetch(event.request));
});

// Optional: Listen for update prompt
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
