import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface StatCardData {
  label: string;
  value: number | string;
  unit?: string;
}

interface WeekData {
  weekOf: string;
  workoutsCompleted: number;
  completionPercent: number;
  avgWeight: number;
  totalSets: number;
  avgPerWorkout: number;
  topExercises: Array<{ name: string; sets: number }>;
}

interface SummaryModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  stats?: StatCardData[];
  weeklyData?: WeekData[];
}

const MOCK_STATS: StatCardData[] = [
  { label: 'Total Workouts', value: 47 },
  { label: 'Avg Weight', value: 178.5, unit: ' lbs' },
  { label: 'Total Sets', value: 312 },
];

const MOCK_WEEKLY: WeekData[] = [
  {
    weekOf: 'Jan 7 - Jan 13, 2026',
    workoutsCompleted: 4,
    completionPercent: 80,
    avgWeight: 178.3,
    totalSets: 64,
    avgPerWorkout: 16,
    topExercises: [
      { name: '1. Push-ups', sets: 16 },
      { name: '2. Squats', sets: 12 },
      { name: '3. Pull-ups', sets: 10 },
    ],
  },
  {
    weekOf: 'Dec 31, 2025 - Jan 6, 2026',
    workoutsCompleted: 5,
    completionPercent: 92,
    avgWeight: 177.8,
    totalSets: 72,
    avgPerWorkout: 14.4,
    topExercises: [
      { name: '1. Deadlifts', sets: 18 },
      { name: '2. Bench Press', sets: 14 },
      { name: '3. Push-ups', sets: 12 },
    ],
  },
  {
    weekOf: 'Dec 24 - Dec 30, 2025',
    workoutsCompleted: 3,
    completionPercent: 55,
    avgWeight: 176.9,
    totalSets: 48,
    avgPerWorkout: 16,
    topExercises: [
      { name: '1. Squats', sets: 14 },
      { name: '2. Lat Pulldown', sets: 12 },
      { name: '3. Dips', sets: 10 },
    ],
  },
];

export function SummaryModal({
  isVisible = false,
  onClose,
  stats = MOCK_STATS,
  weeklyData = MOCK_WEEKLY,
}: SummaryModalProps) {
  const StatCard = ({ label, value, unit = '' }: StatCardData) => (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </Text>
    </View>
  );

  const WeeklyCard = ({ week }: { week: WeekData }) => (
    <View style={styles.weeklyCard}>
      {/* Week Header with Completion Rate */}
      <View style={styles.weekHeader}>
        <View>
          <Text style={styles.weekTitle}>{week.weekOf}</Text>
          <Text style={styles.weekSubtitle}>{week.workoutsCompleted} workouts completed</Text>
        </View>
        <View style={styles.completionRate}>
          <Text style={styles.completionPercent}>{week.completionPercent}%</Text>
          <Text style={styles.completionLabel}>completion</Text>
        </View>
      </View>

      {/* Week Stats Grid */}
      <View style={styles.weekStats}>
        <View style={styles.weekStat}>
          <Text style={styles.weekStatLabel}>Avg Weight</Text>
          <Text style={styles.weekStatValue}>{week.avgWeight} lbs</Text>
        </View>
        <View style={styles.weekStat}>
          <Text style={styles.weekStatLabel}>Total Sets</Text>
          <Text style={styles.weekStatValue}>{week.totalSets}</Text>
        </View>
        <View style={styles.weekStat}>
          <Text style={styles.weekStatLabel}>Avg/Workout</Text>
          <Text style={styles.weekStatValue}>{week.avgPerWorkout}</Text>
        </View>
      </View>

      {/* Top Exercises */}
      <View style={styles.topExercises}>
        <Text style={styles.topExercisesLabel}>Top Exercises:</Text>
        {week.topExercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseSets}>{exercise.sets} sets</Text>
          </View>
        ))}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${week.completionPercent}%` },
          ]}
        />
      </View>
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
            <Text style={styles.modalTitle}>.925</Text>
            <TouchableOpacity
              style={styles.headerMenuButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.contentPadding}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Card */}
            <View style={styles.headerCard}>
              <View>
                <Text style={styles.headerCardTitle}>Fitness Summary</Text>
                <Text style={styles.headerCardSubtitle}>Your progress at a glance</Text>
              </View>
            </View>

            {/* Overall Stats */}
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </View>

            {/* Weekly Breakdown Section */}
            <Text style={styles.sectionTitle}>Weekly Breakdown</Text>

            {/* Weekly Cards */}
            {weeklyData.map((week, index) => (
              <WeeklyCard key={index} week={week} />
            ))}
          </ScrollView>

          {/* Bottom Navigation - from HTML preview */}
          <View style={styles.navBar}>
            <View style={[styles.navItem, styles.navItemActive]}>
              <Text style={styles.navItemText}>🏠 Home</Text>
            </View>
            <View style={styles.navItem}>
              <Text style={styles.navItemText}>⭐ My ABS</Text>
            </View>
            <View style={styles.navItem}>
              <Text style={styles.navItemText}>📱 Scan</Text>
            </View>
            <View style={styles.navItem}>
              <Text style={styles.navItemText}>🎧 Listen</Text>
            </View>
            <View style={styles.navItem}>
              <Text style={styles.navItemText}>🎁 Rewards</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.background,  // Obsidian background
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    flexDirection: 'column',
  },
  modalHeader: {
    backgroundColor: theme.colors.background,  // Unified dark header (was red)
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerMenuButton: {
    position: 'absolute',
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  contentContainer: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerCardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 10,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 22,  // Matching HTML (reduced from 28px)
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textAlign: 'left',  // Left-justified (matching HTML)
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 12,
    marginTop: 16,
  },
  weeklyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  weekSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  completionRate: {
    alignItems: 'flex-end',
  },
  completionPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  completionLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  weekStats: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekStatLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  weekStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  topExercises: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  topExercisesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 12,
  },
  exerciseName: {
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  exerciseSets: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 3,
  },
  navBar: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    fontSize: 11,
  },
  navItemText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  navItemActive: {
    // Will be styled differently if needed
  },
});
