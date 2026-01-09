// DEPRECATED: Root service-worker.js retained only to prevent accidental registration.
// Canonical PWA assets now live under /web/. If this SW is registered, it will unregister itself
// and prompt clients to register /web/service-worker.js instead.
self.addEventListener('install', (e)=>{ self.skipWaiting(); });
self.addEventListener('activate', async (e)=>{
  const clientsArr = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of clientsArr) {
    c.postMessage({ type: 'SW_DEPRECATED', note: 'Use /web/service-worker.js' });
  }
  // Unregister self
  self.registration.unregister();
});
self.addEventListener('fetch', ()=>{});
