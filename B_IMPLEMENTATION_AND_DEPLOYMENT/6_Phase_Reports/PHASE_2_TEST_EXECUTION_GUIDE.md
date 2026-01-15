# Phase 2 QA Testing Execution Guide
## Ageless Mobile App - Web Test Harness

**Test Environment:** http://localhost:8888/mobile-app-test-harness.html
**Backend API:** https://ageless-api.render.com
**Total Tests:** 19 | **Estimated Time:** 95 minutes
**Test Date:** January 10, 2026 | **Tester:** [Your Name]

---

## PHASE 1: BASIC FUNCTIONALITY (Tests 1-6) - 30 minutes

### Test 1: Modal Opens and Displays Correctly ✓ [5 min]
**Objective:** Verify the 52-week progress summary modal opens correctly

**Steps:**
1. Open the test harness: http://localhost:8888/mobile-app-test-harness.html
2. You should see a phone simulator on the left with "Dashboard" screen loaded
3. Locate the "View 52-Week Summary" button in the dashboard
4. Click the button

**Expected Results:**
- ✓ Button click triggers "Fetching 52-week summary from Render API..." message
- ✓ Loading state shows "Loading summary..."
- ✓ API response appears below the button
- ✓ Modal/card shows week data

**Troubleshooting:**
- If button doesn't respond: Refresh the page
- If API fails: Check that https://ageless-api.render.com is accessible
- If no response: Check browser console (F12) for errors

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Loading Spinner Displays During Data Fetch ✓ [5 min]
**Objective:** Verify loading state is visible while API data is being fetched

**Steps:**
1. From Test 1 state (Dashboard screen visible)
2. Click "View 52-Week Summary" button again
3. Immediately observe the screen while data is loading

**Expected Results:**
- ✓ "Loading summary..." text appears instantly
- ✓ Loading message stays visible until data arrives
- ✓ Message disappears when data is received
- ✓ Results card appears with actual data

**Troubleshooting:**
- If spinner is too fast to see: Network is very fast (expected on local tests)
- If spinner never disappears: API may be timing out (check browser console)
- If no spinner at all: JavaScript loading logic may be broken

**Status:** [ ] Pass [ ] Fail

---

### Test 3: Data Displays Correctly in Summary ✓ [5 min]
**Objective:** Verify 52-week summary data is formatted and displayed correctly

**Steps:**
1. Ensure "View 52-Week Summary" has completed loading (from Test 2)
2. Look at the results card that appears below the button
3. Verify the following information is present and readable:
   - "Weeks loaded" count
   - "Data points" in bytes
   - "Response time" status
   - JSON preview of actual data

**Expected Results:**
- ✓ Card shows "52-Week Summary" title
- ✓ Weeks loaded count is > 0 (should show ~52)
- ✓ Data points shows a reasonable byte count (should be several hundred)
- ✓ Response time shows "OK"
- ✓ JSON preview displays actual week/exercise data
- ✓ Text is readable and properly formatted

**Troubleshooting:**
- If "Weeks loaded" is 0: API returned empty data
- If JSON is truncated: This is expected (preview is limited to 500 chars)
- If formatting is broken: CSS may have issues (check browser console)

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Screen Navigation Works Between All Screens ✓ [5 min]
**Objective:** Verify user can navigate between all 4 screens

**Steps:**
1. You're on Dashboard screen
2. Click the "History" button (bottom nav or left panel)
3. Verify History screen loads
4. Click the "Profile" button
5. Verify Profile screen loads
6. Click the "Home" button
7. Verify Home screen loads
8. Click the "Dashboard" button
9. Verify Dashboard screen loads again

**Expected Results:**
- ✓ Dashboard loads with weight input and "View 52-Week Summary" button
- ✓ History loads with "Load History" button and workout list area
- ✓ Profile loads with user info cards (Email, User ID, App Version) and Logout button
- ✓ Home loads with "MindBodyHeart" title and "Go to Dashboard" button
- ✓ Bottom navigation highlights current screen (active state)
- ✓ All buttons in left panel are highlighted appropriately

**Troubleshooting:**
- If screen doesn't change: Click again, button may need double-click
- If highlighting doesn't update: CSS active state may have issues
- If content overlaps: Browser zoom may be too high (try Ctrl+0 to reset)

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Error Handling Shows Clear Messages ✓ [5 min]
**Objective:** Verify error messages are clear and helpful

**Steps:**
1. Go to Dashboard screen
2. Look at the left panel under "Test Actions"
3. Click "Test API Connection" button
4. Observe the status message that appears
5. Click "Test Data Fetching" button
6. Observe any error or success message that appears

**Expected Results:**
- ✓ "Test API Connection" shows green success message: "✓ API is reachable"
- ✓ OR shows red error message: "✗ Cannot reach API: [error details]"
- ✓ Messages appear in colored box below test buttons
- ✓ Error messages include specific error details
- ✓ Success messages use checkmark (✓)
- ✓ Error messages use X (✗)
- ✓ Messages disappear after 5 seconds

**Troubleshooting:**
- If messages don't appear: Check browser console for JavaScript errors
- If API unreachable: Your Render backend may be down (check https://ageless-api.render.com in a new tab)
- If messages don't disappear: Refresh page

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Input Fields Accept and Store Data ✓ [5 min]
**Objective:** Verify date and weight inputs work correctly

**Steps:**
1. Go to Dashboard screen
2. Look at the "Date" input field (should show today's date)
3. Click the date input and change it to a different date (e.g., yesterday)
4. Verify the date changes
5. Look at the "Weight (lbs)" input field
6. Click and enter a weight value (e.g., "180")
7. Click outside the input or press Tab
8. Verify success message appears

**Expected Results:**
- ✓ Date input accepts date selection
- ✓ When date changes, success message shows: "Date updated: [date]"
- ✓ Weight input accepts numeric values
- ✓ When weight changes, success message shows: "Weight updated: [weight] lbs"
- ✓ Input fields retain their values (don't clear after update)
- ✓ Status messages appear in colored box and disappear after 5 seconds

**Troubleshooting:**
- If inputs don't accept values: Try clicking directly on the input field
- If messages don't show: Check browser JavaScript console (F12)
- If values clear: Refresh page (this is expected in a test harness)

**Status:** [ ] Pass [ ] Fail

---

## PHASE 2: ADVANCED FEATURES (Tests 7-10) - 20 minutes

### Test 7: Data Persists Across Screen Navigation ✓ [5 min]
**Objective:** Verify entered data persists when switching screens

**Steps:**
1. Go to Dashboard screen
2. Enter a date (e.g., "2026-01-09")
3. Enter a weight (e.g., "185")
4. Note both values are showing success messages
5. Click "History" to switch to History screen
6. Click "Dashboard" to return to Dashboard screen
7. Check if date and weight fields still have the values

**Expected Results:**
- ✓ Date field still shows "2026-01-09"
- ✓ Weight field still shows "185"
- ✓ Values persist after navigation away and back
- ✓ No data loss when switching screens

**Troubleshooting:**
- If values are cleared: App state persistence may not be implemented (check if expected behavior)
- If values show but are wrong: Check browser's local state in DevTools
- If page refreshes when switching screens: This is expected in a test harness

**Status:** [ ] Pass [ ] Fail

---

### Test 8: API Responses Include All Required Fields ✓ [5 min]
**Objective:** Verify API responses contain all expected data fields

**Steps:**
1. Go to Dashboard screen
2. Click "View 52-Week Summary" button
3. Look at the JSON preview in the results card
4. Examine the JSON structure for expected fields

**Expected Results:**
- ✓ JSON response is visible in the preview
- ✓ Response includes "weeks" array or similar structure
- ✓ Each week has dates, exercise names, or similar data fields
- ✓ Data is properly formatted JSON (not error messages)
- ✓ Response time is under 5 seconds

**Troubleshooting:**
- If JSON is empty: API may have returned no data
- If JSON shows error: Backend may have validation issues
- If truncated: This is expected (preview limited to 500 chars, full data is there)

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Multiple Data Fetches Don't Cause Conflicts ✓ [5 min]
**Objective:** Verify that fetching data multiple times works reliably

**Steps:**
1. Go to Dashboard screen
2. Click "View 52-Week Summary" (wait for it to complete)
3. Immediately click "View 52-Week Summary" again (before previous request finishes if possible)
4. Observe both requests complete
5. Click it a third time
6. Verify the final result is correct

**Expected Results:**
- ✓ All three requests complete without errors
- ✓ Final result shows correct data
- ✓ No duplicate data or corrupted responses
- ✓ Loading messages appear for each request
- ✓ Results update correctly each time

**Troubleshooting:**
- If second request fails: Network may be blocking concurrent requests
- If data corrupts: Request deduplication logic may need checking
- If timeout: API may be throttling requests

**Status:** [ ] Pass [ ] Fail

---

### Test 10: History Data Loads and Displays Correctly ✓ [5 min]
**Objective:** Verify History screen fetches and displays workout data

**Steps:**
1. Go to History screen
2. Click "Load History" button
3. Wait for data to load
4. Examine the results card

**Expected Results:**
- ✓ "Loading history..." message appears
- ✓ API request completes (check status message at bottom)
- ✓ Results card shows "Recent Workouts" title
- ✓ Shows "Total entries" count
- ✓ Shows "Data received" byte count
- ✓ If data exists, shows workout entries with exercise names and sets
- ✓ If no data, shows "No data available" message

**Troubleshooting:**
- If "Total entries" is 0: API endpoint may not have workout data (expected in test)
- If error appears: Check API endpoint https://ageless-api.render.com/api/workouts
- If loading never completes: API may be timing out

**Status:** [ ] Pass [ ] Fail

---

## PHASE 3: DATA VALIDATION (Tests 11-13) - 15 minutes

### Test 11: 52-Week Data Covers Full Year Range ✓ [5 min]
**Objective:** Verify 52-week summary covers a complete year of data

**Steps:**
1. Go to Dashboard screen
2. Click "View 52-Week Summary" (wait for completion)
3. Look at the JSON preview in the results card
4. Count the number of week entries
5. Verify date ranges if visible

**Expected Results:**
- ✓ "Weeks loaded" count should be 52 or close to 52
- ✓ JSON shows weeks from different months throughout the year
- ✓ Data spans approximately 365 days
- ✓ All 52 weeks have data entries (or clear indication of missing weeks)

**Troubleshooting:**
- If weeks < 52: App may only return recent weeks (check if expected)
- If data is corrupted: API may have validation issues
- If all zeros: No workout data for those weeks (expected if new user)

**Status:** [ ] Pass [ ] Fail

---

### Test 12: Exercise Names Are Correctly Mapped ✓ [5 min]
**Objective:** Verify exercise names in API responses match expected exercise list

**Steps:**
1. Go to Dashboard screen
2. Click "View 52-Week Summary"
3. Look at the JSON preview for exercise names
4. Expected exercises should include: Push-ups, Pull-ups, Squats, Lunges, Planks, Deadlifts, Rows, Bench Press, Leg Press, Cardio, Stretching
5. Verify the exercise names in the response

**Expected Results:**
- ✓ Exercise names are recognizable (not codes or IDs)
- ✓ Exercise names match standard fitness exercises
- ✓ No garbled or corrupted exercise names
- ✓ Exercise names are properly formatted (title case or similar)

**Troubleshooting:**
- If seeing codes (e.g., "EX001"): Exercise mapping may not be working
- If seeing incorrect names: API may be returning wrong data
- If empty: No exercises logged yet (expected for new user)

**Status:** [ ] Pass [ ] Fail

---

### Test 13: Empty/Missing Data Falls Back Gracefully ✓ [5 min]
**Objective:** Verify the app handles missing or empty data without crashing

**Steps:**
1. Go to History screen
2. Click "Load History" button
3. If no data is returned, verify the app doesn't crash
4. Go back to Dashboard
5. Click "View 52-Week Summary"
6. If any weeks have no data, verify they're handled gracefully

**Expected Results:**
- ✓ App doesn't crash or show error page
- ✓ Empty states show helpful messages (e.g., "No data available")
- ✓ Missing data doesn't cause blank screens
- ✓ User can still navigate to other screens
- ✓ Fallback messages are clear and user-friendly

**Troubleshooting:**
- If app crashes: JavaScript error in error handling (check console)
- If blank screen: Missing fallback UI for empty state
- If unclear message: UX could be improved but functionality works

**Status:** [ ] Pass [ ] Fail

---

## PHASE 4: INTEGRATION & PERFORMANCE (Tests 14-16) - 15 minutes

### Test 14: Complete User Journey - Dashboard to Summary to History ✓ [5 min]
**Objective:** Verify a complete workflow through multiple screens and data fetches

**Steps:**
1. Start on Home screen
2. Click "Go to Dashboard" button
3. Enter a date in the date field
4. Enter a weight in the weight field
5. Click "View 52-Week Summary" and wait for completion
6. Verify the summary data displays
7. Click "History" in bottom navigation
8. Click "Load History" and wait for completion
9. Verify history data displays
10. Click "Profile" and verify profile information shows
11. Click "Dashboard" to return to start

**Expected Results:**
- ✓ All navigation steps complete without errors
- ✓ All data fetches complete successfully
- ✓ All screens load their content properly
- ✓ No data is lost during navigation
- ✓ API calls all return valid responses
- ✓ User can complete the entire workflow in sequence

**Troubleshooting:**
- If any step fails: Refer to specific test (1-13) for debugging
- If API times out: Render backend may be slow
- If navigation stutters: Browser performance may be an issue

**Status:** [ ] Pass [ ] Fail

---

### Test 15: API Response Time and Performance ✓ [5 min]
**Objective:** Verify API responses are reasonably fast

**Steps:**
1. Go to Dashboard screen
2. Click "Test API Connection" button
3. Note the time it takes to get a response (should be instant to a few seconds)
4. Click "View 52-Week Summary" button
5. Note the time from click to "52-Week Summary" card appearing
6. Go to History screen
7. Click "Load History" button
8. Note the time to get results

**Expected Results:**
- ✓ API Connection test completes in < 5 seconds
- ✓ 52-Week Summary loads in < 10 seconds
- ✓ History loads in < 10 seconds
- ✓ No timeout errors
- ✓ All responses complete successfully

**Typical Performance:**
- Local network: 1-3 seconds
- Remote API: 3-10 seconds
- Very slow network: 10-30 seconds

**Troubleshooting:**
- If > 30 seconds: Network is very slow or API is under load
- If timeout: Check if Render backend is running
- If no response time info: Check browser network tab (F12 → Network)

**Status:** [ ] Pass [ ] Fail

---

### Test 16: Memory/State Management - No Memory Leaks ✓ [5 min]
**Objective:** Verify app doesn't leak memory during repeated operations

**Steps:**
1. Open browser Developer Tools (F12)
2. Go to Performance or Memory tab
3. Go to Dashboard screen
4. Click "View 52-Week Summary" 5 times rapidly
5. Switch to History and click "Load History" 5 times
6. Switch between screens 5-10 times
7. Monitor memory usage in DevTools

**Expected Results:**
- ✓ Memory usage remains relatively stable (doesn't keep growing)
- ✓ No errors in browser console
- ✓ App remains responsive after many operations
- ✓ Performance doesn't degrade noticeably

**Troubleshooting:**
- If memory keeps growing: Potential memory leak (check for event listener cleanup)
- If errors appear: JavaScript cleanup issues
- If app becomes slow: May be browser-specific issue (try different browser)

**Status:** [ ] Pass [ ] Fail

---

## PHASE 5: EDGE CASES & ACCESSIBILITY (Tests 17-19) - 10 minutes

### Test 17: Rapid Interactions Don't Cause Race Conditions ✓ [3 min]
**Objective:** Verify the app handles rapid user interactions correctly

**Steps:**
1. Go to Dashboard screen
2. Rapidly click "View 52-Week Summary" 3-4 times in quick succession
3. Wait a few seconds for all requests to complete
4. Click "Reset App State" button
5. Rapidly change date input 3-4 times
6. Rapidly change weight input 3-4 times
7. Verify the final values are correct

**Expected Results:**
- ✓ No crashes or error pages
- ✓ Final state shows the last action taken
- ✓ Loading messages don't overlap confusingly
- ✓ Status messages update correctly
- ✓ No hung requests

**Troubleshooting:**
- If state is inconsistent: Race condition handling needs improvement
- If errors appear: Error handling for concurrent requests needed
- If one request is "stuck": Request deduplication may be needed

**Status:** [ ] Pass [ ] Fail

---

### Test 18: UI Is Responsive and Mobile-Friendly ✓ [4 min]
**Objective:** Verify the UI is properly sized for mobile viewport

**Steps:**
1. Look at the phone simulator on the left side of the screen
2. Verify it shows a realistic phone frame (375px wide, ~812px tall)
3. All text should be readable without zooming
4. All buttons should be tappable (minimum 44px height)
5. Content should not overflow horizontally
6. Scroll content vertically if needed but not horizontally
7. Try resizing your browser window
8. Verify the layout adapts (phone frame on left, controls on right on wide screens)

**Expected Results:**
- ✓ Phone frame renders with realistic notch (like iPhone)
- ✓ All text is legible at normal size
- ✓ All buttons are easily tappable
- ✓ No horizontal scrolling needed
- ✓ Content fits within phone viewport
- ✓ Responsive layout adjusts on narrow screens (phone frame stacks above controls)

**Troubleshooting:**
- If text is too small: Browser zoom (Ctrl+Plus) or CSS issue
- If buttons are too small: Accessibility issue in CSS
- If horizontal scroll appears: CSS layout issue
- If frame looks wrong: Browser may have font scaling enabled

**Status:** [ ] Pass [ ] Fail

---

### Test 19: Color Contrast and Accessibility Standards ✓ [3 min]
**Objective:** Verify the UI meets basic accessibility standards

**Steps:**
1. Look at the phone simulator
2. Verify you can clearly distinguish between:
   - Text and background (contrast)
   - Active and inactive buttons (color/styling)
   - Status messages (success = green, error = red)
3. Check that all buttons have visible labels
4. Check that all input fields have associated labels
5. Try using Tab key to navigate (keyboard navigation)

**Expected Results:**
- ✓ All text has sufficient contrast against background (readable)
- ✓ Active buttons are visually distinct from inactive ones
- ✓ Status colors are used consistently (green for success, red for error)
- ✓ All buttons have clear labels
- ✓ All inputs have visible labels
- ✓ Tab key moves through interactive elements
- ✓ Focus states are visible (highlighted element when tabbing)

**Troubleshooting:**
- If colors are hard to distinguish: Potential accessibility issue
- If buttons don't highlight on focus: Focus styling needed in CSS
- If labels are missing: UI needs improvement for accessibility
- If Tab doesn't work: tabindex attributes may be needed

**Status:** [ ] Pass [ ] Fail

---

## TEST SUMMARY & SIGN-OFF

### Test Results Summary

| Phase | Tests | Status | Pass | Fail | Notes |
|-------|-------|--------|------|------|-------|
| Phase 1 - Basic | 1-6 | | | | |
| Phase 2 - Advanced | 7-10 | | | | |
| Phase 3 - Validation | 11-13 | | | | |
| Phase 4 - Integration | 14-16 | | | | |
| Phase 5 - Edge Cases | 17-19 | | | | |
| **TOTAL** | **19** | | | | |

### Overall Assessment

**Total Tests Passed:** _____ / 19

**Overall Status:**
- [ ] ✓ ALL TESTS PASSED - Ready for Production
- [ ] ⚠ MINOR ISSUES - Acceptable with documentation
- [ ] ✗ CRITICAL ISSUES - Requires fixes before deployment

### Issues Found:

1. ___________________________________________________
2. ___________________________________________________
3. ___________________________________________________
4. ___________________________________________________

### Recommended Actions:

_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

### Sign-Off

**Tester Name:** _________________________________

**Test Date:** _________________________________

**Test Duration:** _________________________________

**Environment:**
- Backend API: https://ageless-api.render.com
- Test Client: http://localhost:8888/mobile-app-test-harness.html
- Browser: _________________________________
- Device/OS: _________________________________

**Signature/Confirmation:** _________________________________

---

## Quick Reference: Test Harness Controls

### Screen Navigation
- **Home Button (🏠):** Entry screen with "Go to Dashboard" button
- **Dashboard Button (📊):** Main app screen with date, weight, and data fetch buttons
- **History Button (📜):** Workout history screen
- **Profile Button (👤):** User profile and settings

### Data Fetch Buttons
- **View 52-Week Summary:** Fetches 52-week workout data from API
- **Load History:** Fetches recent workout history from API

### Test Controls
- **Test API Connection:** Verifies API is reachable
- **Test Screen Navigation:** Verifies screen switching works
- **Test Data Fetching:** Verifies complete data fetch flow
- **Reset App State:** Clears all entered data

### Input Fields
- **Date Input:** Select any date using date picker
- **Weight Input:** Enter numeric weight value

### Status Indicators
- **Green messages:** Success responses
- **Red messages:** Error responses
- **Blue messages:** Loading/info states

---

**Testing Complete! 🎉**

Please save this document with your test results for QA records.
