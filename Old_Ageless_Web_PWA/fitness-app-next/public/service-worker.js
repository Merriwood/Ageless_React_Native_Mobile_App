/**
 * Service Worker for Fitness Tracker PWA
 *
 * Strategy:
 * - Cache version: ft-static-v1 (increment on updates)
 * - Network-first for /api/* (always try fresh data)
 * - Cache-first for static assets (/icons/*, *.js, *.css)
 * - Network-first for HTML with fallback
 * - Offline response: 503 Offline for failed API calls
 *
 * Source of Truth: claude.md Section 20.1.A
 */

const CACHE_VERSION = 'ft-static-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
];

/**
 * Install: Pre-cache static assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Install: Some assets failed to cache', err);
        // Don't fail install if some assets can't be cached
      });
    })
  );
  // Activate immediately (don't wait for clients)
  self.skipWaiting();
});

/**
 * Activate: Clean up old cache versions
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch: Routing based on request type
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // API routes: Network-first (always try fresh)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: Cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages: Network-first with cache fallback
  event.respondWith(networkFirstHtml(request));
});

/**
 * Network-first strategy for API calls
 * Try network, fall back to cache, then offline response
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses (200-299)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // No cache, return offline response
    return new Response(
      JSON.stringify({ error: 'Offline', status: 503 }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Cache-first strategy for static assets
 * Use cache, fall back to network
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return placeholder for missing assets
    return new Response('Not Available Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network-first for HTML (pages)
 * Try network first, fall back to cache
 */
async function networkFirstHtml(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Offline fallback page (if exists)
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    // Last resort: generic offline response
    return new Response(
      'Application offline. Please check your connection.',
      { status: 503, statusText: 'Service Unavailable' }
    );
  }
}
