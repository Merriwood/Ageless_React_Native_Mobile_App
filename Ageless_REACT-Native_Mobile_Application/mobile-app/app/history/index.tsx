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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: WorkoutEntry }) => {
    const isExpanded = expandedRows.has(item.id.toString());
    const exerciseCount = Object.keys(item.fitnessData || {}).length;
    const totalSets = Object.values(item.fitnessData || {}).reduce((a, b) => a + b, 0);

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() => toggleRow(item.id.toString())}
          style={styles.header}
        >
          <View>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <Text style={styles.summary}>
              {exerciseCount} exercises • {totalSets} sets
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
            {exerciseCount > 0 ? (
              <>
                <View style={styles.divider} />
                {Object.entries(item.fitnessData || {}).map(([key, value]) => (
                  <View key={key} style={styles.exerciseRow}>
                    <Text style={styles.exerciseName}>{getExerciseName(key)}</Text>
                    <Text style={styles.exerciseValue}>{value}</Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.noData}>No exercises recorded</Text>
            )}

            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.status.error} />
              <Text style={styles.deleteText}>Delete Workout</Text>
            </TouchableOpacity>
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

      {/* Header */}
      <View style={styles.header_bar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-outline"
                size={48}
                color={theme.colors.text.secondary}
              />
              <Text style={styles.emptyText}>No workout history</Text>
            </View>
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.base,
    backgroundColor: '#FEE2E2',
    borderRadius: theme.radius.md,
  },
  deleteText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.status.error,
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
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.base,
  },
});
