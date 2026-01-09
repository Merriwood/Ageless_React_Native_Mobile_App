// Service Worker build tag. Bump on every deploy to ensure clients fetch the latest worker.
const SW_BUILD = 'v32-home-icon-20251208a'; // update on each deploy (commit short SHA or date tag)
const CACHE_NAME = 'ft-static-'+SW_BUILD;
// Precache only truly static, rarely changing assets (icons & manifest). HTML/CSS/JS use network-first.
const ASSETS = [
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/Revised_credit_card2.svg',
  './icons/Boxicon.png', // precache Rewards nav icon (PNG) for offline reliability
  './icons/bagicon.jpg', // legacy
  './icons/resized_bagicon_24x24.png', // new Transactions PNG icon
  './icons/Helpicon.png' // Help & policies PNG icon
  // ,'./icons/bagicon-transactions@2x.png' // TODO(after approval): precache Transactions icon for offline
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS);
    } catch (err) {
      // Partial cache okay; do not fail install entirely
      console.warn('SW install cache error', err);
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null));
    const clientsArr = await self.clients.matchAll({ includeUncontrolled: true });
    clientsArr.forEach(c => c.postMessage({ type: 'SW_ACTIVATED', cache: CACHE_NAME, version: SW_BUILD }));
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // Non-GET passthrough
  const url = new URL(req.url);
  // Bypass caching for API calls entirely
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req).catch(() => new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept')||'').includes('text/html');
  const isAsset = /\.js($|\?|#)|\.css($|\?|#)/.test(url.pathname);
  if (isHTML || isAsset) {
    // Network-first for HTML/JS/CSS to mitigate stale deploy issues.
    event.respondWith((async () => {
      try {
        const netRes = await fetch(req, { cache: 'no-store' });
        // Optionally update cache for offline use
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, netRes.clone());
        return netRes;
      } catch (e) {
        const cached = await caches.match(req);
        if (cached) return cached;
        throw e; // propagate
      }
    })());
    return;
  }
  // Other static assets: cache-first
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (url.origin === location.origin && ASSETS.some(a => req.url.endsWith(a.replace('./','')) || req.url.endsWith(a.slice(2)))) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) { throw e; }
  })());
});

// Listen for skipWaiting request
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Optional hard purge request from clients (deletes ALL caches on this origin)
  if (event.data && event.data.type === 'PURGE_ALL') {
    event.waitUntil((async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        const clientsArr = await self.clients.matchAll({ includeUncontrolled: true });
        clientsArr.forEach(c => c.postMessage({ type: 'SW_PURGED', version: SW_BUILD }));
      } catch (e) {
        // no-op
      }
    })());
  }
});
