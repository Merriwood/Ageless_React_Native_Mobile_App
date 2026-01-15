# Phase 2.5 Integration Testing
## EAS Build + Maestro Testing (iOS)

**Date**: January 14, 2026
**Purpose**: Build iOS app with EAS, then test with Maestro on physical device
**Duration**: ~1.5 hours (30 min build + 30 min testing)
**Status**: Ready to Execute

---

## OVERVIEW

This document provides complete step-by-step instructions for:
1. Building iOS app using EAS Build (cloud-based)
2. Installing the built app on iOS device
3. Running Maestro test flows on the built app
4. Verifying Phase 1 & 2 integration requirements

**No Expo Go required** - Tests run on actual built app with real backend integration.

---

## PREREQUISITES

### Requirements
- [ ] Mac with internet connection
- [ ] Xcode Command Line Tools installed: `xcode-select --install`
- [ ] Node.js and npm installed
- [ ] iOS device (iPhone 12+, iOS 14+) or simulator
- [ ] USB cable (if physical device)
- [ ] Expo account (create free at https://expo.dev)
- [ ] Maestro CLI installed: `brew install maestro`

### Verify Prerequisites

```bash
# Check Xcode CLI
xcode-select --version
# Expected: xcode-select version 2xxx

# Check Node
node --version
npm --version
# Expected: v16+, npm 7+

# Check Maestro
maestro --version
# Expected: maestro 1.x.x
```

---

## STEP 1: LOGIN TO EXPO (5 minutes)

### 1.1 Create Expo Account (if needed)
Visit https://expo.dev and create free account

### 1.2 Login via CLI

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login
# Follow prompts:
# - Enter email
# - Enter password
# - Confirm login in browser

# Verify login
eas whoami
# Should show your Expo account email
```

### 1.3 Verify EAS Access

```bash
# List any existing builds (if first time, should be empty)
eas build:list
```

---

## STEP 2: PREPARE FOR BUILD (5 minutes)

### 2.1 Navigate to Project

```bash
cd /Users/SDWOR/Ageless_React_Native_Mobile_App/Ageless_React_Native_Mobile_App/Ageless_REACT-Native_Mobile_Application/mobile-app
```

### 2.2 Verify Build Configuration

```bash
# Check if eas.json exists
ls -la eas.json

# If NOT present, initialize EAS
eas build:configure --platform ios
# Follow prompts (defaults are fine)

# If present, view current config
cat eas.json
```

### 2.3 Update app.json (if needed)

Verify `app.json` has iOS configuration:

```json
{
  "expo": {
    "name": "Ageless",
    "slug": "ageless",
    "version": "1.0.0",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ageless.app",
      "buildNumber": "1"
    }
  }
}
```

**Action if missing**:
```bash
# Edit app.json to add/update bundleIdentifier
# iOS bundle ID should be unique, e.g.: com.yourname.ageless
```

### 2.4 Verify Dependencies

```bash
# Install dependencies
npm install

# Clear cache
rm -rf .expo
npm cache clean --force
```

---

## STEP 3: BUILD iOS APP WITH EAS (25-30 minutes)

### 3.1 Trigger EAS Build

```bash
# Build for iOS (production)
eas build --platform ios --wait

# Flags explained:
# --platform ios     = Build for iOS only
# --wait             = Wait for build to complete (don't return immediately)
```

### 3.2 Build Progress

You'll see output like:
```
✔ Checking your project
✔ Setting up credentials
✔ Compiling app
✔ Generating artifacts
✔ Build complete!
```

**Typical build times:**
- First build: 25-30 minutes (EAS sets up credentials)
- Subsequent builds: 15-20 minutes (reuses credentials)

### 3.3 Download .ipa File

When build completes, you'll see:
```
Build completed!
Download link: https://expo-builds.s3.amazonaws.com/...ageless.ipa
```

**Save the link** and download the .ipa file:

```bash
# Download (replace URL with actual URL from build output)
curl -o ~/Downloads/ageless.ipa "https://expo-builds.s3.amazonaws.com/...ageless.ipa"

# Verify download
ls -lh ~/Downloads/ageless.ipa
# Should be 50-150 MB depending on app size
```

---

## STEP 4: INSTALL APP ON iOS DEVICE (5-10 minutes)

### 4.1 Connect iOS Device via USB

- Connect iPhone to Mac with USB cable
- On phone: Tap "Trust" when prompted
- Enter device passcode if requested

### 4.2 Verify Device Connection

```bash
# List connected devices
maestro list-devices

# Expected output:
# iPhone [Model]
# UDID: 00008120-001ABCDEF1234567
# OS: iOS 15.x

# Save the UDID - you'll need it for Maestro tests
```

### 4.3 Install .ipa on Device

**Option A: Using Xcode (Recommended)**

```bash
# Install via Xcode
xcrun xcodebuild -install-ipa ~/Downloads/ageless.ipa -device <UDID>

# Or simpler:
open ~/Downloads/ageless.ipa
# Xcode opens, click "Install" button
```

**Option B: Using Apple Configurator**

1. Open Apple Configurator 2
2. Select your device
3. Click "Add" → "Apps" → Select ageless.ipa
4. Click "Install"

**Option C: Using ideviceinstaller (CLI)**

```bash
# Install via CLI
ideviceinstaller -i ~/Downloads/ageless.ipa

# Verify installation
ideviceinstaller -l
# Should list "com.ageless.app"
```

### 4.4 Verify App Installation

```bash
# Launch the app on device
# Should see "Ageless" app on home screen
# Or: Settings → General → iPhone Storage → Should see "Ageless"
```

---

## STEP 5: PREPARE MAESTRO (5 minutes)

### 5.1 Start Maestro Server

```bash
# Terminal 1: Start server (keep running)
maestro start-server

# Expected output:
# Starting Maestro Server...
# Server is ready on port 7001
# Waiting for commands...
```

**Important**: Keep this terminal open throughout testing.

### 5.2 Get Device UDID

```bash
# Terminal 2: Get device UDID
maestro list-devices

# Copy output UDID (00008120-001ABCDEF1234567)
# You'll use this for all test commands
```

### 5.3 Verify Backend Accessibility

```bash
# Test Render backend
curl https://ageless-api.render.com/api/health

# Expected: HTTP 200 with health status
```

### 5.4 Verify Test User Exists

```bash
# Backend should have test account pre-configured:
# Email: test@ageless.app
# Password: Test@123

# You can verify by attempting login (optional)
curl -X POST https://ageless-api.render.com/api/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ageless.app","password":"Test@123"}'

# Expected: Returns JWT token
```

---

## STEP 6: RUN MAESTRO TESTS (30 minutes)

### 6.1 Navigate to Test Directory

```bash
# Terminal 2
cd /Users/SDWOR/Ageless_React_Native_Mobile_App/Ageless_React_Native_Mobile_App/TESTING_AND_QA/maestro
```

### 6.2 PHASE 1: CRITICAL TESTS (15 minutes) - REQUIRED

These tests MUST all pass for production approval.

#### Test 1: Login Flow (3 minutes)

```bash
maestro test test_login_flow.yaml --udid=YOUR_UDID_HERE
```

**Expected output**:
```
✓ Login Flow Test
✓ Assert: Email input visible
✓ Assert: Password input visible
✓ Assert: Login button present
✓ Assert: Can enter credentials
✓ Assert: JWT token received

Result: 5/5 PASSED ✅
Duration: ~3 minutes
```

**What this tests**:
- Login screen loads
- Email and password inputs work
- Login button is clickable
- Backend authentication works
- JWT token is received and stored

**If FAILS**:
1. Check test output for specific error
2. Verify backend is accessible: `curl https://ageless-api.render.com/api/health`
3. Verify test account exists
4. Check device is online
5. Retry test

---

#### Test 2: Register Flow (4 minutes)

```bash
maestro test test_register_flow.yaml --udid=YOUR_UDID_HERE
```

**Expected output**:
```
✓ Register Flow Test
✓ Assert: Email input visible
✓ Assert: Password validation works
✓ Assert: Registration succeeds
✓ Assert: Duplicate email rejected
✓ Assert: Navigation to login works

Result: 6/6 PASSED ✅
Duration: ~4 minutes
```

**What this tests**:
- Registration screen loads
- Email validation works
- Password strength validation
- New account creation on backend
- Duplicate email prevention
- Navigation after successful registration

**If FAILS**:
1. Backend might have duplicate test account
2. Clear test account if needed: Contact backend admin
3. Retry test

---

#### Test 3: Dashboard Flow (5 minutes)

```bash
maestro test test_dashboard_flow.yaml --udid=YOUR_UDID_HERE
```

**Expected output**:
```
✓ Dashboard Flow Test
✓ Assert: Dashboard loads with date
✓ Assert: Progress bar visible
✓ Assert: 11 exercise cards display
✓ Assert: Exercise increment works
✓ Assert: Exercise decrement works
✓ Assert: Weight input saves
✓ Assert: Progress bar updates
✓ Assert: Date picker works
✓ Assert: Bottom nav accessible
✓ Assert: History tab navigates
✓ Assert: Back to dashboard works

Result: 11/11 PASSED ✅
Duration: ~5 minutes
```

**What this tests**:
- Post-login dashboard loads
- All 11 exercise cards render
- Increment/decrement functionality
- Weight input auto-save to backend
- Progress bar calculations
- Date picker navigation
- Modal functionality
- Navigation between screens

**If FAILS**:
1. Check if login was successful in previous test
2. Verify backend endpoints for workouts API
3. Check device storage (needs >500MB free)
4. Retry test

---

#### PHASE 1 DECISION POINT

```
If ALL 3 tests PASS (22/22 assertions):
  ✅ Phase 1 Critical Tests Approved
  → Continue to Phase 2 Data Tests

If ANY test FAILS:
  ❌ Stop and Debug
  → Review error message
  → Check backend status
  → Fix issue and retry Phase 1 tests
```

---

### 6.3 PHASE 2: DATA MANAGEMENT TESTS (10 minutes) - IMPORTANT

Proceed only if Phase 1 all passed.

#### Test 4: History Flow (4 minutes)

```bash
maestro test test_history_flow.yaml --udid=YOUR_UDID_HERE
```

**Expected output**:
```
✓ History Flow Test
✓ Assert: Hamburger menu opens
✓ Assert: History modal loads
✓ Assert: Workout cards display
✓ Assert: Multiple workouts visible
✓ Assert: Edit workout modal opens
✓ Assert: Close edit modal works
✓ Assert: Delete confirmation shows
✓ Assert: Scroll through history works
✓ Assert: Close history modal works
✓ Assert: Bottom nav history tab works

Result: 10/10 PASSED ✅
Duration: ~4 minutes
```

**What this tests**:
- History data retrieval from backend
- Modal functionality
- Edit/Delete operations
- Data persistence
- Navigation consistency

**If FAILS**:
1. Check if sample data exists in backend
2. Verify backend history endpoints working
3. Check data integrity on server
4. Retry test

---

#### PHASE 2 DECISION POINT

```
If Phase 2 test PASSES (10/10 assertions):
  ✅ Phase 2 Data Tests Approved
  → Continue to Phase 3 User Tests (optional)

If Phase 2 test FAILS:
  ❌ Stop and Debug
  → Check backend data integrity
  → Verify sample data exists
  → Fix issue and retry
```

---

### 6.4 PHASE 3: USER EXPERIENCE TESTS (5 minutes) - OPTIONAL

These tests are optional but recommended for complete coverage.

#### Test 5: Profile Flow (2 minutes)

```bash
maestro test test_profile_flow.yaml --udid=YOUR_UDID_HERE
```

**Expected output**:
```
✓ Profile Flow Test
✓ Assert: Profile tab accessible
✓ Assert: Profile screen loads
✓ Assert: User info displays
✓ Assert: Body measurements visible
✓ Assert: Settings section present
✓ Assert: Logout button present
✓ Assert: Navigate away and back works
✓ Assert: Return to profile works
✓ Assert: Profile data persists
✓ Assert: Logout clears session

Result: 10/10 PASSED ✅
Duration: ~2 minutes
```

**What this tests**:
- Profile screen functionality
- User information display
- Settings access
- Logout functionality
- Data persistence

**If FAILS**:
1. Not critical for Phase 2.5 approval
2. Can debug separately
3. Continue to reporting

---

## STEP 7: GENERATE TEST REPORT (10 minutes)

### 7.1 Run All Tests with HTML Report

```bash
# Generate comprehensive HTML report
maestro test . --udid=YOUR_UDID_HERE --reporter-type html

# Output location: ./test-reports/report.html
```

### 7.2 View HTML Report

```bash
# Open report in browser
open ./test-reports/report.html
```

**Report contains**:
- Test execution timeline
- Pass/fail status for each test
- Screenshots at key points
- Performance metrics
- Error details (if any)

### 7.3 Export Summary

```bash
# Save summary for documentation
# Report shows:
# - Total tests: 5
# - Total assertions: 42
# - Passed: 42
# - Failed: 0
# - Duration: ~30 minutes
# - Success rate: 100%
```

---

## STEP 8: DOCUMENT RESULTS

### 8.1 Fill Out Test Summary

Create file: `PHASE_2_5_TEST_RESULTS_2026_01_14.md`

```markdown
# Phase 2.5 Test Results
**Date Tested**: January 14, 2026
**Tester**: [Your Name]
**Device**: iPhone [Model]
**iOS Version**: [e.g., 17.2]
**Build Method**: EAS Build
**Backend**: https://ageless-api.render.com

## Test Results

### Phase 1 - Critical Tests
- [x] Login Flow: PASS (5/5)
- [x] Register Flow: PASS (6/6)
- [x] Dashboard Flow: PASS (11/11)
- **Phase 1 Total**: PASS (22/22)

### Phase 2 - Data Tests
- [x] History Flow: PASS (10/10)
- **Phase 2 Total**: PASS (10/10)

### Phase 3 - User Tests (Optional)
- [x] Profile Flow: PASS (10/10)
- **Phase 3 Total**: PASS (10/10)

## Summary
- **Total Assertions**: 42
- **Passed**: 42
- **Failed**: 0
- **Success Rate**: 100%
- **Duration**: ~30 minutes
- **Overall Status**: ✅ APPROVED FOR PHASE 3

## Issues Encountered
None

## Recommendations
Ready to proceed to Phase 3 (Design Refinement & Advanced Features)

## Sign-Off
Tester: _________________ Date: _________
QA Lead: ________________ Date: _________
```

---

## STEP 9: APPROVAL DECISION

### 9.1 Success Criteria

**MINIMUM REQUIRED** (must all be true):
- ✅ Phase 1: ALL 3 tests pass (22/22 assertions)
- ✅ Phase 2: ALL tests pass (10/10 assertions)
- ✅ No app crashes
- ✅ No unhandled errors
- ✅ <30 minutes execution time
- ✅ Data persists correctly

**RECOMMENDED** (additional):
- ✅ Phase 3: Tests pass (10/10 assertions)
- ✅ HTML report generated
- ✅ All 42 assertions successful
- ✅ No warnings in output
- ✅ Performance acceptable

### 9.2 Final Verdict

```
IF all success criteria met:
  ✅ APPROVED - Phase 2.5 Integration Testing Complete
  ✅ Ready to Proceed to Phase 3 (Design Refinement)

IF any criteria not met:
  ❌ BLOCKED - Fix issues and retest
```

---

## COMPLETE TEST EXECUTION COMMAND SEQUENCE

For easy copy-paste execution:

```bash
# SETUP (Terminal 1)
maestro start-server
# Keep this running

# SETUP (Terminal 2)
cd /path/to/TESTING_AND_QA/maestro
maestro list-devices
# Copy UDID

# Replace YOUR_UDID in all commands below

# PHASE 1 CRITICAL (Terminal 2)
maestro test test_login_flow.yaml --udid=YOUR_UDID
maestro test test_register_flow.yaml --udid=YOUR_UDID
maestro test test_dashboard_flow.yaml --udid=YOUR_UDID

# PHASE 2 DATA (Terminal 2)
maestro test test_history_flow.yaml --udid=YOUR_UDID

# PHASE 3 USER - OPTIONAL (Terminal 2)
maestro test test_profile_flow.yaml --udid=YOUR_UDID

# GENERATE REPORT (Terminal 2)
maestro test . --udid=YOUR_UDID --reporter-type html
open ./test-reports/report.html
```

---

## TROUBLESHOOTING

### Device Not Detected
```bash
# 1. Disconnect and reconnect USB
# 2. Check trust certificate on device
# 3. Restart device
# 4. Try again:
maestro list-devices
```

### Test Timeout
```bash
# 1. Close background apps on device
# 2. Verify network connectivity
# 3. Check backend status:
curl https://ageless-api.render.com/api/health
# 4. Increase timeout in config.yaml if needed
```

### API Connection Failed
```bash
# 1. Verify backend is running:
curl https://ageless-api.render.com/api/health

# 2. Check device internet:
# On device, open Safari and test www.google.com

# 3. Disable VPN if enabled
```

### App Crashes
```bash
# 1. Check Xcode console for errors
# 2. Verify test account exists
# 3. Reinstall app:
# Delete from device and reinstall .ipa
# 4. Retry test
```

### Login/Register Fails
```bash
# 1. Verify test account exists:
curl -X POST https://ageless-api.render.com/api/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ageless.app","password":"Test@123"}'

# 2. Check credentials:
# Email: test@ageless.app
# Password: Test@123

# 3. Verify backend is accepting requests
```

---

## SUCCESS CHECKLIST

Before marking Phase 2.5 complete:

- [ ] iOS app built successfully with EAS
- [ ] .ipa downloaded and installed on device
- [ ] Maestro server started without errors
- [ ] Device connected and detected by Maestro
- [ ] Phase 1 Critical Tests: ALL PASS (22/22)
- [ ] Phase 2 Data Tests: ALL PASS (10/10)
- [ ] Phase 3 User Tests: PASS or SKIPPED (10/10)
- [ ] HTML report generated successfully
- [ ] No app crashes during testing
- [ ] No unhandled errors in Maestro output
- [ ] All data persisted correctly
- [ ] Test results documented in file
- [ ] Stakeholders notified of results
- [ ] Decision made: Proceed to Phase 3

---

## NEXT STEPS

### If Phase 2.5 Approved (All tests passed):
✅ **Proceed to Phase 3**: Design Refinement & Advanced Features
- Implement dashboard optimizations
- Add advanced features
- Refine UI/UX

### If Phase 2.5 Blocked (Any test failed):
❌ **Debug and Fix**:
1. Identify root cause
2. Fix in source code or backend
3. Rebuild with EAS Build
4. Retest with Maestro

---

## TIMELINE SUMMARY

| Step | Duration | Total |
|------|----------|-------|
| 1. Login to Expo | 5 min | 5 min |
| 2. Prepare for build | 5 min | 10 min |
| 3. EAS Build | 25-30 min | 35-40 min |
| 4. Install on device | 5-10 min | 40-50 min |
| 5. Prepare Maestro | 5 min | 45-55 min |
| 6. Run tests | 30 min | 75-85 min |
| 7. Generate report | 10 min | 85-95 min |
| 8. Document results | 5 min | 90-100 min |
| **TOTAL** | | **~1.5 hours** |

---

## SUPPORT & QUESTIONS

**For issues with**:
- EAS Build: See `MAESTRO_DEVICE_SETUP_GUIDE.md` (Build section)
- Device setup: See `MAESTRO_DEVICE_SETUP_GUIDE.md` (Device section)
- Test execution: See `MAESTRO_EXECUTION_CHECKLIST.md`
- Backend: See `MAESTRO_RENDER_BACKEND_CONFIG.md`
- General: See `START_MAESTRO_TESTING_HERE.md`

---

**Status**: 🟢 READY FOR EXECUTION
**Date**: January 14, 2026
**Confidence**: ⭐⭐⭐⭐⭐ (5/5)

**Begin Phase 2.5 testing now!**
