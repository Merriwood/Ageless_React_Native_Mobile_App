# Quick Reference: Design Tokens for React Native

**Reference Source**: Old_Ageless_Web_PWA/fitness-app-next
**For**: Immediate use when building components
**Status**: Ready to implement

---

## Color Palette

### Primary & Brand
```
Primary Red:      #C5282F  (Benjamin Moore Red - main CTA, headers)
Primary Hover:    #b12228  (darker variant for press states)
Primary Light:    #f5d5d6  (light variant for backgrounds)
```

### Neutrals
```
Background:       #F7F7F9  (main app background)
Surface:          #FFFFFF  (cards, modals, containers)
Surface Alt:      #F2F2F7  (alternative surface, slight contrast)
Text Primary:     #111111  (main body text)
Text Secondary:   #666666  (muted text, labels)
Text on Primary:  #FFFFFF  (text on red backgrounds)
```

### Borders
```
Border Light:     #E2E3E6  (subtle dividers)
Border Strong:    #D0D1D4  (prominent dividers)
```

### Status Colors
```
Success/Complete: #10B981  (green - completed exercises, checkmarks)
Warning/Pending:  #F59E0B  (amber - in progress)
Error/Missed:     #EF4444  (red - missed workouts)
Info:             #3B82F6  (blue - information)
```

### Interactive
```
Overlay (Modal):  rgba(0,0,0,0.5)  (semi-transparent black)
```

---

## Spacing Scale (4px base)

```
xs:   4px   (tight spacing)
sm:   6px   (small margin)
base: 8px   (base unit - 2x 4px)
md:   12px  (medium margin - 3x 4px)
lg:   16px  (large margin - 4x 4px)
xl:   20px  (extra large - 5x 4px)
2xl:  24px  (2x large - 6x 4px)
3xl:  32px  (3x large - 8x 4px)
```

**Usage Examples**:
- Padding inside cards: `lg` (16px)
- Gap between list items: `base` or `md` (8px or 12px)
- Margin between sections: `xl` (20px)
- Padding inside buttons: `base` vertical, `md` horizontal (8px / 12px)

---

## Border Radius

```
sm:  4px   (slightly rounded - inputs, small elements)
md:  8px   (rounded - buttons, chips)
lg:  12px  (more rounded - cards, modals)
xl:  20px  (pill-shaped - buttons, badges)
2xl: 24px  (very rounded)
full: 999px (circle)
```

**Usage Examples**:
- Card corners: `lg` (12px)
- Button corners: `lg` (12px) for default, `xl` (20px) for pill-shaped
- Input fields: `md` (8px)
- Badges: `xl` (20px) for pill-shaped
- Icons: `sm` (4px) for subtle rounding

---

## Typography

### Font Sizes & Weights

**Headings:**
```
H1: 28px, fontWeight: 700 (bold)     - Page titles
H2: 26px, fontWeight: 600 (semibold) - Section headers
H3: 20px, fontWeight: 600 (semibold) - Subheaders
```

**Body Text:**
```
Body:      16px, fontWeight: 400 (normal)     - Main content
BodySmall: 14px, fontWeight: 400 (normal)     - Secondary content
Label:     12px, fontWeight: 600 (semibold)   - Form labels, tags
Button:    16px, fontWeight: 600 (semibold)   - Button text
```

**All with standard line heights:**
```
H1: lineHeight 32px
H2: lineHeight 30px
H3: lineHeight 24px
Body: lineHeight 22px
BodySmall: lineHeight 20px
Label: lineHeight 16px
Button: lineHeight 20px
```

**Font Family**: System default (platform appropriate)
- iOS: San Francisco
- Android: Roboto

---

## Shadows (Elevation)

### React Native Compatible

```
Small:  {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2
}

Medium: {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4
}

Large:  {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 8
}
```

**Usage Examples**:
- Cards default: Medium shadow
- Cards elevated: Large shadow
- Buttons: Small shadow
- Modals: Large shadow

---

## Animations & Transitions

### Timing

```
Fast:     120ms   (quick feedback, collapse arrows)
Standard: 160ms   (normal transitions, fades)
Slow:     280ms   (modals, drawers, complex)
```

### Easing Functions

```
ease-out      (default: bounce into place)
ease-in-out   (smooth back and forth)
cubic-bezier  (custom timing for special effects)
```

### Common Animations

**Button Press:**
```
Scale: 0.95 (95% size)
Duration: 120ms
Easing: ease-out
```

**Card Appearance:**
```
Opacity: 0 → 1 (fade in)
Transform: translateY(20) → translateY(0) (slide up)
Duration: 160ms
Easing: ease-out
```

**Modal Entrance:**
```
Opacity: 0 → 1 (fade)
Duration: 280ms
Easing: cubic-bezier
```

---

## Component Variants

### Button Sizes

```
Small:  height 36px,  padding 8px vertical, 12px horizontal
Medium: height 44px,  padding 8px vertical, 16px horizontal  (touch target minimum)
Large:  height 48px,  padding 12px vertical, 20px horizontal (form submission)
```

### Button Variants

```
Primary:   bg #C5282F, text white      (main CTAs, form submission)
Secondary: bg #F2F2F7, border #E2E3D6, text primary (alternatives)
Ghost:     bg transparent, text #C5282F (low priority)
Danger:    bg #EF4444, text white      (destructive actions)
```

### Card Variants

```
Default:   bg white, subtle border, small shadow
Completed: bg #f5d5d6, indicates finished state
Elevated:  bg white, large shadow (emphasis)
```

### Input States

```
Default:  border #E2E3E6
Focused:  border #C5282F (brand color)
Error:    border #EF4444 (red)
Disabled: opacity 0.5
```

---

## Safe Area Insets

For notched/safe area devices (iPhones with notch, Android with cutout):

```
Use SafeAreaView on root screens to respect:
- Top: Notch area
- Bottom: Home indicator (iOS) or system bar (Android)
- Left/Right: Safe area padding
```

---

## Responsive Breakpoints

**Mobile-first approach:**
```
Mobile (default):  0px - all screens handled
Tablet:           768px and up (if web support needed)
Desktop:          1024px and up (if web support needed)
```

**For mobile app, no breakpoints needed** - React Native handles scaling automatically.

---

## Dark Mode (if supported)

Currently: Light mode only. If dark mode needed later:

```
Background:       #1A1A1A (instead of #F7F7F9)
Surface:          #2D2D2D (instead of #FFFFFF)
Text Primary:     #FFFFFF (instead of #111111)
Text Secondary:   #CCCCCC (instead of #666666)
Border:           #3D3D3D (instead of #E2E3E6)
```

---

## Implementation Checklist

When creating a new component, verify:

- [ ] Color comes from `colors` object (no hardcoded hex)
- [ ] Spacing uses scale values (xs/sm/base/md/lg/xl)
- [ ] Border radius uses defined values (sm/md/lg/xl)
- [ ] Shadow uses defined values (sm/md/lg)
- [ ] Typography uses defined sizes/weights
- [ ] Button variants match (primary/secondary/ghost/danger)
- [ ] Animations use standard timings (120ms/160ms/280ms)
- [ ] Component accepts style props for flexibility
- [ ] TypeScript types are exported
- [ ] Props match web PWA component intent

---

## Example: Complete Component Using Tokens

```typescript
import { theme } from '../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    height: 48,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.text.onPrimary,
  },
  badge: {
    backgroundColor: theme.colors.status.success,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  badgeText: {
    ...theme.typography.label,
    color: '#fff',
  },
});
```

---

## Common Pitfalls to Avoid

❌ **WRONG**: Hardcoded colors
```typescript
backgroundColor: '#C5282F'  // DON'T DO THIS
```

✅ **RIGHT**: Use theme tokens
```typescript
backgroundColor: theme.colors.primary  // DO THIS
```

---

❌ **WRONG**: Magic spacing numbers
```typescript
padding: 16  // What's the scale?
margin: 12   // Is this standard or one-off?
```

✅ **RIGHT**: Use spacing scale
```typescript
padding: theme.spacing.lg   // Clear intent
margin: theme.spacing.md    // Part of system
```

---

❌ **WRONG**: Different border radius per component
```typescript
borderRadius: 12  // Card
borderRadius: 8   // Button
borderRadius: 20  // Badge
// No consistency!
```

✅ **RIGHT**: Use defined radius values consistently
```typescript
borderRadius: theme.radius.lg   // Card (12)
borderRadius: theme.radius.lg   // Button (12)
borderRadius: theme.radius.xl   // Badge (20)
// Clear and maintainable!
```

---

## Quick Paste Template

**For new `theme/tokens.ts`:**

```typescript
// Copy token values from this document
// See REACT_NATIVE_UI_PARITY_ROADMAP.md Task 1.1 for complete implementation

export const colors = {
  primary: '#C5282F',
  primaryHover: '#b12228',
  primaryLight: '#f5d5d6',
  background: '#F7F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F2F7',
  text: { primary: '#111111', secondary: '#666666', onPrimary: '#FFFFFF' },
  border: { light: '#E2E3E6', strong: '#D0D1D4' },
  status: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' },
  overlay: 'rgba(0,0,0,0.5)',
};

export const spacing = {
  xs: 4, sm: 6, base: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32,
};

export const radius = {
  sm: 4, md: 8, lg: 12, xl: 20, '2xl': 24, full: 999,
};

// ... (see full implementation in roadmap)
```

---

## Reference Documents

- **Full Implementation Guide**: `REACT_NATIVE_UI_PARITY_ROADMAP.md`
- **Recommendations & Strategy**: `UI_PARITY_RECOMMENDATIONS.md`
- **Gap Analysis**: `UI_DUPLICATION_ASSESSMENT.md`

---

**Status**: Ready to Use
**Last Updated**: January 5, 2026
**Source**: Old_Ageless_Web_PWA/fitness-app-next/tailwind.config.ts + app/globals.css
