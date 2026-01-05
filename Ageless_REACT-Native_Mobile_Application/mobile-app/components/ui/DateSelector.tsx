import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { getTodayDate } from '../../lib/utils';

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  button: {
    padding: theme.spacing.base,
  },
  arrow: {
    fontSize: 24,
  },
  arrowLeft: {
    color: theme.colors.text.secondary,
  },
  arrowDisabled: {
    color: theme.colors.border.light,
  },
  centerSection: {
    alignItems: 'center',
  },
  dateText: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  todayBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xl,
    marginTop: theme.spacing.xs,
  },
  todayText: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
});

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    onDateChange(newDate);
  };

  const isToday = date.toDateString() === getTodayDate().toDateString();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrevDay} style={styles.button}>
        <Text style={[styles.arrow, styles.arrowLeft]}>←</Text>
      </TouchableOpacity>
      
      <View style={styles.centerSection}>
        <Text style={styles.dateText}>
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>Today</Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={handleNextDay} style={styles.button} disabled={isToday}>
        <Text style={[styles.arrow, styles.arrowLeft, isToday && styles.arrowDisabled]}>→</Text>
      </TouchableOpacity>
    </View>
  );
}
