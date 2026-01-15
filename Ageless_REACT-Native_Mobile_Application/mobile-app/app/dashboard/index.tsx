import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import { BottomNav } from '../../components/layout/BottomNav';
import { HistoryModal } from '../../components/modals/HistoryModal';
import { ScanModal } from '../../components/modals/ScanModal';
import { ProgressSummaryScreen } from '../../components/modals/ProgressSummaryScreen';
import { MyABSDrawer } from '../../components/layout/MyABSDrawer';
import { EXERCISES, Exercise } from '../../lib/constants/exercises';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { getTodayDate } from '../../lib/utils';
import summaryAPI from '../../api/summary';

export default function Dashboard() {
  const { user } = useAuth();
  const responsive = useResponsive();
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

  // Progress Summary data states
  const [summaryWeekData, setSummaryWeekData] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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

  // Fetch 52-week progress summary when modal opens
  useEffect(() => {
    if (summaryModalVisible) {
      fetchProgressSummary();
    }
  }, [summaryModalVisible]);

  const fetchProgressSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const weekData = await summaryAPI.get52WeekSummary();
      setSummaryWeekData(weekData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load progress data';
      setSummaryError(errorMessage);
      console.error('Error fetching progress summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

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
      } else if (user?.id) {
        // Load weight from AsyncStorage if no pending entry
        try {
          const savedWeight = await AsyncStorage.getItem(`weight_${user.id}`);
          if (savedWeight) {
            currentWeight = savedWeight;
          }
        } catch (e) {
          console.error('Weight load error:', e);
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
            {/* Minus Button (Secondary - Gray) */}
            <TouchableOpacity
              style={styles.controlBtnSecondary}
              onPress={() => handleExerciseChange(exercise.id, count - 1)}
              disabled={count === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.controlBtnSecondaryText}>−</Text>
            </TouchableOpacity>

            <View style={styles.countDisplay}>
              <Text style={styles.countText}>{count}</Text>
            </View>

            {/* Plus Button (Primary - Red) */}
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
      position: 'absolute',  // Fixed positioning (Web PWA: fixed top-0)
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingVertical: 12, // Web PWA: 12px (not 10px)
      borderBottomWidth: 0, // No border in Web PWA header
      borderBottomColor: theme.colors.border.light,
      backgroundColor: theme.colors.primary, // Red background (#C5282F)
      flexDirection: 'row',
      justifyContent: 'center', // CENTER the title
      alignItems: 'center',
      minHeight: 48, // Matches Web PWA header height
      zIndex: 400, // CRITICAL FIX: Web PWA uses z-[400], not 10
    },
    headerTitle: {
      fontSize: 24, // Matches PWA "Ageless." header size
      fontWeight: '700', // Bold
      color: '#FFFFFF', // White text
      textAlign: 'center',
      flex: 1,
    },
    headerMenuButton: {
      position: 'absolute',
      right: 16,
      padding: theme.spacing.base,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20, // Web PWA px-5 (20px, not 16px)
      paddingTop: 48, // Account for fixed header (Web PWA: pt-[48px])
      paddingBottom: 80, // Account for fixed BottomNav (Web PWA: pb-[80px])
    },
    loadingContainer: {
      marginTop: theme.spacing.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      gap: theme.spacing.sectionSpacing,  // CHANGE from lg (16px) to sectionSpacing (24px)
      paddingBottom: theme.spacing.xl,
    },

    // Progress Section
    progressSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,                       // 12px (matching HTML)
      padding: 16,                             // 16px (matching HTML)
      ...theme.shadows.sm,                    // 0.08 opacity ✓
      textAlign: 'center',                    // ✓ text-center
    },
    progressLabel: {
      fontSize: 14,        // 14px (matching HTML)
      fontWeight: '400',   // 400 normal (matching HTML)
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    progressText: {
      fontSize: 20,        // 20px (matching HTML)
      fontWeight: '700',   // 700 bold (matching HTML)
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    progressBar: {
      height: 8,                              // 8px (matching HTML)
      backgroundColor: theme.colors.border.light,
      borderRadius: 4,                        // 4px (matching HTML)
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },

    // Weight Input Card - Match exercise card styling for consistency
    weightCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,                              // Full border all sides
      borderColor: theme.colors.border.light,      // Light gray border
      borderRadius: 12,                            // 12px (matching HTML)
      padding: 16,                                 // 16px (matching HTML)
      ...theme.shadows.sm,                         // 0.08 opacity shadow
    },
    weightLabel: {
      fontSize: 11,                                // 11px (matching HTML)
      fontWeight: '600',                           // 600 bold (matching HTML)
      color: theme.colors.text.primary,
      marginBottom: 8,
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

    // Exercise Grid (Responsive layout matching Web PWA)
    exerciseGridContainer: {
      marginBottom: theme.spacing.lg,
    },
    exerciseGridWrapper: {
      // Match Web PWA responsive grid behavior
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,                                     // 12px gap (matching HTML)
      // NOTE: React Native doesn't have perfect CSS Grid, so we use hardcoded widths
      // This matches the 2-column layout
    },

    // Exercise Cards (2-column grid layout) - Web PWA parity
    exerciseCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,                              // Full border all sides
      borderColor: theme.colors.border.light,      // Light gray border
      borderRadius: 12,                            // 12px (matching HTML)
      padding: 14,                                 // 14px (matching HTML)
      ...theme.shadows.sm,                         // 0.08 opacity shadow
      flex: 1,
      minWidth: '45%',                             // Forces 2-column layout
      flexDirection: 'column',                      // flex flex-col
      gap: 12,                                     // 12px internal spacing
    },
    exerciseCardLandscape: {
      minWidth: responsive.isLandscape ? '30%' : '45%', // 3-column in landscape, 2-column in portrait
    },
    exerciseCardCompleted: {
      borderColor: '#4caf50',                       // Green border (matching HTML)
      backgroundColor: '#f1f8f4',                  // Light green background (matching HTML)
    },
    exerciseHeader: {
      marginBottom: theme.spacing.md,
    },
    exerciseName: {
      fontSize: 13,        // 13px (matching HTML)
      fontWeight: '600',   // Semibold
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    exerciseTarget: {
      fontSize: 11,        // 11px (matching HTML)
      fontWeight: '400',   // Normal weight
      color: theme.colors.text.secondary,
    },

    // Exercise Controls
    exerciseControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,                                      // 8px gap (matching HTML)
      marginBottom: theme.spacing.md,
    },
    controlBtn: {
      width: 32,                                   // 32px (matching HTML)
      height: 32,                                  // 32px (matching HTML)
      borderRadius: 8,                             // 8px (matching HTML)
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.button,
    },
    controlBtnSecondary: {
      width: 32,                                   // 32px (matching HTML)
      height: 32,                                  // 32px (matching HTML)
      borderRadius: 8,                             // 8px (matching HTML)
      backgroundColor: theme.colors.surfaceAlt,   // Gray background
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.button,
    },
    controlBtnText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.onPrimary,
    },
    controlBtnSecondaryText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,  // ✓ Black text on gray background
    },
    countDisplay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {
      fontSize: 18,                                // 18px (matching HTML)
      fontWeight: '700',
      color: theme.colors.text.primary,
      lineHeight: 24,
    },
    countMax: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    countLine: {
      fontSize: 14,
      fontWeight: '400', // CRITICAL FIX: Web PWA uses normal weight (400), not 500
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ageless.</Text>
        <TouchableOpacity
          onPress={() => setMyAbsDrawerVisible(true)}
          style={styles.headerMenuButton}
        >
          <Ionicons
            name="menu"
            size={24}
            color="#FFFFFF"
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
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Today's Workout</Text>
              <Text style={styles.progressText}>
                Progress: <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{progress.completed}</Text>/
                {progress.total} exercises ({progress.percentage}%)
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

            {/* Exercise Grid (2-column responsive layout) */}
            <View style={styles.exerciseGridContainer}>
              <View style={styles.exerciseGridWrapper}>
                {EXERCISES.map((exercise) => (
                  <View
                    key={exercise.id}
                    testID={`exercise-card-${exercise.id}`}
                    style={{
                      width: responsive.isLandscape ? '31%' : '48%'
                    }}
                  >
                    {renderExerciseCard({ item: exercise })}
                  </View>
                ))}
              </View>
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
      <ProgressSummaryScreen
        isVisible={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        weeks={summaryWeekData}
        loading={summaryLoading}
        error={summaryError}
      />
      <ScanModal
        isVisible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
      />
      <MyABSDrawer
        isVisible={myAbsDrawerVisible}
        onClose={() => setMyAbsDrawerVisible(false)}
        onHistoryPress={() => {
          setMyAbsDrawerVisible(false);
          setHistoryModalVisible(true);
        }}
        onSummaryPress={() => {
          setMyAbsDrawerVisible(false);
          setSummaryModalVisible(true);
        }}
        onWeightChange={(value) => {
          setWeight(value);
        }}
      />
    </SafeAreaView>
  );
}
