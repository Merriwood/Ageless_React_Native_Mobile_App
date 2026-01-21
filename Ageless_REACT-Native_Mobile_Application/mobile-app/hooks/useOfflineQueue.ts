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

import { useState, useCallback, useEffect, useRef } from 'react';
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
    fitnessData: Record<string, any>;
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

  // CRITICAL FIX: Use a ref to always have access to current queue items
  // This prevents stale closure issues when syncQueue is called immediately after addToQueue
  // (React's setState is async, so queueState.items would be stale in syncQueue)
  const queueItemsRef = useRef<QueuedRequest[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    queueItemsRef.current = queueState.items;
  }, [queueState.items]);

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
        console.log('[useOfflineQueue] Loaded from storage:', {
          totalItems: items.length,
          sampleItem: items[0] ? {
            id: items[0].id,
            method: items[0].method,
            date: items[0].date,
            hasBody: !!items[0].body,
            bodyKeys: items[0].body ? Object.keys(items[0].body) : [],
            hasFitnessData: !!items[0].body?.fitnessData,
            fitnessDataKeys: items[0].body?.fitnessData ? Object.keys(items[0].body.fitnessData) : [],
          } : 'N/A',
        });

        // Filter out expired items
        const validItems = items.filter(item => !isItemExpired(item));

        if (validItems.length !== items.length) {
          console.log('[useOfflineQueue] Removed expired items:', {
            before: items.length,
            after: validItems.length,
          });
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

      // Deduplicate: remove ANY request (pending, synced, or failed) for same date/endpoint
      // This ensures we only have the latest version of data for each date
      
      // CRITICAL FIX: Update ref IMMEDIATELY (synchronously) so syncQueue can see the new item
      // This is necessary because React's setState is async - queueState.items would be stale
      const updatedItemsForRef = queueItemsRef.current.filter(
        item => !(item.date === date && item.endpoint === endpoint)
      );
      updatedItemsForRef.push(newItem);
      queueItemsRef.current = updatedItemsForRef;
      
      // Also update React state (async) for re-renders and persistence
      setQueueState(prev => {
        const updatedItems = prev.items.filter(
          item => !(item.date === date && item.endpoint === endpoint)
        );
        updatedItems.push(newItem);
        
        const pendingCount = updatedItems.filter(i => i.status === 'pending').length;
        const failedCount = updatedItems.filter(i => i.status === 'failed').length;
        const conflictCount = updatedItems.filter(i => i.status === 'conflict').length;
        
        return {
          ...prev,
          items: updatedItems,
          totalSize: updatedItems.length,
          pendingCount,
          failedCount,
          conflictCount,
        };
      });

      console.log('[useOfflineQueue] Added/updated item for', date, endpoint, '- ref now has', queueItemsRef.current.length, 'items');

      const fitnessData = newItem.body?.fitnessData || {};
      const fitnessDataKeys = Object.keys(fitnessData);
      console.log('[useOfflineQueue] Added to queue:', {
        id: newItem.id,
        method: newItem.method,
        endpoint: newItem.endpoint,
        date: newItem.date,
        hasBody: !!newItem.body,
        bodyKeys: newItem.body ? Object.keys(newItem.body) : [],
        hasFitnessData: !!newItem.body?.fitnessData,
        fitnessDataKeys,
        fitnessDataIsEmpty: fitnessDataKeys.length === 0,
        fitnessDataCount: fitnessDataKeys.length,
        fitnessDataJSON: JSON.stringify(fitnessData),
        fitnessDataValues: fitnessDataKeys.map(k => `${k}:${fitnessData[k]}`).join(', '),
        weight: newItem.body?.weight,
        fullBodyJSON: JSON.stringify(newItem.body),
      });

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

    // CRITICAL FIX: Use ref instead of queueState.items to avoid stale closure
    // When syncQueue is called immediately after addToQueue, queueState.items is stale
    // because React's setState is async. The ref is updated synchronously.
    const pendingItems = queueItemsRef.current.filter(item => item.status === 'pending');

    if (pendingItems.length === 0) {
      console.log('[useOfflineQueue.syncQueue] No pending items to sync (checked ref with', queueItemsRef.current.length, 'total items)');
      setQueueState(prev => ({ ...prev, syncInProgress: false }));
      return result;
    }

    console.log('[useOfflineQueue.syncQueue] Starting sync of', pendingItems.length, 'pending items (from ref):', {
      itemIds: pendingItems.map(i => i.id),
      dates: pendingItems.map(i => i.date),
      endpoints: pendingItems.map(i => i.endpoint),
    });

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

        // Make request based on method
        const requestBody = item.body ? { date: item.date, ...item.body } : undefined;

        const syncFitnessData = item.body?.fitnessData || {};
        const syncFitnessDataKeys = Object.keys(syncFitnessData);
        console.log('[useOfflineQueue.syncQueue] Syncing item:', {
          itemId: item.id,
          method: item.method,
          endpoint: item.endpoint,
          date: item.date,
          hasBody: !!item.body,
          bodyKeys: item.body ? Object.keys(item.body) : [],
          hasFitnessData: !!item.body?.fitnessData,
          fitnessDataKeys: syncFitnessDataKeys,
          fitnessDataIsEmpty: syncFitnessDataKeys.length === 0,
          fitnessDataCount: syncFitnessDataKeys.length,
          fitnessDataJSON: JSON.stringify(syncFitnessData),
          fitnessDataValues: syncFitnessDataKeys.map(k => `${k}:${syncFitnessData[k]}`).join(', '),
          weight: item.body?.weight,
          constructedRequestBody: JSON.stringify(requestBody),
        });

        switch (item.method) {
          case 'POST':
            console.log('[useOfflineQueue.syncQueue] Posting to', item.endpoint, 'with body:', requestBody);
            await apiClient.post(item.endpoint, requestBody);
            console.log('[useOfflineQueue.syncQueue] POST successful');
            break;
          case 'PUT':
            await apiClient.put(item.endpoint, requestBody);
            break;
          case 'DELETE':
            await apiClient.delete(item.endpoint);
            break;
        }

        // Success: mark as synced - update ref synchronously
        queueItemsRef.current = queueItemsRef.current.map(i =>
          i.id === item.id ? { ...i, status: 'synced' as const } : i
        );
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

    console.log('[useOfflineQueue.syncQueue] Sync complete:', {
      synced: result.synced,
      failed: result.failed,
      conflicts: result.conflicts,
      totalProcessed: result.synced + result.failed + result.conflicts,
    });

    // Clean up: Remove successfully synced items from queue to prevent stale data
    // CRITICAL FIX: Also update the ref synchronously
    const cleanedItems = queueItemsRef.current.filter(item => item.status !== 'synced');
    queueItemsRef.current = cleanedItems;
    
    setQueueState(prev => {
      const remainingItems = prev.items.filter(item => item.status !== 'synced');
      const pendingCount = remainingItems.filter(i => i.status === 'pending').length;
      const failedCount = remainingItems.filter(i => i.status === 'failed').length;
      const conflictCount = remainingItems.filter(i => i.status === 'conflict').length;
      
      console.log('[useOfflineQueue.syncQueue] Cleaned up synced items:', {
        before: prev.items.length,
        after: remainingItems.length,
        removed: prev.items.length - remainingItems.length,
      });
      
      return {
        ...prev,
        items: remainingItems,
        totalSize: remainingItems.length,
        pendingCount,
        failedCount,
        conflictCount,
        syncInProgress: false,
        lastSyncTime: Date.now(),
      };
    });

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
