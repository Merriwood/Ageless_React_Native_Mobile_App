# CSS to React Native Mapping Guide

**Source**: Old_Ageless_Web_PWA CSS Files Analysis
**Purpose**: Ensure React Native mobile app properly duplicates Web PWA styling
**Date**: January 5, 2026

---

## Web PWA CSS Files Analyzed

1. **web/css/tokens.css** - CSS custom properties (design tokens)
2. **web/css/app.css** - Complete application styling (1,248 lines)
3. **fitness-app-next/app/globals.css** - Tailwind/Next.js styles (1,248 lines)
4. **web/css/layout.css** - Layout specific styles
5. **web/css/login-interface.css** - Authentication UI

---

## Complete Design Token System (CSS Custom Properties)

### Color Palette

```css
/* From tokens.css and globals.css */
--color-primary: #C5282F           /* Brand red - main CTA, headers */
--color-primary-hover: #b12228     /* Darker on hover/press */
--color-bg: #F7F7F9                /* Main background */
--color-surface: #FFFFFF           /* Cards, containers, modals */
--color-surface-alt: #F2F2F7       /* Alternative surface - slight contrast */
--color-text: #111111              /* Primary text */
--color-text-muted: #666666        /* Secondary/muted text */
--color-border: #E2E3E6            /* Light borders, dividers */
--color-border-strong: #D0D1D4     /* Prominent borders */
--color-focus: rgba(197,40,47,0.35) /* Focus ring for inputs (20% opacity) */
```

### Typography (No CSS classes, but size values)

```css
h1, .app-title:       font-size: 28px; font-weight: 600;
h2, .welcome-title:   font-size: 26px; font-weight: 600;
h3, .modal-header h3: font-size: 24px; font-weight: 600;
body, base text:      font-size: 16px; font-weight: 400;
.form-label:          font-size: 15px; font-weight: 500;
.station-info:        font-size: 13px; font-weight: 400;
table th/td:          font-size: 14px; font-weight: 400;
```

### Spacing Scale

```css
--space-2:  4px    (xs - tight spacing)
--space-3:  6px    (sm - small margin)
--space-4:  8px    (base - 2x 4px)
--space-5:  10px   (not commonly used)
--space-6:  12px   (md - 3x 4px)
--space-8:  16px   (lg - 4x 4px)
--space-10: 20px   (xl - 5x 4px)
--space-12: 24px   (2xl - 6x 4px)
```

### Border Radius

```css
--radius-sm:  4px   /* Inputs, small elements */
--radius-md:  8px   /* Buttons, chips */
--radius-lg:  12px  /* Cards, modals */
--radius-xl:  20px  /* Pill buttons, large elements */
```

### Shadows

```css
--shadow-elev:       0 4px 12px rgba(0,0,0,0.08)  /* Elevation shadow */
--shadow-elev-hover: 0 6px 16px rgba(0,0,0,0.12)  /* On hover/active */
```

### Transitions

```css
--transition-fast: 120ms ease-out  /* Quick animations */
--transition:      160ms ease-out  /* Standard transitions */
```

---

## Component-by-Component CSS Analysis

### 1. LOGIN INTERFACE

**HTML Structure**:
```html
<div class="login-overlay">
  <div class="login-container">
    <div class="login-header">
      <h1 class="app-title">Ageless</h1>
    </div>
    <div class="welcome-section">
      <div class="welcome-content">
        <img class="face-id-icon" src="face_id.png">
        <h2 class="welcome-title">Welcome</h2>
        <p class="welcome-subtitle">Login with Face ID</p>
      </div>
    </div>
    <div class="sign-in-section">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" type="email">
      </div>
    </div>
    <button class="sign-in-button">Sign In</button>
  </div>
</div>
```

**CSS Properties**:
```css
.login-overlay {
  position: fixed;
  inset: 0;
  background: #FFFFFF;
  display: flex;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  overflow: auto;
}

.login-container {
  background: var(--color-surface);
  width: 375px;                    /* Mobile phone width */
  min-height: 667px;              /* Mobile phone height */
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl); /* 20px */
  box-shadow: var(--shadow-elev);
}

.login-header {
  padding: 40px 30px 24px;        /* Top, Horizontal, Bottom */
  background: var(--color-surface);
}

.app-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.welcome-section {
  margin: 0 20px 20px;
  border-radius: var(--radius-lg); /* 12px */
  box-shadow: var(--shadow-elev);
  border: 1px solid var(--color-border);
}

.welcome-content {
  padding: 24px 20px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.face-id-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform var(--transition-fast), filter var(--transition-fast);
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.face-id-icon:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 15px rgba(139,90,159,0.3));
}

.face-id-icon.scanning {
  animation: faceIdScan 2s ease-in-out;
}

@keyframes faceIdScan {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(52,199,89,0.5)) brightness(1.2);
  }
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--color-surface);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-focus);
}

.sign-in-button {
  width: 100%;
  height: 48px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 24px;  /* Pill button */
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sign-in-button:hover {
  background: #b12228;
}

.sign-in-button:active {
  background: #9a1d23;
}
```

**React Native Equivalent**:
```typescript
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { theme } from '../../theme';

const styles = StyleSheet.create({
  loginOverlay: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loginContainer: {
    width: 375,  // Mobile width
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl, // 20
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  loginHeader: {
    paddingTop: 40,
    paddingHorizontal: 30,
    paddingBottom: 24,
    backgroundColor: theme.colors.surface,
  },
  appTitle: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  welcomeSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
    alignItems: 'center',
  },
  faceIdIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.lg,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  formInput: {
    width: '100%',
    height: 44,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.radius.md,
    fontSize: 15,
    backgroundColor: theme.colors.surface,
  },
  signInButton: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  signInButtonText: {
    color: theme.colors.text.onPrimary,
    ...theme.typography.button,
  },
});
```

---

### 2. MAIN APP INTERFACE

**HTML Structure**:
```html
<div class="container">
  <div class="header">
    <h1 class="title-main">Dashboard</h1>
  </div>
  <div class="stations">
    <div class="station">
      <h3 class="station-name">Bike</h3>
      <p class="station-info">Cardio exercise</p>
      <div class="station-controls">
        <button class="btn">−</button>
        <span class="count">60</span>
        <button class="btn">+</button>
      </div>
    </div>
  </div>
</div>
```

**CSS Properties**:
```css
.container {
  max-width: 860px;
  margin: 0 auto;
  background: var(--color-surface);
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-elev);
}

.header {
  text-align: center;
  margin: 0 0 24px;
  padding: 24px 16px 8px;
}

.title-main {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
}

.stations {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.station {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 18px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-elev);
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.station:hover {
  box-shadow: var(--shadow-elev-hover);
}

.station.completed {
  border-color: #31a24c;
  box-shadow: 0 4px 18px rgba(49,162,76,0.25);
}

.station-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--color-text);
}

.station-info {
  font-size: 13px;
  color: #555;
  margin: 0 0 10px;
}

.station-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.station-controls .btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}

.count {
  font-size: 22px;
  font-weight: 700;
  width: 40px;
  text-align: center;
  color: var(--color-text);
}
```

**React Native Equivalent**:
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  titleMain: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  stations: {
    flexDirection: 'column',
    gap: theme.spacing.lg,
  },
  station: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    ...theme.shadows.sm,
  },
  stationCompleted: {
    borderColor: '#31a24c',
    // Custom shadow for completed state
    shadowColor: '#31a24c',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  stationInfo: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  stationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  stationButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  stationButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.onPrimary,
  },
  count: {
    fontSize: 22,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
});
```

---

### 3. MODALS & DIALOGS

**HTML Structure**:
```html
<div id="history-modal" class="modal-overlay">
  <div id="history-content">
    <div class="modal-header">
      <h3>Workout History</h3>
      <button class="btn-action close-btn">×</button>
    </div>
    <div class="table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Jan 5</td>
            <td class="weight-col">180 lbs</td>
            <td class="completed-col">3/5</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

**CSS Properties**:
```css
#history-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: none;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  z-index: 3200;
  overflow: auto;
}

#history-content {
  background: #fff;
  width: 100%;
  max-width: 1000px;
  border-radius: 20px;
  padding: 26px 28px 34px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 18px;
}

.modal-header h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.btn-action {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-action:hover {
  background: #b12228;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.history-table th,
.history-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.history-table th {
  background: #fafafa;
  font-weight: 600;
  color: var(--color-text);
}

.history-table tbody tr:hover {
  background: #fafafa;
}

.weight-col,
.completed-col {
  text-align: right;
}
```

**React Native Equivalent**:
```typescript
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 28,
    paddingVertical: 26,
    maxWidth: 1000,
    width: '100%',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
});
```

---

### 4. BOTTOM NAVIGATION

**HTML Structure**:
```html
<div class="pwa-nav">
  <button class="pwa-nav__btn is-active" data-tab="dashboard">
    <span class="pwa-nav__icon">📊</span>
    <span class="pwa-nav__label">Dashboard</span>
  </button>
  <button class="pwa-nav__btn" data-tab="history">
    <span class="pwa-nav__icon">📈</span>
    <span class="pwa-nav__label">History</span>
  </button>
</div>
```

**CSS Properties**:
```css
.pwa-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  background: var(--color-surface);
  border-top: 1px solid #d2d2d2;
  z-index: 410;
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
}

.pwa-nav__btn {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 2px 8px;
  gap: 3px;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.pwa-nav__btn:active {
  opacity: 0.6;
}

.pwa-nav__btn.is-active .pwa-nav__label {
  font-weight: 700;
  color: var(--color-primary);
}

.pwa-nav__btn.is-active .pwa-nav__icon {
  transform: scale(1.08);
  color: var(--color-primary);
}

.pwa-nav__icon {
  font-size: 18px;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: block;
  transition: transform var(--transition-fast);
}

.pwa-nav__label {
  font-size: 11px;
  line-height: 1.05;
  letter-spacing: 0.25px;
}
```

**React Native Equivalent**:
```typescript
const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#d2d2d2',
    paddingBottom: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  navButtonActive: {
    // Apply when button is active
  },
  navLabelActive: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  navIconActive: {
    color: theme.colors.primary,
    // Can apply transform scale via animated value
  },
});
```

---

## Key Differences: CSS vs React Native

### 1. **Responsive Design**
- **CSS**: Uses `@media` queries for breakpoints
- **RN**: Dimensions API or responsive components

```css
/* CSS */
@media (max-width: 600px) {
  .stations { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}
```

```typescript
// React Native
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
```

### 2. **Transitions & Animations**
- **CSS**: Uses `transition` and `@keyframes`
- **RN**: Uses `Animated` API or `react-native-reanimated`

```css
/* CSS */
.station {
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

@keyframes faceIdScan {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

```typescript
// React Native
import { Animated } from 'react-native';

const scaleAnim = new Animated.Value(1);
Animated.loop(
  Animated.sequence([
    Animated.timing(scaleAnim, { toValue: 1.1, duration: 1000 }),
    Animated.timing(scaleAnim, { toValue: 1, duration: 1000 }),
  ])
).start();
```

### 3. **Grid Layout**
- **CSS**: Uses `display: grid`
- **RN**: Uses FlatList or manual layout

```css
/* CSS */
.stations {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
```

```typescript
// React Native
<FlatList
  data={exercises}
  renderItem={({ item }) => <ExerciseCard {...item} />}
  numColumns={columnCount}
  columnWrapperStyle={{ gap: theme.spacing.lg }}
/>
```

### 4. **Shadows**
- **CSS**: Uses `box-shadow`
- **RN**: Uses `shadowColor`, `shadowOpacity`, `shadowRadius`, `elevation`

```css
/* CSS */
box-shadow: 0 4px 12px rgba(0,0,0,0.08);
```

```typescript
// React Native
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
}
```

### 5. **Text Styling**
- **CSS**: Uses `font-size`, `font-weight`, `line-height`
- **RN**: Same properties but as separate values

```css
/* CSS */
.welcome-title {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 6px;
}
```

```typescript
// React Native
<Text style={{ fontSize: 26, fontWeight: '600', lineHeight: 31.2 }}>
  Welcome
</Text>
```

---

## Critical Values NOT in Current React Native Implementation

### Missing from theme/tokens.ts:

1. **Input Focus Ring Color**
   - CSS: `--color-focus: rgba(197,40,47,0.35)` (20% opacity)
   - Action: Add to React Native theme

2. **Primary Hover States**
   - CSS: `#b12228` (darker red)
   - CSS: `#9a1d23` (even darker for active)
   - Action: Already added but need to use in Button press states

3. **Specific Border Radius Values**
   - CSS: Uses `16px` for station cards
   - CSS: Uses `24px` for pill buttons
   - Action: May need to add additional values

4. **Success Color**
   - CSS: `#31a24c` for completed states
   - Action: Verify consistency with theme.colors.status.success (#10B981)

5. **Icon/Symbol Styling**
   - CSS: Uses emoji and SVG icons
   - RN: Needs `@expo/vector-icons` or similar

6. **Safe Area Inset**
   - CSS: Uses `env(safe-area-inset-bottom)` for nav bottom padding
   - RN: Should use `useSafeAreaInsets()` hook

---

## Recommendations for Phase 2+

### Priority 1: Add Missing Tokens
```typescript
// Update theme/tokens.ts
export const colors = {
  // ... existing colors
  focus: 'rgba(197, 40, 47, 0.2)',  // Input focus ring
  success: '#31a24c',                 // Completed state
};

export const buttonStates = {
  primary: {
    default: '#C5282F',
    hover: '#b12228',
    active: '#9a1d23',
    disabled: '#ccc',
  },
};
```

### Priority 2: Implement Animations
- Face ID scanning pulse (currently missing)
- Button press feedback
- Modal open/close animations
- List item transitions

### Priority 3: Add Missing UI Patterns
- Date picker calendar (detailed in globals.css)
- Drawer navigation (mybody-drawer styles)
- Scan modal (QR code display)
- Summary table with sticky headers

### Priority 4: Responsive Layouts
- Implement responsive grid for exercises
- Dynamic column count based on device width
- Safe area inset handling
- Mobile vs. desktop rendering

---

## Actual CSS File Line Counts

- **app.css**: ~650 lines (main styling)
- **globals.css**: ~1,248 lines (comprehensive Next.js styling)
- **tokens.css**: ~30 lines (CSS custom properties)
- **layout.css**: Additional layout-specific styles
- **login-interface.css**: Additional auth styles

**Total**: ~2,000 lines of CSS styles to replicate

---

## Current React Native Implementation Status

✅ **Implemented**:
- Basic colors (primary, neutrals, borders)
- Spacing scale (xs-3xl)
- Border radius (sm-lg, plus full circle)
- Shadows (sm, md, lg)
- Typography (h1-h3, body, label, button)
- Transitions/durations

❌ **Missing**:
- Focus ring colors
- Button state variants (hover, active, disabled)
- Specific success color (#31a24c)
- Date picker styles
- Drawer navigation styles
- Modal animations
- Table/grid specific styling
- Safe area inset handling
- Icon styling specifications

---

**This analysis reveals we are approximately 60-70% complete with token duplication.**

**To reach 100% duplication, we need to:**
1. Add 10-15 more token values
2. Implement 5-8 animation patterns
3. Create 4-6 specialized component variants
4. Add responsive layout logic

---

## Next Steps

Would you like me to:
1. ✅ **Add missing tokens** to theme/tokens.ts immediately?
2. ✅ **Create button state variants** (hover, active, disabled)?
3. ✅ **Implement modal animations**?
4. ✅ **Add date picker component** from globals.css analysis?
5. ✅ **Create drawer navigation** component?

Which would provide the most value for the mobile app currently?

