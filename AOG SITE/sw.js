/* Architecture of Grace - service worker
   Bump CACHE_VERSION (v1 -> v2 -> ...) when you want installed
   devices to discard cached assets and re-download everything. */
const CACHE_VERSION = 'aog-v1';

const CORE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: pre-cache the core files, activate immediately.
self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CORE).catch(function () { /* ignore any missing file */ });
    })
  );
});

// Activate: delete any old caches, take control of open pages.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Fetch strategy:
//  - Page navigations: network-first (so people see updates when online),
//    falling back to the cached page when offline.
//  - Other same-origin GETs: cache-first, then network (and cache the result).
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put('/index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('/index.html').then(function (hit) {
          return hit || caches.match('/');
        });
      })
    );
    return;
  }

  var sameOrigin = req.url.indexOf(self.location.origin) === 0;
  if (!sameOrigin) return; // let cross-origin (fonts, etc.) go straight to network

  event.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
    })
  );
});
