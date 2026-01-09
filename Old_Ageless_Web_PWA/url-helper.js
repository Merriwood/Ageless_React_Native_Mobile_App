// URL Configuration Helper
// Copy this after you deploy both services on Render

// STEP 1: Replace this with your actual backend service URL from Render
const BACKEND_URL = "https://fitness-tracker-api-xyz.onrender.com";

// STEP 2: Replace this with your actual frontend service URL from Render  
const FRONTEND_URL = "https://fitness-tracker-web-abc.onrender.com";

// STEP 3: Update web/app.js line 3:
console.log(`Update web/app.js line 3 to:`);
console.log(`const API_BASE = "${BACKEND_URL}";`);

// STEP 4: Update backend CORS_ORIGIN environment variable:
console.log(`\nUpdate backend CORS_ORIGIN to:`);
console.log(`${FRONTEND_URL}`);

// Test URLs:
console.log(`\nTest your deployment:`);
console.log(`Frontend: ${FRONTEND_URL}`);
console.log(`Backend Health: ${BACKEND_URL}/healthz`);
console.log(`Backend API: ${BACKEND_URL}/api/me`);
