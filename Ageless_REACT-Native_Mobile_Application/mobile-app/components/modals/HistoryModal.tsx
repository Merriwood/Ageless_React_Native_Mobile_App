import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { theme } from '../../theme';

interface WorkoutRecord {
  id: string;
  date: string;
  weight: number;
  exercisesCompleted: number;
  totalExercises: number;
}

interface HistoryModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  data?: WorkoutRecord[];
}

const MOCK_DATA: WorkoutRecord[] = [
  {
    id: '1',
    date: 'January 5, 2025',
    weight: 180,
    exercisesCompleted: 5,
    totalExercises: 5,
  },
  {
    id: '2',
    date: 'January 4, 2025',
    weight: 179,
    exercisesCompleted: 4,
    totalExercises: 5,
  },
  {
    id: '3',
    date: 'January 3, 2025',
    weight: 179,
    exercisesCompleted: 5,
    totalExercises: 5,
  },
  {
    id: '4',
    date: 'January 2, 2025',
    weight: 178,
    exercisesCompleted: 5,
    totalExercises: 5,
  },
  {
    id: '5',
    date: 'January 1, 2025',
    weight: 178,
    exercisesCompleted: 3,
    totalExercises: 5,
  },
];

export function HistoryModal({
  isVisible = false,
  onClose,
  data = MOCK_DATA,
}: HistoryModalProps) {
  const renderWorkoutRow = ({ item }: { item: WorkoutRecord }) => {
    const isCompleted = item.exercisesCompleted === item.totalExercises;

    return (
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.dateCell]}>{item.date}</Text>
        <Text style={[styles.tableCell, styles.weightCell]}>{item.weight} lbs</Text>
        <View style={[styles.tableCell, styles.statusCell]}>
          <View
            style={[
              styles.statusBadge,
              isCompleted && styles.statusBadgeCompleted,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCompleted && styles.statusTextCompleted,
              ]}
            >
              {isCompleted ? 'Complete' : 'Partial'}
            </Text>
          </View>
        </View>
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
            <Text style={styles.modalTitle}>Workout History</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.dateHeaderCell]}>
              Date
            </Text>
            <Text style={[styles.tableHeaderCell, styles.weightHeaderCell]}>
              Weight
            </Text>
            <Text style={[styles.tableHeaderCell, styles.statusHeaderCell]}>
              Status
            </Text>
          </View>

          {/* Table Body */}
          <FlatList
            data={data}
            renderItem={renderWorkoutRow}
            keyExtractor={(item) => item.id}
            scrollEnabled
            nestedScrollEnabled
            style={styles.tableBody}
            contentContainerStyle={styles.tableBodyContent}
          />

          {/* Footer Button */}
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
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.full,
  },
  closeButtonText: {
    fontSize: 28,
    color: theme.colors.text.secondary,
    fontWeight: '400',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  dateHeaderCell: {
    flex: 1.5,
  },
  weightHeaderCell: {
    flex: 1,
    textAlign: 'center',
  },
  statusHeaderCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableBody: {
    flex: 1,
  },
  tableBodyContent: {
    paddingBottom: theme.spacing.base,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: theme.typography.bodySmall.fontWeight,
    color: theme.colors.text.primary,
  },
  dateCell: {
    flex: 1.5,
  },
  weightCell: {
    flex: 1,
    textAlign: 'center',
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statusTextCompleted: {
    color: theme.colors.status.success,
  },
  closeModalButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.text.onPrimary,
  },
});
