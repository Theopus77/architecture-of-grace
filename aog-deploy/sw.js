/* Architecture of Grace — offline service worker
 * Cache-first for assets, network-first for the page, so the regulation tools,
 * PECS images, and breathing guides stay responsive at zero latency even with
 * no internet (sensory closets, basement classrooms, Wi-Fi dead zones).
 *
 * The CACHE name carries the build version, which build.py stamps automatically
 * on every build — so each new deploy invalidates the old cache and returning
 * visitors always get the fresh page. No manual version bumping required.
 */
const CACHE = 'aog-cache-2026.07.02.1200';

// Same-origin essentials — reliable to precache at install.
const PRECACHE = [
  './', './index.html', './aog-styles.css', './manifest.json', './og-image.png',
  './favicon.ico', './favicon-16.png', './favicon-32.png',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png',
  './AoG-Pocket-Reset-Golf.html'
];

// Cross-origin extras that complete the offline experience (the dyslexia font).
// Cached best-effort — a failure here must NEVER block install of the core.
const PRECACHE_OPTIONAL = [
  'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-400-normal.woff2',
  'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-700-normal.woff2'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    PRECACHE_OPTIONAL.forEach(function (u) { c.add(u).catch(function () {}); }); // best-effort
    return c.addAll(PRECACHE).catch(function () {});                              // core
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // The page itself: network-first (so updates land), fall back to cache offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (r) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return r;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match('./index.html'); });
      })
    );
    return;
  }

  // Everything else (fonts, css, images): cache-first, then network, then cache it.
  e.respondWith(
    caches.match(req).then(function (m) {
      return m || fetch(req).then(function (r) {
        if (r && r.status === 200 && (r.type === 'basic' || r.type === 'cors')) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return r;
      }).catch(function () { return m; });
    })
  );
});
