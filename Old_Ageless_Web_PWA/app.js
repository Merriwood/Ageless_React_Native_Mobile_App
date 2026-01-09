// DEPRECATED: Root app.js no longer used.
// Canonical client logic: /web/app.js
// This stub prevents accidental execution divergence.
(function(){
  if (typeof window !== 'undefined') {
    console.warn('[DEPRECATED] root app.js loaded. Use /web/app.js only.');
    // Optional: redirect if this file is still referenced
    if (!window.location.pathname.startsWith('/web/')) {
      // Attempt soft redirect to canonical path if index served from root
      // Comment out if server routing differs.
      try { window.location.replace('/web/'); } catch(_) {}
    }
  }
})();
