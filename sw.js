const CACHE_NAME = 'pixelpal-v2.2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './audio.js',
  './pet.js',
  './shop.js',
  './inventory.js',
  './quests.js',
  './minigames.js',
  './save.js',
  './ui.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install Event - Pre-caches all main app shell files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cleans up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve assets from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache external requests like Google Fonts stylesheets
        if (e.request.url.startsWith('http') && 
            (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com'))) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
