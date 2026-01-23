# Status Bar Configuration Guide

## Overview

This document explains the complete status bar color configuration for Ageless across all platforms:
- **iOS** (native)
- **Android** (native)
- **Web** (browser)
- **PWA** (standalone app)
- **EAS Web Build** (Expo deployment)

---

## Brand Color Specification

| Platform | Color | Hex | CSS |
|----------|-------|-----|-----|
| All Platforms | Primary Red | `#C5282F` | `rgb(197, 40, 47)` |

---

## Native Implementation (iOS & Android)

### StatusBar Component

**File**: `app/_layout.tsx`

```typescript
// Platform-aware rendering - only on native
{Platform.OS !== 'web' && (
  <StatusBar
    barStyle="light-content"           // White icons/text
    backgroundColor={theme.colors.primary}  // #C5282F
    translucent={true}                 // Allow content behind
  />
)}

// Wrapping View ensures color continuity
<View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
  {/* App content */}
</View>
```

### Native Configuration

**File**: `app.json`

```json
{
  "ios": {
    "statusBar": {
      "backgroundColor": "#C5282F"
    }
  },
  "android": {
    "statusBar": {
      "backgroundColor": "#C5282F"
    }
  }
}
```

### Visual Result (Native)

```
┌─────────────────────────────────────┐
│ 🔴 #C5282F Primary Red              │ ← Status Bar (native)
│ ⏰ 9:41 ● ● ●                        │ ← White icons (light-content)
├─────────────────────────────────────┤
│ Dashboard/Screen Content             │
│ Seamless red color transition       │
└─────────────────────────────────────┘
```

---

## Web Implementation

### HTML Meta Tags

**File**: `public/index.html`

```html
<!-- Chrome (Android) -->
<meta name="theme-color" content="#C5282F" />

<!-- Edge (Windows) -->
<meta name="msapplication-TileColor" content="#C5282F" />

<!-- Apple iOS/Safari -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-capable" content="yes" />

<!-- PWA Manifest -->
<link rel="manifest" href="./manifest.json" />
```

### CSS Styling

```css
html, body {
  margin: 0;
  padding: 0;
  background-color: #C5282F; /* Matches status bar */
  padding-top: env(safe-area-inset-top, 0);    /* iOS notch safe area */
  padding-bottom: env(safe-area-inset-bottom, 0);
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #C5282F;
}
```

### JavaScript Enhancement

```javascript
function setStatusBarColor() {
  const brandRed = '#C5282F';

  // Set theme color meta tag (Chrome on Android)
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.content = brandRed;

  // Ensure body/html background
  document.documentElement.style.backgroundColor = brandRed;
  document.body.style.backgroundColor = brandRed;
}

// Called on load, visibility change, and resume
setStatusBarColor();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    setStatusBarColor();
  }
});
```

### Visual Result (Web)

```
┌─────────────────────────────────────┐
│ 🔴 #C5282F Primary Red              │ ← Browser toolbar (Chrome on Android)
│ https://ageless-app.com             │
├─────────────────────────────────────┤
│ Dashboard/Screen Content             │
│ Seamless red color transition       │
└─────────────────────────────────────┘
```

---

## Web Build Configuration

### Expo app.json

**File**: `app.json`

```json
{
  "web": {
    "bundler": "metro",
    "output": "static",
    "favicon": "./assets/icon.png",
    "backgroundColor": "#C5282F",
    "themeColor": "#C5282F"
  }
}
```

### EAS Web Build

Build for web PWA:

```bash
# Local web build (for testing)
npm run build

# EAS web build (for production)
eas build --platform web --local

# Preview
npx http-server dist/
```

---

## PWA Manifest Configuration

**File**: `public/manifest.json`

```json
{
  "name": "Ageless - Fitness Tracking",
  "short_name": "Ageless",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#C5282F",
  "theme_color": "#C5282F",
  "orientation": "portrait-primary"
}
```

---

## Testing & Verification

### Native Platform Testing

#### iOS Simulator
```bash
npm run ios
# Verify red status bar with white icons
# No gap between status bar and header
```

#### Android Emulator
```bash
npm run android
# Verify red status bar with white icons
# Compare visual consistency with iOS
```

### Web Platform Testing

#### Local Build
```bash
npm run build
npx http-server dist/
# Open http://localhost:8080
# Check browser toolbar color (Chrome on Android)
```

#### Chrome DevTools Mobile Emulation
```
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select "Pixel 7" or similar Android device
4. Browser toolbar should show #C5282F
5. Meta theme-color should be visible in Head
```

#### iOS Safari Testing
```
1. Visit on iPhone/iPad
2. Click Share → Add to Home Screen
3. Launch PWA from home screen
4. Status bar should appear black-translucent
5. Background should be red
```

### Checklist

- [ ] **iOS**: Red status bar visible, white icons, no gaps
- [ ] **Android**: Red status bar visible, white icons, matches iOS
- [ ] **Web (Chrome)**: Toolbar color is red on mobile
- [ ] **Web (Safari)**: Meta tag recognized, safe area respected
- [ ] **PWA (iOS)**: Standalone mode, status bar correct
- [ ] **PWA (Android)**: Standalone mode, status bar correct
- [ ] **EAS Web Build**: Color continuity after deployment
- [ ] **All Platforms**: No white flash during app load
- [ ] **All Platforms**: Content doesn't hide behind status bar

---

## Troubleshooting

### Issue: White Flash on Load

**Problem**: White screen appears briefly before red loads.

**Solution**: Check that `public/index.html` has immediate background color:
```html
<style>
  html, body {
    background-color: #C5282F;
  }
</style>
```

Should be in `<head>` before any JavaScript.

---

### Issue: Status Bar Color Not Applied on Web

**Problem**: Browser toolbar remains default color.

**Solutions**:
1. **Clear Cache**: `Ctrl+Shift+Delete` in Chrome
2. **Hard Refresh**: `Ctrl+Shift+R`
3. **Check Meta Tag**: Inspect page source for `<meta name="theme-color">`
4. **Verify File**: Ensure `public/index.html` is in build output

---

### Issue: Status Bar Disappears on App Resume

**Problem**: Color resets after minimizing and resuming PWA.

**Solution**: The JavaScript handler re-applies color:
```javascript
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    setStatusBarColor();
  }
});
```

Verify this code is in `public/index.html`.

---

### Issue: EAS Web Build Missing Colors

**Problem**: EAS deployment doesn't show status bar color.

**Solutions**:
1. Verify `app.json` includes web config with theme colors
2. Ensure `public/manifest.json` exists and is valid
3. Check EAS build logs for any errors
4. Rebuild with: `eas build --platform web --local --clear-cache`

---

## Platform-Specific Behavior

### iOS
- **Native**: StatusBar component works, translucent allowed
- **Web**: Uses `apple-mobile-web-app-status-bar-style: black-translucent`
- **Safe Area**: Respects notch via `env(safe-area-inset-*)`

### Android
- **Native**: StatusBar component works, full support for custom colors
- **Web**: Uses `theme-color` meta tag for Chrome toolbar
- **Edge-to-Edge**: Respects system gesture areas

### Desktop Web
- **Chrome**: Shows toolbar in theme color
- **Firefox**: Limited theme color support
- **Safari**: Uses theme-color for browser UI

---

## Files Modified

| File | Purpose | Status |
|------|---------|--------|
| `app/_layout.tsx` | Platform-aware StatusBar component | ✅ Enhanced |
| `app.json` | Native + Web configuration | ✅ Enhanced |
| `public/index.html` | Meta tags + CSS + JavaScript | ✅ Enhanced |
| `public/manifest.json` | PWA manifest | ✅ Created |

---

## Commits

- `[STATUS-BAR-WEB]`: Platform-aware StatusBar + web fallback implementation
- `[PWA-MANIFEST]`: Add PWA manifest for status bar support

---

## References

- [React Native StatusBar](https://reactnative.dev/docs/statusbar)
- [Web Platform Colors](https://web.dev/web-app-manifest/#theme_color)
- [PWA Manifest](https://www.w3.org/TR/appmanifest/)
- [Apple Web App Meta Tags](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

---

**Last Updated**: January 23, 2026
**Version**: 1.0 - Complete Web Platform Support
