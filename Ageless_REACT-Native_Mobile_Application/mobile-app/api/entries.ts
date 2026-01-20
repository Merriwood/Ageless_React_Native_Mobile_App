/**
 * Entries API Module
 *
 * Handles all workout entry CRUD operations
 * Integrates with backend /api/entries endpoint
 * Implements caching, deduplication, and error handling
 */

import { client } from './client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Exercise {
  [exerciseName: string]: number; // exerciseName -> set count
}

export interface WorkoutEntry {
  id: string;
  userId: string;
  date: string; // ISO date format: YYYY-MM-DD
  exercises: Exercise;
  weight?: number; // Optional: user's body weight
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface EntriesResponse {
  entries: WorkoutEntry[];
  total: number;
  hasMore: boolean;
}

export interface EntryResponse {
  success: boolean;
  data: WorkoutEntry;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
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
    // Invalidate all cache entries matching pattern
    // E.g., invalidate('entry:*') clears all entry caches
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

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  ENTRY: 1 * 60 * 60 * 1000, // 1 hour for single entry
  ENTRIES_LIST: 5 * 60 * 1000, // 5 minutes for entries list
};

// ============================================================================
// DEDUPLICATION
// ============================================================================

type PendingRequest = {
  promise: Promise<any>;
  timer: NodeJS.Timeout;
};

const pendingRequests = new Map<string, PendingRequest>();

function getDedupKey(method: string, url: string, body?: any): string {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${method}:${url}:${bodyStr}`;
}

function getDedupedRequest<T>(
  key: string,
  request: () => Promise<T>,
  durationMs: number = 2000
): Promise<T> {
  // Return existing pending request if available
  const existing = pendingRequests.get(key);
  if (existing) {
    return existing.promise;
  }

  // Create new request
  const promise = request();

  // Clear dedup after duration
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

export const entriesAPI = {
  /**
   * Get all entries for current user (paginated)
   *
   * Cache: 5 minutes (updated on save/delete)
   * Dedup: 2 seconds
   */
  async getEntries(limit: number = 30, offset: number = 0): Promise<EntriesResponse> {
    const cacheKey = `entries:${limit}:${offset}`;

    // Check cache first
    const cached = cacheManager.get<EntriesResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Deduplicate simultaneous requests
    const dedupKey = getDedupKey('GET', '/api/entries', { limit, offset });

    return getDedupedRequest(dedupKey, async () => {
      const response = await client.get<EntriesResponse>('/api/entries', {
        params: { limit, offset },
      });

      // Cache the result
      cacheManager.set(cacheKey, response.data, CACHE_TTL.ENTRIES_LIST);

      return response.data;
    });
  },

  /**
   * Get single day's entry
   *
   * Cache: 1 hour
   * Dedup: 2 seconds
   *
   * @param date - ISO date format (YYYY-MM-DD)
   */
  async getEntry(date: string): Promise<WorkoutEntry | null> {
    const cacheKey = `entry:${date}`;

    // Check cache first
    const cached = cacheManager.get<WorkoutEntry | null>(cacheKey);
    if (cached !== null) {
      console.log('[entriesAPI.getEntry] Returning from cache:', { date, cached });
      return cached;
    }

    // Deduplicate simultaneous requests
    const dedupKey = getDedupKey('GET', `/api/entries/${date}`);

    try {
      console.log('[entriesAPI.getEntry] Fetching from server:', { date, dedupKey });
      return await getDedupedRequest(dedupKey, async () => {
        const response = await client.get<WorkoutEntry>(`/api/entries/${date}`);
        console.log('[entriesAPI.getEntry] Server response:', { date, data: response.data });

        // Cache the result
        cacheManager.set(cacheKey, response.data, CACHE_TTL.ENTRY);

        return response.data;
      });
    } catch (error: any) {
      console.error('[entriesAPI.getEntry] Error:', { date, status: error.response?.status, message: error.message });
      // 404 means no entry for this date (valid scenario)
      if (error.response?.status === 404) {
        console.log('[entriesAPI.getEntry] No entry found (404) - returning null');
        cacheManager.set(cacheKey, null, CACHE_TTL.ENTRY);
        return null;
      }
      throw error;
    }
  },

  /**
   * Save entry (create or update)
   *
   * Always sends to backend (no cache)
   * Invalidates cache after success
   *
   * @param date - ISO date format (YYYY-MM-DD)
   * @param exercises - Exercise name -> set count mapping
   * @param weight - Optional body weight
   */
  async saveEntry(
    date: string,
    exercises: Exercise,
    weight?: number
  ): Promise<WorkoutEntry> {
    const payload = {
      date,
      exercises,
      ...(weight !== undefined && { weight }),
    };

    console.log('[entriesAPI.saveEntry] Saving entry:', { payload });

    const dedupKey = getDedupKey('POST', '/api/entries', payload);

    try {
      const response = await getDedupedRequest(dedupKey, async () => {
        console.log('[entriesAPI.saveEntry] Posting to server:', { url: '/api/entries', payload });
        const result = await client.post<WorkoutEntry>('/api/entries', payload);
        console.log('[entriesAPI.saveEntry] Server response:', { result: result.data });
        return result;
      });

      console.log('[entriesAPI.saveEntry] Invalidating caches for date:', date);
      // Invalidate caches after successful save
      cacheManager.invalidate('entries:.*');
      cacheManager.invalidate(`entry:${date}`);

      return response.data;
    } catch (error: any) {
      // Handle conflict (server has newer data)
      if (error.response?.status === 409) {
        const conflictData = error.response.data;
        const error409 = new Error('Server has newer data');
        (error409 as any).code = 'CONFLICT';
        (error409 as any).serverData = conflictData.data;
        throw error409;
      }
      throw error;
    }
  },

  /**
   * Delete entry
   *
   * Always sends to backend
   * Invalidates cache after success
   *
   * @param date - ISO date format (YYYY-MM-DD)
   */
  async deleteEntry(date: string): Promise<void> {
    const dedupKey = getDedupKey('DELETE', `/api/entries/${date}`);

    await getDedupedRequest(dedupKey, async () => {
      return await client.delete(`/api/entries/${date}`);
    });

    // Invalidate caches after successful delete
    cacheManager.invalidate('entries:.*');
    cacheManager.invalidate(`entry:${date}`);
  },

  /**
   * Utility: Clear all entry caches
   * Useful when user logs out or data is invalidated
   */
  clearCache(): void {
    cacheManager.invalidate('entry:.*');
    cacheManager.invalidate('entries:.*');
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default entriesAPI;
