import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
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
        <Text style={styles.buttonIcon}>📅</Text>
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
    marginVertical: theme.spacing.base,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.base,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text.primary,
  },
  arrow: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    transition: 'all 0.12s ease-out',
  },
  arrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  calendarContainer: {
    marginTop: theme.spacing.base,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  navArrow: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  monthYear: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.base,
    justifyContent: 'space-between',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  dayCell: {
    width: '14.285%', // 7 columns per week
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
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
    fontSize: 14,
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
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
