import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { theme } from '../../theme';

interface SummaryData {
  totalWorkouts: number;
  thisWeek: number;
  thisMonth: number;
  totalExercises: number;
  averageWeight: number;
  currentStreak: number;
  personalBest: number;
}

interface SummaryModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  data?: SummaryData;
}

const MOCK_DATA: SummaryData = {
  totalWorkouts: 47,
  thisWeek: 4,
  thisMonth: 16,
  totalExercises: 235,
  averageWeight: 178.5,
  currentStreak: 4,
  personalBest: 185,
};

export function SummaryModal({
  isVisible = false,
  onClose,
  data = MOCK_DATA,
}: SummaryModalProps) {
  const StatCard = ({ label, value, unit = '' }: { label: string; value: number | string; unit?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {value}
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

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
            <Text style={styles.modalTitle}>Summary</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.contentPadding}
            scrollEnabled
          >
            {/* Primary Stats */}
            <View style={styles.statsGrid}>
              <StatCard label="Total Workouts" value={data.totalWorkouts} />
              <StatCard label="This Week" value={data.thisWeek} />
              <StatCard label="This Month" value={data.thisMonth} />
              <StatCard label="Total Exercises" value={data.totalExercises} />
            </View>

            <View style={styles.divider} />

            {/* Secondary Stats */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Average Weight"
                value={data.averageWeight.toFixed(1)}
                unit=" lbs"
              />
              <StatCard label="Current Streak" value={data.currentStreak} unit=" days" />
            </View>

            {/* Highlight Stat */}
            <View style={styles.highlightStat}>
              <Text style={styles.highlightLabel}>Personal Best</Text>
              <Text style={styles.highlightValue}>{data.personalBest} lbs</Text>
            </View>
          </ScrollView>

          {/* Footer Button */}
          <TouchableOpacity
            style={styles.closeButton2}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText2}>Close</Text>
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
  contentContainer: {
    flex: 1,
  },
  contentPadding: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    lineHeight: 28,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  statLabel: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.lg,
  },
  highlightStat: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.lg,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  highlightValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  closeButton2: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  closeButtonText2: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.text.onPrimary,
  },
});
