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
} from 'react-native';
import { theme } from '../../theme';

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
}

const COLUMN_WIDTHS = {
  weekOf: 130,
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
}: ProgressSummaryScreenProps) {
  const weeksData = useMemo(() => weeks || generateWeekData(), [weeks]);

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    height: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...theme.shadows.lg,
  },

  // Header Section
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerContent: {
    textAlign: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.text.secondary,
    lineHeight: 1.4 * 15,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
  },
  closeButtonText: {
    fontSize: 32,
    color: theme.colors.text.secondary,
    fontWeight: '400',
  },

  // Scroll Info
  scrollInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    flexShrink: 0,
  },
  scrollInfoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 1.4 * 12,
  },

  // Table Container
  tableContainer: {
    flex: 1,
    overflow: 'hidden',
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
    borderBottomColor: theme.colors.border.light,
  },
  dataRowAlt: {
    backgroundColor: theme.colors.surfaceAlt,
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
    borderRightColor: theme.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekOfCell: {
    textAlign: 'left',
    paddingLeft: theme.spacing.lg,
  },

  // Footer Info
  footer: {
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    textAlign: 'center',
    flexShrink: 0,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 1.4 * 13,
  },
  footerBold: {
    fontWeight: '700',
  },
});
