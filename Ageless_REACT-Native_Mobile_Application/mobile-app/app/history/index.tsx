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

const PAGE_SIZE = 20;

export default function HistoryScreen() {
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

  const renderItem = ({ item }: { item: WorkoutEntry }) => {
    const isExpanded = expandedRows.has(item.id.toString());
    const fitnessData = item.fitnessData || {};
    const completedExercises = Object.values(fitnessData).filter(sets => sets > 0).length;
    const totalSets = Object.values(fitnessData).reduce((a, b) => a + b, 0);

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() => toggleRow(item.id.toString())}
          style={styles.header}
        >
          <View>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <Text style={styles.summary}>
              {completedExercises} exercises • {totalSets} sets
            </Text>
          </View>
          <View style={styles.headerRight}>
            {item.weight && (
              <Text style={styles.weight}>{item.weight} lbs</Text>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.text.secondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {Object.keys(fitnessData).length > 0 ? (
              <>
                <View style={styles.divider} />
                {Object.entries(item.fitnessData || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, value]) => (
                    <View key={key} style={styles.exerciseRow}>
                      <Text style={styles.exerciseName}>{getExerciseName(key)}</Text>
                      <Text style={styles.exerciseValue}>{value} sets</Text>
                    </View>
                  ))}
                {/* Skipped exercises section */}
                {Object.entries(item.fitnessData || {}).some(([, value]) => value === 0) && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.skippedHeader}>Skipped</Text>
                    <View style={styles.skippedContainer}>
                      {Object.entries(item.fitnessData || {})
                        .filter(([, value]) => value === 0)
                        .map(([key]) => (
                          <View key={key} style={styles.skippedBadge}>
                            <Text style={styles.skippedText}>{getExerciseName(key)}</Text>
                          </View>
                        ))}
                    </View>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.noData}>No exercises recorded</Text>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <Ionicons name="pencil-outline" size={18} color={theme.colors.text.primary} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.status.error} />
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

  // Calculate stats for header
  const totalWorkouts = entries.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Bar */}
      <View style={styles.header_bar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Page Title Section */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Workout History</Text>
        <Text style={styles.pageSubtitle}>{totalWorkouts} workouts tracked</Text>
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
          <Text style={styles.emptyMessage}>Start tracking your workouts to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
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
  header_bar: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  headerSpacer: {
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  pageSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.xl * 2,
  },
  card: {
    marginBottom: theme.spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.base,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  summary: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  weight: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  expandedContent: {
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginBottom: theme.spacing.base,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  exerciseName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  exerciseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  noData: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.base,
  },
  actionButtons: {
    marginTop: theme.spacing.base,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.radius.md,
  },
  editText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: theme.radius.md,
  },
  deleteText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.status.error,
  },
  skippedHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skippedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skippedBadge: {
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  skippedText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
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
    marginBottom: theme.spacing.base,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.base,
  },
});
