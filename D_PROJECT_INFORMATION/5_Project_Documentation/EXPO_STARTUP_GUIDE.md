# Expo Startup Guide - Phase 2 Testing

**Date:** 2026-01-10
**Issue:** Port conflicts and dependency resolution
**Status:** ✅ RESOLVED

---

## What Happened

When launching Expo, you received an error about missing `@sentry/react-native` dependency. This has been **fixed**.

---

## Resolution Applied

### Step 1: Installed Missing Dependency ✅
```bash
npm install @sentry/react-native --legacy-peer-deps
```

**Result:**
- ✅ Added 20 packages
- ✅ Removed 2 packages
- ✅ 0 vulnerabilities found
- ✅ @sentry/react-native@7.8.0 installed

### Step 2: Verified Installation ✅
```bash
npm list @sentry/react-native
# Output: @sentry/react-native@7.8.0
```

---

## How to Start Expo for Testing

### Option 1: Interactive Mode (Recommended)
```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"
npx expo start
```

When prompted:
- If port 8082 is in use: Press Enter to accept using 8083 (or next available)
- App will start on available port
- QR code will be displayed
- Scan with Expo Go app on phone

### Option 2: Specific Port
```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"
npx expo start --port 8085
```

(Use any port that's available)

### Option 3: Web Browser
```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"
npx expo start --web
```

App will open in web browser automatically

---

## Port Information

**Port Status:**
- Port 8081: In use by another process
- Port 8082: In use by another process
- Port 8083+: Available for Expo

**Solution:** Expo will automatically use the next available port (8083, 8084, 8085, etc.)

---

## Expected Console Output

When Expo starts successfully, you should see:

```
env: load .env
env: export EXPO_PUBLIC_API_URL
Starting project at C:\Users\...\mobile-app

> Local:   http://localhost:8083
> LAN:     http://192.168.x.x:8083

Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

Press 'a' to open Android emulator
Press 'i' to open iOS simulator
Press 'w' to open web
Press 'r' to reload
```

---

## Verification Checklist

Before starting manual testing:

- [x] @sentry/react-native installed (@7.8.0)
- [x] .env file configured (EXPO_PUBLIC_API_URL set)
- [x] 298/298 unit tests passing
- [ ] Expo started successfully
- [ ] App loads on device/emulator
- [ ] Console shows "API Client initialized..." message
- [ ] "My ABS" icon visible on dashboard
- [ ] Summary menu accessible

---

## Connection Instructions

### For Android Phone
1. Install "Expo Go" app from Google Play Store
2. Start Expo: `npx expo start`
3. Scan QR code with Expo Go app
4. App will load on your phone

### For iOS iPhone
1. Install "Expo Go" app from App Store
2. Start Expo: `npx expo start`
3. Scan QR code with Camera app (iOS 11+)
4. Tap notification to open Expo
5. App will load on your phone

### For Android Emulator
1. Start Android emulator
2. Start Expo: `npx expo start`
3. Press 'a' key in terminal
4. App will load in emulator

### For iOS Simulator (Mac only)
1. Install Xcode if not already
2. Start iOS simulator
3. Start Expo: `npx expo start`
4. Press 'i' key in terminal
5. App will load in simulator

### For Web Browser
1. Start Expo: `npx expo start`
2. Press 'w' key or visit http://localhost:8083 (or assigned port)
3. App will load in browser

---

## Next Steps for Testing

### Once App is Running

1. **Tap "My ABS" Icon**
   - Should be visible at bottom right of dashboard
   - Opens menu drawer

2. **Select "Summary" from Menu**
   - Should open modal with loading spinner
   - Will say "Loading progress data..."

3. **Wait for Data to Load**
   - Should take 5-10 seconds
   - Loading spinner disappears
   - 52-week table displays

4. **Begin Manual Testing**
   - Follow: PHASE_2_MANUAL_TESTING_EXECUTION_GUIDE.md
   - Track results: PHASE_2_QA_TEST_EXECUTION.md
   - Reference: PHASE_2_TESTING_INDEX.md

---

## Troubleshooting

### Issue: "Port already in use"
**Solution:** Let Expo automatically use next available port (press Enter when prompted)

### Issue: "Unable to connect to device"
**Solution:**
1. Make sure device/emulator has internet
2. Make sure device and computer are on same network
3. Try web browser first: Press 'w' key
4. Try with `-w` flag for web: `npx expo start -w`

### Issue: App doesn't show "My ABS" icon
**Solution:**
1. Make sure app fully loaded
2. Check console for errors
3. Refresh app (press 'r' in terminal)
4. Check that ProgressSummaryScreen component is imported

### Issue: "API Client initialized..." not in console
**Solution:**
1. Check .env file exists
2. Verify EXPO_PUBLIC_API_URL is set
3. Open React Native debugger to check console
4. Restart Expo: Kill terminal, run `npx expo start` again

### Issue: "Cannot find module '@sentry/react-native'"
**Solution:** (Already fixed)
```bash
npm install @sentry/react-native --legacy-peer-deps
```

### Issue: Modal opens but no data loads
**Solution:**
1. Check internet connection
2. Verify Render API is accessible: https://ageless-api.render.com/api/summary
3. Check browser console for network errors
4. See: BACKEND_INTEGRATION_GUIDE.md → Troubleshooting

---

## Environment Variables

**Current Configuration:**
```
EXPO_PUBLIC_API_URL=https://ageless-api.render.com
```

**This is:**
- ✅ Set in .env file
- ✅ Properly exported by Expo
- ✅ Connected to real Render backend
- ✅ Ready for testing

---

## Testing Ready

✅ **All dependencies installed**
✅ **Environment configured**
✅ **App ready to launch**
✅ **Manual testing ready**

---

## Quick Start Command

```bash
cd "Ageless_REACT-Native_Mobile_Application/mobile-app"
npx expo start
```

Then follow prompts to open on device/emulator/web.

---

## Testing Checklist

Once app is running:

- [ ] Tap "My ABS" icon - menu opens
- [ ] Tap "Summary" - modal appears with loading spinner
- [ ] Wait 5-10 seconds - data loads
- [ ] See 52-week table - real data displays
- [ ] Scroll horizontally - more columns visible
- [ ] Scroll vertically - all 52 weeks accessible
- [ ] Tap × button - modal closes
- [ ] No console errors - clean console

If all above items checked, app is ready for Phase 2 manual testing.

---

**Status:** ✅ READY TO START EXPO AND BEGIN TESTING

**Next Action:** Run `npx expo start` and open app on device/emulator

---

Generated: 2026-01-10
Purpose: Guide Expo startup for Phase 2 testing
