import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';

interface WeekData {
  dateRange: string;
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

interface ProgressSummaryScreenProps {
  isVisible?: boolean;
  onClose?: () => void;
  weeks?: WeekData[];
  loading?: boolean;
  error?: string | null;
}

const COLUMN_WIDTHS = {
  weekOf: 170,
  avgWt: 80,
  bike: 60,
  abs: 60,
  chestPress: 100,
  legPress: 100,
  lat: 60,
  military: 80,
  crunch: 60,
  bicepCurls: 100,
  triceps: 75,
  overheadPull: 120,
  row: 60,
  totalSets: 90,
};

const TOTAL_WIDTH = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0);

// Helper: Get Sunday of the week (weeks run Sunday to Saturday)
function getSundayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper: Get Saturday of the week
function getSaturdayOfWeek(date: Date): Date {
  const sunday = getSundayOfWeek(date);
  const saturday = new Date(sunday);
  saturday.setDate(saturday.getDate() + 6);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

// Helper: Format week range as "MMM D - MMM D, YYYY" (Sunday to Saturday)
function formatWeekRange(date: Date): string {
  const sunday = getSundayOfWeek(date);
  const saturday = getSaturdayOfWeek(date);

  const startMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = sunday.getDate();
  const endMonth = saturday.toLocaleDateString('en-US', { month: 'short' });
  const endDay = saturday.getDate();
  const year = saturday.getFullYear();

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

// Generate mock data for 52 weeks
function generateWeekData(): WeekData[] {
  const data: WeekData[] = [];
  const today = new Date();

  for (let i = 0; i < 52; i++) {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - i * 7);

    const generateValue = () => Math.floor(Math.random() * 20);

    const bike = generateValue();
    const abs = generateValue();
    const chestPress = generateValue();
    const legPress = generateValue();
    const lat = generateValue();
    const military = generateValue();
    const crunch = generateValue();
    const bicepCurls = generateValue();
    const triceps = generateValue();
    const overheadPull = generateValue();
    const row = generateValue();

    const totalSets =
      bike +
      abs +
      chestPress +
      legPress +
      lat +
      military +
      crunch +
      bicepCurls +
      triceps +
      overheadPull +
      row;

    data.push({
      dateRange: formatWeekRange(weekDate),
      avgWeight: Math.random() > 0.5 ? parseFloat((170 + Math.random() * 20).toFixed(1)) : null,
      bike,
      abs,
      chestPress,
      legPress,
      lat,
      military,
      crunch,
      bicepCurls,
      triceps,
      overheadPull,
      row,
      totalSets,
    });
  }

  return data;
}

const TableHeader = () => (
  <View style={styles.headerRow}>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.weekOf }]}>Week Of</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.avgWt }]}>Avg Wt</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.bike }]}>Bike</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.abs }]}>Abs</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.chestPress }]}>Chest Press</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.legPress }]}>Leg Press</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.lat }]}>Lat</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.military }]}>Military</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.crunch }]}>Crunch</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.bicepCurls }]}>Bicep Curls</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.triceps }]}>Triceps</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.overheadPull }]}>
      Overhead Pull
    </Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.row }]}>Row</Text>
    <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.totalSets }]}>Total Sets</Text>
  </View>
);

const TableRow = ({ item, index }: { item: WeekData; index: number }) => {
  const isOdd = index % 2 === 0;

  return (
    <View style={[styles.dataRow, !isOdd && styles.dataRowAlt]}>
      <Text style={[styles.dataCell, styles.weekOfCell, { width: COLUMN_WIDTHS.weekOf }]}>
        {item.dateRange}
      </Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.avgWt }]}>
        {item.avgWeight ? item.avgWeight.toFixed(1) : '–'}
      </Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.bike }]}>{item.bike}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.abs }]}>{item.abs}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.chestPress }]}>
        {item.chestPress}
      </Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.legPress }]}>{item.legPress}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.lat }]}>{item.lat}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.military }]}>{item.military}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.crunch }]}>{item.crunch}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.bicepCurls }]}>
        {item.bicepCurls}
      </Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.triceps }]}>{item.triceps}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.overheadPull }]}>
        {item.overheadPull}
      </Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.row }]}>{item.row}</Text>
      <Text style={[styles.dataCell, { width: COLUMN_WIDTHS.totalSets }]}>{item.totalSets}</Text>
    </View>
  );
};

export function ProgressSummaryScreen({
  isVisible = false,
  onClose,
  weeks,
  loading = false,
  error = null,
}: ProgressSummaryScreenProps) {
  const responsive = useResponsive();

  const weeksData = useMemo(
    () => {
      if (loading || error) return [];
      return weeks && weeks.length > 0 ? weeks : generateWeekData();
    },
    [weeks, loading, error]
  );

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, responsive.isLandscape && styles.modalContainerLandscape]}>
          {/* Header Card - White background with shadow and rounded corners */}
          <View style={styles.headerCard}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Progress Summary</Text>
              <Text style={styles.headerSubtitle}>Weekly workout totals</Text>
            </View>
          </View>

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
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
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

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#f5f5f5',  // Light grey background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
  },
  modalContainer: {
    width: '95%',
    height: '90%',
    backgroundColor: '#f5f5f5',  // Grey background for modal area
    borderRadius: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalContainerLandscape: {
    width: '98%',
    height: '95%',
  },

  // Header Card - Separate white card with shadow and rounded corners
  headerCard: {
    marginHorizontal: 16,                          // 16px (matching HTML)
    marginTop: 8,                                  // 8px (matching HTML)
    marginBottom: 8,                               // 8px (matching HTML)
    paddingHorizontal: 24,                         // 24px horizontal (matching HTML)
    paddingVertical: 12,                           // 12px vertical (matching HTML)
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...theme.shadows.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,                                  // 20px (matching HTML)
    fontWeight: '700',                             // Bold (matching HTML)
    color: theme.colors.text.primary,
    marginBottom: 4,                               // 4px (matching HTML)
  },
  headerSubtitle: {
    fontSize: 13,                                  // 13px (matching HTML)
    fontWeight: '400',                             // Normal (matching HTML)
    color: theme.colors.text.secondary,
    marginBottom: 0,
  },


  // Table Container - White card with rounded corners
  tableContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  // Table Header Row
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 0,
  },
  headerCell: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text.onPrimary,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 1.3 * 13,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Table Data Row
  dataRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',                  // Matching HTML
  },
  dataRowAlt: {
    backgroundColor: '#f9f9f9',                    // Matching HTML
  },
  dataCell: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.4 * 14,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',                   // Matching HTML
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekOfCell: {
    textAlign: 'left',
    paddingLeft: theme.spacing.lg,
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
