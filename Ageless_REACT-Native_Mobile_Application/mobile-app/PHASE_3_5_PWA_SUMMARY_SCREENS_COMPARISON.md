# Phase 3.5: PWA Summary Screens Analysis & React Native Replication

**Date**: January 9, 2026
**Status**: ✅ Design Analysis Complete - Ready for Implementation
**Scope**: Duplicate and align Progress Summary screens from PWA to React Native

---

## Quick Overview

The PWA has **2 distinct Progress Summary screens** that need to be replicated in React Native:

| Aspect | Progress Summary 1 | Progress Summary 2 |
|--------|-------------------|-------------------|
| **Purpose** | Weekly exercise totals | Weekly summary with dates |
| **Activation** | Bottom nav → Summary | Hamburger menu → Summary |
| **React Native Component** | ProgressSummaryModal (NEW) | SummaryModal (UPDATE) |
| **Layout** | 5 weeks, 13 columns | 4 weeks, 12 columns |
| **Key Column** | Total Sets | Week Of (dates) + Avg Weight |
| **Design** | Simple table | Formatted report table |

---

## Design Details

### Progress Summary 1: Weekly Workout Totals (Bottom Nav)

**Screen Description**:
A horizontally scrollable table showing the last 5 weeks of exercise data with totals.

**Visual Layout**:
```
┌──────────────────────────────────────────────────┐
│  Progress Summary                          [X]   │
│  Weekly workout totals                          │
├──────────────────────────────────────────────────┤
│ Bike│Abs│Chest Press│Leg Press│Lat│Military│...│
├──────────────────────────────────────────────────┤
│  1  │ 6 │    8      │   8     │ 8 │   4    │...│
│  0  │ 4 │    8      │   8     │ 8 │   8    │...│
│  0  │ 4 │   12      │   9     │12 │   8    │...│
│  0  │ 6 │   16      │  13     │ 8 │   8    │...│
│  1  │10 │   12      │  10     │ 8 │   5    │...│
└──────────────────────────────────────────────────┘
```

**Columns** (in order):
1. Bike
2. Abs
3. Chest Press
4. Leg Press
5. Lat
6. Military
7. Crunch
8. Bicep Curls
9. Triceps
10. Overhead Pull
11. Row
12. Total Sets ← **Key distinguishing column**

**Design Specifications**:
- **Header Row**: Red background (#C5282F), white text, bold
- **Title**: "Progress Summary" (bold, ~26px)
- **Subtitle**: "Weekly workout totals" (gray, ~15px)
- **Data Rows**: 5 rows of numbers
  - Row backgrounds: Alternating white and light gray (#F5F5F5)
  - Text: Dark (#111111), regular weight
  - Cell alignment: Center
- **Close Button**: X button, top-right corner
- **Scrolling**: Horizontal scroll for all 13 columns
- **Modal**: Centered, white background, rounded corners, shadow

**Color Palette**:
- Header: #C5282F (primary red)
- Header Text: #FFFFFF (white)
- Row 1, 3, 5: #FFFFFF (white background)
- Row 2, 4: #F5F5F5 (light gray background)
- Text: #111111 (dark text)
- Border: #E2E3E6 (light gray)

**Typography**:
- Title: 600 weight, 26px, dark
- Subtitle: 400 weight, 15px, gray (#666666)
- Column Headers: 600 weight, 14px, white
- Data Cells: 400 weight, 14px, dark

**Spacing**:
- Cell padding: 6-8px
- Column width: ~50-65px (varies)
- Row height: ~38px
- Header row height: ~40px
- Title padding: 20px top/bottom
- Horizontal padding: 16px left/right

---

### Progress Summary 2: Weekly Summary with Dates (Hamburger Menu)

**Screen Description**:
A formatted table showing the last 4 weeks with date ranges, average weight, and exercise totals.

**Visual Layout**:
```
┌─────────────────────────────────────────────────┐
│  Progress Summary                          [X]  │
│  Weekly workout totals                         │
├─────────────────────────────────────────────────┤
│Week Of │Avg Wt│Bike│Abs│Chest│Leg Press│...  │
├─────────────────────────────────────────────────┤
│Jan 4-10│  -   │ 1  │ 6 │  8  │   8     │...  │
│Dec 28-3│  -   │ 0  │ 4 │  8  │   8     │...  │
│Dec 21-27│ -   │ 0  │ 4 │ 12  │   9     │...  │
│Dec 14-20│ -   │ 0  │ 6 │ 16  │  13     │...  │
└─────────────────────────────────────────────────┘
```

**Columns** (in order):
1. Week Of ← **Date ranges as text**
2. Avg Weight ← **Average weight that week**
3. Bike
4. Abs
5. Chest Press
6. Leg Press
7. Lat
8. Military
9. Crunch
10. Bicep Curls
11. Triceps
12. Overhead Pull

**Design Specifications**:
- **Header Row**: Red background (#C5282F), white text, bold
- **Title**: "Progress Summary" (bold, ~26px)
- **Subtitle**: "Weekly workout totals" (gray, ~15px)
- **Data Rows**: 4 rows with date info
  - Row backgrounds: Alternating white and light gray
  - Text: Dark, regular weight
  - Date column: "Jan 4 - Jan 10, 2026" format
  - Weight column: Shows "Avg Weight" header, data cells show `-` or number
- **Close Button**: X button, top-right corner
- **Scrolling**: Horizontal scroll for all columns
- **Modal**: Centered, white background, rounded corners
- **Bottom Nav**: Visible at bottom (Home, My ABS, Scan, Listen, Rewards)

**Color Palette**: Same as Summary 1
- Header: #C5282F (primary red)
- Header Text: #FFFFFF (white)
- Row backgrounds: Alternating white and light gray
- Text: #111111 (dark)

**Typography**: Same as Summary 1
- Title: 600 weight, 26px
- Subtitle: 400 weight, 15px
- Column Headers: 600 weight, 14px, white
- Data Cells: 400 weight, 14px

**Spacing**: Similar to Summary 1
- Cell padding: 6-8px
- Column width: ~50-70px (varies)
- Row height: ~38px
- Header row height: ~40px

**Date Format Note**:
- Example: "Jan 4 - Jan 10, 2026"
- Shows week boundaries in user-friendly format
- Calculated from week start and end dates

---

## Current React Native Implementation Gap Analysis

### Current SummaryModal Issues

**File**: `components/modals/SummaryModal.tsx`

**Current Design** (What it shows now):
```
┌─────────────────────────────────────────┐
│  Summary                          [X]   │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐              │
│  │   47    │  │    4    │              │
│  │ Workouts│  │This Week│              │
│  └─────────┘  └─────────┘              │
│  ┌─────────┐  ┌─────────┐              │
│  │   16    │  │ 235     │              │
│  │This Month│  │Exercises               │
│  └─────────┘  └─────────┘              │
│                                         │
│  Personal Best: 185 lbs                 │
│                                         │
│  ┌─────────────────────────────┐       │
│  │       Close                 │       │
│  └─────────────────────────────┘       │
└─────────────────────────────────────────┘
```

**Problems**:
1. ❌ **Wrong layout**: Shows card/grid layout instead of table
2. ❌ **Wrong data**: Shows overall stats (47 workouts total) not weekly breakdown
3. ❌ **Missing columns**: No Bike, Abs, Chest Press, etc. columns
4. ❌ **Missing rows**: No 4-5 weeks of data
5. ❌ **No dates**: Doesn't show "Week Of" or date ranges
6. ❌ **Wrong header**: No red header row with exercise names
7. ❌ **Missing subtitle**: No "Weekly workout totals" text
8. ❌ **Wrong styling**: Card-based instead of table-based

**Root Cause**:
The current SummaryModal was designed as a "dashboard overview" showing overall fitness stats, not a "progress report" showing weekly exercise breakdown. Complete redesign needed.

---

## Implementation Requirements

### Requirement 1: Create ProgressSummaryModal (NEW)

**File to Create**: `components/modals/ProgressSummaryModal.tsx`

**Purpose**: Display Progress Summary 1 design (weekly table with totals)

**Activation Point**: Bottom Nav → Summary button

**Data Props**:
```typescript
interface WeeklyExerciseData {
  bike: number;
  abs: number;
  chestPress: number;
  legPress: number;
  lat: number;
  military: number;
  crunch: number;
  bicepCurls: number;
  triceps: number;
  overheadPull: number;
  row: number;
  totalSets: number;
}

interface ProgressSummaryModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks?: WeeklyExerciseData[]; // Array of 5 weeks
}
```

**Mock Data Example**:
```typescript
const defaultWeeks: WeeklyExerciseData[] = [
  { bike: 1, abs: 6, chestPress: 8, legPress: 8, lat: 8, military: 4, crunch: 8, bicepCurls: 8, triceps: 8, overheadPull: 8, row: 8, totalSets: 75 },
  { bike: 0, abs: 4, chestPress: 8, legPress: 8, lat: 8, military: 8, crunch: 8, bicepCurls: 8, triceps: 8, overheadPull: 8, row: 8, totalSets: 76 },
  { bike: 0, abs: 4, chestPress: 12, legPress: 9, lat: 12, military: 8, crunch: 16, bicepCurls: 16, triceps: 12, overheadPull: 16, row: 12, totalSets: 117 },
  { bike: 0, abs: 6, chestPress: 16, legPress: 13, lat: 8, military: 8, crunch: 16, bicepCurls: 16, triceps: 12, overheadPull: 16, row: 8, totalSets: 119 },
  { bike: 1, abs: 10, chestPress: 12, legPress: 10, lat: 8, military: 5, crunch: 12, bicepCurls: 12, triceps: 8, overheadPull: 12, row: 4, totalSets: 94 },
];
```

**Key Features**:
- ✅ Scrollable table (horizontal)
- ✅ Red header row (#C5282F)
- ✅ 13 columns (all exercises + Total Sets)
- ✅ 5 data rows
- ✅ Alternating row colors (white/light gray)
- ✅ Title: "Progress Summary"
- ✅ Subtitle: "Weekly workout totals"
- ✅ X close button
- ✅ Modal styling (white background, rounded corners)

**Implementation Notes**:
- Use `FlatList` with `horizontal={true}` or `ScrollView` with `horizontal={true}`
- Fix column widths to ensure all content visible
- Each column: ~55-65px width
- Center-align all numbers
- Use design tokens for colors and typography

---

### Requirement 2: Update SummaryModal (REDESIGN)

**File to Update**: `components/modals/SummaryModal.tsx`

**Purpose**: Display Progress Summary 2 design (weekly summary with dates and weight)

**Activation Point**: Hamburger Menu (MyABSDrawer) → Summary button

**Data Props**:
```typescript
interface WeekSummary {
  dateRange: string;           // "Jan 4 - Jan 10, 2026"
  avgWeight?: number | null;   // Average weight that week
  bike: number;
  abs: number;
  chestPress: number;
  legPress: number;
  lat: number;
  military: number;
  crunch: number;
  bicepCurls: number;
  triceps: number;
  overheadPull: number;
}

interface SummaryModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks?: WeekSummary[]; // Array of 4 weeks
}
```

**Mock Data Example**:
```typescript
const defaultWeeks: WeekSummary[] = [
  { dateRange: "Jan 4 - Jan 10, 2026", avgWeight: null, bike: 1, abs: 6, chestPress: 8, legPress: 8, lat: 8, military: 4, crunch: 8, bicepCurls: 8, triceps: 8, overheadPull: 8 },
  { dateRange: "Dec 28 - Jan 3, 2026", avgWeight: null, bike: 0, abs: 4, chestPress: 8, legPress: 8, lat: 8, military: 8, crunch: 8, bicepCurls: 8, triceps: 8, overheadPull: 8 },
  { dateRange: "Dec 21 - Dec 27, 2025", avgWeight: null, bike: 0, abs: 4, chestPress: 12, legPress: 9, lat: 12, military: 8, crunch: 16, bicepCurls: 16, triceps: 12, overheadPull: 16 },
  { dateRange: "Dec 14 - Dec 20, 2025", avgWeight: null, bike: 0, abs: 6, chestPress: 16, legPress: 13, lat: 8, military: 8, crunch: 16, bicepCurls: 16, triceps: 12, overheadPull: 16 },
];
```

**Key Features**:
- ✅ Scrollable table (horizontal)
- ✅ Red header row (#C5282F)
- ✅ 12 columns (date, weight, exercises)
- ✅ 4 data rows
- ✅ "Week Of" column with date ranges
- ✅ "Avg Weight" column (shows `-` or number)
- ✅ Alternating row colors
- ✅ Title: "Progress Summary"
- ✅ Subtitle: "Weekly workout totals"
- ✅ X close button
- ✅ Modal styling

**Breaking Changes from Current**:
- Complete redesign from stat cards to table
- Different data structure
- Different layout (table vs grid)
- Different activation point (will move to drawer)

---

## Integration Requirements

### Integration Point 1: Bottom Nav Summary Button

**Component**: `components/layout/BottomNav.tsx`

**Change Needed**:
```typescript
// In navItems array, add or update Summary tab:
{
  id: 'summary',
  label: 'Summary',
  icon: (active) => <ProgressSummaryIcon active={active} />,
  onPress: () => handlePress('summary'),  // ← Trigger modal
},

// In handlePress:
const handleSummaryPress = () => {
  setActiveTab('summary');
  // Trigger ProgressSummaryModal
  onNavigate?.('summary');
};
```

**Current Status**:
- BottomNav has Home, History, My ABS, Scan, Listen, Profile (6 tabs)
- Likely needs Summary tab added OR replace one of these

---

### Integration Point 2: Hamburger Menu (MyABSDrawer)

**Component**: `components/layout/MyABSDrawer.tsx`

**Change Needed**:
```typescript
// Add Summary menu item to drawer:
const menuItems: MenuItem[] = [
  { id: 'summary', label: 'Summary', enabled: true, onPress: onSummaryPress },
  { id: 'history', label: 'History', enabled: true, onPress: onHistoryPress },
  // ... rest of items
];

// Parent component must pass:
<MyABSDrawer
  onSummaryPress={() => {
    setShowSummaryModal(true);
    setShowDrawer(false);
  }}
/>
```

**Current Status**:
- MyABSDrawer already has menu items (History, Summary, etc.)
- Summary item exists but may not be wired to SummaryModal
- Need to verify and fix wiring

---

## Design Token Compliance

### Colors ✅ Already in theme/tokens.ts
- Primary Red: #C5282F
- White: #FFFFFF
- Text Primary: #111111
- Text Secondary: #666666
- Border Light: #E2E3E6
- Surface: #FFFFFF
- Surface Alt: #F5F5F5

### Typography ✅ Mostly already defined
- h2: 26px, 600 weight (for title) ✅
- h3: 20px, 600 weight (if needed) ✅
- bodySmall: 14px, 400 weight (for cells) ✅
- New token needed for table header: 14px, 600 weight, white

### Spacing ✅ Already defined
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px

### New Tokens Needed
```typescript
// In theme/tokens.ts - optional (can use existing):
tableHeader: {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 16,
} as const,

tableCell: {
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 18,
} as const,
```

---

## Testing Checklist

### Visual Compliance
- [ ] ProgressSummaryModal
  - [ ] Red header row visible
  - [ ] All 13 columns visible (with horizontal scroll)
  - [ ] Title: "Progress Summary" (bold)
  - [ ] Subtitle: "Weekly workout totals" (gray)
  - [ ] 5 data rows visible
  - [ ] Alternating row backgrounds (white/light gray)
  - [ ] X close button visible
  - [ ] Modal centered on screen

- [ ] SummaryModal (Updated)
  - [ ] Red header row visible
  - [ ] "Week Of" column shows dates
  - [ ] "Avg Weight" column visible
  - [ ] Exercise columns visible
  - [ ] Title: "Progress Summary" (bold)
  - [ ] Subtitle: "Weekly workout totals" (gray)
  - [ ] 4 data rows visible
  - [ ] Alternating backgrounds
  - [ ] X close button visible

### Functional Compliance
- [ ] ProgressSummaryModal
  - [ ] Opens from bottom nav Summary button
  - [ ] Closes with X button
  - [ ] Scrolls horizontally
  - [ ] Data displays correctly
  - [ ] No layout overflow

- [ ] SummaryModal
  - [ ] Opens from hamburger menu
  - [ ] Closes with X button
  - [ ] Scrolls horizontally
  - [ ] Data displays correctly
  - [ ] Dates formatted correctly

### Design System Compliance
- [ ] Colors use theme tokens
- [ ] Typography uses theme tokens
- [ ] Spacing uses theme tokens
- [ ] Borders use theme colors
- [ ] Modal styling consistent with others

---

## Files to Create/Modify

| File | Action | Status |
|------|--------|--------|
| `components/modals/ProgressSummaryModal.tsx` | CREATE | ⏳ Pending |
| `components/modals/SummaryModal.tsx` | UPDATE | ⏳ Pending |
| `components/layout/BottomNav.tsx` | VERIFY/UPDATE | ⏳ Pending |
| `components/layout/MyABSDrawer.tsx` | VERIFY/UPDATE | ⏳ Pending |
| `theme/tokens.ts` | OPTIONAL (add table tokens) | ⏳ Pending |
| `PHASE_3_5_PWA_SUMMARY_DESIGN_ANALYSIS.md` | REFERENCE | ✅ Created |

---

## Summary

### What Needs to Happen
1. **Create ProgressSummaryModal** with table showing 5 weeks of exercise totals (Summary 1)
2. **Redesign SummaryModal** with table showing 4 weeks with dates and weights (Summary 2)
3. **Wire ProgressSummaryModal** to bottom nav Summary activation
4. **Wire SummaryModal** to hamburger menu Summary activation
5. **Verify design compliance** with PWA screenshots

### Key Differences Between Screens
| Feature | Progress Summary 1 | Progress Summary 2 |
|---------|-------------------|-------------------|
| **Last Column** | Total Sets | Overhead Pull |
| **Date Column** | None | Week Of (date ranges) |
| **Weight Column** | None | Avg Weight |
| **Row Count** | 5 | 4 |
| **Column Count** | 13 | 12 |
| **Use Case** | Quick weekly view | Detailed report |

### Success Criteria
✅ Both modals display as tables (not cards)
✅ Red header rows with exercise names
✅ Proper alternating row colors
✅ Horizontal scrolling works smoothly
✅ Data displays correctly
✅ Matches PWA design exactly
✅ Proper navigation triggering

---

**Analysis Completed**: January 9, 2026
**Next Step**: Implement both components
**Estimated Time**: 2-3 hours for full implementation

🤖 Generated with Claude Code
