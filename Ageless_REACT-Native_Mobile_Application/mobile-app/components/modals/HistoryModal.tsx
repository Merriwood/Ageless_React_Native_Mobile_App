/**
 * History Modal Component
 *
 * Displays workout history with expandable rows showing exercise breakdown.
 * Fetches data from historyAPI on modal open.
 * Matches PWA HistoryModal functionality.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../../theme';
import { historyAPI } from '../../api/history';
import { entriesAPI, WorkoutEntry, Exercise } from '../../api/entries';
import { EXERCISES } from '../../lib/constants/exercises';

interface HistoryModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  onEditWorkout?: (date: string) => void;
}

export function HistoryModal({
  isVisible = false,
  onClose,
  onEditWorkout,
}: HistoryModalProps) {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load history when modal opens
  useEffect(() => {
    if (isVisible) {
      loadHistory();
    }
  }, [isVisible]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await historyAPI.getHistory(0, 50);
      // Defensive: handle if entries is undefined or not an array
      const entriesData = response?.entries || [];
      setEntries(Array.isArray(entriesData) ? entriesData : []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Unable to load workout history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (entryId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const handleDelete = async (entryId: string, entryDate: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(entryId);
            try {
              await entriesAPI.deleteEntry(entryDate);
              setEntries((prev) => prev.filter((e) => e.id !== entryId));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete workout');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (entryDate: string) => {
    if (onEditWorkout) {
      onEditWorkout(entryDate);
    }
    onClose?.();
  };

  const getExerciseName = (exerciseId: string): string => {
    const exercise = EXERCISES.find((e) => e.id === exerciseId);
    return exercise?.name || exerciseId;
  };

  const calculateTotalSets = (exercises: Exercise): number => {
    return Object.values(exercises).reduce((sum, sets) => sum + sets, 0);
  };

  const calculateCompletedExercises = (exercises: Exercise): number => {
    return Object.values(exercises).filter((sets) => sets > 0).length;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDayOfWeek = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const renderWorkoutCard = (entry: WorkoutEntry) => {
    const totalSets = calculateTotalSets(entry.exercises || {});
    const completedExercises = calculateCompletedExercises(entry.exercises || {});
    const isExpanded = expandedRows.has(entry.id);

    return (
      <View key={entry.id} style={styles.workoutCard}>
        {/* Main Row - Tappable to expand */}
        <TouchableOpacity
          style={styles.workoutCardHeader}
          onPress={() => toggleRow(entry.id)}
          activeOpacity={0.7}
        >
          <View style={styles.expandIcon}>
            <Text style={styles.expandIconText}>{isExpanded ? '▼' : '▶'}</Text>
          </View>

          <View style={styles.workoutInfo}>
            <Text style={styles.workoutDate}>{formatDate(entry.date)}</Text>
            <Text style={styles.workoutDay}>{formatDayOfWeek(entry.date)}</Text>
          </View>

          <View style={styles.workoutStats}>
            {entry.weight && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{entry.weight}</Text>
                <Text style={styles.statLabel}>lbs</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedExercises}</Text>
              <Text style={styles.statLabel}>exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSets}</Text>
              <Text style={styles.statLabel}>sets</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Content - Exercise Breakdown */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.breakdownTitle}>Exercise Breakdown:</Text>

            {/* Completed Exercises */}
            <View style={styles.exerciseGrid}>
              {Object.entries(entry.exercises || {})
                .filter(([, sets]) => sets > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([exerciseId, sets]) => (
                  <View key={exerciseId} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{getExerciseName(exerciseId)}</Text>
                    <Text style={styles.exerciseSets}>{sets} sets</Text>
                  </View>
                ))}
            </View>

            {/* Skipped Exercises */}
            {Object.entries(entry.exercises || {}).filter(([, sets]) => sets === 0).length > 0 && (
              <>
                <Text style={styles.skippedTitle}>Skipped:</Text>
                <View style={styles.skippedContainer}>
                  {Object.entries(entry.exercises || {})
                    .filter(([, sets]) => sets === 0)
                    .map(([exerciseId]) => (
                      <View key={exerciseId} style={styles.skippedBadge}>
                        <Text style={styles.skippedText}>{getExerciseName(exerciseId)}</Text>
                      </View>
                    ))}
                </View>
              </>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(entry.date)}
                activeOpacity={0.7}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, deleting === entry.id && styles.deleteButtonDisabled]}
                onPress={() => handleDelete(entry.id, entry.date)}
                disabled={deleting === entry.id}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>
                  {deleting === entry.id ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>Workout History</Text>
              <Text style={styles.modalSubtitle}>
                {entries.length} workout{entries.length !== 1 ? 's' : ''} recorded
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : entries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyTitle}>No Workout History</Text>
                <Text style={styles.emptyText}>
                  Start tracking your workouts to see your history here!
                </Text>
              </View>
            ) : (
              entries.map(renderWorkoutCard)
            )}
          </ScrollView>

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '94%',
    maxHeight: '90%',
    backgroundColor: '#f5f5f5',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },

  // Workout Card
  workoutCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    marginBottom: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  expandIcon: {
    width: 24,
    marginRight: 12,
  },
  expandIconText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDate: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  workoutDay: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
  },

  // Expanded Content
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
    marginTop: 12,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minWidth: '48%',
  },
  exerciseName: {
    fontSize: 13,
    color: theme.colors.text.primary,
  },
  exerciseSets: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  skippedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  skippedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skippedBadge: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  skippedText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fee2e2',
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },

  // Loading State
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },

  // Error State
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.onPrimary,
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
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
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
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
