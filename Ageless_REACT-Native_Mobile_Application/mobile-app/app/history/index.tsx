import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Card, CardContent } from '../../components/ui/Card';
import { EXERCISES } from '../../lib/constants/exercises';
import { WorkoutEntry } from '../../lib/types';

export default function HistoryScreen() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      // const response = await fetch('/api/workouts');
      // const data = await response.json();
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData: WorkoutEntry[] = [
        {
          id: 1,
          date: '2023-10-26',
          weight: 185.5,
          fitnessData: {
            bike: 30,
            chestPress: 4,
            row: 4
          }
        },
        {
          id: 2,
          date: '2023-10-25',
          weight: 186.0,
          fitnessData: {
            bike: 45,
            abs: 100
          }
        }
      ];
      setEntries(mockData);
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId: number) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            // Implement delete logic here
            setEntries(prev => prev.filter(e => e.id !== entryId));
          }
        }
      ]
    );
  };

  const toggleRow = (entryId: number) => {
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
    const date = new Date(dateStr);
    // Fix timezone offset issue for display
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    
    return adjustedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderItem = ({ item }: { item: WorkoutEntry }) => {
    const isExpanded = expandedRows.has(item.id);
    const exerciseCount = Object.keys(item.fitnessData).length;
    const totalSets = Object.values(item.fitnessData).reduce((a, b) => a + b, 0);

    return (
      <Card className="mb-4">
        <TouchableOpacity 
          onPress={() => toggleRow(item.id)}
          className="p-4"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-bold text-slate-900">
                {formatDate(item.date)}
              </Text>
              <Text className="text-sm text-slate-500">
                {exerciseCount} exercises • {totalSets} sets/mins
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              {item.weight && (
                <Text className="font-medium text-slate-700">{item.weight} lbs</Text>
              )}
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#64748b" 
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className="px-4 pb-4 border-t border-gray-100 pt-4">
            {Object.entries(item.fitnessData).map(([key, value]) => (
              <View key={key} className="flex-row justify-between py-1">
                <Text className="text-slate-600">{getExerciseName(key)}</Text>
                <Text className="font-medium text-slate-900">{value}</Text>
              </View>
            ))}
            
            <TouchableOpacity 
              onPress={() => handleDelete(item.id)}
              className="mt-4 flex-row items-center justify-center py-2 bg-red-50 rounded-md"
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text className="ml-2 text-red-600 font-medium">Delete Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-4 py-4 border-b border-gray-200 bg-white flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">History</Text>
        <View className="w-10" /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text className="text-center text-slate-500 mt-10">No workout history found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
