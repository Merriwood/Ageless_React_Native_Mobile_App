# Detailed UI Comparison Analysis: React Native vs Web PWA Dashboard

**Date:** January 6, 2026
**Assessment Purpose:** Identify all remaining styling, structural, and design differences between React Native implementation and Web PWA source of truth
**Goal:** Achieve identical duplication of Web PWA UI

---

## 📊 EXECUTIVE SUMMARY

The React Native implementation has fundamental structural and styling discrepancies that prevent it from being an identical duplication of the Web PWA. While color values are mostly aligned, there are critical differences in:

1. **Card Styling** (gap, padding, border radius) - NOT ALIGNED
2. **Button Styling** (shadow, inactive state) - PARTIALLY ALIGNED
3. **Spacing Architecture** (card internal spacing) - NOT ALIGNED
4. **Component Structure** (card borders, completed states) - DIFFERENT
5. **Progress Section** (styling, layout, shadow) - NOT ALIGNED
6. **Weight Input** (card structure, styling) - DIFFERENT
7. **Exercise Header** (spacing, typography) - NEEDS ADJUSTMENT

---

## 🔍 DETAILED COMPARISON BY COMPONENT

### 1. CONTAINER / LAYOUT

#### Web PWA
```css
/* From globals.css */
.exercise-grid {
  display: grid;
  gap: 20px;  /* gap-5 in Tailwind = 20px (Tailwind spacing-5 * 4) */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Mobile */
}

/* At 600px+ breakpoint */
@media (min-width: 600px) {
  .exercise-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
```

**CSS Grid Properties:**
- Display: `grid` (not flexbox!)
- Gap: `20px` (explicitly: `gap-5`)
- Responsive: 180px cards on mobile, 240px cards on desktop
- Breakpoint: Exactly 600px

#### React Native Current
```typescript
exerciseGridWrapper: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing.xl, // 20px ✓
}
```

**Issues:**
- ✗ Uses `flexDirection: 'row'` instead of CSS Grid
- ✓ Gap is correct (20px)
- ✗ Cannot implement responsive minmax(180px/240px) in flexbox
- ✗ No breakpoint implementation for mobile vs desktop card sizes
- ✗ Card width hardcoded to '48%' instead of responsive sizing

**Status:** ❌ INCORRECT - Fundamental architecture differs

---

### 2. EXERCISE CARD (Station Card)

#### Web PWA
```css
.station-card {
  @apply bg-surface border border-border rounded-2xl p-5 relative shadow-elev
         flex flex-col gap-3 transition-fast;
}

.station-card.completed {
  @apply border-[#31a24c] shadow-[0_4px_18px_rgba(49,162,76,0.25)];
}
```

**Decoded Tailwind Classes:**
- `bg-surface` → `#FFFFFF` (white)
- `border border-border` → 1px solid `#E2E3E6` (light gray)
- `rounded-2xl` → **24px** border radius (NOT 16px!)
- `p-5` → **20px** padding (all sides) (NOT 16px!)
- `shadow-elev` → `0 4px 12px rgba(0,0,0,0.08)` (subtle shadow)
- `flex flex-col gap-3` → flexbox column with 12px gap between elements
- `transition-fast` → 120ms transitions
- **Completed State:** Green border (#31a24c) + shadow `0 4px 18px rgba(49,162,76,0.25)`

#### React Native Current
```typescript
exerciseCard: {
  backgroundColor: theme.colors.surface,           // ✓ #FFFFFF
  borderRadius: theme.radius.lg,                    // ✗ 16px (should be 24px)
  padding: theme.spacing.lg,                        // ✗ 16px (should be 20px)
  borderLeftWidth: 3,                               // ✗ LEFT BORDER ONLY (not full border!)
  borderLeftColor: theme.colors.primary,
  ...theme.shadows.sm,                              // ✓ Similar shadow
  flex: 1,
  minWidth: '45%',
}

exerciseCardCompleted: {
  borderLeftColor: theme.colors.status.success,     // ✓ #10B981 (similar to #31a24c)
  ...theme.shadows.md,                              // ✗ Different shadow
}
```

**Detailed Differences:**

| Property | Web PWA | React Native | Status |
|----------|---------|--------------|--------|
| Background | `#FFFFFF` | `#FFFFFF` | ✓ CORRECT |
| Border | 1px solid `#E2E3E6` (all sides) | 3px left border only | ❌ WRONG |
| Border Radius | **24px** | 16px | ❌ WRONG |
| Padding | **20px** (all sides) | 16px | ❌ WRONG |
| Shadow (Normal) | `0 4px 12px rgba(0,0,0,0.08)` | `shadowOpacity: 0.05, shadowRadius: 4` | ⚠️ APPROXIMATE |
| Shadow (Completed) | `0 4px 18px rgba(49,162,76,0.25)` | `shadowOpacity: 0.08, shadowRadius: 12` | ❌ WRONG |
| Internal Gap | 12px (`gap-3`) | None | ❌ MISSING |
| Completed Border | Green all sides | Green left only | ❌ WRONG |

**Status:** ❌ CRITICAL MISMATCH - Multiple styling errors

---

### 3. CARD HEADER / TITLE

#### Web PWA
```jsx
<CardHeader>
  <CardTitle className="text-lg">{exercise.name}</CardTitle>
  <CardDescription>
    Target: {exercise.targetReps} {exercise.unit}
  </CardDescription>
</CardHeader>
```

**Tailwind Classes (implicit):**
- `CardTitle` → `text-lg` = 18px font, font-semibold (600 weight), likely color: text-primary
- `CardDescription` → text-sm = 14px font, color: text-muted (#666666)

#### React Native Current
```typescript
exerciseName: {
  fontSize: 16,           // ✗ Should be 18px
  fontWeight: '600',      // ✓ Correct
  color: theme.colors.text.primary,  // ✓ Correct
  marginBottom: theme.spacing.xs,    // 4px
}

exerciseTarget: {
  fontSize: 13,           // ✗ Should be 14px
  fontWeight: '500',      // ✗ Should be 400 (normal)
  color: theme.colors.text.secondary,  // ✓ Correct
}
```

**Differences:**

| Property | Web PWA | React Native | Status |
|----------|---------|--------------|--------|
| Title Font Size | 18px | 16px | ❌ WRONG |
| Title Weight | 600 | 600 | ✓ CORRECT |
| Subtitle Font Size | 14px | 13px | ❌ WRONG |
| Subtitle Weight | 400 | 500 | ❌ WRONG |

**Status:** ❌ TYPOGRAPHY MISMATCH

---

### 4. BUTTON STYLING

#### Web PWA
```jsx
<Button
  size="sm"
  className="w-11 h-11 rounded-[14px] text-lg shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
>
  -
</Button>
```

**Decoded:**
- `w-11` = 44px width (Tailwind: 11 * 4px)
- `h-11` = 44px height
- `rounded-[14px]` = **14px border radius** (explicit custom value)
- `text-lg` = 18px font
- `shadow-[0_4px_10px_rgba(0,0,0,0.12)]` = **Custom shadow: 0 4px 10px with 12% opacity**
- Variant: Primary button (red background) or Secondary (gray for minus)

#### React Native Current
```typescript
controlBtn: {
  width: theme.sizes.controlButton,    // 44px ✓
  height: theme.sizes.controlButton,   // 44px ✓
  borderRadius: theme.radius.button,   // 14px ✓
  backgroundColor: theme.colors.primary, // #C5282F ✓
  justifyContent: 'center',
  alignItems: 'center',
  ...theme.shadows.sm,                 // 0.05 opacity, 4px radius ✗
}
```

**Issues:**

| Property | Web PWA | React Native | Status |
|----------|---------|--------------|--------|
| Width | 44px | 44px | ✓ CORRECT |
| Height | 44px | 44px | ✓ CORRECT |
| Border Radius | 14px | 14px | ✓ CORRECT |
| Shadow | `0 4px 10px rgba(0,0,0,0.12)` | `shadowOpacity: 0.05, shadowRadius: 4` | ❌ WRONG |
| Disabled State | Secondary button styling | ??? | ❓ UNCLEAR |
| Hover State | Darker background | ??? | ❓ UNCLEAR |
| Font Size | 18px | 18px | ✓ CORRECT |

**Missing in React Native:**
- ✗ Disabled/inactive button styling (secondary variant with different background)
- ✗ Proper button shadow (should be `0 4px 10px rgba(0,0,0,0.12)`)
- ✗ Hover/active press state styling
- ✗ Both buttons have same styling (minus button should be secondary/gray in Web PWA)

**Status:** ⚠️ PARTIAL - Size and radius correct, but shadows and states missing

---

### 5. PROGRESS SECTION (Today's Workout)

#### Web PWA
```jsx
<div className="text-center bg-surface p-6 rounded-xl shadow-elev">
  <h2 className="text-2xl font-bold mb-2">Today's Workout</h2>
  <div className="text-lg text-text-muted mb-3">
    Progress: <span className="font-bold text-primary">{completed}</span>/
    {EXERCISES.length} exercises ({progress}%)
  </div>
  <div className="w-full bg-border rounded-full h-3 overflow-hidden">
    <div
      className="bg-primary h-3 transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

**Decoded Tailwind:**
- Container: `bg-surface p-6 rounded-xl shadow-elev`
  - Background: `#FFFFFF` (white)
  - Padding: `24px` (p-6 = 6 * 4px)
  - Border Radius: `12px` (rounded-xl, NOT 24px)
  - Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Title: `text-2xl font-bold` → 28px, weight 700
- Subtitle: `text-lg text-text-muted` → 18px, color #666666
  - Progress number: `font-bold text-primary` → weight 700, color #C5282F
- Progress Bar:
  - Container: `w-full bg-border rounded-full h-3` → full width, light gray background, fully rounded, 12px height (h-3 = 3 * 4px)
  - Fill: `bg-primary h-3` → red, 12px height, width dynamic

#### React Native Current
```typescript
progressSection: {
  backgroundColor: theme.colors.surface,     // ✓ #FFFFFF
  borderRadius: theme.radius.lg,             // ✓ 12px (rounded-xl)
  padding: theme.spacing.lg,                 // ✗ 16px (should be 24px)
  ...theme.shadows.md,                       // ✗ Wrong shadow (should be .sm / elev)
}

progressLabel: {
  fontSize: 16,         // ✗ Should be 28px
  fontWeight: '600',    // ✗ Should be 700
  color: theme.colors.text.primary,
  marginBottom: theme.spacing.base,  // 8px
}

progressText: {
  fontSize: 14,         // ✗ Should be 18px
  color: theme.colors.text.secondary,  // ✓
  marginBottom: theme.spacing.md,
}

progressBar: {
  height: theme.sizes.progressBar,    // ✓ 8px (but Web PWA uses 12px!)
  backgroundColor: theme.colors.border.light,  // ✓
  borderRadius: theme.radius.full,    // ✓ 999px (full round)
  overflow: 'hidden',
}

progressFill: {
  height: '100%',
  backgroundColor: theme.colors.primary,  // ✓
}
```

**Differences:**

| Component | Web PWA | React Native | Status |
|-----------|---------|--------------|--------|
| Container Padding | **24px** | 16px | ❌ WRONG |
| Container Shadow | `0 4px 12px rgba(0,0,0,0.08)` | `0.08 opacity, 12px radius` | ⚠️ CLOSE |
| Title Font Size | **28px** | 16px | ❌ WRONG |
| Title Weight | **700** | 600 | ❌ WRONG |
| Subtitle Font Size | **18px** | 14px | ❌ WRONG |
| Progress Bar Height | **12px** | 8px | ❌ WRONG |
| Progress Bar Radius | Fully rounded | 999px | ✓ CORRECT |

**Status:** ❌ CRITICAL - Typography and sizing severely wrong

---

### 6. WEIGHT INPUT CARD

#### Web PWA
```jsx
<Card>
  <CardContent className="pt-6">
    <label htmlFor="weight" className="block text-sm font-medium mb-2">
      Weight (lbs)
    </label>
    <Input
      id="weight"
      type="number"
      step="0.1"
      placeholder="Enter your weight (optional)"
      value={weight}
      onChange={(e) => {
        setWeight(e.target.value)
      }}
    />
  </CardContent>
</Card>
```

**Structure:**
- Standard Card wrapper (same as exercise cards)
- Label: `text-sm font-medium` → 14px, weight 500
- Label margin: `mb-2` → 8px bottom
- Input field with styling

#### React Native Current
```typescript
weightCard: {
  backgroundColor: theme.colors.surface,
  borderRadius: theme.radius.lg,
  padding: theme.spacing.lg,
  ...theme.shadows.md,
}

weightLabel: {
  fontSize: 14,         // ✓
  fontWeight: '600',    // ✗ Should be 500
  color: theme.colors.text.primary,
  marginBottom: theme.spacing.md,  // 12px (should be 8px)
}
```

**Issues:**
- ✗ Card structure doesn't match exercise cards (different border/padding treatment)
- ✗ Label weight: 600 instead of 500
- ✗ Label margin: 12px instead of 8px
- ✗ Card doesn't have full border like exercise cards (has left border instead)

**Status:** ❌ INCONSISTENT - Card structure doesn't match

---

### 7. OVERALL STRUCTURE

#### Web PWA Container
```jsx
<div className="space-y-6">
  {/* DatePicker */}
  {/* Progress Section */}
  {/* Weight Card */}
  {/* Exercise Grid */}
</div>
```

- Uses `space-y-6` → 24px vertical spacing between major sections
- Flexbox column layout (implicit via space-y)

#### React Native Container
```typescript
contentContainer: {
  gap: theme.spacing.lg,  // 16px (should be 24px!)
  paddingBottom: theme.spacing.xl,
}
```

**Issues:**
- ✗ Gap between sections: 16px (should be 24px for `space-y-6`)
- ✗ Not documented as to actual gaps between sections

**Status:** ❌ WRONG - Section spacing incorrect

---

## 📋 COMPLETE DISCREPANCY TABLE

| Element | Property | Web PWA | React Native | Gap | Severity |
|---------|----------|---------|--------------|-----|----------|
| **Card** | Border Radius | 24px | 16px | 8px | 🔴 HIGH |
| **Card** | Padding | 20px | 16px | 4px | 🔴 HIGH |
| **Card** | Border | 1px all sides | 3px left only | Structural | 🔴 CRITICAL |
| **Card** | Internal Gap | 12px | 0px | 12px | 🔴 HIGH |
| **Card** | Completed Shadow | Custom green | Different | Opacity/color | 🔴 HIGH |
| **Button** | Shadow | `0 4px 10px rgba(0,0,0,0.12)` | `sm shadow` | Values | 🟡 MEDIUM |
| **Button** | Variants | Secondary (gray) | Only primary | Structural | 🔴 HIGH |
| **Button Minus** | Background | Gray/secondary | Red/primary | Color | 🟡 MEDIUM |
| **Title** | Font Size | 28px | 16px | 12px | 🔴 CRITICAL |
| **Title** | Weight | 700 | 600 | 100 | 🔴 HIGH |
| **Subtitle** | Font Size | 18px | 14px | 4px | 🔴 HIGH |
| **Subtitle** | Weight | 400 | 500 | 100 | 🟡 MEDIUM |
| **Progress Bar** | Height | 12px | 8px | 4px | 🔴 HIGH |
| **Progress Section** | Padding | 24px | 16px | 8px | 🔴 HIGH |
| **Weight Label** | Weight | 500 | 600 | 100 | 🟡 MEDIUM |
| **Section Gap** | Spacing | 24px | 16px | 8px | 🔴 HIGH |
| **Grid** | Architecture | CSS Grid | Flexbox | Structural | 🔴 CRITICAL |
| **Grid Layout** | Responsive | minmax(180/240) | Fixed 48% | Structural | 🔴 CRITICAL |

---

## 🛠️ CORRECTIVE ACTION PLAN

### PHASE 1: Theme Token Corrections (HIGHEST PRIORITY)

**File:** `theme/tokens.ts`

**Required Changes:**

1. **Add new radius token for cards:**
   ```typescript
   export const radius = {
     // ... existing ...
     card: 24,        // NEW: Exercise card radius (rounded-2xl)
     lg: 12,          // CHANGE: Progress section radius (rounded-xl, not 16px)
     // ... rest ...
   }
   ```

2. **Add explicit card-related spacing tokens:**
   ```typescript
   export const spacing = {
     // ... existing ...
     cardPadding: 20,     // NEW: p-5 in Tailwind
     sectionSpacing: 24,  // NEW: space-y-6 gap
     internalCardGap: 12, // NEW: gap-3 inside cards
     // ... rest ...
   }
   ```

3. **Fix shadow values to match Web PWA exactly:**
   ```typescript
   export const shadows = {
     sm: {
       shadowColor: '#000',
       shadowOpacity: 0.08,       // CHANGE from 0.05
       shadowRadius: 3,           // CHANGE from 4 (4px blur ≈ 3 radius)
       elevation: 2,
       shadowOffset: { width: 0, height: 4 },  // NEW: explicit offset
     },
     // Add new shadow for buttons
     button: {
       shadowColor: '#000',
       shadowOpacity: 0.12,       // NEW: 0 4px 10px rgba(0,0,0,0.12)
       shadowRadius: 2.5,
       elevation: 3,
       shadowOffset: { width: 0, height: 4 },
     },
     // Add new shadow for completed cards
     completedCard: {
       shadowColor: '#31a24c',    // GREEN
       shadowOpacity: 0.25,       // 0 4px 18px rgba(49,162,76,0.25)
       shadowRadius: 4.5,
       elevation: 4,
       shadowOffset: { width: 0, height: 4 },
     },
     // ...rest...
   }
   ```

**Status:** Must complete before UI updates

---

### PHASE 2: Card Component Refactoring

**File:** `app/dashboard/index.tsx` styles

**Changes Required:**

```typescript
exerciseCard: {
  backgroundColor: theme.colors.surface,
  borderWidth: 1,                               // NEW: Full border
  borderColor: theme.colors.border.light,       // NEW: All sides
  borderLeftWidth: 3,                           // KEEP: Left accent
  borderLeftColor: theme.colors.primary,        // KEEP
  borderRadius: theme.radius.card,              // CHANGE to 24px
  padding: theme.spacing.cardPadding,           // CHANGE to 20px
  ...theme.shadows.sm,                          // CHANGE to elev
  flex: 1,
  minWidth: '45%',
},

exerciseCardCompleted: {
  borderColor: theme.colors.status.success,     // CHANGE: Full border green
  borderLeftColor: theme.colors.status.success, // KEEP: Left green
  ...theme.shadows.completedCard,               // NEW: Green shadow
},
```

**Key Changes:**
- Add `borderWidth: 1` for full border (not just left)
- Change border radius from 16px to 24px
- Change padding from 16px to 20px
- Update shadow to button-specific shadow
- Add green shadow for completed state

---

### PHASE 3: Typography Corrections

**File:** `app/dashboard/index.tsx` styles

**Changes Required:**

```typescript
exerciseName: {
  fontSize: 18,                                  // CHANGE from 16
  fontWeight: '600',
  color: theme.colors.text.primary,
  marginBottom: theme.spacing.xs,
},

exerciseTarget: {
  fontSize: 14,                                  // CHANGE from 13
  fontWeight: '400',                             // CHANGE from 500
  color: theme.colors.text.secondary,
},

progressLabel: {
  fontSize: 28,                                  // CHANGE from 16
  fontWeight: '700',                             // CHANGE from 600
  color: theme.colors.text.primary,
  marginBottom: theme.spacing.base,
},

progressText: {
  fontSize: 18,                                  // CHANGE from 14
  color: theme.colors.text.secondary,
  marginBottom: theme.spacing.md,
},

progressBar: {
  height: 12,                                    // CHANGE from 8 (theme.sizes.progressBar)
  backgroundColor: theme.colors.border.light,
  borderRadius: theme.radius.full,
  overflow: 'hidden',
},

weightLabel: {
  fontSize: 14,
  fontWeight: '500',                             // CHANGE from 600
  color: theme.colors.text.primary,
  marginBottom: theme.spacing.sm,                // CHANGE from md (12px to 8px)
},
```

---

### PHASE 4: Spacing & Layout Corrections

**File:** `app/dashboard/index.tsx` styles

**Changes Required:**

```typescript
progressSection: {
  backgroundColor: theme.colors.surface,
  borderRadius: theme.radius.lg,                // VERIFY: Should be 12px
  padding: theme.spacing.cardPadding,           // CHANGE from lg (16 to 20px)
  ...theme.shadows.sm,                          // CHANGE from md
},

contentContainer: {
  gap: theme.spacing.sectionSpacing,            // CHANGE from lg (16 to 24px)
  paddingBottom: theme.spacing.xl,
},

exerciseGridContainer: {
  marginBottom: theme.spacing.lg,
},

// INSIDE CardHeader or CardContent
exerciseHeader: {
  marginBottom: theme.spacing.md,                // VERIFY: Should ensure 12px internal gap
},
```

---

### PHASE 5: Button State Variants

**File:** `app/dashboard/index.tsx` - controlBtn styling

**Add Button Variants:**

```typescript
controlBtn: {
  width: theme.sizes.controlButton,
  height: theme.sizes.controlButton,
  borderRadius: theme.radius.button,
  backgroundColor: theme.colors.primary,        // Red for +
  justifyContent: 'center',
  alignItems: 'center',
  ...theme.shadows.button,                      // NEW specific shadow
},

controlBtnSecondary: {  // NEW: For minus button
  width: theme.sizes.controlButton,
  height: theme.sizes.controlButton,
  borderRadius: theme.radius.button,
  backgroundColor: theme.colors.surfaceAlt,     // Light gray background
  borderWidth: 1,
  borderColor: theme.colors.border.light,       // Border for contrast
  justifyContent: 'center',
  alignItems: 'center',
  ...theme.shadows.button,
},

controlBtnDisabled: {  // NEW: Disabled state
  opacity: 0.5,
  backgroundColor: theme.colors.border.light,
},
```

**Implementation in renderExerciseCard:**
```typescript
<TouchableOpacity
  style={[
    styles.controlBtn,
    count === 0 && styles.controlBtnDisabled,
    // For minus button specifically:
    count > 0 && styles.controlBtnSecondary
  ]}
  // ...rest
>
```

---

### PHASE 6: Grid Layout Architecture (COMPLEX)

**Current Issue:** Using flexbox instead of true grid with responsive sizing

**Solution Approach A: Responsive View Width (Recommended for RN)**

```typescript
// Calculate card width based on viewport
// Mobile: ~180px cards (2 columns + 20px gap = ~380px total width)
// Desktop: ~240px cards (similar logic)

const getCardWidth = (screenWidth: number) => {
  const gap = theme.spacing.xl; // 20px
  const containerPadding = theme.spacing.lg * 2; // 32px (left + right)
  const availableWidth = screenWidth - containerPadding;
  const twoColumns = (availableWidth - gap) / 2;

  // Mobile breakpoint: 600px
  if (screenWidth < 600) {
    // ~180px cards
    return twoColumns;
  } else {
    // ~240px cards
    return twoColumns;
  }
};

// Then use:
<View key={exercise.id} style={{ width: getCardWidth(screenWidth) }}>
```

**Alternative Approach B: Percentage-based (Current)**
Keep current 48% approach but ensure proper responsive behavior

---

## 📋 IMPLEMENTATION CHECKLIST

### Must Complete (Blocking Compliance):

- [ ] **Theme Tokens**
  - [ ] Add `radius.card: 24`
  - [ ] Change `radius.lg: 12` (from 16)
  - [ ] Add shadow values for buttons and completed cards
  - [ ] Add spacing tokens for card padding, section gap, internal gaps

- [ ] **Card Styling**
  - [ ] Add full border (not just left)
  - [ ] Change radius to 24px
  - [ ] Change padding to 20px
  - [ ] Fix completed card styling and shadow

- [ ] **Typography**
  - [ ] Fix title: 28px, weight 700
  - [ ] Fix subtitle: 18px, weight 400
  - [ ] Fix card title: 18px, weight 600
  - [ ] Fix card subtitle: 14px, weight 400
  - [ ] Fix progress label: 18px, weight 700 (NOT 28px - review)
  - [ ] Fix weight label: 14px, weight 500

- [ ] **Spacing**
  - [ ] Card padding: 20px
  - [ ] Progress section padding: 24px
  - [ ] Section gaps: 24px
  - [ ] Progress bar height: 12px
  - [ ] Internal card gap: 12px

- [ ] **Shadows**
  - [ ] Card shadow: 0 4px 12px rgba(0,0,0,0.08)
  - [ ] Button shadow: 0 4px 10px rgba(0,0,0,0.12)
  - [ ] Completed card shadow: Green tinted

- [ ] **Button States**
  - [ ] Primary button styling (+)
  - [ ] Secondary button styling (-) with border
  - [ ] Disabled state (opacity 0.5)

---

## 🎯 EXPECTED OUTCOME

Once all corrections are applied:

1. **Visual Match:** React Native Dashboard will visually match Web PWA exactly
2. **Component Parity:** Card structure, spacing, and styling identical
3. **Typography Alignment:** All font sizes and weights match
4. **Shadow Consistency:** Drop shadows match Web PWA specifications
5. **Color Accuracy:** All colors properly applied
6. **Responsive Design:** Proper handling of mobile/desktop layouts
7. **Compliance Score:** Should reach 95%+ (up from 91.8%)

---

## ⏳ TIMELINE ESTIMATE

| Phase | Component | Complexity | Est. Files |
|-------|-----------|-----------|-----------|
| 1 | Theme Tokens | 🟢 Low | 1 |
| 2 | Card Styling | 🟡 Medium | 1 |
| 3 | Typography | 🟢 Low | 1 |
| 4 | Spacing/Layout | 🟡 Medium | 1 |
| 5 | Button States | 🟡 Medium | 1 |
| 6 | Grid Architecture | 🔴 High | 1-2 |
| 7 | Testing/Refinement | 🟡 Medium | 0 |

**Total Implementation:** 2-3 focused work sessions

---

## 📄 REFERENCE FILES

**Web PWA Source of Truth:**
- `Old_Ageless_Web_PWA/fitness-app-next/app/dashboard/page.tsx` (lines 220-312)
- `Old_Ageless_Web_PWA/fitness-app-next/app/globals.css` (lines 473-603)
- `Old_Ageless_Web_PWA/fitness-app-next/tailwind.config.ts` (all)

**React Native Current:**
- `Ageless_REACT-Native_Mobile_Application/mobile-app/theme/tokens.ts`
- `Ageless_REACT-Native_Mobile_Application/mobile-app/app/dashboard/index.tsx`

---

**Status:** Ready for implementation
**Approval Required:** YES - These are structural changes affecting visual output

