# Testing Environment Setup - Phase 2

**Date:** 2026-01-10
**Purpose:** Configure mobile app to connect to real Render API for testing
**Status:** ⏳ PENDING COMPLETION

---

## Quick Start (5 minutes)

### Step 1: Create .env File

Create a new file `Ageless_REACT-Native_Mobile_Application/mobile-app/.env`:

```bash
# Render API Configuration
EXPO_PUBLIC_API_URL=https://ageless-api.render.com
```

**OR** (alternative - choose ONE):

```bash
REACT_APP_API_URL=https://ageless-api.render.com
```

### Step 2: Determine Render API Endpoint

**Option A: Use Default**
- The app defaults to `https://ageless-api.render.com`
- If this is correct, you can skip .env file creation
- The app will work immediately

**Option B: Find Exact Render URL**
1. Check PWA backend deployment on Render.com
2. Look for service name in `Old_Ageless_Web_PWA/render.yaml`
3. Find the actual deployed URL (usually https://service-name.render.com)
4. Add to .env file above

**Option C: Local Development**
1. If running backend locally: `http://localhost:3000`
2. Add to .env: `EXPO_PUBLIC_API_URL=http://localhost:3000`

### Step 3: Verify API is Accessible

Test the endpoint manually:

```bash
# In terminal or browser
curl https://ageless-api.render.com/api/summary?startDate=2026-01-01&endDate=2026-01-07

# OR use Postman/Insomnia to test
# GET https://ageless-api.render.com/api/summary?startDate=2026-01-01&endDate=2026-01-07
# Expected: 200 OK with workout data
```

### Step 4: Start App

```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"
npm start
# or
expo start
```

### Step 5: Begin Testing

Follow: `PHASE_2_TESTING_CHECKLIST.md`

---

## Detailed Setup Instructions

### Understanding Environment Variables

The app checks for API URL in this priority order:

1. **EXPO_PUBLIC_API_URL** (Expo projects)
2. **REACT_APP_API_URL** (React projects)
3. **NODE_ENV = 'development'** → Use `http://localhost:3000`
4. **Default** → Use `https://ageless-api.render.com`

### Creating .env File

**Method 1: Using Text Editor**

1. Open VSCode or your text editor
2. Create new file in `mobile-app/` directory
3. Name it: `.env`
4. Add content:
```
EXPO_PUBLIC_API_URL=https://ageless-api.render.com
```
5. Save file
6. Restart app with `npm start`

**Method 2: Using Terminal**

```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"

# Windows PowerShell
@"
EXPO_PUBLIC_API_URL=https://ageless-api.render.com
"@ | Out-File -Encoding UTF8 .env

# Or using bash
echo "EXPO_PUBLIC_API_URL=https://ageless-api.render.com" > .env

# Verify file created
cat .env
```

**Method 3: Using Node**

```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"
npm create-env.js  # if available
```

### Finding Render Deployment URL

**From render.yaml:**

```yaml
services:
  - type: web
    name: fitness-tracker-backend  # This is the service name
    env: node
    # ... rest of config
```

**Deployed URL Format:** `https://{service-name}.render.com`

**Example:**
- Service name: `fitness-tracker-backend`
- URL: `https://fitness-tracker-backend.render.com`

**To Find Your Exact URL:**

1. Log into Render.com dashboard
2. Find your service
3. Look for "Live URL" or "Service URL"
4. Copy the full URL
5. Add to .env file

### Testing API Connectivity

**Before starting app, verify API is accessible:**

```bash
# Test endpoint exists
curl -i "https://ageless-api.render.com/api/summary?startDate=2026-01-01&endDate=2026-01-07"

# Expected response:
# HTTP/1.1 200 OK
# {
#   "weekOfSunday": "2026-01-04",
#   "weightAvg": 175.5,
#   "workoutCount": 5,
#   "totals": { "Bike": 15, "Abs": 12, ... }
# }
```

**If request fails:**

1. Check URL is correct
2. Verify Render service is running (not paused)
3. Check internet connection
4. Verify firewall allows outbound connections
5. Check CORS is configured on backend

---

## API Response Format Verification

### Expected Response Structure

When calling `/api/summary`, expect this format:

```json
[
  {
    "weekOfSunday": "2026-01-04",
    "weightAvg": 175.5,
    "workoutCount": 5,
    "totals": {
      "Bike": 15,
      "Abs": 12,
      "Chest Press": 8,
      "Leg Press": 10,
      "Lat": 6,
      "Military": 9,
      "Crunch": 18,
      "Bicep Curls": 12,
      "Triceps": 9,
      "Overhead Pull": 4,
      "Row": 8,
      "Weight": 170.5
    }
  },
  // ... more weeks
]
```

### Verifying Exercise Names

**Check actual API response exercise names:**

1. Make request to your API: `curl "https://your-api/api/summary?startDate=2026-01-01&endDate=2026-01-07"`
2. Look at "totals" object
3. Note the exercise names (exactly as they appear)
4. Compare with mapping in `api/summary.ts` line 241-251

**Current Mapping in Code:**
```typescript
bike: summary.stats.exercises['bike']?.sets || 0,
abs: summary.stats.exercises['abs']?.sets || 0,
chestPress: summary.stats.exercises['chest press']?.sets || 0,
legPress: summary.stats.exercises['leg press']?.sets || 0,
lat: summary.stats.exercises['lat']?.sets || 0,
military: summary.stats.exercises['military']?.sets || 0,
crunch: summary.stats.exercises['crunch']?.sets || 0,
bicepCurls: summary.stats.exercises['bicep curls']?.sets || 0,
triceps: summary.stats.exercises['triceps']?.sets || 0,
overheadPull: summary.stats.exercises['overhead pull']?.sets || 0,
row: summary.stats.exercises['row']?.sets || 0,
```

**If Names Don't Match:**

1. Update the mapping in `api/summary.ts`
2. Use exact names from API response
3. Restart app
4. Test again

---

## Troubleshooting Setup Issues

### Issue: "Cannot find module 'axios'"

**Solution:**
```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"
npm install axios
npm start
```

### Issue: ".env file not being read"

**Solution:**

1. Verify file is named `.env` (not `.env.example` or `.env.local`)
2. Verify file is in `mobile-app/` root directory
3. Restart app completely: `npm start` (not hot reload)
4. Check console log: should say "API Client initialized with base URL: https://..."

### Issue: "Network error - Failed to fetch"

**Solution:**

1. Check internet connection is active
2. Verify API URL is correct
3. Test URL manually: `curl "https://your-api/api/summary?startDate=2026-01-01&endDate=2026-01-07"`
4. Verify Render service is running (not paused/suspended)
5. Check firewall allows outbound connections
6. Try with `http://localhost:3000` if backend running locally

### Issue: "Cannot find module './client'" when running app

**Solution:**

1. Verify `api/client.ts` exists in `mobile-app/api/` directory
2. Check file is created correctly (not empty)
3. Verify no typos in import statement
4. Run `npm test` to verify jest can find it

### Issue: Render API returns 401 Unauthorized

**Solution:**

1. Check if backend requires authentication
2. Verify user is logged in
3. Check if JWT token is needed
4. Verify auth headers are being sent correctly
5. Check backend auth configuration

### Issue: Render API returns 404 Not Found

**Solution:**

1. Verify endpoint URL is correct: `/api/summary`
2. Check base URL is correct
3. Verify backend has this endpoint deployed
4. Check no typos in API path

---

## Verification Checklist

Before beginning tests, verify:

### Environment Configuration
- [ ] .env file created in `mobile-app/` directory
- [ ] EXPO_PUBLIC_API_URL or REACT_APP_API_URL set to correct endpoint
- [ ] File saved properly (no encoding issues)

### API Accessibility
- [ ] Can access API endpoint from terminal: `curl https://api-url/api/summary?startDate=2026-01-01&endDate=2026-01-07`
- [ ] API returns 200 OK status
- [ ] API returns valid JSON with workout data
- [ ] Render service is running (not paused)

### App Configuration
- [ ] Run `npm test` - all 298 tests passing
- [ ] Start app: `npm start`
- [ ] App compiles without errors
- [ ] Check console log for: "API Client initialized with base URL: ..."
- [ ] No TypeScript compilation errors

### Network Configuration
- [ ] Device/emulator has internet connection
- [ ] Can reach other APIs/websites
- [ ] Firewall allows outbound connections
- [ ] No VPN blocking API access (if using VPN)

### Database Verification
- [ ] Render database has workout entries
- [ ] Test user has some workout history
- [ ] Data is from within last 52 weeks
- [ ] Multiple exercises have entries

---

## Configuring Multiple Environments

### Development (Local)
```bash
# .env
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Staging (Render Preview)
```bash
# .env
NODE_ENV=staging
EXPO_PUBLIC_API_URL=https://staging-ageless-api.render.com
```

### Production (Render Main)
```bash
# .env
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://ageless-api.render.com
```

---

## Environment Variables Reference

### Supported Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `EXPO_PUBLIC_API_URL` | API base URL (Expo) | `https://ageless-api.render.com` |
| `REACT_APP_API_URL` | API base URL (React) | `https://ageless-api.render.com` |
| `REACT_APP_API_TIMEOUT` | Request timeout (ms) | `30000` |
| `NODE_ENV` | Environment type | `development`, `production` |
| `DEBUG` | Debug logging | `api:*` |

### Setting Multiple Variables

```bash
# .env file with multiple variables
EXPO_PUBLIC_API_URL=https://ageless-api.render.com
REACT_APP_API_TIMEOUT=30000
NODE_ENV=production
DEBUG=api:*
```

---

## Post-Setup Verification

After setting up environment:

1. **Check app startup:**
   ```bash
   npm start
   # Look for: "API Client initialized with base URL: https://ageless-api.render.com"
   ```

2. **Test API connectivity from app:**
   - Tap "My ABS" icon
   - Tap "Summary"
   - Wait for data to load
   - Should show loading spinner for 5-10 seconds
   - Then display 52-week table

3. **Verify data is real:**
   - Check week ranges (should match actual dates)
   - Check exercise numbers (should not be all zeros)
   - Scroll through weeks (should see varied data)

4. **Check console for errors:**
   - Open React Native debugger
   - Look for any error messages
   - Should see API calls in network tab
   - Should see data transformations in logs

---

## Next Steps

1. ✅ Create `.env` file with EXPO_PUBLIC_API_URL
2. ✅ Verify API endpoint is accessible
3. ✅ Start app with `npm start`
4. ⏳ Begin testing: `PHASE_2_TESTING_CHECKLIST.md`
5. ⏳ Document results: `PHASE_2_QA_TEST_EXECUTION.md`

---

## Support Resources

- **API Guide:** `BACKEND_INTEGRATION_GUIDE.md`
- **Testing Checklist:** `PHASE_2_TESTING_CHECKLIST.md`
- **Test Execution:** `PHASE_2_QA_TEST_EXECUTION.md`
- **Code Reference:** `api/client.ts`, `api/summary.ts`
- **Client Test:** `__tests__/unit/api/client.test.ts`

---

**Created:** 2026-01-10
**Setup Time:** ~5-10 minutes
**Next: Begin PHASE_2_TESTING_CHECKLIST.md**
