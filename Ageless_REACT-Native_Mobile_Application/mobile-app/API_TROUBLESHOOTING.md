# API Troubleshooting Guide

## Issue: Data Persists for 2 Seconds Then Disappears

### Root Cause
The API client was configured with the **wrong production URL**.

**Before Fix:**
```typescript
// api/client.ts line 29
return 'https://locali-corp.onrender.com'; // ❌ WRONG URL!
```

**After Fix:**
```typescript
// api/client.ts line 29
return 'https://ageless-api.render.com'; // ✅ CORRECT URL
```

### Why This Caused Data Loss

1. **User enters data on Dashboard**
   ```
   User clicks "+" on Bike → exercises = { bike: 1 }
   UI updates immediately (local state)
   2 seconds pass... debounce triggers
   ```

2. **Data sent to WRONG API (before fix)**
   ```
   POST https://locali-corp.onrender.com/api/entries
   ❌ Goes to wrong server
   ❌ Wrong server doesn't have the data
   ❌ Returns 404 or empty response
   ```

3. **Dashboard tries to reload data**
   ```
   loadWorkoutForDate() calls GET /api/entries/{date}
   GET https://locali-corp.onrender.com/api/entries/2026-01-20
   ❌ Wrong server returns empty or 404
   Dashboard receives: null or empty exercises
   State cleared: exercises = {}
   ```

4. **Result: Data disappears**
   ```
   After 2 seconds: data vanishes
   User sees empty state
   Actual data was NEVER saved to correct API
   ```

### How the Fix Works

```
User enters data
    ↓
2 second debounce
    ↓
saveData() → addToQueue()
    ↓
POST https://ageless-api.render.com/api/entries ✅ CORRECT API
    ↓
Server receives and saves to database
    ↓
loadWorkoutForDate() → GET /api/entries/{date}
    ↓
GET https://ageless-api.render.com/api/entries/2026-01-20 ✅ CORRECT API
    ↓
Server returns saved data
    ↓
Dashboard displays data ✅ PERSISTS
```

---

## Verification Steps

### 1. Clear Browser Cache
```
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
Clear all cache and cookies
Refresh page
```

### 2. Open Browser DevTools Console
```
F12 or Right-click → Inspect → Console
```

### 3. Look for API URL Log
```
[API Client] Initialized with BASE_URL: https://ageless-api.render.com
```
If you see `locali-corp.onrender.com`, you're still using old cached code.

### 4. Try to Save Data
1. Click "+" on an exercise (e.g., Bike)
2. **IMMEDIATELY** watch the console

**Expected logs (working correctly):**
```
[Dashboard] saveData() called: { dateStr: "2026-01-20", ... }
[Dashboard] Adding to offline queue...
[Dashboard] Successfully added to offline queue
[API Client POST] /api/entries with data: { date: "2026-01-20", exercises: { bike: 1 }, ... }
[API Client POST Response] /api/entries response: { id: "...", date: "2026-01-20", exercises: { bike: 1 }, ... }
[Dashboard] Sync result: { synced: 1, failed: 0, conflicts: 0 }
[Dashboard] Data synced successfully, clearing caches and refreshing...
[API Client GET] /api/entries/2026-01-20 with params: undefined
[API Client GET Response] /api/entries/2026-01-20 response: { id: "...", date: "2026-01-20", exercises: { bike: 1 }, ... }
[Dashboard] Loaded from server: { dateStr: "2026-01-20", weight: '', exerciseCount: 1 }
[Dashboard] loadWorkoutForDate END - took XXXms
```

### 5. Check Network Tab
```
Browser DevTools → Network tab
Try to save data
Look for two requests:
1. POST /api/entries → 200 OK (or 201 Created)
2. GET  /api/entries/YYYY-MM-DD → 200 OK
```

Both should succeed. If they fail:
- **401 Unauthorized**: Check if you're logged in
- **404 Not Found**: Wrong API URL or endpoint doesn't exist
- **500 Server Error**: Server-side issue
- **CORS Error**: Cross-origin issue (shouldn't happen with Render)

---

## Configuration

### Environment Variables
The app respects these environment variables (in order of priority):

```bash
# Highest priority - explicit production URL override
EXPO_PUBLIC_API_URL=https://ageless-api.render.com

# Fallback
REACT_APP_API_URL=https://ageless-api.render.com

# Default behavior based on environment
NODE_ENV=production  # Uses https://ageless-api.render.com
NODE_ENV=development # Uses http://localhost:3000
```

### Web vs Mobile

**Web Platform (localhost:8081 or Render web)**
- Uses relative URLs: `/api/entries`
- Requests go to same domain (CORS-free)
- BASE_URL = empty string

**React Native / Mobile (via Render API)**
- Uses full URL: `https://ageless-api.render.com/api/entries`
- Requires `Authorization: Bearer {token}` header
- BASE_URL = `https://ageless-api.render.com`

---

## Common Issues & Solutions

### Problem: "Data still disappears after 2 seconds"

**Check 1: Are you on the latest code?**
```bash
git log --oneline | head -5
# Should show: "fix: Correct production API URL"
```

**Check 2: Is the API URL correct?**
```
Browser console: [API Client] Initialized with BASE_URL: https://ageless-api.render.com
If not, do: npm run build && npm run start
```

**Check 3: Is the server responding?**
```
Network tab → POST /api/entries
Should show: 200 OK with response body showing saved data
If 404: Wrong URL is being used
If 401: Not logged in
If 500: Server error - check server logs
```

**Check 4: Is auth token being sent?**
```
Network tab → POST /api/entries → Headers
Should show: Authorization: Bearer eyJhbGc...
If missing: Login first
```

### Problem: "I see 404 errors on GET /api/entries"

1. **First, verify the date format**
   - Must be: `YYYY-MM-DD` (e.g., `2026-01-20`)
   - Not: `2026/01/20` or `01-20-2026`

2. **Check if entry exists for that date**
   - Open History Modal
   - If date appears in list, entry exists on server
   - If not, you haven't saved data for that date yet

3. **Try deleting cache and reloading**
   ```
   Browser console: localStorage.clear()
   Refresh page
   Try to save again
   ```

### Problem: "Wrong API URL in browser console"

**If you still see wrong URL:**
1. Close browser completely
2. Hard refresh: `Ctrl+Shift+R` (not just `F5`)
3. Check: `Cmd+Option+Empty Cache and Hard Refresh` on Mac

**Or manually clear service worker:**
```javascript
// In browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}
localStorage.clear();
sessionStorage.clear();
```

---

## Testing Endpoints

### Test 1: Can you POST to the API?

```bash
curl -X POST https://ageless-api.render.com/api/entries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-20",
    "exercises": { "bike": 2, "abs": 3 },
    "weight": 185
  }'
```

Expected response:
```json
{
  "id": "123",
  "date": "2026-01-20",
  "exercises": { "bike": 2, "abs": 3 },
  "weight": 185,
  "userId": "user-id",
  "createdAt": "2026-01-20T...",
  "updatedAt": "2026-01-20T..."
}
```

### Test 2: Can you GET the data back?

```bash
curl https://ageless-api.render.com/api/entries/2026-01-20 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "id": "123",
  "date": "2026-01-20",
  "exercises": { "bike": 2, "abs": 3 },
  "weight": 185,
  "userId": "user-id",
  "createdAt": "2026-01-20T...",
  "updatedAt": "2026-01-20T..."
}
```

---

## Related Files

- **API Client**: `api/client.ts` - HTTP client with interceptors
- **Entries API**: `api/entries.ts` - Save/load/delete workout entries
- **Dashboard**: `app/dashboard/index.tsx` - Main save/load logic
- **Data Persistence Guide**: `DATA_PERSISTENCE.md` - Architecture overview

---

## Logging Reference

### Dashboard Logging
- `[Dashboard] saveData() called` - User triggered a save
- `[Dashboard] Adding to offline queue` - Data queued for sync
- `[Dashboard] syncQueue() completed` - Sync request finished
- `[Dashboard] Data synced successfully` - Sync succeeded, reloading
- `[Dashboard] loadWorkoutForDate()` - Fetching data for current date

### API Client Logging
- `[API Client] Initialized with BASE_URL` - Shows which URL is configured
- `[API Client POST]` - POST request being sent
- `[API Client POST Response]` - Server response to POST
- `[API Client GET]` - GET request being sent
- `[API Client GET Response]` - Server response to GET

### Entries API Logging
- `[entriesAPI.getEntry]` - Fetching single entry from server
- `[entriesAPI.saveEntry]` - Saving entry to server

---

## If Issue Persists

1. **Verify commits are deployed**
   ```bash
   git log --oneline api/client.ts | head -3
   # Should show "fix: Correct production API URL"
   ```

2. **Check server is running**
   - Visit https://ageless-api.render.com/api/health
   - Should return: `{ "status": "operational", ... }`

3. **Check authentication**
   - Are you logged in on the dashboard?
   - Does History Modal load 96 entries?
   - If no, auth token is invalid

4. **Clear everything and start fresh**
   ```
   1. Browser: Ctrl+Shift+Delete → Clear all
   2. Page: Ctrl+Shift+R → Hard refresh
   3. Console: Check for [API Client] BASE_URL log
   4. Save: Try to save data and watch console
   ```

---

## Success Indicator

Once working, you should see:
- ✅ Data appears immediately on dashboard
- ✅ Data persists after page refresh
- ✅ History Modal shows all entries
- ✅ Summary Modal loads 52-week data
- ✅ Edit functionality works
- ✅ Delete functionality works
- ✅ No data disappears after 2 seconds
