import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';

// Card components removed - using simple View for PWA-matching exercise cards
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
import { entriesAPI } from '../../api/entries';
import { historyAPI } from '../../api/history';

export default function Dashboard() {
  const { user } = useAuth();
  const responsive = useResponsive();
  const params = useLocalSearchParams();
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

  const { addToQueue, syncQueue, queue: offlineQueue } = useOfflineQueue();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle date parameter from URL (when editing from History screen)
  useEffect(() => {
    if (params.date && typeof params.date === 'string') {
      console.log('[Dashboard] Date parameter found in URL:', params.date);
      // Parse the date string (format: YYYY-MM-DD) and set it
      const [year, month, day] = params.date.split('-').map(Number);
      const editDate = new Date(year, month - 1, day);
      console.log('[Dashboard] Setting selectedDate from URL parameter:', editDate);
      setSelectedDate(editDate);
    }
  }, [params.date]);

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
    console.log('[Dashboard] selectedDate changed, calling loadWorkoutForDate:', selectedDate);
    loadWorkoutForDate();
  }, [selectedDate]);

  // Fetch 52-week progress summary when modal opens
  // Refresh dashboard when modals close (user may have edited data via History modal)
  useEffect(() => {
    if (summaryModalVisible) {
      fetchProgressSummary();
    } else if (summaryModalVisible === false) {
      // When summary modal closes, clear caches and refresh dashboard to show any changes made via modals
      console.log('[Dashboard] Summary modal closed, refreshing dashboard');
      entriesAPI.clearCache();
      historyAPI.clearCache();
      loadWorkoutForDate();
    }
  }, [summaryModalVisible]);

  // Also refresh when history modal closes
  useEffect(() => {
    if (!historyModalVisible && historyModalVisible !== undefined) {
      console.log('[Dashboard] History modal closed, refreshing dashboard');
      entriesAPI.clearCache();
      historyAPI.clearCache();
      loadWorkoutForDate();
    }
  }, [historyModalVisible]);

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
    const loadStartTime = Date.now();
    console.log(`[Dashboard] loadWorkoutForDate START - Stack trace:`, new Error().stack);
    try {
      const dateStr = formatDateForApi(selectedDate);
      let currentWeight = '';
      let currentExercises: Record<string, number> = {};

      console.log('[Dashboard] loadWorkoutForDate - Fetching for date:', dateStr);

      // First, try to fetch from server for authoritative data
      try {
        console.log('[Dashboard] Attempting server fetch...');
        const serverEntry = await entriesAPI.getEntry(dateStr);
        console.log('[Dashboard] Server fetch result:', { serverEntry, isNull: serverEntry === null });

        if (serverEntry) {
          // Use server data if available
          if (serverEntry.weight !== undefined && serverEntry.weight !== null) {
            currentWeight = serverEntry.weight.toString();
          }
          if (serverEntry.exercises) {
            currentExercises = serverEntry.exercises;
          }
          console.log('[Dashboard] Loaded from server:', { dateStr, weight: currentWeight, exerciseCount: Object.keys(currentExercises).length });
        } else {
          console.log('[Dashboard] Server returned null entry (no data for this date)');
        }
      } catch (serverError) {
        console.warn('[Dashboard] Server fetch failed:', { error: serverError?.message, code: serverError?.code });
        // If server fetch fails, check offline queue for pending changes
        const pendingEntry = offlineQueue.find((entry) => entry.date === dateStr);
        console.log('[Dashboard] Checking offline queue:', { hasPending: !!pendingEntry, queueLength: offlineQueue.length });

        if (pendingEntry && pendingEntry.body) {
          if (pendingEntry.body.weight !== undefined && pendingEntry.body.weight !== null) {
            currentWeight = pendingEntry.body.weight.toString();
          }
          if (pendingEntry.body.fitnessData) {
            currentExercises = pendingEntry.body.fitnessData;
          }
          console.log('[Dashboard] Loaded from offline queue:', { dateStr, weight: currentWeight, exercises: currentExercises });
        } else if (user?.id) {
          // Last resort: Load weight from AsyncStorage
          console.log('[Dashboard] No server data and no offline queue entry, checking AsyncStorage');
          try {
            const savedWeight = await AsyncStorage.getItem(`weight_${user.id}`);
            if (savedWeight) {
              currentWeight = savedWeight;
            }
          } catch (e) {
            console.error('Weight load error:', e);
          }
        }
      }

      console.log('[Dashboard] Setting state with:', {
        weight: currentWeight,
        exerciseCount: Object.keys(currentExercises).length,
        exercises: currentExercises
      });

      // Important: Reset the user-initiated flag BEFORE setting server state
      // This prevents the save debounce from triggering on server-loaded data
      isUserInitiatedChange.current = false;

      setWeight(currentWeight);
      setExercises(currentExercises);

      const initialPayload = {
        date: dateStr,
        weight: currentWeight ? parseFloat(currentWeight) : null,
        fitnessData: currentExercises,
      };
      setLastPayload(JSON.stringify(initialPayload));

      console.log(`[Dashboard] loadWorkoutForDate END - took ${Date.now() - loadStartTime}ms`);
    } catch (error) {
      console.error('Failed to load workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      const dateStr = formatDateForApi(selectedDate);
      const exerciseKeys = Object.keys(exercises);
      const isEmpty = exerciseKeys.length === 0;

      console.log('[Dashboard] saveData() START - exercises state:', {
        exerciseKeys,
        isEmpty,
        exerciseCount: exerciseKeys.length,
        exercises: JSON.stringify(exercises),
        exerciseValues: exerciseKeys.map(k => `${k}:${exercises[k]}`).join(', ')
      });

      const payload = {
        date: dateStr,
        weight: weight ? parseFloat(weight) : null,
        fitnessData: exercises,
      };

      const payloadString = JSON.stringify(payload);
      console.log('[Dashboard] saveData() PAYLOAD:', {
        dateStr,
        fitnessDataKeys: Object.keys(payload.fitnessData),
        fitnessDataIsEmpty: Object.keys(payload.fitnessData).length === 0,
        fitnessData: JSON.stringify(payload.fitnessData),
        fitnessDataValues: Object.keys(payload.fitnessData).map(k => `${k}:${payload.fitnessData[k]}`).join(', ')
      });
      console.log('[Dashboard] saveData() called:', { dateStr, currentPayload: payload, lastPayload: JSON.parse(lastPayload) });

      if (payloadString === lastPayload) {
        console.log('[Dashboard] saveData() - payload unchanged, skipping save');
        return;
      }

      console.log('[Dashboard] Saving workout data for', dateStr, 'with exercises:', exercises);

      // Queue for offline sync
      console.log('[Dashboard] Adding to offline queue...');
      await addToQueue(
        'POST',
        '/api/entries',
        dateStr,
        { fitnessData: exercises, weight: weight ? parseFloat(weight) : undefined }
      );
      console.log('[Dashboard] Successfully added to offline queue');

      // Immediately sync the queue to server
      console.log('[Dashboard] Starting syncQueue()...');
      const syncResult = await syncQueue();
      console.log('[Dashboard] syncQueue() completed:', syncResult);

      // After sync (successful or not), trust local state instead of re-fetching
      // This prevents UI jumping from unnecessary data refresh
      // The data we just saved is already in state, and sync was successful
      if (syncResult) {
        console.log('[Dashboard] Sync result:', { synced: syncResult.synced, failed: syncResult.failed, conflicts: syncResult.conflicts });
        if (syncResult.synced > 0) {
          console.log('[Dashboard] Data synced successfully (synced count:', syncResult.synced, '), keeping local state to avoid UI jump');
          // Clear caches so other screens (History, Summary) fetch fresh data on next open
          entriesAPI.clearCache();
          historyAPI.clearCache();
          console.log('[Dashboard] Caches cleared for other screens');
        } else if (syncResult.failed > 0) {
          console.log('[Dashboard] Sync had failures (failed count:', syncResult.failed, '), keeping data in offline queue for retry');
        } else {
          console.log('[Dashboard] Sync result is not synced and not failed? Unusual case.');
        }
      } else {
        console.log('[Dashboard] syncResult is null/undefined - this is unexpected!');
      }

      console.log('[Dashboard] saveData() finished, updating lastPayload');
      setLastPayload(payloadString);
    } catch (error) {
      console.error('[Dashboard] Failed to save:', error);
    }
  };

  // Track if we're in the initial load phase or a user-initiated reload
  const isUserInitiatedChange = useRef(false);

  // Auto-save debounce - only save on USER INITIATED changes, not on initial loads
  useEffect(() => {
    // Skip debounce if currently loading or if this is just a state update from server
    if (loading || !isUserInitiatedChange.current) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      console.log('[Dashboard] Debounce triggered, saving data');
      saveData();
    }, 2000); // 2 second debounce like Web PWA

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [weight, exercises]);

  const handleExerciseChange = (id: string, value: number) => {
    // Mark this as user-initiated change
    isUserInitiatedChange.current = true;
    console.log('[Dashboard] handleExerciseChange BEFORE:', { id, newValue: value, currentExercises: exercises });
    setExercises((prev) => {
      const updated = {
        ...prev,
        [id]: Math.min(Math.max(value, 0), 4), // Clamp between 0 and maxSets (4)
      };
      console.log('[Dashboard] handleExerciseChange AFTER:', { id, newValue: value, updatedExercises: updated });
      return updated;
    });
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

  // PWA-matching exercise card renderer - NO Card/CardHeader/CardContent wrappers
  // Uses simple View with exact PWA .station specs for correct ~157×149 dimensions
  const renderExerciseCard = ({ item: exercise }: { item: Exercise }) => {
    const count = exercises[exercise.id] || 0;
    const isCompleted = count >= exercise.maxSets;

    return (
      <View style={[styles.exerciseCard, isCompleted && styles.exerciseCardCompleted]}>
        {/* Station Name - PWA: .station-name */}
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        {/* Station Info - PWA: .station-info */}
        <Text style={styles.exerciseTarget}>
          Target: {exercise.targetReps} {exercise.unit}
        </Text>

        {/* Station Controls - PWA: .station-controls */}
        <View style={styles.exerciseControls}>
          {/* Minus Button (Gray) */}
          <TouchableOpacity
            style={[styles.controlBtnSecondary, count === 0 && styles.controlBtnDisabled]}
            onPress={() => handleExerciseChange(exercise.id, count - 1)}
            disabled={count === 0}
            activeOpacity={0.7}
          >
            <Text style={[styles.controlBtnSecondaryText, count === 0 && styles.controlBtnDisabledText]}>−</Text>
          </TouchableOpacity>

          {/* Count - PWA: .count */}
          <View style={styles.countDisplay}>
            <Text style={styles.countText}>{count}</Text>
          </View>

          {/* Plus Button (Red) */}
          <TouchableOpacity
            style={[styles.controlBtn, count >= exercise.maxSets && styles.controlBtnDisabled]}
            onPress={() => handleExerciseChange(exercise.id, count + 1)}
            disabled={count >= exercise.maxSets}
            activeOpacity={0.7}
          >
            <Text style={[styles.controlBtnText, count >= exercise.maxSets && styles.controlBtnDisabledText]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Sets Count */}
        <Text style={styles.countLine}>
          {count} / {exercise.maxSets} sets
        </Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,  // Gray for content area
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

    // Progress Section - PWA Style (WHITE card, not red)
    progressSection: {
      backgroundColor: theme.colors.surface,  // WHITE background (#FFFFFF)
      borderRadius: theme.radius.card,        // 16px rounded corners (same as exercise cards)
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      paddingVertical: 20,
      paddingHorizontal: 20,
      ...theme.shadows.sm,
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: 20,                           // PWA: "Today's Workout" title
      fontWeight: '700',                      // Bold
      color: theme.colors.text.primary,       // BLACK text (#111)
      marginBottom: 8,
      textAlign: 'center',
    },
    progressText: {
      fontSize: 14,                           // PWA: Smaller progress text
      fontWeight: '400',                      // Normal weight
      color: theme.colors.text.secondary,     // Gray text (#666)
      marginBottom: 16,
      textAlign: 'center',
    },
    progressBar: {
      height: 8,                              // Progress bar height
      backgroundColor: theme.colors.border.light, // Light gray track
      borderRadius: 4,
      overflow: 'hidden',
      width: '100%',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,  // Red progress fill (#C5282F)
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

    // Exercise Cards - PWA .station specs (exact dimensions for ~157×149 cards)
    exerciseCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border.light,      // #E2E3E6
      borderRadius: theme.radius.card,             // 16px
      paddingTop: 18,                              // PWA: padding: 18px 16px 20px
      paddingHorizontal: 16,
      paddingBottom: 20,
      ...theme.shadows.sm,                         // 0 4px 12px rgba(0,0,0,0.08)
      // NO flex:1 or minWidth - wrapper View handles sizing
    },
    exerciseCardCompleted: {
      borderColor: theme.colors.status.success,    // Green border (#31a24c)
      ...theme.shadows.completedCard,              // Green-tinted shadow
    },
    // PWA: .station-name { font-size:18px; font-weight:600; margin:0 0 6px; }
    exerciseName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 6,
    },
    // PWA: .station-info { font-size:13px; color:#555; margin:0 0 10px; }
    exerciseTarget: {
      fontSize: 13,
      fontWeight: '400',
      color: '#555555',
      marginBottom: 10,
    },

    // Exercise Controls - PWA .station-controls specs
    exerciseControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',                    // Center buttons laterally
      gap: 12,                                     // PWA: gap: 12px
      marginBottom: 10,
      paddingHorizontal: 8,                        // Add horizontal padding
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
    // PWA: .btn:disabled { background:#ccc; cursor:not-allowed; box-shadow:none; }
    controlBtnDisabled: {
      backgroundColor: '#CCCCCC',
      shadowOpacity: 0,
      elevation: 0,
    },
    controlBtnDisabledText: {
      color: '#999999',
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
    <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      {/* Status Bar Background - Red extends behind status bar */}
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

            {/* Progress Section - PWA Style (WHITE card) */}
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Today's Workout</Text>
              <Text style={styles.progressText}>
                Progress: <Text style={{ fontWeight: '700', color: theme.colors.text.primary }}>{progress.completed}</Text>/
                {progress.total} exercises ({progress.percentage}%)
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress.percentage}%`,
                      backgroundColor: theme.colors.primary,
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
    </View>
  );
}
