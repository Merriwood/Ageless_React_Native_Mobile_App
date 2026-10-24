/**
 * Date Utilities for Week-Based Calculations
 * Weeks are defined as: Sunday (start) to Saturday (end)
 *
 * Usage throughout the application:
 * - Progress Summary: Show week ranges as "Sun Date - Sat Date, Year"
 * - Weekly totals: Aggregate data for complete weeks (Sunday-Saturday)
 * - Date references: Always reference week by Sunday-Saturday boundaries
 */

/**
 * Format a date as YYYY-MM-DD using the device's LOCAL calendar date.
 *
 * Use this (not toISOString) for any date sent to or matched against the API.
 * toISOString() converts to UTC first, so in US Eastern time any moment after
 * 8 pm EDT / 7 pm EST becomes the NEXT day — which made the Progress Summary
 * look up Monday-keyed weeks that don't exist and show all zeros.
 *
 * @example
 * // 2026-10-23 21:00 EDT
 * toLocalDateKey(new Date(2026, 9, 23, 21)) // '2026-10-23' (toISOString gives '2026-10-24')
 */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the Sunday of the week for a given date
 * Weeks run Sunday (0) to Saturday (6)
 *
 * @param date - Any date within the week
 * @returns The Sunday of that week (00:00:00)
 *
 * @example
 * const date = new Date('2026-01-09'); // Friday
 * getSundayOfWeek(date) // Returns 2026-01-04 (Sunday)
 */
export function getSundayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day; // Calculate difference to get to Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Set to start of day
  return d;
}

/**
 * Get the Saturday of the week for a given date
 * Weeks run Sunday (0) to Saturday (6)
 *
 * @param date - Any date within the week
 * @returns The Saturday of that week (00:00:00)
 *
 * @example
 * const date = new Date('2026-01-09'); // Friday
 * getSaturdayOfWeek(date) // Returns 2026-01-10 (Saturday)
 */
export function getSaturdayOfWeek(date: Date): Date {
  const sunday = getSundayOfWeek(date);
  const saturday = new Date(sunday);
  saturday.setDate(saturday.getDate() + 6); // Sunday + 6 days = Saturday
  saturday.setHours(0, 0, 0, 0); // Set to start of day
  return saturday;
}

/**
 * Format a week date range as "MMM D - MMM D, YYYY"
 * Input: any date in the week
 * Output: Sunday to Saturday range of that week
 *
 * @param date - Any date within the week
 * @returns Formatted string like "Jan 4 - Jan 10, 2026"
 *
 * @example
 * const date = new Date('2026-01-09'); // Friday
 * formatWeekRange(date) // Returns "Jan 4 - Jan 10, 2026"
 */
export function formatWeekRange(date: Date): string {
  const sunday = getSundayOfWeek(date);
  const saturday = getSaturdayOfWeek(date);

  const startMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = sunday.getDate();
  const endMonth = saturday.toLocaleDateString('en-US', { month: 'short' });
  const endDay = saturday.getDate();
  const year = saturday.getFullYear();

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

/**
 * Get an array of 52 weeks ending with the current week
 * Each week starts on Sunday and ends on Saturday
 * Ordered from current week (index 0) to 52 weeks ago (index 51)
 *
 * @returns Array of week objects with sunday, saturday, and label
 *
 * @example
 * const weeks = get52WeekRanges();
 * weeks[0].label // Current week: "Jan 4 - Jan 10, 2026"
 * weeks[51].label // 52 weeks ago: "Jan 5 - Jan 11, 2025"
 */
export function get52WeekRanges(): Array<{
  sunday: Date;
  saturday: Date;
  label: string;
  weekIndex: number; // 0 = current week, 1 = last week, ..., 51 = 52 weeks ago
}> {
  const weeks = [];
  const today = new Date();

  for (let i = 0; i < 52; i++) {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - i * 7);

    const sunday = getSundayOfWeek(weekDate);
    const saturday = getSaturdayOfWeek(weekDate);
    const label = formatWeekRange(weekDate);

    weeks.push({
      sunday,
      saturday,
      label,
      weekIndex: i,
    });
  }

  return weeks;
}

/**
 * Get the week index (0-51) for a given date
 * 0 = current week, 51 = 52 weeks ago
 *
 * @param date - The date to find the week index for
 * @returns Week index (0-51), or -1 if date is more than 52 weeks old
 *
 * @example
 * const weekIndex = getWeekIndex(new Date()); // Returns 0 (current week)
 */
export function getWeekIndex(date: Date): number {
  const today = new Date();
  const todaysSunday = getSundayOfWeek(today);
  const dateSunday = getSundayOfWeek(date);

  const diffMs = todaysSunday.getTime() - dateSunday.getTime();
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks < 0 || diffWeeks > 51) {
    return -1; // Date is outside 52-week range
  }

  return diffWeeks;
}

/**
 * Check if a date falls within a specific week (Sunday-Saturday)
 *
 * @param date - The date to check
 * @param weekDate - Any date within the week to check
 * @returns true if date falls in the same week
 *
 * @example
 * const monday = new Date('2026-01-05');
 * const friday = new Date('2026-01-09');
 * isInSameWeek(monday, friday) // Returns true (same week)
 */
export function isInSameWeek(date: Date, weekDate: Date): boolean {
  const sunday1 = getSundayOfWeek(date);
  const sunday2 = getSundayOfWeek(weekDate);
  return sunday1.getTime() === sunday2.getTime();
}

/**
 * Get the start of a specific week (Sunday 00:00:00)
 * Useful for API queries and data aggregation
 *
 * @param weekIndex - Week index (0 = current week, 51 = 52 weeks ago)
 * @returns Sunday of that week at 00:00:00
 */
export function getWeekStartDate(weekIndex: number): Date {
  const today = new Date();
  const date = new Date(today);
  date.setDate(date.getDate() - weekIndex * 7);
  return getSundayOfWeek(date);
}

/**
 * Get the end of a specific week (Saturday 23:59:59)
 * Useful for API queries and data aggregation
 *
 * @param weekIndex - Week index (0 = current week, 51 = 52 weeks ago)
 * @returns Saturday of that week at 23:59:59
 */
export function getWeekEndDate(weekIndex: number): Date {
  const today = new Date();
  const date = new Date(today);
  date.setDate(date.getDate() - weekIndex * 7);
  const saturday = getSaturdayOfWeek(date);
  saturday.setHours(23, 59, 59, 999);
  return saturday;
}
