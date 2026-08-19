// sw.js · Service Worker para Marejada 2.0 (PWA Offline-First)
const CACHE_NAME = 'marejada-v2.5.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './player.html',
  './admin.html',
  './dashboard.html',
  './manifest.json',
  './css/style.css',
  './css/animations.css',
  './css/regatta.css',
  './js/config.js',
  './js/icons.js',
  './js/utils.js',
  './js/audio.js',
  './js/canvas-fx.js',
  './js/regatta.js',
  './js/mechanics.js',
  './js/host.js',
  './js/player.js',
  './js/admin.js',
  './js/dashboard.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Error precaching static assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Excluir llamadas de Supabase REST y WebSockets (Network Only)
  if (url.hostname.includes('supabase.co') || event.request.method !== 'GET') {
    return;
  }

  // Estrategia Stale-While-Revalidate para assets locales
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
