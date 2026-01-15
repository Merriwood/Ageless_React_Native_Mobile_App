# Maestro iOS Testing - Ageless React Native

**Date**: 2026-01-14
**Status**: ✅ Ready for Production Testing
**Framework**: Maestro Test Automation
**Platform**: iOS 14+
**Device**: Single iOS device (UDID-based)

---

## Quick Start

### 1. Install Maestro
```bash
brew tap mobile-dev-inc/maestro
brew install maestro
maestro --version
```

### 2. Connect iOS Device
```bash
maestro list-devices
# Get your device UDID
```

### 3. Run Tests
```bash
# Start server
maestro start-server

# In another terminal, run login test
maestro test test_login_flow.yaml --udid=YOUR_DEVICE_UDID
```

---

## Test Files

### Critical Path Tests (Must Pass)

| Test | Duration | File | Status |
|------|----------|------|--------|
| Login Flow | ~3 min | `test_login_flow.yaml` | ✅ Core Auth |
| Register Flow | ~4 min | `test_register_flow.yaml` | ✅ New Users |
| Dashboard Flow | ~5 min | `test_dashboard_flow.yaml` | ✅ Main UI |
| History Flow | ~4 min | `test_history_flow.yaml` | ✅ Data Mgmt |

### Secondary Tests (Should Pass)

| Test | Duration | File | Status |
|------|----------|------|--------|
| Profile Flow | ~2 min | `test_profile_flow.yaml` | ⭕ User Info |

---

## Test Execution Phases

### Phase 1: Foundation (15 min total)
Required for production release:
```bash
maestro test test_login_flow.yaml --udid=$DEVICE_UDID
maestro test test_register_flow.yaml --udid=$DEVICE_UDID
maestro test test_dashboard_flow.yaml --udid=$DEVICE_UDID
```

### Phase 2: Data Management (10 min total)
Verify workflows:
```bash
maestro test test_history_flow.yaml --udid=$DEVICE_UDID
```

### Phase 3: User Experience (5 min total)
Optional validation:
```bash
maestro test test_profile_flow.yaml --udid=$DEVICE_UDID
```

**Total Time**: ~30 minutes for full test suite

---

## Configuration

### config.yaml
Master configuration file with:
- App ID: `exp.ageless`
- API timeout: 30 seconds
- Test timeout: 60 seconds
- Screenshots on error: enabled

### Device Setup
See [MAESTRO_DEVICE_SETUP_GUIDE.md](../../../MAESTRO_DEVICE_SETUP_GUIDE.md)

### Backend Configuration
See [MAESTRO_RENDER_BACKEND_CONFIG.md](../../../MAESTRO_RENDER_BACKEND_CONFIG.md)

---

## Test Details

### test_login_flow.yaml
**Tests**:
1. Valid login
2. Email validation
3. Password required
4. Invalid credentials
5. Successful login with token

**Expected Results**: All steps pass, token extracted

### test_register_flow.yaml
**Tests**:
1. Invalid email format
2. Password too short
3. Successful registration
4. Duplicate email error
5. Required fields validation
6. Navigation back to login

**Expected Results**: All validations work, registration succeeds

### test_dashboard_flow.yaml
**Tests**:
1. Dashboard loads with current date
2. Progress bar visible
3. All 11 exercise cards display
4. Increment/decrement counts work
5. Weight input saves
6. Progress updates
7. Date picker navigation
8. Bottom navigation works
9. Cross-screen navigation

**Expected Results**: Full workout tracking functional

### test_history_flow.yaml
**Tests**:
1. Hamburger menu opens
2. History modal opens
3. History cards display
4. Workout cards load
5. Edit button opens modal
6. Delete confirmation works
7. Scroll through history
8. Close modal
9. Bottom nav history tab
10. Navigation consistency

**Expected Results**: History fully accessible and manageable

### test_profile_flow.yaml
**Tests**:
1. Profile tab accessible
2. Navigate to profile screen
3. MyBody screen displays
4. User info shows
5. Body measurements visible
6. Settings section present
7. Logout button visible
8. Navigation away and back
9. Return to profile
10. Data persists

**Expected Results**: Profile screen fully functional

---

## Test Elements (Test IDs)

### Authentication
- `email-input` - Email input field
- `password-input` - Password input field
- `signin-button` - Sign in button
- `register-email-input` - Register email field
- `register-password-input` - Register password field
- `register-confirm-password-input` - Confirm password field
- `register-button` - Register button

### Dashboard
- `date-picker` - Date selection
- `exercise-card-{name}` - Individual exercise cards (bike, abs, chest_press, etc.)
- `exercise-increment-{name}` - Increment button per exercise
- `exercise-decrement-{name}` - Decrement button per exercise
- `exercise-value-{name}` - Exercise count display
- `weight-input` - Weight input field
- `save-weight-button` - Save weight button
- `progress-bar` - Progress indicator

### Navigation
- `hamburger-menu` - Side menu button
- `bottom-nav` - Bottom navigation container
- `profile-tab` - Profile tab in nav

### Modals
- `history-modal` - History modal container
- `history-card-{index}` - Individual workout entries
- `edit-button-{index}` - Edit workout button
- `delete-button-{index}` - Delete workout button
- `close-button` - Modal close button
- `profile-screen` - Profile screen container

### Profile
- `user-name-display` - Username display
- `user-email-display` - Email display
- `body-measurements` - Measurements section
- `profile-settings` - Settings section
- `logout-button` - Logout button

---

## Running Tests

### Single Test
```bash
maestro test test_login_flow.yaml --udid=DEVICE_UDID
```

### All Tests in Directory
```bash
maestro test . --udid=DEVICE_UDID
```

### With Verbose Output
```bash
maestro test test_login_flow.yaml --udid=DEVICE_UDID --verbose
```

### Generate HTML Report
```bash
maestro test . --udid=DEVICE_UDID --reporter-type html
```

### Run in CI/CD
```bash
maestro ci test . \
  --udid=DEVICE_UDID \
  --reporter-type html \
  --reporter-output-dir=./test-reports
```

---

## Success Criteria

### Login Flow
✅ Valid credentials authenticate
✅ Invalid email rejected
✅ Missing password rejected
✅ Wrong password rejected
✅ Token successfully extracted

### Register Flow
✅ Email validation works
✅ Password length enforced
✅ Duplicate email rejected
✅ Required fields enforced
✅ Navigation back to login

### Dashboard Flow
✅ Dashboard loads
✅ All 11 exercises display
✅ Exercise counts increment/decrement
✅ Weight saves
✅ Progress bar updates
✅ Date picker works
✅ Bottom nav functional
✅ Navigation between screens

### History Flow
✅ Menu opens
✅ History modal accessible
✅ Workouts display
✅ Edit modal opens
✅ Delete confirmation shows
✅ Scroll works
✅ Modal closes
✅ Bottom nav history tab works

### Profile Flow
✅ Profile screen loads
✅ User info displays
✅ Body measurements show
✅ Settings section present
✅ Logout button available
✅ Data persists

---

## Common Issues

### Device Not Detected
See [MAESTRO_DEVICE_SETUP_GUIDE.md](../../../MAESTRO_DEVICE_SETUP_GUIDE.md#step-2-connect-ios-device)

### Test Timeout
See [MAESTRO_DEVICE_SETUP_GUIDE.md](../../../MAESTRO_DEVICE_SETUP_GUIDE.md#tests-timeout)

### App Crashes
See [MAESTRO_DEVICE_SETUP_GUIDE.md](../../../MAESTRO_DEVICE_SETUP_GUIDE.md#app-crashes-during-tests)

### Authentication Fails
See [MAESTRO_RENDER_BACKEND_CONFIG.md](../../../MAESTRO_RENDER_BACKEND_CONFIG.md#troubleshooting)

---

## Test Data

### Test Account
```
Email: test@ageless.app
Password: Test@123
```

### Pre-populated Data
- ✅ 47 workouts
- ✅ 52 weeks of summary data
- ✅ Multiple workout entries per week

---

## Next Steps

1. **Setup Device**: Follow [MAESTRO_DEVICE_SETUP_GUIDE.md](../../../MAESTRO_DEVICE_SETUP_GUIDE.md)
2. **Configure Backend**: Review [MAESTRO_RENDER_BACKEND_CONFIG.md](../../../MAESTRO_RENDER_BACKEND_CONFIG.md)
3. **Run Phase 1 Tests**: Execute login, register, dashboard flows
4. **Review Results**: Check test reports
5. **Run Phase 2 Tests**: Execute history flow if Phase 1 passes
6. **Run Phase 3 Tests**: Execute profile flow for full validation
7. **Generate Final Report**: Compile all test results
8. **Deploy to Production**: Proceed with app store submission

---

## Documentation

- [Main Setup Guide](../../../MAESTRO_IOS_TESTING_SETUP.md)
- [Device Setup](../../../MAESTRO_DEVICE_SETUP_GUIDE.md)
- [Backend Config](../../../MAESTRO_RENDER_BACKEND_CONFIG.md)
- [Test Files](./README.md) ← You are here

---

**Status**: ✅ READY FOR TESTING
**Date**: 2026-01-14
**Last Updated**: 2026-01-14

