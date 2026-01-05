import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DateSelector } from '../../components/ui/DateSelector';
import { DatePicker } from '../../components/ui/DatePicker';
import { WorkoutCard } from '../../components/dashboard/WorkoutCard';
import { BottomNav } from '../../components/layout/BottomNav';
import { HistoryModal } from '../../components/modals/HistoryModal';
import { SummaryModal } from '../../components/modals/SummaryModal';
import { ScanModal } from '../../components/modals/ScanModal';
import { MyABSDrawer } from '../../components/layout/MyABSDrawer';
import { EXERCISES } from '../../lib/constants/exercises';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { getTodayDate } from '../../lib/utils';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [weight, setWeight] = useState('');
  const [exercises, setExercises] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastPayload, setLastPayload] = useState<string>('');
  const [activeTab, setActiveTab] = useState('home');

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

  useEffect(() => {
    loadWorkoutForDate();
  }, [selectedDate]);

  const loadWorkoutForDate = async () => {
    setLoading(true);
    try {
      const dateStr = formatDateForApi(selectedDate);
      let currentWeight = '';
      let currentExercises = {};

      // 1. Try to fetch from server (Mocked for now)
      // In real app: const response = await fetch(...)
      
      // 2. Check offline queue for pending changes
      const queue = await getQueue();
      const pendingEntry = queue.find(entry => {
        if (entry.body && typeof entry.body.date === 'string') {
          return entry.body.date === dateStr;
        }
        return false;
      });

      if (pendingEntry && pendingEntry.body) {
        console.log('[Dashboard] Applying pending offline changes for', dateStr);
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

      console.log('Saving data...', payload);
      
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
    }, 1000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [weight, exercises]);

  const handleExerciseChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    setExercises(prev => ({
      ...prev,
      [id]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'myabs':
        setMyAbsDrawerVisible(true);
        break;
      case 'scan':
        setScanModalVisible(true);
        break;
      case 'listen':
        // PWANav handles external link
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
    },
    contentContainer: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    quickButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      alignItems: 'center',
    },
    quickButtonText: {
      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight,
      color: theme.colors.text.onPrimary,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => setSummaryModalVisible(true)} style={{ padding: theme.spacing.base }}>
          <Ionicons name="stats-chart-outline" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* Weight Card */}
            <Card>
              <CardHeader style={{ paddingBottom: theme.spacing.xs }}>
                <CardTitle>Daily Check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.typography.body, color: theme.colors.text.primary }}>Body Weight</Text>
                  <View style={{ width: 96, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.base }}>
                    <Input
                      keyboardType="numeric"
                      placeholder="lbs"
                      value={weight}
                      onChangeText={setWeight}
                    />
                    <Text style={{ color: theme.colors.text.secondary, ...theme.typography.bodySmall }}>lbs</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Workout Card */}
            <Card>
              <CardHeader style={{ paddingBottom: theme.spacing.xs }}>
                <CardTitle>Today's Workout</CardTitle>
              </CardHeader>
              <CardContent>
                {EXERCISES.map((exercise) => (
                  <WorkoutCard
                    key={exercise.id}
                    exercise={exercise}
                    value={exercises[exercise.id]}
                    onChange={(val) => handleExerciseChange(exercise.id, val)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Quick Action Buttons */}
            <View style={{ flexDirection: 'row', gap: theme.spacing.base }}>
              <TouchableOpacity
                style={[styles.quickButton, { flex: 1 }]}
                onPress={() => setHistoryModalVisible(true)}
              >
                <Text style={styles.quickButtonText}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, { flex: 1 }]}
                onPress={() => setMyAbsDrawerVisible(true)}
              >
                <Text style={styles.quickButtonText}>My ABS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onNavigate={handleNavigate} />

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
