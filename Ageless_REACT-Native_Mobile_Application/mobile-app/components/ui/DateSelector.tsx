import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    padding: 8,
  },
  arrow: {
    fontSize: 24,
  },
  arrowLeft: {
    color: '#4b5563',
  },
  arrowDisabled: {
    color: '#d1d5db',
  },
  centerSection: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  todayBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
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
