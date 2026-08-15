/* QuizMe Offline — service worker.
   Caches the whole app shell (HTML + icons + manifest) on first load so the
   app keeps working — including every icon — with zero network at all,
   the same way it already works when opened straight from disk. Bump
   CACHE_NAME whenever index.html changes so returning visitors get the
   update instead of a stale cached copy. */

const CACHE_NAME = 'mindbattle-offline-v3';
const SCOPE_URL = self.registration ? self.registration.scope : './';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  'icons/app-logo.png',
  'icons/arrow-right.png',
  'icons/avatar-1.png',
  'icons/avatar-2.png',
  'icons/avatar-3.png',
  'icons/avatar-4.png',
  'icons/avatar-5.png',
  'icons/avatar-6.png',
  'icons/avatar-7.png',
  'icons/avatar-8.png',
  'icons/backspace.png',
  'icons/bell.png',
  'icons/bolt.png',
  'icons/camera.png',
  'icons/chart.png',
  'icons/check-circle.png',
  'icons/check.png',
  'icons/chevron-left.png',
  'icons/clock.png',
  'icons/controller.png',
  'icons/copy.png',
  'icons/edit.png',
  'icons/favicon-192.png',
  'icons/favicon-512.png',
  'icons/fire.png',
  'icons/home.png',
  'icons/hotspot.png',
  'icons/list.png',
  'icons/lock.png',
  'icons/logout.png',
  'icons/mail.png',
  'icons/medal-bronze.png',
  'icons/medal-gold.png',
  'icons/medal-silver.png',
  'icons/people.png',
  'icons/play.png',
  'icons/plus.png',
  'icons/profile.png',
  'icons/quiz.png',
  'icons/search.png',
  'icons/skip.png',
  'icons/star.png',
  'icons/target.png',
  'icons/trash.png',
  'icons/trophy.png',
  'icons/wifi.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('QuizMe SW install: failed to cache app shell', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first for everything in our own origin/scope — this app has no
// backend and no dynamic data over the network, so there's nothing to
// "go stale" other than the app shell itself, which is versioned by
// CACHE_NAME above. Falls back to the network (useful only while
// developing over http/https), and finally to the cached index.html for
// any navigation request so deep-refreshes still work offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok && req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === 'navigate') return caches.match('./index.html');
          return caches.match('./icons/favicon-192.png');
        });
    })
  );
});
