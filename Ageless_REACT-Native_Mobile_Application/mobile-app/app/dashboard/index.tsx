import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import { BottomNav } from '../../components/layout/BottomNav';
import { HistoryModal } from '../../components/modals/HistoryModal';
import { SummaryModal } from '../../components/modals/SummaryModal';
import { ScanModal } from '../../components/modals/ScanModal';
import { MyABSDrawer } from '../../components/layout/MyABSDrawer';
import { EXERCISES, Exercise } from '../../lib/constants/exercises';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { getTodayDate } from '../../lib/utils';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [weight, setWeight] = useState('');
  const [exercises, setExercises] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastPayload, setLastPayload] = useState<string>('');

  // Modal states
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [myAbsDrawerVisible, setMyAbsDrawerVisible] = useState(false);

  const { enqueue, getQueue } = useOfflineQueue();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to format date as YYYY-MM-DD
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate progress percentage
  const calculateProgress = (): { completed: number; total: number; percentage: number } => {
    const total = EXERCISES.length;
    const completed = EXERCISES.filter(
      (exercise) => (exercises[exercise.id] || 0) >= exercise.maxSets
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  useEffect(() => {
    loadWorkoutForDate();
  }, [selectedDate]);

  const loadWorkoutForDate = async () => {
    setLoading(true);
    try {
      const dateStr = formatDateForApi(selectedDate);
      let currentWeight = '';
      let currentExercises: Record<string, number> = {};

      // Check offline queue for pending changes
      const queue = await getQueue();
      const pendingEntry = queue.find((entry) => {
        if (entry.body && typeof entry.body.date === 'string') {
          return entry.body.date === dateStr;
        }
        return false;
      });

      if (pendingEntry && pendingEntry.body) {
        const body = pendingEntry.body as any;
        if (body.weight !== undefined && body.weight !== null) {
          currentWeight = body.weight.toString();
        }
        if (body.fitnessData) {
          currentExercises = body.fitnessData;
        }
      }

      setWeight(currentWeight);
      setExercises(currentExercises);

      const initialPayload = {
        date: dateStr,
        weight: currentWeight ? parseFloat(currentWeight) : null,
        fitnessData: currentExercises,
      };
      setLastPayload(JSON.stringify(initialPayload));
    } catch (error) {
      console.error('Failed to load workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      const dateStr = formatDateForApi(selectedDate);
      const payload = {
        date: dateStr,
        weight: weight ? parseFloat(weight) : null,
        fitnessData: exercises,
      };

      const payloadString = JSON.stringify(payload);
      if (payloadString === lastPayload) return;

      // Queue for offline sync
      await enqueue({
        path: '/api/entries',
        method: 'POST',
        body: payload,
      });

      setLastPayload(payloadString);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Auto-save debounce
  useEffect(() => {
    if (loading) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveData();
    }, 2000); // 2 second debounce like Web PWA

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [weight, exercises]);

  const handleExerciseChange = (id: string, value: number) => {
    setExercises((prev) => ({
      ...prev,
      [id]: Math.min(Math.max(value, 0), 4), // Clamp between 0 and maxSets (4)
    }));
  };

  const handleNavigate = (tab: string) => {
    switch (tab) {
      case 'myabs':
        setMyAbsDrawerVisible(true);
        break;
      case 'scan':
        setScanModalVisible(true);
        break;
      case 'listen':
        // BottomNav handles external link
        break;
      case 'rewards':
        // Navigate to rewards screen
        break;
      case 'home':
      default:
        // Already on home
        break;
    }
  };

  const progress = calculateProgress();

  const renderExerciseCard = ({ item: exercise }: { item: Exercise }) => {
    const count = exercises[exercise.id] || 0;
    const isCompleted = count >= exercise.maxSets;

    return (
      <Card style={[styles.exerciseCard, isCompleted && styles.exerciseCardCompleted]}>
        <CardHeader style={styles.exerciseHeader}>
          <CardTitle style={styles.exerciseName}>{exercise.name}</CardTitle>
          <Text style={styles.exerciseTarget}>
            Target: {exercise.targetReps} {exercise.unit}
          </Text>
        </CardHeader>
        <CardContent>
          {/* Exercise Controls */}
          <View style={styles.exerciseControls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => handleExerciseChange(exercise.id, count - 1)}
              disabled={count === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.controlBtnText}>−</Text>
            </TouchableOpacity>

            <View style={styles.countDisplay}>
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.countMax}>/ {exercise.maxSets}</Text>
            </View>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => handleExerciseChange(exercise.id, count + 1)}
              disabled={count >= exercise.maxSets}
              activeOpacity={0.7}
            >
              <Text style={styles.controlBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Count Line */}
          <Text style={styles.countLine}>
            {count} / {exercise.maxSets} sets
          </Text>
        </CardContent>
      </Card>
    );
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      ...theme.typography.h1,
      color: theme.colors.text.primary,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    loadingContainer: {
      marginTop: theme.spacing.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },

    // DatePicker
    datePickerLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },

    // Progress Section
    progressSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    progressLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.base,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: theme.sizes.progressBar,
      backgroundColor: theme.colors.border.light,
      borderRadius: theme.radius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },

    // Weight Input Card
    weightCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    weightLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    weightInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.base,
    },
    weightInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surfaceAlt,
    },
    weightUnit: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      minWidth: 40,
    },

    // Exercise Grid
    exerciseGridContainer: {
      marginBottom: theme.spacing.lg,
    },
    exerciseGridLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    exerciseGridWrapper: {
      // FlatList handles the grid layout
    },

    // Exercise Cards
    exerciseCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      ...theme.shadows.sm,
    },
    exerciseCardCompleted: {
      borderLeftColor: theme.colors.status.success,
      ...theme.shadows.md,
    },
    exerciseHeader: {
      marginBottom: theme.spacing.md,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    exerciseTarget: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },

    // Exercise Controls
    exerciseControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.base,
      marginBottom: theme.spacing.md,
    },
    controlBtn: {
      width: theme.sizes.controlButton,
      height: theme.sizes.controlButton,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    controlBtnText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.onPrimary,
    },
    countDisplay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text.primary,
      lineHeight: 28,
    },
    countMax: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    countLine: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },

    // Quick Action Buttons
    quickActions: {
      flexDirection: 'row',
      gap: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    quickBtn: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      alignItems: 'center',
    },
    quickBtnText: {
      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight,
      color: theme.colors.text.onPrimary,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity
          onPress={() => setSummaryModalVisible(true)}
          style={{ padding: theme.spacing.base }}
        >
          <Ionicons
            name="stats-chart-outline"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* DatePicker */}
            <View>
              <Text style={styles.datePickerLabel}>Select Date</Text>
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Today's Workout</Text>
              <Text style={styles.progressText}>
                {progress.completed}/{progress.total} exercises ({progress.percentage}%)
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress.percentage}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Weight Input */}
            <View style={styles.weightCard}>
              <Text style={styles.weightLabel}>Weight (lbs)</Text>
              <View style={styles.weightInputContainer}>
                <Input
                  keyboardType="decimal-pad"
                  placeholder="Enter your weight"
                  value={weight}
                  onChangeText={setWeight}
                  style={styles.weightInput}
                />
                <Text style={styles.weightUnit}>lbs</Text>
              </View>
            </View>

            {/* Exercise Grid */}
            <View style={styles.exerciseGridContainer}>
              <Text style={styles.exerciseGridLabel}>Exercises</Text>
              <FlatList
                data={EXERCISES}
                renderItem={renderExerciseCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => setHistoryModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => setMyAbsDrawerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>My ABS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" onNavigate={handleNavigate} />

      {/* Modals */}
      <HistoryModal
        isVisible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
      />
      <SummaryModal
        isVisible={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
      />
      <ScanModal
        isVisible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
      />
      <MyABSDrawer
        isVisible={myAbsDrawerVisible}
        onClose={() => setMyAbsDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}
