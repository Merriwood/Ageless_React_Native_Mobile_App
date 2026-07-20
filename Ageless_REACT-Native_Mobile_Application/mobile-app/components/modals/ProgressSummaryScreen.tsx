/**
 * Progress Summary Screen Component
 *
 * Displays 52-week workout progress summary in a scrollable table.
 * IMMUTABLE COLUMN ORDER: Week Of, Avg Weight, 11 exercises, Total Sets (14 columns)
 * Fetches data from summaryAPI on modal open.
 * Matches PWA SummaryModal functionality.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import { summaryAPI } from '../../api/summary';

/**
 * IMMUTABLE SUMMARY TABLE COLUMNS
 * Exactly 14 items: [Week Of, Avg Weight, Bike, Abs, ..., Row, Total Sets]
 * DO NOT modify order - matches PWA exactly
 */
const IMMUTABLE_COLUMNS = [
  { key: 'weekOf', label: 'Week Of', width: 160 },
  { key: 'avgWeight', label: 'Avg Wt', width: 70 },
  { key: 'bike', label: 'Bike', width: 55 },
  { key: 'abs', label: 'Abs', width: 50 },
  { key: 'chestPress', label: 'Chest Press', width: 90 },
  { key: 'legPress', label: 'Leg Press', width: 85 },
  { key: 'lat', label: 'Lat', width: 50 },
  { key: 'military', label: 'Military', width: 70 },
  { key: 'crunch', label: 'Crunch', width: 65 },
  { key: 'bicepCurls', label: 'Bicep Curls', width: 90 },
  { key: 'triceps', label: 'Triceps', width: 70 },
  { key: 'overheadPull', label: 'Overhead Pull', width: 105 },
  { key: 'row', label: 'Row', width: 50 },
  { key: 'totalSets', label: 'Total Sets', width: 80 },
] as const;

// Validate column count
if (IMMUTABLE_COLUMNS.length !== 14) {
  throw new Error(`Summary columns corrupted: expected 14 columns, got ${IMMUTABLE_COLUMNS.length}`);
}

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

// Helper: Get Sunday of the week
function getSundayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
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

// Helper: Format week range as "MMM D - MMM D, YYYY"
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

// Generate placeholder data for 52 weeks (used when API is unavailable)
function generatePlaceholderData(): WeekData[] {
  const data: WeekData[] = [];
  const today = new Date();

  for (let i = 0; i < 52; i++) {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - i * 7);

    data.push({
      dateRange: formatWeekRange(weekDate),
      avgWeight: null,
      bike: 0,
      abs: 0,
      chestPress: 0,
      legPress: 0,
      lat: 0,
      military: 0,
      crunch: 0,
      bicepCurls: 0,
      triceps: 0,
      overheadPull: 0,
      row: 0,
      totalSets: 0,
    });
  }

  return data;
}

export function ProgressSummaryScreen({
  isVisible = false,
  onClose,
  weeks,
  loading: externalLoading = false,
  error: externalError = null,
}: ProgressSummaryScreenProps) {
  const responsive = useResponsive();
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [fetchedData, setFetchedData] = useState<WeekData[]>([]);

  const loading = externalLoading || internalLoading;
  const error = externalError || internalError;

  // Load data when modal opens (fetch if no external weeks data provided)
  useEffect(() => {
    if (isVisible && (!weeks || weeks.length === 0)) {
      loadSummaryData();
    }
  }, [isVisible, weeks]);

  const loadSummaryData = async () => {
    setInternalLoading(true);
    setInternalError(null);
    try {
      const data = await summaryAPI.get52WeekSummary();
      setFetchedData(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
      setInternalError('Unable to load progress data. Showing placeholder.');
      setFetchedData(generatePlaceholderData());
    } finally {
      setInternalLoading(false);
    }
  };

  const weeksData = useMemo(() => {
    if (loading) return [];
    if (weeks && weeks.length > 0) return weeks;
    if (fetchedData.length > 0) return fetchedData;
    return generatePlaceholderData();
  }, [weeks, fetchedData, loading]);

  const getCellValue = (item: WeekData, key: string): string => {
    switch (key) {
      case 'weekOf':
        return item.dateRange;
      case 'avgWeight':
        return item.avgWeight ? item.avgWeight.toFixed(1) : '–';
      case 'totalSets':
        return String(item.totalSets);
      default:
        const value = item[key as keyof WeekData];
        return typeof value === 'number' ? String(value) : '–';
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, responsive.isLandscape && styles.modalContainerLandscape]}>
          {/* Header Card with Close Button */}
          <View style={styles.headerCard}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Progress Summary</Text>
              <Text style={styles.headerSubtitle}>Weekly workout totals</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Table Container */}
          <View style={styles.tableContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading progress data...</Text>
              </View>
            ) : error && fetchedData.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Unable to Load Data</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity onPress={loadSummaryData} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : weeksData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No Data Yet</Text>
                <Text style={styles.emptyText}>
                  Complete some workouts to see your weekly summary!
                </Text>
              </View>
            ) : (
              /* Two-dimensional scrollable table */
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                bounces={false}
              >
                <View>
                  {/* Fixed Header Row */}
                  <View style={styles.headerRow}>
                    {IMMUTABLE_COLUMNS.map((col) => (
                      <View key={col.key} style={[styles.headerCell, { width: col.width }]}>
                        <Text style={styles.headerCellText}>{col.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Scrollable Data Rows */}
                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    style={styles.dataScrollView}
                  >
                    {weeksData.map((item, index) => (
                      <View
                        key={`week-${index}`}
                        style={[styles.dataRow, index % 2 !== 0 && styles.dataRowAlt]}
                      >
                        {IMMUTABLE_COLUMNS.map((col) => (
                          <View key={col.key} style={[styles.dataCell, { width: col.width }]}>
                            <Text
                              style={[
                                styles.dataCellText,
                                col.key === 'weekOf' && styles.weekOfCellText,
                                col.key === 'totalSets' && styles.totalSetsCellText,
                              ]}
                            >
                              {getCellValue(item, col.key)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            )}
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '96%',
    height: '92%',
    backgroundColor: theme.colors.background,
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  modalContainerLandscape: {
    width: '98%',
    height: '95%',
  },

  // Header Card
  headerCard: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    ...theme.shadows.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },

  // Table Container
  tableContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  // Table Header Row
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(11, 11, 13, 0.15)',
  },
  headerCellText: {
    color: theme.colors.text.onPrimary,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },

  // Data Rows
  dataScrollView: {
    flex: 1,
  },
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
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.light,
  },
  dataCellText: {
    color: theme.colors.text.primary,
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  weekOfCellText: {
    textAlign: 'left',
    fontSize: 12,
  },
  totalSetsCellText: {
    fontWeight: '700',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.status.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  retryButtonText: {
    color: theme.colors.text.onPrimary,
    fontWeight: '600',
    fontSize: 14,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },

  // Close Button
  closeModalButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
    paddingVertical: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.onPrimary,
  },
});
