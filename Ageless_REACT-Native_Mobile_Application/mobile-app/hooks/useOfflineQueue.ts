/**
 * useOfflineQueue Hook
 *
 * Comprehensive offline queue management with:
 * - AsyncStorage persistence
 * - Auth token integration (user mismatch validation)
 * - Conflict detection (409 handling)
 * - Selective retry strategy
 * - Auto-sync on login
 * - Max item limits and TTL
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';
import { useUI } from '../context/UIContext';
import { apiClient } from '../api/client';
import { mapError } from '../utils/errorHandler';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type QueueStatus = 'pending' | 'synced' | 'failed' | 'conflict';

export interface QueuedRequest {
  // Identification
  id: string; // Unique queue item ID (uuid)
  userId: string; // User who created the request (for user mismatch validation)
  timestamp: number; // When added to queue

  // Request data
  method: 'POST' | 'PUT' | 'DELETE';
  endpoint: string; // e.g., '/api/entries'
  date: string; // YYYY-MM-DD - for deduplication
  body?: {
    exercises: Record<string, any>;
    weight?: number;
  };

  // Status tracking
  status: QueueStatus;
  retryCount: number; // Current attempt (0 = never retried)
  maxRetries: number; // Max attempts (default: 5)
  lastRetryTime?: number; // When last retry was attempted

  // Conflict resolution
  conflictData?: {
    serverData: any; // Server's version when conflict occurred
    userChoice?: 'keep-local' | 'use-server'; // User's resolution choice
  };
}

export interface OfflineQueueState {
  items: QueuedRequest[];
  totalSize: number; // Count of items
  maxSize: number; // Max allowed items (500)
  syncInProgress: boolean;
  lastSyncTime?: number;
  pendingCount: number; // Count with status='pending'
  failedCount: number; // Count with status='failed'
  conflictCount: number; // Count with status='conflict'
}

export interface SyncResult {
  synced: number; // Successfully synced
  failed: number; // Failed to sync
  conflicts: number; // Conflicts detected
  errors: Array<{ itemId: string; error: string }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUEUE_STORAGE_KEY = 'offline_queue_v2';
const MAX_QUEUE_SIZE = 500;
const MAX_RETRIES = 5;
const ITEM_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Retry strategy: exponential backoff with jitter
const getRetryDelay = (attempt: number): number => {
  const baseDelay = 1000; // 1 second
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, 30000); // Cap at 30 seconds
  const jitter = Math.random() * 1000; // Add 0-1 second jitter
  return cappedDelay + jitter;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isItemExpired(item: QueuedRequest): boolean {
  return Date.now() - item.timestamp > ITEM_TTL;
}

function shouldRetryError(errorCode: string): boolean {
  // Retry on network/timeout errors, NOT on auth/validation errors
  return ['NO_INTERNET', 'TIMEOUT', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'].includes(errorCode);
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useOfflineQueue() {
  const { user } = useAuth();
  const { showToast } = useUI();

  // State
  const [queueState, setQueueState] = useState<OfflineQueueState>({
    items: [],
    totalSize: 0,
    maxSize: MAX_QUEUE_SIZE,
    syncInProgress: false,
    pendingCount: 0,
    failedCount: 0,
    conflictCount: 0,
  });

  // ========================================================================
  // LOAD QUEUE FROM ASYNCSTORAGE ON MOUNT
  // ========================================================================

  useEffect(() => {
    loadQueueFromStorage();
  }, []);

  // ========================================================================
  // AUTO-SYNC WHEN USER LOGS IN
  // ========================================================================

  useEffect(() => {
    if (user && queueState.pendingCount > 0) {
      syncQueue().catch((err) => {
        console.error('[useOfflineQueue] Auto-sync on login failed:', err);
      });
    }
  }, [user?.id]);

  // ========================================================================
  // PERSIST QUEUE WHENEVER IT CHANGES
  // ========================================================================

  useEffect(() => {
    if (queueState.items.length > 0) {
      persistQueueToStorage(queueState.items);
    }
  }, [queueState]);

  // ========================================================================
  // LOAD QUEUE FROM ASYNCSTORAGE
  // ========================================================================

  const loadQueueFromStorage = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const items: QueuedRequest[] = JSON.parse(stored);

        // Filter out expired items
        const validItems = items.filter(item => !isItemExpired(item));

        if (validItems.length !== items.length) {
          await persistQueueToStorage(validItems);
        }

        updateQueueState(validItems);
      }
    } catch (err) {
      console.error('[useOfflineQueue] Failed to load queue:', err);
    }
  }, []);

  // ========================================================================
  // PERSIST QUEUE TO ASYNCSTORAGE
  // ========================================================================

  const persistQueueToStorage = useCallback(async (items: QueuedRequest[]) => {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('[useOfflineQueue] Failed to persist queue:', err);
    }
  }, []);

  // ========================================================================
  // UPDATE QUEUE STATE WITH METRICS
  // ========================================================================

  const updateQueueState = useCallback((items: QueuedRequest[]) => {
    const pendingCount = items.filter(i => i.status === 'pending').length;
    const failedCount = items.filter(i => i.status === 'failed').length;
    const conflictCount = items.filter(i => i.status === 'conflict').length;

    setQueueState({
      items,
      totalSize: items.length,
      maxSize: MAX_QUEUE_SIZE,
      syncInProgress: false,
      pendingCount,
      failedCount,
      conflictCount,
    });
  }, []);

  // ========================================================================
  // ADD REQUEST TO QUEUE
  // ========================================================================

  const addToQueue = useCallback(
    async (
      method: 'POST' | 'PUT' | 'DELETE',
      endpoint: string,
      date: string,
      body?: QueuedRequest['body']
    ): Promise<string> => {
      if (!user?.id) {
        const msg = 'Must be logged in to queue requests';
        showToast(msg, 'error');
        throw new Error(msg);
      }

      // Check queue size
      if (queueState.totalSize >= MAX_QUEUE_SIZE) {
        const msg = 'Offline queue is full. Please sync before making more changes.';
        showToast(msg, 'error');
        throw new Error(msg);
      }

      const newItem: QueuedRequest = {
        id: generateId(),
        userId: user.id,
        timestamp: Date.now(),
        method,
        endpoint,
        date,
        body,
        status: 'pending',
        retryCount: 0,
        maxRetries: MAX_RETRIES,
      };

      // Deduplicate: remove any pending request for same date/endpoint
      let updatedItems = queueState.items.filter(
        item => !(item.date === date && item.endpoint === endpoint && item.status === 'pending')
      );

      updatedItems.push(newItem);
      updateQueueState(updatedItems);

      if (__DEV__) {
        console.log('[useOfflineQueue] Added to queue:', newItem.id);
      }

      return newItem.id;
    },
    [user?.id, queueState.totalSize, showToast]
  );

  // ========================================================================
  // SYNC QUEUE WITH BACKEND
  // ========================================================================

  const syncQueue = useCallback(async (): Promise<SyncResult> => {
    if (!user?.id) {
      throw new Error('Must be logged in to sync');
    }

    if (queueState.syncInProgress) {
      return { synced: 0, failed: 0, conflicts: 0, errors: [] };
    }

    setQueueState(prev => ({ ...prev, syncInProgress: true }));

    const result: SyncResult = {
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    };

    const pendingItems = queueState.items.filter(item => item.status === 'pending');

    if (pendingItems.length === 0) {
      setQueueState(prev => ({ ...prev, syncInProgress: false }));
      return result;
    }

    for (const item of pendingItems) {
      try {
        // User mismatch validation: only sync if user hasn't changed
        if (item.userId !== user.id) {
          setQueueState(prev => ({
            ...prev,
            items: prev.items.map(i =>
              i.id === item.id ? { ...i, status: 'failed' } : i
            ),
          }));
          result.failed++;
          result.errors.push({
            itemId: item.id,
            error: 'User changed - request invalid',
          });
          continue;
        }

        // Make request
        const config: any = {
          method: item.method,
          url: item.endpoint,
        };

        if (item.body) {
          config.data = item.body;
        }

        await apiClient(config);

        // Success: mark as synced
        setQueueState(prev => ({
          ...prev,
          items: prev.items.map(i =>
            i.id === item.id ? { ...i, status: 'synced' } : i
          ),
        }));
        result.synced++;

      } catch (err: any) {
        const mappedError = mapError(err);

        // Conflict: server has newer data
        if (mappedError.code === 'CONFLICT') {
          setQueueState(prev => ({
            ...prev,
            items: prev.items.map(i =>
              i.id === item.id
                ? {
                    ...i,
                    status: 'conflict',
                    conflictData: {
                      serverData: err.response?.data?.data,
                    },
                  }
                : i
            ),
          }));
          result.conflicts++;
          result.errors.push({
            itemId: item.id,
            error: 'Server has newer version',
          });
          continue;
        }

        // Authorization: don't retry
        if (mappedError.code === 'UNAUTHORIZED' || mappedError.code === 'FORBIDDEN') {
          setQueueState(prev => ({
            ...prev,
            items: prev.items.map(i =>
              i.id === item.id ? { ...i, status: 'failed' } : i
            ),
          }));
          result.failed++;
          result.errors.push({
            itemId: item.id,
            error: 'Authorization failed - request invalid',
          });
          continue;
        }

        // Retryable errors: schedule retry
        if (shouldRetryError(mappedError.code)) {
          const newRetryCount = item.retryCount + 1;
          if (newRetryCount <= MAX_RETRIES) {
            setQueueState(prev => ({
              ...prev,
              items: prev.items.map(i =>
                i.id === item.id
                  ? {
                      ...i,
                      retryCount: newRetryCount,
                      lastRetryTime: Date.now(),
                      status: 'pending', // Will retry later
                    }
                  : i
              ),
            }));
            result.failed++;
          } else {
            // Max retries exceeded
            setQueueState(prev => ({
              ...prev,
              items: prev.items.map(i =>
                i.id === item.id ? { ...i, status: 'failed' } : i
              ),
            }));
            result.failed++;
            result.errors.push({
              itemId: item.id,
              error: `Max retries exceeded: ${mappedError.message}`,
            });
          }
        } else {
          // Non-retryable error
          setQueueState(prev => ({
            ...prev,
            items: prev.items.map(i =>
              i.id === item.id ? { ...i, status: 'failed' } : i
            ),
          }));
          result.failed++;
          result.errors.push({
            itemId: item.id,
            error: mappedError.message,
          });
        }
      }
    }

    setQueueState(prev => ({
      ...prev,
      syncInProgress: false,
      lastSyncTime: Date.now(),
    }));

    // Show result toast
    if (result.synced > 0) {
      showToast(`Synced ${result.synced} item(s)`, 'success', 2000);
    }
    if (result.conflicts > 0) {
      showToast(`${result.conflicts} conflict(s) need resolution`, 'warning', 3000);
    }
    if (result.failed > 0 && result.errors.length > 0) {
      showToast(`${result.failed} item(s) failed to sync`, 'error', 3000);
    }

    return result;
  }, [user?.id, queueState.items, queueState.syncInProgress, showToast]);

  // ========================================================================
  // RESOLVE CONFLICT (USER CHOICE)
  // ========================================================================

  const resolveConflict = useCallback(
    async (
      itemId: string,
      choice: 'keep-local' | 'use-server'
    ): Promise<void> => {
      setQueueState(prev => ({
        ...prev,
        items: prev.items.map(i =>
          i.id === itemId
            ? {
                ...i,
                conflictData: {
                  ...i.conflictData,
                  userChoice: choice,
                },
                status: choice === 'keep-local' ? 'pending' : 'synced',
              }
            : i
        ),
      }));

      // If user chose to retry with local data, trigger sync
      if (choice === 'keep-local') {
        syncQueue().catch(err => {
          console.error('[useOfflineQueue] Retry after conflict resolution failed:', err);
        });
      }
    },
    [syncQueue]
  );

  // ========================================================================
  // REMOVE ITEM FROM QUEUE
  // ========================================================================

  const removeFromQueue = useCallback((itemId: string) => {
    setQueueState(prev => {
      const updatedItems = prev.items.filter(i => i.id !== itemId);
      const pendingCount = updatedItems.filter(i => i.status === 'pending').length;
      const failedCount = updatedItems.filter(i => i.status === 'failed').length;
      const conflictCount = updatedItems.filter(i => i.status === 'conflict').length;

      return {
        items: updatedItems,
        totalSize: updatedItems.length,
        maxSize: MAX_QUEUE_SIZE,
        syncInProgress: prev.syncInProgress,
        lastSyncTime: prev.lastSyncTime,
        pendingCount,
        failedCount,
        conflictCount,
      };
    });
  }, []);

  // ========================================================================
  // CLEAR ENTIRE QUEUE
  // ========================================================================

  const clearQueue = useCallback(async () => {
    setQueueState(prev => ({
      ...prev,
      items: [],
      totalSize: 0,
      pendingCount: 0,
      failedCount: 0,
      conflictCount: 0,
    }));
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }, []);

  // ========================================================================
  // GET PENDING ITEMS
  // ========================================================================

  const getPendingItems = useCallback(
    (): QueuedRequest[] => {
      return queueState.items.filter(i => i.status === 'pending');
    },
    [queueState.items]
  );

  // ========================================================================
  // GET CONFLICT ITEMS
  // ========================================================================

  const getConflictItems = useCallback(
    (): QueuedRequest[] => {
      return queueState.items.filter(i => i.status === 'conflict');
    },
    [queueState.items]
  );

  // ========================================================================
  // RETURN HOOK API
  // ========================================================================

  return {
    // State
    queue: queueState.items,
    state: queueState,

    // Actions
    addToQueue,
    removeFromQueue,
    clearQueue,
    syncQueue,
    resolveConflict,

    // Queries
    getPendingItems,
    getConflictItems,
  };
}
