# Phase 3.5: 52-Week Rolling Progress Summary Table Design

**Date**: January 9, 2026
**Status**: ✅ Design Analysis Complete - Ready for Implementation
**Scope**: Create continuous 52-week rolling table accessible from My ABS drawer → Summary menu

---

## Correct Understanding

The PWA screenshots show **ONE CONTINUOUS TABLE** that scrolls both:
- **Vertically**: To view all 52 weeks of data
- **Horizontally**: To view all columns (Week Of + Avg Weight + 11 exercises)

**Progress Summary 1 (PDF 1)**: Shows the table WITH "Week Of" and "Avg Weight" columns (4 weeks visible)
**Progress Summary 2 (PDF 2)**: Shows the table WITHOUT those leftmost columns, just exercises + Total Sets (5 weeks visible)

Together they demonstrate the complete scrollable table structure and capabilities.

---

## Complete Table Specifications

### Table Dimensions

**Columns**: 13 total
1. Week Of (date range string)
2. Avg Weight (optional numeric value)
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
13. Row (Note: Not "Total Sets" - that was in PDF 2 context, but PDF 2 also shows "Row" is the last exercise)

**Rows**: 52 weeks (continuous rolling data)

**Scrolling**:
- 📊 **Vertical**: Scroll through all 52 weeks
- 📈 **Horizontal**: Scroll to view all 13 columns
- 🔒 **Sticky Headers**: Table headers stay fixed when scrolling
- 🔒 **Sticky Left Column**: "Week Of" column stays visible when scrolling horizontally (optional enhancement)

### Header Structure

```
┌─────────────┬───────────┬──────┬─────┬──────────────┬───────────┬─────┬──────────┬────────┬────────────┬──────────┬──────────────┬────────┐
│  Week Of    │ Avg Wt    │ Bike │ Abs │ Chest Press  │ Leg Press │ Lat  │ Military │ Crunch │ Bicep Curls│ Triceps │ Overhead Pull│  Row  │
├─────────────┼───────────┼──────┼─────┼──────────────┼───────────┼─────┼──────────┼────────┼────────────┼──────────┼──────────────┼────────┤
│ Jan 4-10    │    -      │  1   │  6  │      8       │     8     │  8   │    4     │   8    │      8     │    8     │      8       │   8    │
│ Dec 28-3    │    -      │  0   │  4  │      8       │     8     │  8   │    8     │   8    │      8     │    8     │      8       │   8    │
│ Dec 21-27   │    -      │  0   │  4  │     12       │     9     │ 12   │    8     │  16    │     16     │   12     │     16       │  12    │
│ Dec 14-20   │    -      │  0   │  6  │     16       │    13     │  8   │    8     │  16    │     16     │   12     │     16       │   8    │
│ Dec 7-13    │    -      │  1   │ 10  │     12       │    10     │  8   │    5     │  12    │     12     │    8     │     12       │   4    │
│ ... (47 more weeks)     │  -   │ ... │ ... │       ...        │ ...   │... │  ...     │ ...   │     ...    │  ...     │     ...      │ ...   │
└─────────────┴───────────┴──────┴─────┴──────────────┴───────────┴─────┴──────────┴────────┴────────────┴──────────┴──────────────┴────────┘
```

### Design Details

**Header Row**:
- Background: Red (#C5282F)
- Text: White (#FFFFFF)
- Font Weight: 600 (bold)
- Font Size: 14px
- Height: ~40-45px
- Padding: 6-8px vertical, 8-10px horizontal

**Data Rows**:
- Background: Alternating white (#FFFFFF) and light gray (#F5F5F5)
- Text: Dark (#111111)
- Font Weight: 400 (regular)
- Font Size: 14px
- Height: ~36-40px
- Padding: 6-8px vertical, 8-10px horizontal

**Columns**:
- Width: Fixed width per column (~50-70px depending on content)
- Text Alignment: Center for numbers, Left for "Week Of"
- Border: Light gray (#E2E3E6) between columns

**Modal/Screen Wrapper**:
- Background: White (#FFFFFF)
- Title: "Progress Summary" (bold, ~26px, dark)
- Subtitle: "Weekly workout totals" (~15px, gray #666666)
- Close Button: X in top-right corner
- Padding: 16-20px around edges

### Date Format

**Week Of Column Format**:
- "Jan 4 - Jan 10, 2026" (most recent week at top)
- "Dec 28 - Jan 3, 2026"
- "Dec 21 - Dec 27, 2025"
- "Dec 14 - Dec 20, 2025"
- ... continues back 52 weeks
- "Jan X - Jan Y, 2025" (oldest week at bottom)

**Calculation**:
- Each row represents a calendar week
- Start day: Sunday
- End day: Saturday
- Format: "MMM D - MMM D, YYYY"

### Data Structure

```typescript
interface WeekData {
  dateRange: string;              // "Jan 4 - Jan 10, 2026"
  avgWeight?: number | null;      // Average weight that week (can be null/-)
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
}

interface ProgressSummaryTableProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks: WeekData[];              // Array of 52 weeks
  title?: string;                 // Default: "Progress Summary"
  subtitle?: string;              // Default: "Weekly workout totals"
}
```

### Mock Data Pattern

```typescript
const weeks: WeekData[] = [
  { dateRange: "Jan 4 - Jan 10, 2026", avgWeight: null, bike: 1, abs: 6, chestPress: 8, legPress: 8, lat: 8, military: 4, crunch: 8, bicepCurls: 8, triceps: 8, overheadPull: 8, row: 8 },
  { dateRange: "Dec 28 - Jan 3, 2026", avgWeight: null, bike: 0, abs: 4, chestPress: 8, legPress: 8, lat: 8, military: 8, crunch: 8, bicepCurls: 8, triceps: 8, overheadPull: 8, row: 8 },
  { dateRange: "Dec 21 - Dec 27, 2025", avgWeight: null, bike: 0, abs: 4, chestPress: 12, legPress: 9, lat: 12, military: 8, crunch: 16, bicepCurls: 16, triceps: 12, overheadPull: 16, row: 12 },
  { dateRange: "Dec 14 - Dec 20, 2025", avgWeight: null, bike: 0, abs: 6, chestPress: 16, legPress: 13, lat: 8, military: 8, crunch: 16, bicepCurls: 16, triceps: 12, overheadPull: 16, row: 8 },
  { dateRange: "Dec 7 - Dec 13, 2025", avgWeight: null, bike: 1, abs: 10, chestPress: 12, legPress: 10, lat: 8, military: 5, crunch: 12, bicepCurls: 12, triceps: 8, overheadPull: 12, row: 4 },
  // ... 47 more weeks going back 52 total
];
```

---

## Implementation Requirements

### Component: ProgressSummaryScreen

**File**: `components/modals/ProgressSummaryScreen.tsx` OR `screens/ProgressSummary.tsx`

**Type**: Modal (overlay) or Full Screen (navigation)

**Activation Path**: Bottom Nav → My ABS → Summary Menu Item → Opens this screen

**Key Features**:

1. **Dual Scrolling**
   - Vertical scroll: Through all 52 weeks
   - Horizontal scroll: Through all 13 columns
   - Both scrolls work independently

2. **Fixed Headers**
   - Table header row stays visible at top
   - Screen title/subtitle stays visible
   - No scroll content into headers

3. **Sticky Left Column (Optional Enhancement)**
   - "Week Of" column could stay visible when scrolling horizontally
   - Helps user stay oriented to which week is being viewed
   - Not required but nice UX enhancement

4. **Responsive Column Widths**
   - Need to accommodate varying column widths
   - "Week Of" is wider (~120-140px) for dates
   - Numbers columns are narrower (~50-65px)
   - "Avg Weight" column: ~60px

5. **Close Functionality**
   - X button in top-right corner
   - Close to return to previous screen/modal

### Technical Implementation Approach

**Option A: Nested ScrollViews (Simple)**
```tsx
<View>
  {/* Header */}
  <Text>Progress Summary</Text>
  <Text>Weekly workout totals</Text>

  {/* Horizontal ScrollView with Vertical ScrollView inside */}
  <ScrollView horizontal>
    <ScrollView>
      {/* Table header row (sticky) */}
      {/* Table rows */}
    </ScrollView>
  </ScrollView>
</View>
```

**Option B: FlatList with SectionList (Better for Large Data)**
```tsx
<View>
  {/* Header */}

  {/* Fixed header row */}
  <ScrollView horizontal>
    {/* Column headers */}
  </ScrollView>

  {/* Data rows with horizontal scroll */}
  <FlatList
    data={weeks}
    renderItem={({item}) => (
      <ScrollView horizontal>
        {/* Row content for this week */}
      </ScrollView>
    )}
  />
</View>
```

**Option C: React Native Table Library**
- Consider: `react-native-table-component`
- Provides built-in sticky headers and scrolling
- Cleaner implementation for complex tables

### Data Requirements

**Data Source**:
- Backend API: GET `/api/progress-summary` or `/api/summary?weeks=52`
- Response: Array of 52 weeks with exercise data
- Or: Calculate from existing entries API data

**Fallback**: Use mock data for development/testing

**Data Frequency**:
- Load once when screen opens
- Could refresh on pull-to-refresh
- Consider caching for performance

---

## Integration Points

### Integration 1: MyABSDrawer (Hamburger Menu)

**File**: `components/layout/MyABSDrawer.tsx`

**Current Status**: Already has menu items (History, Summary, etc.)

**Required Change**:
```typescript
// In MyABSDrawer.tsx, Summary menu item:
{
  id: 'summary',
  label: 'Summary',
  enabled: true,
  onPress: onSummaryPress,  // ← Will open ProgressSummaryScreen
}

// Parent component must handle:
<MyABSDrawer
  onSummaryPress={() => {
    setShowProgressSummary(true);  // ← Show new screen/modal
    setShowDrawer(false);           // ← Close drawer
  }}
/>
```

### Integration 2: Bottom Navigation

**File**: `components/layout/BottomNav.tsx`

**Current Status**: Has Home, History, My ABS, Scan, Listen, Profile

**Note**: The "My ABS" tab may open MyABSDrawer, which contains the Summary menu item. No changes needed here if drawer already integrated.

---

## Design Token Alignment

### Colors
✅ Red header: `#C5282F` (theme.colors.primary)
✅ White text: `#FFFFFF` (theme.colors.text.onPrimary)
✅ Dark text: `#111111` (theme.colors.text.primary)
✅ Gray text: `#666666` (theme.colors.text.secondary)
✅ White background: `#FFFFFF` (theme.colors.surface)
✅ Light gray rows: `#F5F5F5` (theme.colors.surfaceAlt)
✅ Borders: `#E2E3E6` (theme.colors.border.light)

### Typography
✅ Title: h2 or h3 (26px, 600 weight)
✅ Subtitle: bodySmall (14-15px, 400 weight, gray)
✅ Column headers: 14px, 600 weight, white
✅ Data cells: 14px, 400 weight, dark

### Spacing
✅ All spacing uses theme tokens (lg, xl, md, sm)
✅ Cell padding: Uses spacing.xs/sm
✅ Modal padding: Uses spacing.lg/xl

---

## Current Implementation Issue

### What's Wrong with Current SummaryModal

**File**: `components/modals/SummaryModal.tsx`

**Current Design**:
- Shows 4 stat cards (Total Workouts, This Week, This Month, Total Exercises)
- Shows 2 more cards (Average Weight, Current Streak)
- Shows Personal Best highlight
- Has Close button

**Problems**:
- ❌ Completely different from PWA design
- ❌ Shows aggregate stats, not weekly breakdown
- ❌ Not a table structure
- ❌ Missing all exercise columns
- ❌ Missing week-by-week data
- ❌ Not accessible from My ABS drawer

**Action**: Replace with new ProgressSummaryScreen implementation

---

## Implementation Steps

### Step 1: Create ProgressSummaryScreen Component
- [ ] Create new file: `components/modals/ProgressSummaryScreen.tsx`
- [ ] Implement table structure with headers
- [ ] Implement vertical scrolling (52 weeks)
- [ ] Implement horizontal scrolling (13 columns)
- [ ] Apply styling (colors, spacing, typography)
- [ ] Add X close button

### Step 2: Integrate with MyABSDrawer
- [ ] Update MyABSDrawer to pass onSummaryPress callback
- [ ] Add state management to show/hide screen
- [ ] Wire Summary menu item to trigger screen

### Step 3: Test Data Loading
- [ ] Create mock data generator (52 weeks)
- [ ] Test table rendering with data
- [ ] Verify scrolling performance with 52 rows
- [ ] Test on various screen sizes

### Step 4: Polish & Refinement
- [ ] Sticky headers (vertical scroll)
- [ ] Optional: Sticky left column (horizontal scroll)
- [ ] Column width optimization
- [ ] Touch target size verification (minimum 44px)
- [ ] Performance optimization if needed

### Step 5: Design Compliance Verification
- [ ] Header colors match exactly (#C5282F)
- [ ] Text colors match exactly (#FFFFFF, #111111)
- [ ] Row backgrounds match (white, #F5F5F5)
- [ ] Typography matches (sizes, weights)
- [ ] Spacing consistent with design system
- [ ] Close button visible and functional

---

## Testing Checklist

### Visual Compliance
- [ ] Title: "Progress Summary" visible
- [ ] Subtitle: "Weekly workout totals" visible
- [ ] Red header row with all 13 column names
- [ ] All columns visible (with horizontal scroll)
- [ ] 52 rows visible (with vertical scroll)
- [ ] Date format correct: "Jan 4 - Jan 10, 2026"
- [ ] Alternating row backgrounds
- [ ] X close button visible and positioned correctly
- [ ] Modal background white
- [ ] Text colors correct throughout

### Functional Compliance
- [ ] Opens from My ABS → Summary menu
- [ ] Closes with X button
- [ ] Vertical scroll works smoothly
- [ ] Horizontal scroll works smoothly
- [ ] Headers don't scroll with content
- [ ] Data displays correctly
- [ ] No layout overflow or clipping
- [ ] Responsive on mobile screens

### Performance
- [ ] Table renders without lag
- [ ] Scrolling is smooth (60fps target)
- [ ] Memory usage reasonable with 52 rows
- [ ] No crashes on scroll
- [ ] Fast open/close transitions

### Design System Compliance
- [ ] All colors from theme tokens
- [ ] All typography from theme tokens
- [ ] All spacing from theme tokens
- [ ] Consistent with other modals
- [ ] Accessibility standards met (color contrast, touch targets)

---

## Files to Create/Modify

| File | Action | Status |
|------|--------|--------|
| `components/modals/ProgressSummaryScreen.tsx` | CREATE | ⏳ Pending |
| `components/layout/MyABSDrawer.tsx` | UPDATE (add integration) | ⏳ Pending |
| `components/modals/SummaryModal.tsx` | REPLACE or DELETE | ⏳ Pending |

---

## Summary

### What to Build
✅ ONE continuous 52-week rolling table
✅ 13 columns: Week Of + Avg Weight + 11 exercises + Row
✅ Vertical scrolling: See all 52 weeks
✅ Horizontal scrolling: See all columns
✅ Red header row with exercise names
✅ Alternating row backgrounds
✅ Fixed table headers (don't scroll)
✅ Title: "Progress Summary"
✅ Subtitle: "Weekly workout totals"
✅ X close button
✅ Accessible from My ABS → Summary menu

### Key Differences from Old Understanding
- ✅ NOT two separate modals
- ✅ NOT separate "Progress Summary 1" and "Progress Summary 2"
- ✅ IS one continuous table
- ✅ IS scrollable both vertically and horizontally
- ✅ IS accessed from My ABS drawer menu

### Design Compliance
- Matches PWA design exactly
- Uses all theme tokens
- Proper colors (#C5282F header, white background, light gray rows)
- Proper typography (14px cells, 26px title)
- Proper spacing throughout
- Professional table appearance

---

**Analysis Completed**: January 9, 2026
**Status**: ✅ Ready for Implementation
**Next Step**: Create ProgressSummaryScreen component

🤖 Generated with Claude Code
