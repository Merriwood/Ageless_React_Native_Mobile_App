/**
 * Runtime Configuration Example
 * -------------------------------------------------------------
 * Copy this file to the same directory as:  runtime-config.js
 * (DO NOT commit runtime-config.js – it's gitignored) and edit
 * the values for each deployment environment.
 *
 * The HTML bootstrapping script merges this object with the
 * immutable fallback (window.__MBH_RUNTIME_FALLBACK__) into
 * window.__MBH_CONFIG which the app consumes.
 *
 * Only include NON-SENSITIVE values here (public at runtime).
 */

// Define environment specific overrides
window.__MBH_RUNTIME_CONFIG__ = {
  // Base URL for API calls. Use empty string for same-origin relative paths
  // Examples:
  //   ""                  -> fetch('/api/...') (same host)
  //   "https://api.example.com" -> fetch('https://api.example.com/api/...')
  API_BASE_URL: "",

  // Feature flag toggles (add new flags as needed)
  FEATURE_FLAGS: {
    ENABLE_ANALYTICS: false,
    ENABLE_EXPERIMENTAL_UI: false
  },

  // Optional build metadata for diagnostics / footer display
  BUILD_METADATA: {
    version: "0.0.0-dev",
    generatedAt: new Date().toISOString(),
    commit: "(local)"
  }
};

// (Optional) Simple validation – safe to remove or extend
try {
  const cfg = window.__MBH_RUNTIME_CONFIG__ || {}; 
  if (typeof cfg.API_BASE_URL !== 'string') console.warn('[runtime-config] API_BASE_URL should be a string');
} catch(_) {}
