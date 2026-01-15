# Phase 2 Step 1: Manual Changes to ProgressSummaryScreen.tsx

**Status:** ActivityIndicator import added ✅
**Remaining:** 4 more changes needed

---

## File Location
`components/modals/ProgressSummaryScreen.tsx`

---

## Change 2: Update Props Interface

**Find this (around line 31-35):**
```typescript
interface ProgressSummaryScreenProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks?: WeekData[];
}
```

**Replace with:**
```typescript
interface ProgressSummaryScreenProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks?: WeekData[];
  loading?: boolean;
  error?: string | null;
}
```

---

## Change 3: Update Function Signature

**Find this (around line 151-156):**
```typescript
export function ProgressSummaryScreen({
  isVisible = false,
  onClose,
  weeks,
}: ProgressSummaryScreenProps) {
  const weeksData = useMemo(() => weeks || generateWeekData(), [weeks]);
```

**Replace with:**
```typescript
export function ProgressSummaryScreen({
  isVisible = false,
  onClose,
  weeks,
  loading = false,
  error = null,
}: ProgressSummaryScreenProps) {
  const weeksData = useMemo(
    () => {
      if (loading || error) return [];
      return weeks && weeks.length > 0 ? weeks : generateWeekData();
    },
    [weeks, loading, error]
  );
```

---

## Change 4: Update Modal Return/Rendering

**Find this (around line 159-215):**
```typescript
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Progress Summary</Text>
              <Text style={styles.headerSubtitle}>Weekly workout totals</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Scroll Info */}
          <View style={styles.scrollInfo}>
            <Text style={styles.scrollInfoText}>
              ↔️ Scroll horizontally to see all columns | ↕️ Scroll vertically to see all 52 weeks
            </Text>
          </View>

          {/* Table with Dual Scroll */}
          <View style={styles.tableContainer}>
            <ScrollView
              horizontal
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={true}
            >
              <View>
                {/* Fixed Header Row */}
                <TableHeader />

                {/* Data Rows */}
                <FlatList
                  data={weeksData}
                  keyExtractor={(_, index) => `week-${index}`}
                  renderItem={({ item, index }) => <TableRow item={item} index={index} />}
                  scrollEnabled={false}
                  nestedScrollEnabled={false}
                />
              </View>
            </ScrollView>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Showing <Text style={styles.footerBold}>{weeksData.length}</Text> of 52 weeks | Last
              updated: Today
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

**Replace with:**
```typescript
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Progress Summary</Text>
              <Text style={styles.headerSubtitle}>Weekly workout totals</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Scroll Info - Only show when not loading/error */}
          {!loading && !error && (
            <View style={styles.scrollInfo}>
              <Text style={styles.scrollInfoText}>
                ↔️ Scroll horizontally to see all columns | ↕️ Scroll vertically to see all 52 weeks
              </Text>
            </View>
          )}

          {/* Table Container or Loading/Error */}
          <View style={styles.tableContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading progress data...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Unable to Load Data</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity onPress={onClose} style={styles.errorButton}>
                  <Text style={styles.errorButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                horizontal
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={true}
              >
                <View>
                  {/* Fixed Header Row */}
                  <TableHeader />

                  {/* Data Rows */}
                  <FlatList
                    data={weeksData}
                    keyExtractor={(_, index) => `week-${index}`}
                    renderItem={({ item, index }) => <TableRow item={item} index={index} />}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                  />
                </View>
              </ScrollView>
            )}
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Showing <Text style={styles.footerBold}>{weeksData.length}</Text> of 52 weeks | Last
              updated: Today
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

---

## Change 5: Add New Styles

**Find this (at the end of StyleSheet.create(), around line 390-396):**
```typescript
  footerBold: {
    fontWeight: '700',
  },
});
```

**Replace with:**
```typescript
  footerBold: {
    fontWeight: '700',
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },

  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 1.5 * 14,
  },
  errorButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  errorButtonText: {
    color: theme.colors.text.onPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
});
```

---

## Summary of Changes

| # | Change | Lines Affected | Status |
|---|--------|----------------|--------|
| 1 | Add ActivityIndicator import | 2-11 | ✅ Done |
| 2 | Update Props interface | 31-35 | ⏳ Pending |
| 3 | Update function signature & useMemo | 151-156 | ⏳ Pending |
| 4 | Update modal rendering | 159-215 | ⏳ Pending |
| 5 | Add new styles | 390-396 | ⏳ Pending |

---

## Testing After Changes

After applying all changes:

```bash
cd mobile-app
npm test
```

**Expected Result:**
```
Test Suites: 12 passed, 12 total
Tests:       298 passed, 298 total
Status:      ✅ ALL PASSING
```

---

## Next Steps (Phase 2 Step 2)

Once these changes are complete and tests pass:
1. Implement `get52WeekSummary()` method in `api/summary.ts`
2. Wire data fetching to `app/dashboard/index.tsx`
3. Test with real API data

---

**Generated:** 2026-01-09
**Phase 2 Step 1 Status:** In Progress (4/5 changes needed)

