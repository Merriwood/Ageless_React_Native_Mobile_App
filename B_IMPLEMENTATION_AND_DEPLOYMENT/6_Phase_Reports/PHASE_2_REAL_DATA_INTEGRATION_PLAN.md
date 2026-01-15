# Phase 2: Real Workout Data Integration Plan

**Date:** 2026-01-09
**Status:** PLANNING
**Objective:** Connect ProgressSummaryScreen to real workout API data

---

## Current State

### ✅ Completed (Phase 3.5 & Integration)
- ProgressSummaryScreen component created with mock data generation
- 52-week date utilities implemented (lib/date-utils.ts)
- Integration into dashboard modal system complete
- All 298 tests passing
- Menu item enabled: My Body > Progress

### 📊 Current Implementation
**ProgressSummaryScreen.tsx (lines 86-130):**
- Uses `generateWeekData()` function to create mock data internally
- Generates random workout stats per week
- Data structure: `WeekData` interface with 12 exercise columns

**Current WeekData Interface:**
```typescript
interface WeekData {
  dateRange: string;         // "Jan 4 - Jan 10, 2026"
  avgWeight: number | null;
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
```

**API Available (summary.ts):**
- `getSummary(startDate, endDate)` - Get detailed stats for date range
- `getWeekSummary(referenceDate?)` - Get stats for week (Sunday-Saturday)
- Returns `SummaryResponse` with `WorkoutStats` data

---

## Implementation Steps

### Step 1: Update ProgressSummaryScreen Props
**Location:** `components/modals/ProgressSummaryScreen.tsx`

**Current Props:**
```typescript
interface ProgressSummaryScreenProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks?: WeekData[];  // Exists but unused
}
```

**Changes Needed:**
1. Add loading state prop
2. Add error prop for API failures
3. Make weeks prop actually functional
4. Update component to use real data when available

**New Props:**
```typescript
interface ProgressSummaryScreenProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks?: WeekData[];
  loading?: boolean;
  error?: string | null;
}
```

**Code Changes (lines ~140-155):**
- Read weeks prop and check if valid
- Show loading indicator if `loading === true`
- Show error message if `error` is set
- Use provided weeks data, fallback to `generateWeekData()` if not available

---

### Step 2: Implement API Data Fetching in Dashboard
**Location:** `app/dashboard/index.tsx`

**New Hook State (after line 36):**
```typescript
const [weeksSummary, setWeeksSummary] = useState<WeekData[]>([]);
const [loadingProgress, setLoadingProgress] = useState(false);
const [progressError, setProgressError] = useState<string | null>(null);
```

**New Function (before useEffect for loadWorkoutForDate):**
```typescript
const loadProgressSummary = async () => {
  setLoadingProgress(true);
  setProgressError(null);
  try {
    const weeks = await summaryAPI.get52WeekSummary();
    setWeeksSummary(weeks);
  } catch (error) {
    console.error('Failed to load progress summary:', error);
    setProgressError('Failed to load progress data');
  } finally {
    setLoadingProgress(false);
  }
};
```

**New useEffect (before/after existing useEffect):**
```typescript
useEffect(() => {
  if (progressSummaryVisible) {
    loadProgressSummary();
  }
}, [progressSummaryVisible]);
```

**Update ProgressSummaryScreen Rendering (current ~560-563):**
```typescript
<ProgressSummaryScreen
  isVisible={progressSummaryVisible}
  onClose={() => setProgressSummaryVisible(false)}
  weeks={weeksSummary}
  loading={loadingProgress}
  error={progressError}
/>
```

---

### Step 3: Implement 52-Week API Aggregation
**Location:** `api/summary.ts`

**New Function (after getMonthSummary):**
```typescript
/**
 * Get 52-week summary data for ProgressSummaryScreen
 * Aggregates workout statistics for each week
 *
 * @returns Array of WeekData objects for all 52 weeks
 */
async get52WeekSummary(): Promise<WeekData[]> {
  const weeks = get52WeekRanges();
  const summaries = await Promise.all(
    weeks.map(week =>
      this.getSummary(
        week.sunday.toISOString().split('T')[0],
        week.saturday.toISOString().split('T')[0]
      )
    )
  );

  return formatSummariesToWeekData(summaries, weeks);
}
```

**Helper Function (transform API response to WeekData):**
```typescript
function formatSummariesToWeekData(
  summaries: SummaryResponse['data'][],
  weeks: Array<{sunday: Date; saturday: Date; label: string; weekIndex: number}>
): WeekData[] {
  return summaries.map((summary, index) => {
    const week = weeks[index];
    const stats = summary.stats;

    return {
      dateRange: week.label,
      avgWeight: calculateAverageWeight(summary),
      bike: stats.exercises['bike']?.sets || 0,
      abs: stats.exercises['abs']?.sets || 0,
      chestPress: stats.exercises['chestPress']?.sets || 0,
      legPress: stats.exercises['legPress']?.sets || 0,
      lat: stats.exercises['lat']?.sets || 0,
      military: stats.exercises['military']?.sets || 0,
      crunch: stats.exercises['crunch']?.sets || 0,
      bicepCurls: stats.exercises['bicepCurls']?.sets || 0,
      triceps: stats.exercises['triceps']?.sets || 0,
      overheadPull: stats.exercises['overheadPull']?.sets || 0,
      row: stats.exercises['row']?.sets || 0,
      totalSets: stats.totalSets,
    };
  });
}

function calculateAverageWeight(summary: SummaryResponse['data']): number | null {
  // Extract average weight from summary if available
  // This depends on how the backend provides this data
  return null; // Placeholder - adjust based on API response
}
```

---

### Step 4: Update ProgressSummaryScreen Rendering Logic
**Location:** `components/modals/ProgressSummaryScreen.tsx`

**Current Logic (lines ~140-155):**
```typescript
export default function ProgressSummaryScreen({
  isVisible = false,
  onClose,
  weeks,
}: ProgressSummaryScreenProps) {
  const displayWeeks = useMemo(
    () => weeks && weeks.length > 0 ? weeks : generateWeekData(),
    [weeks]
  );
```

**Update to Handle Loading/Error:**
```typescript
export default function ProgressSummaryScreen({
  isVisible = false,
  onClose,
  weeks,
  loading = false,
  error = null,
}: ProgressSummaryScreenProps) {
  const displayWeeks = useMemo(
    () => {
      if (loading) return [];
      if (error) return [];
      return weeks && weeks.length > 0 ? weeks : generateWeekData();
    },
    [weeks, loading, error]
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.text.secondary }}>
            Loading progress data...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.error, marginBottom: 12 }}>
            {error}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: theme.colors.primary }}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Existing table rendering code
    return <ActualTableContent weeks={displayWeeks} />;
  };

  return (
    <Modal visible={isVisible} onRequestClose={onClose} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            {/* ... existing header ... */}
          </View>

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <View style={styles.footer}>
            {/* ... existing footer ... */}
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

---

### Step 5: Handle Edge Cases & Optimization
**Considerations:**

1. **Performance:** 52 API calls in parallel might be slow
   - Consider batching (fetch 13 weeks at a time, lazy load)
   - Use caching from summary API (5-minute TTL)

2. **Empty Data:** If no workouts recorded
   - Show all zeros (realistic for new users)
   - Consider skeleton loading state

3. **Network Failures:**
   - Show error message in modal
   - Allow retry button
   - Gracefully fallback to mock data

4. **Timezone Issues:**
   - Use `getWeekStartDate()` and `getWeekEndDate()` from date-utils
   - These handle timezone considerations

---

## Implementation Order

1. **First:** Update ProgressSummaryScreen props and add loading/error rendering
2. **Second:** Implement `get52WeekSummary()` in summary API
3. **Third:** Add data fetching state and useEffect to dashboard
4. **Fourth:** Test with real API data
5. **Fifth:** Optimize performance if needed
6. **Sixth:** Add error handling and retry logic

---

## Testing Strategy

### Unit Tests
- Test `formatSummariesToWeekData()` function
- Test loading/error states in ProgressSummaryScreen
- Test API error handling

### Integration Tests
- Dashboard + API data flow
- Modal open → API fetch → data display
- Error state rendering
- Loading indicator visibility

### End-to-End Tests
- User opens My Body > Progress
- Loading indicator appears
- Data loads and displays
- User sees real week data with actual workout stats

---

## Files to Modify

1. **components/modals/ProgressSummaryScreen.tsx** (main changes)
   - Add props for loading/error
   - Update rendering logic
   - Add loading indicator
   - Add error message display

2. **app/dashboard/index.tsx** (add data fetching)
   - Import summaryAPI
   - Add state for weeks/loading/error
   - Add useEffect to fetch data
   - Pass data to ProgressSummaryScreen

3. **api/summary.ts** (add aggregation)
   - Add `get52WeekSummary()` method
   - Add `formatSummariesToWeekData()` helper
   - Add `calculateAverageWeight()` helper
   - Import date utilities from lib/date-utils

---

## Expected Outcomes

✅ ProgressSummaryScreen displays real user workout data from last 52 weeks
✅ Proper loading states shown to user
✅ Graceful error handling with user feedback
✅ All 298 tests still passing
✅ No breaking changes to existing functionality
✅ Ready for user testing and feedback

---

## Next Phase

After real data integration is verified:
1. Gather user feedback on display/layout
2. Performance optimization if needed
3. Prepare for production deployment

---

**Generated:** 2026-01-09
**Author:** Claude Code
**Status:** READY FOR IMPLEMENTATION

