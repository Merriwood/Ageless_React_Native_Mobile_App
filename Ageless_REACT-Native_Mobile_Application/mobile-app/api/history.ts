/**
 * History API Module
 *
 * Handles historical entries retrieval for the History screen
 * Implements pagination and caching
 * Reuses entries endpoint but with pagination focus
 */

import { client } from './client';
import { WorkoutEntry } from './entries';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface HistoryPageResponse {
  entries: WorkoutEntry[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
}

export interface FilterOptions {
  sortBy?: 'date' | 'createdAt'; // date (default), createdAt
  sortOrder?: 'asc' | 'desc'; // desc (default, newest first)
  exerciseFilter?: string; // Filter by exercise name (optional)
}

// ============================================================================
// PAGINATION STATE
// ============================================================================

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  entries: WorkoutEntry[];
  hasMore: boolean;
}

let paginationState: PaginationState = {
  currentPage: 0,
  pageSize: 30,
  total: 0,
  entries: [],
  hasMore: true,
};

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

// Cache TTL for history pages (10 minutes)
const CACHE_TTL_HISTORY = 10 * 60 * 1000; // 10 minutes

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

export const historyAPI = {
  /**
   * Get paginated history entries
   *
   * Cache: 10 minutes per page
   * Dedup: 2 seconds
   *
   * @param page - Page number (0-indexed)
   * @param pageSize - Items per page (default: 30)
   * @param options - Filtering and sorting options
   */
  async getHistory(
    page: number = 0,
    pageSize: number = 30,
    options?: FilterOptions
  ): Promise<HistoryPageResponse> {
    const cacheKey = `history:${page}:${pageSize}:${JSON.stringify(options || {})}`;

    // Check cache first
    const cached = cacheManager.get<HistoryPageResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate offset
    const offset = page * pageSize;

    // Build query parameters
    const params: any = {
      limit: pageSize,
      offset,
    };

    // Add optional filters
    if (options?.sortBy) {
      params.sortBy = options.sortBy;
    }
    if (options?.sortOrder) {
      params.sortOrder = options.sortOrder;
    }
    if (options?.exerciseFilter) {
      params.exercise = options.exerciseFilter;
    }

    // Deduplicate simultaneous requests
    const dedupKey = getDedupKey('GET', '/api/entries', params);

    const response = await getDedupedRequest(dedupKey, async () => {
      interface EntriesResponse { entries: WorkoutEntry[]; total: number; hasMore: boolean }
      const result = await client.get<EntriesResponse>('/api/entries', { params });

      return {
        entries: result.entries || [],
        total: result.total || 0,
        hasMore: result.hasMore || false,
        currentPage: page,
        pageSize,
      } as HistoryPageResponse;
    });

    // Cache the result
    cacheManager.set(cacheKey, response, CACHE_TTL_HISTORY);

    return response;
  },

  /**
   * Load next page of history (for pagination)
   * Automatically manages page counter
   */
  async loadNextPage(
    pageSize: number = 30,
    options?: FilterOptions
  ): Promise<HistoryPageResponse> {
    const nextPage = paginationState.currentPage + 1;
    const response = await this.getHistory(nextPage, pageSize, options);

    // Update pagination state
    paginationState.currentPage = nextPage;
    paginationState.pageSize = pageSize;
    paginationState.entries.push(...response.entries);
    paginationState.total = response.total;
    paginationState.hasMore = response.hasMore;

    return response;
  },

  /**
   * Reset pagination state (call when user navigates away from history)
   */
  resetPagination(): void {
    paginationState = {
      currentPage: 0,
      pageSize: 30,
      total: 0,
      entries: [],
      hasMore: true,
    };
  },

  /**
   * Get current pagination state
   */
  getPaginationState(): PaginationState {
    return { ...paginationState };
  },

  /**
   * Utility: Clear history cache
   * Called when entries are saved/deleted to keep history fresh
   */
  clearCache(): void {
    cacheManager.invalidate('history:.*');
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default historyAPI;
