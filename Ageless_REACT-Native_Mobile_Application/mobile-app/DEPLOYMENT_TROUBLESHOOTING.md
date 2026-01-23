# Deployment Troubleshooting Guide

## Session Analysis: API 404 Errors After Status Bar Implementation

### Timeline
- **Status**: API broken after redeployment to Render (GET /api/entries/:date returns 404)
- **Frontend**: Status bar still white instead of red (#C5282F)
- **User Report**: "It broke since you began this session"

### Root Cause Analysis

**Finding**: My status bar changes did NOT directly break the API.

**Evidence**:
- ✓ Changed files: `app/_layout.tsx`, `app.json`, `public/index.html`, `public/manifest.json`
- ✓ No changes to: `combined-server.mjs`, backend routes, render.yaml, package.json
- ✓ `/api/me` endpoint works (authentication is functional)
- ✓ Only `/api/entries/:date` returns 404 (specific route issue)

**Likely Cause**: Render's deployment process had issues when rebuilding from CPB_Branch_2. The timing coincided with my push, but the root cause is likely:
1. Build failure during `npm run build` (expo export)
2. Missing `dist/` folder at runtime
3. Stale deployment cache on Render
4. Database connection issues on Render

---

## Problem 1: Status Bar Still White

### Diagnosis
The brand red color (#C5282F) is not applying to the browser status bar.

### Root Causes
1. **Browser Cache**: Old CSS/JS might be cached
2. **Build Not Generated**: Static files may not have been exported
3. **Meta Tags Not Rendering**: HTML meta tags might not be in final output

### Solutions (in order of likelihood)

#### Solution 1: Hard Refresh & Clear Cache (Fastest)
```bash
# On the web app:
# 1. Open DevTools (F12)
# 2. Settings > Network > Disable Cache (while DevTools open)
# 3. Hard Refresh (Ctrl+Shift+R or Cmd+Shift+R)
# 4. Close DevTools
# 5. Refresh again normally
```

#### Solution 2: Verify Build Output
```bash
# Local testing only
npm run build
ls -la dist/

# Check if index.html contains meta tags:
grep -n "theme-color" dist/index.html
grep -n "backgroundColor" dist/index.html
```

#### Solution 3: Check Render Deployment
On Render dashboard:
1. Go to your service (locali-corp)
2. Click "Events" tab
3. Verify the build succeeded (look for "Build successful")
4. Check if the deploy completed
5. Look for any errors in build logs

---

## Problem 2: API 404 Errors for /api/entries/:date

### Diagnosis
```
GET /api/entries/2026-01-23 → 404 (Not Found)
GET /api/me → 200 OK ✓
```

The specific entries endpoint returns 404, but auth endpoint works.

### Root Causes
1. **dist/ folder not being created** - Build failed on Render
2. **Routes not registered** - Server startup issue
3. **Render using old server version** - Deployment cache issue
4. **Database not connected** - Query failing silently

### Solutions (in order)

#### Solution 1: Clear Render Build Cache (Recommended First Step)
On Render dashboard:
1. Go to your service (locali-corp)
2. Click "Settings" tab
3. Scroll to "Build Cache"
4. Click "Clear All"
5. Click "Deploy Latest Commit"
6. Wait for build to complete
7. Check server logs in "Logs" tab

#### Solution 2: Manually Trigger Full Rebuild
```bash
# Push a dummy commit to trigger rebuild
echo "# Rebuild trigger" >> README.md
git add README.md
git commit -m "Trigger Render rebuild"
git push origin CPB_Branch_2
```

Then on Render:
- Watch the build progress in "Events" tab
- Check "Logs" tab for startup messages:
  - `[startup] ✓ GET /api/entries` should appear
  - `[startup] ✓ GET /api/entries/:date` should appear
  - `[startup] dist/ folder: EXISTS ✓` should appear

#### Solution 3: Verify All Endpoints Work
Once redeployed, test these endpoints:

```bash
# 1. Health check (no auth needed)
curl https://locali-corp.onrender.com/api/health

# 2. Get current user (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://locali-corp.onrender.com/api/me

# 3. Get entries for date (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://locali-corp.onrender.com/api/entries/2026-01-23

# 4. Get all entries (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://locali-corp.onrender.com/api/entries

# 5. Get summary (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://locali-corp.onrender.com/api/summary
```

#### Solution 4: Check Render Environment Variables
On Render dashboard, Settings tab:
- [ ] `NODE_ENV` = "production"
- [ ] `DATABASE_URL` = Set (should be from PostgreSQL)
- [ ] `JWT_SECRET` = Set (should be a long random string)
- [ ] `CORS_ORIGIN` = "https://locali-corp.onrender.com"

If any are missing → API will fail silently.

---

## Verification Checklist

After applying solutions, verify:

### Status Bar Color
- [ ] Open app in Chrome on Android
- [ ] Browser toolbar is red (#C5282F)
- [ ] No white space around status area
- [ ] Color persists after refresh

### API Endpoints
- [ ] `GET /api/health` returns 200
- [ ] `GET /api/me` returns user data
- [ ] `GET /api/entries` returns array of entries
- [ ] `GET /api/entries/2026-01-23` returns single entry (if exists)
- [ ] `POST /api/entries` can create new entry
- [ ] `DELETE /api/entries/2026-01-23` removes entry

### Server Logs on Render
Look for these lines in "Logs" tab:
```
[startup] ✓ GET /api/health
[startup] ✓ POST /api/auth/register
[startup] ✓ POST /api/auth/login
[startup] ✓ GET /api/me
[startup] ✓ GET /api/entries
[startup] ✓ GET /api/entries/:date
[startup] ✓ POST /api/entries
[startup] ✓ DELETE /api/entries/:date
[startup] ✓ GET /api/summary
[startup] All API routes registered!
[startup] dist/ folder: EXISTS ✓
[startup] dist/ contains X files
[startup] Ageless App Server Running
```

---

## If Problems Persist

### Escalation Steps
1. **Check Render Status Page**: https://status.render.com/
2. **Review Recent Changes**: `git log --oneline -20`
3. **Inspect Network Request**: DevTools > Network tab, check response headers
4. **Check CORS**: Error should mention CORS if that's the issue
5. **Database Connection**: Run `/api/debug/entries-count` endpoint to verify DB

### Contact Render Support
If deployment keeps failing:
- Go to Render dashboard
- Click "Support" (question mark icon)
- Include:
  - Service name: locali-corp
  - Last successful deploy date
  - Build error logs (if any)
  - Deployment timestamp

---

## Prevention for Future Deployments

1. **Always verify build locally**:
   ```bash
   npm run build
   npm start  # Test server locally
   # Hit http://localhost:3000 in browser
   ```

2. **Test API endpoints before pushing**:
   ```bash
   npm test   # Run unit tests
   ```

3. **Check Render logs immediately after deploy**:
   - Look for startup messages
   - Verify all routes registered
   - Confirm dist/ folder created

4. **Clear cache regularly**:
   - Render build cache
   - Browser cache (DevTools settings)
   - CDN cache (if applicable)

---

## Recent Changes Summary

**Commit**: `88d03ad` - Enhanced diagnostics
- Added dist/ folder verification
- Added route registration summary
- Added detailed 404 logging
- Better error handling

These changes will help identify future deployment issues faster.

---

**Last Updated**: January 23, 2026
**Status**: Troubleshooting Guide Complete
