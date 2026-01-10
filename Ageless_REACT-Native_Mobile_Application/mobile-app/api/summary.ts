/**
 * Summary API Module
 *
 * Handles workout statistics and summary endpoints
 * Implements aggressive caching (5 minutes)
 * Used for analytics and history screens
 */

import { client } from './client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WorkoutStats {
  exercises: Record<string, {
    sets: number;
    totalReps: number;
    avgSets: number;
    daysActive: number;
  }>;
  totalSets: number;
  totalWorkouts: number;
  daysActive: number;
  averageSetsPerDay: number;
  currentStreak: number; // Days in a row with workout
  personalBests: Record<string, number>; // Exercise -> max sets in one day
}

export interface SummaryResponse {
  success: boolean;
  data: {
    period: {
      startDate: string;
      endDate: string;
      dayCount: number;
    };
    stats: WorkoutStats;
    generatedAt: string;
  };
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const cacheManager = new CacheManager();

// Cache TTL for summaries (5 minutes - will be invalidated on entry save)
const CACHE_TTL_SUMMARY = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// DEDUPLICATION
// ============================================================================

type PendingRequest = {
  promise: Promise<any>;
  timer: NodeJS.Timeout;
};

const pendingRequests = new Map<string, PendingRequest>();

function getDedupKey(method: string, url: string, params?: any): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramsStr}`;
}

function getDedupedRequest<T>(
  key: string,
  request: () => Promise<T>,
  durationMs: number = 2000
): Promise<T> {
  const existing = pendingRequests.get(key);
  if (existing) {
    return existing.promise;
  }

  const promise = request();

  const timer = setTimeout(() => {
    pendingRequests.delete(key);
  }, durationMs);

  pendingRequests.set(key, { promise, timer });

  return promise.finally(() => {
    clearTimeout(timer);
    pendingRequests.delete(key);
  });
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const summaryAPI = {
  /**
   * Get workout summary/statistics for date range
   *
   * Cache: 5 minutes (invalidated when entries change)
   * Dedup: 2 seconds
   *
   * @param startDate - ISO date format (YYYY-MM-DD)
   * @param endDate - ISO date format (YYYY-MM-DD)
   */
  async getSummary(startDate: string, endDate: string): Promise<SummaryResponse['data']> {
    const cacheKey = `summary:${startDate}:${endDate}`;

    // Check cache first
    const cached = cacheManager.get<SummaryResponse['data']>(cacheKey);
    if (cached) {
      return cached;
    }

    // Deduplicate simultaneous requests
    const dedupKey = getDedupKey('GET', '/api/summary', { startDate, endDate });

    return getDedupedRequest(dedupKey, async () => {
      const response = await client.get<SummaryResponse>('/api/summary', {
        params: { startDate, endDate },
      });

      // Cache the result
      cacheManager.set(cacheKey, response.data.data, CACHE_TTL_SUMMARY);

      return response.data.data;
    });
  },

  /**
   * Get summary for current week
   * Convenience method - calculates dates automatically
   * Week boundaries: Sunday (start) to Saturday (end)
   *
   * @param referenceDate - Center date for week calculation (defaults to today)
   */
  async getWeekSummary(referenceDate?: Date): Promise<SummaryResponse['data']> {
    const today = referenceDate || new Date();

    // Find start of week (Sunday - day 0)
    const day = today.getDay();
    const diff = today.getDate() - day;
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    return this.getSummary(startDate, endDate);
  },

  /**
   * Get summary for current month
   * Convenience method - calculates dates automatically
   */
  async getMonthSummary(referenceDate?: Date): Promise<SummaryResponse['data']> {
    const today = referenceDate || new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return this.getSummary(startDateStr, endDateStr);
  },

  /**
   * Get summaries for all 52 weeks (52-week rolling window)
   * Used by Progress Summary screen to show year-long progress
   *
   * @param referenceDate - Center date for 52-week calculation (defaults to today)
   * @returns Array of week data matching WeekData interface structure
   */
  async get52WeekSummary(referenceDate?: Date) {
    const today = referenceDate || new Date();
    const weeks = [];

    // Fetch data for each of the 52 weeks (going back in time)
    for (let i = 0; i < 52; i++) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - i * 7);

      try {
        const summary = await this.getWeekSummary(weekDate);

        // Transform API response to WeekData format
        const weekData = {
          dateRange: this._formatWeekRange(weekDate),
          avgWeight: summary.stats.exercises['weight']?.avgSets || null,
          bike: summary.stats.exercises['bike']?.sets || 0,
          abs: summary.stats.exercises['abs']?.sets || 0,
          chestPress: summary.stats.exercises['chest press']?.sets || 0,
          legPress: summary.stats.exercises['leg press']?.sets || 0,
          lat: summary.stats.exercises['lat']?.sets || 0,
          military: summary.stats.exercises['military']?.sets || 0,
          crunch: summary.stats.exercises['crunch']?.sets || 0,
          bicepCurls: summary.stats.exercises['bicep curls']?.sets || 0,
          triceps: summary.stats.exercises['triceps']?.sets || 0,
          overheadPull: summary.stats.exercises['overhead pull']?.sets || 0,
          row: summary.stats.exercises['row']?.sets || 0,
          totalSets: summary.stats.totalSets || 0,
        };

        weeks.push(weekData);
      } catch (error) {
        // If a week fails, add empty week data to maintain 52-week structure
        weeks.push({
          dateRange: this._formatWeekRange(weekDate),
          avgWeight: null,
          bike: 0,
          abs: 0,
          chestPress: 0,
          legPress: 0,
          lat: 0,
          military: 0,
          crunch: 0,
          bicepCurls: 0,
          triceps: 0,
          overheadPull: 0,
          row: 0,
          totalSets: 0,
        });
      }
    }

    return weeks;
  },

  /**
   * Helper: Format week range as "MMM D - MMM D, YYYY" (Sunday to Saturday)
   * @internal
   */
  _formatWeekRange(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);

    const sunday = d;
    const saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6);

    const startMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
    const startDay = sunday.getDate();
    const endMonth = saturday.toLocaleDateString('en-US', { month: 'short' });
    const endDay = saturday.getDate();
    const year = saturday.getFullYear();

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  },

  /**
   * Utility: Clear summary cache
   * Called when entries are saved/deleted to keep summary fresh
   */
  clearCache(): void {
    cacheManager.invalidate('summary:.*');
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default summaryAPI;
