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

  const { addToQueue, queue: offlineQueue } = useOfflineQueue();
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
      const pendingEntry = offlineQueue.find((entry) => entry.date === dateStr);

      if (pendingEntry && pendingEntry.body) {
        if (pendingEntry.body.weight !== undefined && pendingEntry.body.weight !== null) {
          currentWeight = pendingEntry.body.weight.toString();
        }
        if (pendingEntry.body.exercises) {
          currentExercises = pendingEntry.body.exercises;
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
      await addToQueue(
        'POST',
        '/api/entries',
        dateStr,
        { exercises, weight: weight ? parseFloat(weight) : undefined }
      );

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

    // Progress Section - PWA Red Banner Style
    progressSection: {
      backgroundColor: theme.colors.primary,  // Red background (#C5282F)
      borderRadius: theme.radius.xl,          // 20px rounded corners
      paddingVertical: 20,                    // Vertical padding
      paddingHorizontal: 24,                  // Horizontal padding
      ...theme.shadows.sm,
      alignItems: 'center',                   // Center content
    },
    progressLabel: {
      fontSize: 24,                           // PWA: Large bold title
      fontWeight: '700',                      // Bold
      color: '#FFFFFF',                       // White text on red
      marginBottom: 8,
      textAlign: 'center',
    },
    progressText: {
      fontSize: 16,                           // PWA: Smaller progress text
      fontWeight: '400',                      // Normal weight
      color: '#FFFFFF',                       // White text
      marginBottom: 16,
      textAlign: 'center',
    },
    progressBar: {
      height: 6,                              // Thinner progress bar
      backgroundColor: 'rgba(255,255,255,0.3)', // Semi-transparent white
      borderRadius: 3,
      overflow: 'hidden',
      width: '100%',                          // Full width
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#FFFFFF',             // White fill on red background
    },

    // Weight Input Card - PWA Style
    weightCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: theme.radius.card,             // 16px to match exercise cards
      padding: 16,
      ...theme.shadows.sm,
    },
    weightLabel: {
      fontSize: 14,                                // Larger label
      fontWeight: '600',                           // Bold
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    weightInput: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: theme.radius.md,               // 8px
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surfaceAlt,
    },

    // Exercise Grid (Responsive layout matching Web PWA)
    exerciseGridContainer: {
      marginBottom: theme.spacing.lg,
    },
    exerciseGridWrapper: {
      // Match Web PWA responsive grid behavior
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,                                     // PWA: .stations gap: 20px
      // NOTE: React Native doesn't have perfect CSS Grid, so we use hardcoded widths
      // This matches the 2-column layout
    },

    // Exercise Cards (2-column grid layout) - PWA .station specs
    exerciseCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,                              // Full border all sides
      borderColor: theme.colors.border.light,      // Light gray border
      borderRadius: theme.radius.card,             // 16px (PWA .station)
      paddingTop: 18,                              // PWA: 18px 16px 20px
      paddingHorizontal: 16,
      paddingBottom: 20,
      ...theme.shadows.sm,                         // 0.08 opacity shadow
      flex: 1,
      minWidth: '45%',                             // Forces 2-column layout
      flexDirection: 'column',
      gap: 10,                                     // PWA: gap: 10px
    },
    exerciseCardLandscape: {
      minWidth: responsive.isLandscape ? '30%' : '45%',
    },
    exerciseCardCompleted: {
      borderColor: theme.colors.status.success,    // Green border (#31a24c)
      ...theme.shadows.completedCard,              // Green-tinted shadow
    },
    exerciseHeader: {
      marginBottom: 6,                             // Tighter spacing
    },
    exerciseName: {
      fontSize: 18,                                // PWA: .station-name 18px
      fontWeight: '600',                           // Semibold (bold)
      color: theme.colors.text.primary,
      marginBottom: 6,
    },
    exerciseTarget: {
      fontSize: 13,                                // PWA: .station-info 13px
      fontWeight: '400',                           // Normal weight
      color: '#555555',                            // PWA: color:#555
    },

    // Exercise Controls - PWA .station-controls specs
    exerciseControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,                                     // PWA: gap: 12px
      marginBottom: 10,
    },
    controlBtn: {
      width: 44,                                   // PWA: w-11 h-11 (44px)
      height: 44,
      borderRadius: theme.radius.button,          // 14px (PWA: rounded-[14px])
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.button,
    },
    controlBtnSecondary: {
      width: 44,                                   // PWA: w-11 h-11 (44px)
      height: 44,
      borderRadius: theme.radius.button,          // 14px
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
      color: theme.colors.text.primary,
    },
    countDisplay: {
      width: 40,                                   // PWA: .count width:40px
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {
      fontSize: 22,                                // PWA: .count font-size:22px
      fontWeight: '700',                           // PWA: font-weight:700
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    countMax: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    countLine: {
      fontSize: 14,
      fontWeight: '400',
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

            {/* Progress Section - PWA Red Banner */}
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Today's Workout</Text>
              <Text style={styles.progressText}>
                Progress: <Text style={{ fontWeight: '700' }}>{progress.completed}</Text>/
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

            {/* Weight Input - PWA Style */}
            <View style={styles.weightCard}>
              <Text style={styles.weightLabel}>Weight (lbs)</Text>
              <Input
                keyboardType="decimal-pad"
                placeholder="Enter your weight (optional)"
                value={weight}
                onChangeText={setWeight}
                style={styles.weightInput}
              />
            </View>

            {/* Exercise Grid (2-column responsive layout) */}
            <View style={styles.exerciseGridContainer}>
              <View style={styles.exerciseGridWrapper}>
                {EXERCISES.map((exercise) => (
                  <View
                    key={exercise.id}
                    testID={`exercise-card-${exercise.id}`}
                    style={{
                      width: responsive.isLandscape ? '31%' : '47%'  // Adjusted for 20px gap
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
