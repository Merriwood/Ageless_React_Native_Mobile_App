import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { EXERCISES } from '../../lib/constants/exercises';
import { WorkoutEntry } from '../../lib/types';
import { historyAPI } from '../../api/history';
import { useUI } from '../../context/UIContext';
import { useResponsive } from '../../hooks/useResponsive';

const PAGE_SIZE = 20;
const TOTAL_EXERCISES = EXERCISES.length; // 11 exercises

export default function HistoryScreen() {
  const responsive = useResponsive();
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { showToast } = useUI();

  // Load initial history
  useEffect(() => {
    loadInitialHistory();
  }, []);

  const loadInitialHistory = async () => {
    setLoading(true);
    try {
      historyAPI.resetPagination();
      const response = await historyAPI.getHistory(0, PAGE_SIZE);
      // Transform API entries to local WorkoutEntry type
      const transformed = response.entries.map(e => ({
        id: typeof e.id === 'string' ? parseInt(e.id, 10) : e.id,
        date: e.date,
        weight: e.weight,
        fitnessData: (e as any).exercises || (e as any).fitnessData || {},
      } as WorkoutEntry));
      setEntries(transformed);
      setCurrentPage(0);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load history:', error);
      showToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      historyAPI.resetPagination();
      const response = await historyAPI.getHistory(0, PAGE_SIZE);
      // Transform API entries to local WorkoutEntry type
      const transformed = response.entries.map(e => ({
        id: typeof e.id === 'string' ? parseInt(e.id, 10) : e.id,
        date: e.date,
        weight: e.weight,
        fitnessData: (e as any).exercises || (e as any).fitnessData || {},
      } as WorkoutEntry));
      setEntries(transformed);
      setCurrentPage(0);
      setHasMore(response.hasMore);
      showToast('History refreshed', 'success');
    } catch (error) {
      console.error('Failed to refresh history:', error);
      showToast('Failed to refresh history', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [showToast]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await historyAPI.getHistory(nextPage, PAGE_SIZE);
      // Transform API entries to local WorkoutEntry type
      const transformed = response.entries.map(e => ({
        id: typeof e.id === 'string' ? parseInt(e.id, 10) : e.id,
        date: e.date,
        weight: e.weight,
        fitnessData: (e as any).exercises || (e as any).fitnessData || {},
      } as WorkoutEntry));
      setEntries(prev => [...prev, ...transformed]);
      setCurrentPage(nextPage);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load more history:', error);
      showToast('Failed to load more entries', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleEdit = (entry: WorkoutEntry) => {
    // Navigate to dashboard with date parameter to edit that workout
    const dateStr = entry.date; // Format: YYYY-MM-DD
    router.push(`/dashboard?date=${dateStr}`);
  };

  const handleDelete = async (entry: WorkoutEntry) => {
    Alert.alert(
      'Delete Workout',
      `Delete workout from ${formatDate(entry.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from server - would need deleteEntry API
              setEntries(prev => prev.filter(e => e.id !== entry.id));
              // Clear history cache so next load is fresh
              historyAPI.clearCache();
              showToast('Workout deleted', 'success');
            } catch (error) {
              console.error('Failed to delete workout:', error);
              showToast('Failed to delete workout', 'error');
            }
          },
        },
      ]
    );
  };

  const toggleRow = (entryId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const getExerciseName = (id: string) => {
    return EXERCISES.find(e => e.id === id)?.name || id;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getWeekday = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
    });
  };

  const calculateCompletedExercises = (fitnessData: Record<string, number>) => {
    return Object.values(fitnessData).filter(sets => sets > 0).length;
  };

  const calculateTotalSets = (fitnessData: Record<string, number>) => {
    return Object.values(fitnessData).reduce((a, b) => a + b, 0);
  };

  const renderItem = ({ item }: { item: WorkoutEntry }) => {
    const isExpanded = expandedRows.has(item.id.toString());
    const fitnessData = item.fitnessData || {};
    const completedExercises = calculateCompletedExercises(fitnessData);
    const totalSets = calculateTotalSets(fitnessData);

    return (
      <Card style={styles.card}>
        {/* Card Header - Clickable */}
        <TouchableOpacity
          onPress={() => toggleRow(item.id.toString())}
          style={styles.cardHeader}
        >
          {/* Left Section: Date + Weekday */}
          <View style={styles.headerLeft}>
            <View style={styles.dateSection}>
              <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
              <View>
                <Text style={styles.dateValue}>{formatDate(item.date)}</Text>
                <Text style={styles.weekday}>{getWeekday(item.date)}</Text>
              </View>
            </View>
          </View>

          {/* Right Section: Weight */}
          {item.weight && (
            <View style={styles.headerRight}>
              <Text style={styles.weightValue}>{item.weight}</Text>
              <Text style={styles.weightUnit}>lbs</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Summary Stats - Always visible */}
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Exercises</Text>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>{completedExercises}</Text>
              <Text style={styles.statFraction}> / {TOTAL_EXERCISES}</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Sets</Text>
            <Text style={styles.statNumber}>{totalSets}</Text>
          </View>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.expandedDivider} />

            {/* Exercise Breakdown */}
            <Text style={styles.breakdownTitle}>Exercise Breakdown:</Text>

            <View style={styles.exercisesContainer}>
              {Object.entries(fitnessData)
                .filter(([, sets]) => sets > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([key, value]) => (
                  <View key={key} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{getExerciseName(key)}</Text>
                    <Text style={styles.exerciseSets}>{value} sets</Text>
                  </View>
                ))}
            </View>

            {/* Skipped Exercises Section */}
            {Object.entries(fitnessData).some(([, sets]) => sets === 0) && (
              <>
                <Text style={styles.skippedTitle}>Skipped:</Text>
                <View style={styles.skippedContainer}>
                  {Object.entries(fitnessData)
                    .filter(([, sets]) => sets === 0)
                    .map(([key]) => (
                      <View key={key} style={styles.skippedTag}>
                        <Text style={styles.skippedText}>{getExerciseName(key)}</Text>
                      </View>
                    ))}
                </View>
              </>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        onPress={loadMore}
        disabled={loadingMore}
        style={styles.loadMoreButton}
      >
        {loadingMore ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <Text style={styles.loadMoreText}>Load More</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>History</Text>
        <View style={styles.navSpacer} />
      </View>

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Workout History</Text>
        <Text style={styles.pageSubtitle}>
          {entries.length} workout{entries.length !== 1 ? 's' : ''} recorded
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>No Workout History</Text>
          <Text style={styles.emptyMessage}>Start tracking your workouts to see your history here!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            responsive.isLandscape && styles.listContentLandscape
          ]}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  navSpacer: {
    width: 40,
  },
  pageHeader: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: theme.colors.text.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    gap: 16, // space-y-4 = 16px
  },
  listContentLandscape: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  card: {
    marginBottom: 0,
    backgroundColor: theme.colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
  },
  headerLeft: {
    flex: 1,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  weekday: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  weightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  weightUnit: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statFraction: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  expandedContent: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  exercisesContainer: {
    gap: 8,
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  exerciseName: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  exerciseSets: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  skippedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  skippedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skippedTag: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.md,
  },
  skippedText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 11,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  deleteButton: {
    paddingVertical: 11,
    paddingHorizontal: 22,
    height: 40,
    backgroundColor: '#C5282F',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadMoreButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.base,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 24,
  },
});
