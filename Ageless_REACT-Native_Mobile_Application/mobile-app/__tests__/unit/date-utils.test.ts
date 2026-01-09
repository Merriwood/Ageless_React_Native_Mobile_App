/**
 * Unit tests for date-utils.ts
 * Validates Sunday-Saturday week boundary calculations
 */

import {
  getSundayOfWeek,
  getSaturdayOfWeek,
  formatWeekRange,
  get52WeekRanges,
  getWeekIndex,
  isInSameWeek,
  getWeekStartDate,
  getWeekEndDate,
} from '../../lib/date-utils';

describe('date-utils: Week Boundary Calculations', () => {

  describe('getSundayOfWeek()', () => {
    it('should return Sunday for a date in the middle of the week', () => {
      // Jan 9, 2026 is a Friday
      const date = new Date('2026-01-09T12:00:00Z');
      const result = getSundayOfWeek(date);

      expect(result.getDay()).toBe(0); // 0 = Sunday
      const resultDate = result.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      expect(resultDate).toBe('2026-01-04');
    });

    it('should return the same date if input is already Sunday', () => {
      // Jan 4, 2026 is a Sunday
      const date = new Date('2026-01-04T12:00:00Z');
      const result = getSundayOfWeek(date);

      expect(result.getDay()).toBe(0);
      const resultDate = result.toLocaleDateString('en-CA');
      expect(resultDate).toBe('2026-01-04');
    });

    it('should handle year boundary correctly', () => {
      // Jan 2, 2026 is a Friday (week starts Dec 28, 2025)
      const date = new Date('2026-01-02T12:00:00Z');
      const result = getSundayOfWeek(date);

      expect(result.getDay()).toBe(0);
      const resultDate = result.toLocaleDateString('en-CA');
      expect(resultDate).toBe('2025-12-28');
    });
  });

  describe('getSaturdayOfWeek()', () => {
    it('should return Saturday for a date in the middle of the week', () => {
      // Jan 9, 2026 is a Friday
      const date = new Date('2026-01-09T12:00:00Z');
      const result = getSaturdayOfWeek(date);

      expect(result.getDay()).toBe(6); // 6 = Saturday
      const resultDate = result.toLocaleDateString('en-CA');
      expect(resultDate).toBe('2026-01-10');
    });

    it('should return the same date if input is already Saturday', () => {
      // Jan 10, 2026 is a Saturday
      const date = new Date('2026-01-10T12:00:00Z');
      const result = getSaturdayOfWeek(date);

      expect(result.getDay()).toBe(6);
      const resultDate = result.toLocaleDateString('en-CA');
      expect(resultDate).toBe('2026-01-10');
    });
  });

  describe('formatWeekRange()', () => {
    it('should format week range correctly', () => {
      // Jan 9, 2026 is a Friday (week is Jan 4-10)
      const date = new Date('2026-01-09T12:00:00Z');
      const result = formatWeekRange(date);

      expect(result).toBe('Jan 4 - Jan 10, 2026');
    });

    it('should format correctly when start and end months differ', () => {
      // Dec 29, 2025 is a Monday (week is Dec 28, 2025 - Jan 3, 2026)
      const date = new Date('2025-12-29T12:00:00Z');
      const result = formatWeekRange(date);

      expect(result).toMatch(/^Dec \d+ - Jan \d+, \d{4}$/);
    });
  });

  describe('isInSameWeek()', () => {
    it('should return true for dates in the same week', () => {
      const monday = new Date('2026-01-05T12:00:00Z');
      const friday = new Date('2026-01-09T12:00:00Z');

      expect(isInSameWeek(monday, friday)).toBe(true);
    });

    it('should return false for dates in different weeks', () => {
      // Jan 10 (Saturday) is end of week 1
      // Jan 11 (Sunday) is start of week 2
      const saturday = new Date('2026-01-10T12:00:00Z');
      const sunday = new Date('2026-01-11T12:00:00Z');

      expect(isInSameWeek(saturday, sunday)).toBe(false);
    });
  });

  describe('get52WeekRanges()', () => {
    it('should return array of 52 weeks', () => {
      const weeks = get52WeekRanges();
      expect(weeks).toHaveLength(52);
    });

    it('should have week 0 as current week', () => {
      const weeks = get52WeekRanges();
      expect(weeks[0].weekIndex).toBe(0);
    });

    it('should have week 51 as 52 weeks ago', () => {
      const weeks = get52WeekRanges();
      expect(weeks[51].weekIndex).toBe(51);
    });

    it('should have all weeks properly formatted', () => {
      const weeks = get52WeekRanges();
      weeks.forEach(week => {
        expect(week.label).toMatch(/^[A-Z][a-z]{2} \d+ - [A-Z][a-z]{2} \d+, \d{4}$/);
        expect(week.sunday.getDay()).toBe(0);
        expect(week.saturday.getDay()).toBe(6);
      });
    });
  });

  describe('getWeekIndex()', () => {
    it('should return 0 for current week', () => {
      const today = new Date();
      expect(getWeekIndex(today)).toBe(0);
    });

    it('should return 1 for last week', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      expect(getWeekIndex(lastWeek)).toBe(1);
    });

    it('should return -1 for dates outside 52-week range', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      expect(getWeekIndex(twoYearsAgo)).toBe(-1);
    });
  });

  describe('getWeekStartDate() and getWeekEndDate()', () => {
    it('should return correct start date for week 0', () => {
      const startDate = getWeekStartDate(0);
      expect(startDate.getDay()).toBe(0); // Sunday
    });

    it('should return correct end date for week 0', () => {
      const endDate = getWeekEndDate(0);
      expect(endDate.getDay()).toBe(6); // Saturday
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
    });

    it('should return correct dates for week 1 (last week)', () => {
      const startDate = getWeekStartDate(1);
      const endDate = getWeekEndDate(1);
      const today = new Date();

      // Should be 7 days before current week
      const expectedStart = new Date(today);
      expectedStart.setDate(expectedStart.getDate() - 7);

      // Verify it's the Sunday of that week
      expect(startDate.getDay()).toBe(0);
      expect(endDate.getDay()).toBe(6);
    });
  });
});

describe('date-utils: Edge Cases', () => {
  it('should handle leap year dates correctly', () => {
    // Feb 29, 2024 (leap year) is a Thursday
    const date = new Date('2024-02-29T12:00:00Z');
    const sunday = getSundayOfWeek(date);
    expect(sunday.getDay()).toBe(0);
    const resultDate = sunday.toLocaleDateString('en-CA');
    expect(resultDate).toBe('2024-02-25');
  });

  it('should handle year boundary correctly', () => {
    // Dec 31, 2025 is a Tuesday
    const date = new Date('2025-12-31T12:00:00Z');
    const sunday = getSundayOfWeek(date);
    const resultDate = sunday.toLocaleDateString('en-CA');
    expect(resultDate).toBe('2025-12-28');
  });

  it('should handle month boundary correctly', () => {
    // Jan 31, 2026 is a Saturday
    const date = new Date('2026-01-31T12:00:00Z');
    const saturday = getSaturdayOfWeek(date);
    const resultDate = saturday.toLocaleDateString('en-CA');
    expect(resultDate).toBe('2026-01-31');
  });
});
