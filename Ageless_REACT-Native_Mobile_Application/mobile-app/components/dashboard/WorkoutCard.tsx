import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { Exercise } from '../../lib/constants/exercises';

interface WorkoutCardProps {
  exercise: Exercise;
  value: number | undefined;
  onChange: (value: string) => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  leftSection: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#a1aeb8',
    marginTop: 2,
  },
  inputContainer: {
    width: 96,
  },
});

export function WorkoutCard({ exercise, value, onChange }: WorkoutCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDetails}>
          Target: {exercise.targetReps} {exercise.unit} • {exercise.maxSets} sets
        </Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Input
          keyboardType="numeric"
          placeholder="0"
          value={value?.toString() || ''}
          onChangeText={onChange}
        />
      </View>
    </View>
  );
}
