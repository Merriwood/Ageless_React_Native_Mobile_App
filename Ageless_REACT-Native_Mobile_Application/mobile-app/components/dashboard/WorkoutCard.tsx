import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { Exercise } from '../../lib/constants/exercises';
import { theme } from '../../theme';

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
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  leftSection: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  exerciseDetails: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
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
