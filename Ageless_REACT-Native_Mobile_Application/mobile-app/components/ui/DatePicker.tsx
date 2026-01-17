import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface DatePickerProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function DatePicker({ selectedDate = new Date(), onDateChange }: DatePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    if (onDateChange) {
      onDateChange(newDate);
    }
    setIsExpanded(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    handleDateSelect(today.getDate());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days: (number | null)[] = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  // PWA uses short month format: "Jan 9, 2026"
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        {/* Calendar Icon - Red to match PWA theme */}
        <Ionicons name="calendar" size={18} color={theme.colors.primary} />
        <Text style={styles.buttonText}>{formattedDate}</Text>
        <Text style={[styles.arrow, isExpanded && styles.arrowOpen]}>▼</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.calendarContainer}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePrevMonth}
              activeOpacity={0.7}
            >
              <Text style={styles.navArrow}>◀</Text>
            </TouchableOpacity>

            <Text style={styles.monthYear}>
              {monthNames[currentMonth]} {currentYear}
            </Text>

            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNextMonth}
              activeOpacity={0.7}
            >
              <Text style={styles.navArrow}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Day of Week Headers */}
          <View style={styles.daysHeader}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day === null && styles.emptyCell,
                  day && isToday(day) && styles.todayCell,
                  day && isSelected(day) && styles.selectedCell,
                ]}
                onPress={() => day && handleDateSelect(day)}
                activeOpacity={day ? 0.7 : 1}
                disabled={!day}
              >
                {day && (
                  <Text
                    style={[
                      styles.dayText,
                      isToday(day) && styles.todayText,
                      isSelected(day) && styles.selectedText,
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Today Button */}
          <TouchableOpacity
            style={styles.todayButton}
            onPress={handleToday}
            activeOpacity={0.7}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',                        // Center the button horizontally
    marginVertical: theme.spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,                       // PWA: compact horizontal padding
    paddingVertical: 10,                         // PWA: compact vertical padding
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,               // 8px rounded corners
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: 8,                                      // Gap between icon, text, arrow
    ...theme.shadows.sm,                         // Subtle shadow like PWA
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',                           // Medium weight
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginLeft: 2,
  },
  arrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  calendarContainer: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,               // 12px rounded
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: 12,
    maxWidth: 280,                               // Compact width like PWA
    width: '100%',
    ...theme.shadows.md,                         // Slightly more shadow for flyout
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  navButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  navArrow: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  monthYear: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
    justifyContent: 'space-between',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    lineHeight: 14,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 2,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  todayCell: {
    backgroundColor: theme.colors.primaryLight,
  },
  selectedCell: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  todayText: {
    color: theme.colors.text.secondary,
  },
  selectedText: {
    color: theme.colors.text.onPrimary,
    fontWeight: '700',
  },
  todayButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
