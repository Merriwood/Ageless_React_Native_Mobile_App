// === CONFIG ===
const API_BASE = "";
const MAX_SETS = 4;
const IS_PRODUCTION = !window.location.hostname.includes('localhost');

// Production-safe logging
const logger = {
  log: IS_PRODUCTION ? () => {} : console.log,
  error: console.error, // Always log errors
  warn: IS_PRODUCTION ? () => {} : console.warn
};

const exercises = [
  { name: "Bike", unit: "Min", reps: 60 },
  { name: "Abs", unit: "Reps", reps: 100 },
  { name: "Chest Press", unit: "Reps", reps: 20 },
  { name: "Leg Press", unit: "Reps", reps: 20 },
  { name: "Lat", unit: "Reps", reps: 20 },
  { name: "Military", unit: "Reps", reps: 20 },
  { name: "Crunch", unit: "Reps", reps: 100 },
  { name: "Bicep Curls", unit: "Reps", reps: 20 },
  { name: "Triceps", unit: "Reps", reps: 40 },
  { name: "Overhead Pull", unit: "Reps", reps: 40 },
  { name: "Row", unit: "Reps", reps: 20 }
];

// === AUTH / STORAGE ===
const tokenKey = "ft.jwt";
const outboxKey = "ft.outbox";

// Optimized token management with validation
function getToken() {
  const token = localStorage.getItem(tokenKey);
  if (!token) return null;
  
  try {
    // Basic JWT validation (decode payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      clearToken();
      return null;
    }
    return token;
  } catch {
    clearToken();
    return null;
  }
}

function setToken(token) { 
  localStorage.setItem(tokenKey, token); 
}

function clearToken() { 
  localStorage.removeItem(tokenKey); 
  localStorage.removeItem(outboxKey);
}

// Enhanced API function with better error handling and retry logic
async function api(path, { method = "GET", body, retries = 3 } = {}) {
  const token = getToken();
  const headers = { 
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(API_BASE + path, {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        if (!navigator.onLine && method === "POST") {
          queueOutbox({ path, method, body });
          return { queued: true };
        }
        throw error;
      }
      
      // Exponential backoff for retries
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
