# iOS Device Setup Guide for Maestro Testing

**Date**: 2026-01-14
**Purpose**: Prepare single iOS device for Maestro automation testing
**Target Device**: Any iOS 14+ device
**Duration**: ~15 minutes

---

## Prerequisites

### Development Machine
- macOS (Catalina or later)
- Xcode 12+ installed
- Maestro CLI installed
- USB cable to connect device

### iOS Device
- iOS 14 or later
- Adequate storage (>500MB free)
- Battery >50% charged
- USB connector compatible with device

---

## Step 1: Install Maestro CLI

### Option A: Using Homebrew (Recommended)

```bash
# Add Maestro tap
brew tap mobile-dev-inc/maestro

# Install Maestro
brew install maestro

# Verify installation
maestro --version

# Expected output:
# maestro 1.x.x
```

### Option B: Manual Installation

```bash
# Download latest release
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to PATH if needed
export PATH="$PATH:$HOME/.maestro/bin"

# Verify
maestro --version
```

---

## Step 2: Connect iOS Device

### Physical Connection

1. **Connect Device via USB**
   - Use native USB cable (Lightning or USB-C depending on device)
   - Connect to Mac USB port (not hub, use direct port)
   - Device will display trust prompt

2. **Trust Development Certificate**
   - On device: Tap "Trust" when prompted
   - On device: Enter passcode if required
   - Device is now trusted for development

3. **Unlock Device**
   - Keep device unlocked during Maestro setup
   - Maestro needs to access device features

### Verify Connection

```bash
# List connected devices
maestro list-devices

# Expected output:
# iPhone (Model)
# UDID: 00008120-001ABCDEF1234567
# OS: iOS 15.7
```

**If device not detected**:
- Disconnect and reconnect USB cable
- Try different USB port
- Restart device
- Update Xcode: `xcode-select --install`

---

## Step 3: Enable Developer Mode

### For iOS 16+ (Important!)

Developer Mode is required for automation on iOS 16+:

1. **Go to Settings**
   - Open Settings app on device
   - Navigate to Privacy & Security
   - Scroll to bottom and find "Developer Mode"

2. **Enable Developer Mode**
   - Toggle Developer Mode ON
   - Confirm alert ("Reboot to apply changes?")
   - Device will reboot

3. **Trust Certificate Again**
   - After reboot, trust the development certificate again
   - Unlock device

### For iOS 14-15

Developer Mode not required, but ensure:
- Device is unlocked
- USB connection is stable
- Xcode is up to date

---

## Step 4: Prepare Device for Testing

### Disable Auto-Lock

```
Settings → Display & Brightness → Auto-Lock → Never
```

This prevents device from sleeping during tests.

### Enable Airplane Mode (Optional for Offline Tests)

```
Settings → Airplane Mode → Toggle ON/OFF
```

Keep disabled for online tests. Enable only when testing offline sync.

### Check Storage

```bash
# On device:
Settings → General → iPhone Storage
# Ensure >500MB free
```

If low on storage:
- Delete unused apps
- Clear cache: Settings → General → iPhone Storage → Delete unused apps

---

## Step 5: Install Ageless App on Device

### Option A: Using Expo Go (Development)

```bash
# On development machine:
cd Ageless_REACT-Native_Mobile_Application/mobile-app

# Start Expo development server
npx expo start

# On device:
# 1. Install "Expo Go" from App Store
# 2. Open Expo Go app
# 3. Scan QR code from terminal
# 4. App loads on device
```

### Option B: Using EAS Build (Production)

```bash
# On development machine:
cd Ageless_REACT-Native_Mobile_Application/mobile-app

# Build for device
eas build --platform ios --device

# Follow prompts to select device
# App is built and installed automatically
```

### Verify App Installation

1. On device, look for "mobile-app" or "Ageless" icon
2. Launch app to verify it works
3. Complete login with test account

---

## Step 6: Get Device UDID

```bash
# On development machine:
maestro list-devices

# Look for your device in output:
# iPhone 15 Pro
# UDID: 00008120-001ABCDEF1234567
# OS: iOS 17.2

# Copy the UDID
DEVICE_UDID="00008120-001ABCDEF1234567"
```

**Alternative method**:
```bash
# Using Xcode
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app

# Or via terminal
xcrun simctl list devices
```

---

## Step 7: Create Device Configuration File

Create `.maestro-device.yml` in project root:

```yaml
# Maestro Device Configuration
# Ageless React Native Mobile App

device:
  udid: "00008120-001ABCDEF1234567"  # Replace with your UDID
  deviceName: "iPhone 15 Pro"         # Optional, for reference
  osVersion: "17.2"                   # Optional, for reference

appConfiguration:
  bundleId: "exp.ageless"  # For Expo Go
  # OR
  # bundleId: "com.ageless.app"  # For EAS Build

testConfiguration:
  timeout: 60
  screenshotOnError: true
  verbose: true
```

---

## Step 8: Verify Device is Ready for Maestro

### Start Maestro Server

```bash
# Terminal 1: Start server
maestro start-server

# Expected output:
# Starting Maestro Server on port 7001
# Server is ready
```

Keep this terminal running.

### Run First Test

```bash
# Terminal 2: Run test
cd Ageless_React_Native_Mobile_Application/mobile-app
maestro test --udid=00008120-001ABCDEF1234567 path/to/test.yaml

# Expected output:
# Running test...
# ✅ Test passed
# Completed in X seconds
```

---

## Step 9: Environment Configuration

Create `.env.maestro` in project root:

```env
# Maestro Testing Environment

# Device Configuration
IOS_DEVICE_UDID=00008120-001ABCDEF1234567
DEVICE_NAME=iPhone 15 Pro

# Backend Configuration
RENDER_API_URL=https://ageless-api.render.com
RENDER_API_HEALTH_CHECK=https://ageless-api.render.com/api/health

# Test User Credentials
TEST_USER_EMAIL=test@ageless.app
TEST_USER_PASSWORD=Test@123

# Test Configuration
TEST_TIMEOUT=60
SCREENSHOT_ON_ERROR=true
VERBOSE_LOGGING=true
```

---

## Step 10: Troubleshooting

### Device Not Detected

**Problem**: `maestro list-devices` shows no devices

**Solutions**:
```bash
# 1. Restart USB connection
# Disconnect and reconnect USB cable

# 2. Restart device
# Power off and on

# 3. Update Xcode
xcode-select --install

# 4. Check USB port
# Try different USB port on Mac

# 5. Reset trust
# On device: Settings → General → Reset → Reset Location & Privacy
# Then reconnect and re-trust

# 6. Restart Maestro
maestro start-server  # Stop and restart
```

### Device Disconnects During Test

**Problem**: Device loses connection mid-test

**Solutions**:
- Use direct USB port (not hub)
- Keep USB cable plugged in fully
- Disable USB Selective Suspend (Windows only - not applicable on Mac)
- Keep device unlocked
- Don't use device during tests

### Tests Timeout

**Problem**: Tests fail with timeout errors

**Solutions**:
```bash
# 1. Increase timeout in config
# Change timeout: 60 to timeout: 120

# 2. Check device performance
# - Close background apps
# - Disable iCloud sync
# - Disable automatic updates

# 3. Check network latency
ping ageless-api.render.com
# Should be <100ms
```

### App Crashes During Tests

**Problem**: App crashes or freezes during automation

**Solutions**:
- Check app logs: `xcrun simctl spawn <device-udid> log stream --predicate 'eventMessage contains "crash"'`
- Restart app: kill and reopen
- Check for required permissions (Camera, Location, etc.)
- Verify test data is valid

### Token/Authentication Issues

**Problem**: Tests fail at login step

**Solutions**:
- Verify test account exists on backend
- Verify password is correct
- Check token storage: look in app's AsyncStorage
- Clear app data: on device, Settings → General → iPhone Storage → [App] → Offload App, then reinstall

---

## Device Maintenance

### Before Each Test Session

- [ ] Device charged >50%
- [ ] Device unlocked
- [ ] App installed and accessible
- [ ] No critical background processes
- [ ] USB connection stable
- [ ] Backend API accessible

### After Test Session

- [ ] Disconnect device
- [ ] Back up test results
- [ ] Review crash logs if any
- [ ] Note any device issues

### Weekly Maintenance

- [ ] Restart device (power off/on)
- [ ] Update iOS if available
- [ ] Clear app cache: Settings → General → iPhone Storage → [App] → Offload & Reinstall
- [ ] Check device storage (maintain >1GB free)

---

## Advanced Configuration

### Multiple Device Testing (Future)

For testing across multiple devices:

```bash
# List all devices
maestro list-devices

# Run on specific device
maestro test --udid=DEVICE_1_UDID test.yaml
maestro test --udid=DEVICE_2_UDID test.yaml

# Run in parallel with different UDIDs
maestro ci test . --udid=$DEVICE_1 &
maestro ci test . --udid=$DEVICE_2 &
```

### Parallel Test Execution

```bash
# Run multiple test flows on same device
maestro test --udid=UDID test_login.yaml &
maestro test --udid=UDID test_dashboard.yaml &
# Wait for both
wait
```

### Recording Tests

```bash
# Record a test flow for later playback
maestro record --udid=UDID output.yaml

# Then play back
maestro test --udid=UDID output.yaml
```

---

## Device Specifications

### Tested Devices
- ✅ iPhone 14 Pro (iOS 17+)
- ✅ iPhone 13 (iOS 16+)
- ✅ iPhone 12 mini (iOS 15+)
- ⚠️ Older devices (iOS 14) - may need workarounds

### Simulator (Alternative)

If physical device unavailable:

```bash
# List simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 15"

# Run tests on simulator
maestro test --simulator test.yaml
```

---

## Next Steps

1. ✅ Install Maestro
2. ✅ Connect device
3. ✅ Get UDID
4. ✅ Install app
5. ✅ Run first test
6. ✅ Configure environment
7. **→ Run full test suite** (see MAESTRO_IOS_TESTING_SETUP.md)

---

**Status**: ✅ DEVICE SETUP READY
**Date**: 2026-01-14
**Next**: Execute test flows from MAESTRO_IOS_TESTING_SETUP.md

