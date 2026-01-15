/**
 * useOfflineQueue Hook - Offline Data Queue Management
 *
 * Purpose: Manage offline workout entries that will be synced when connection restored
 * Storage: localStorage key 'ft.outbox'
 * Behavior: Deduplicates by date (same date replaces older entry)
 *
 * Source of Truth: claude.md Section 20.1.A
 */

import { useState, useCallback, useEffect } from 'react';

export interface OfflineEntry {
  path: string; // API endpoint (e.g., '/api/entries')
  method: 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  ts: number; // Timestamp when queued
}

const STORAGE_KEY = 'ft.outbox';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Get current queue from localStorage
   */
  const getQueue = useCallback((): OfflineEntry[] => {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[useOfflineQueue] Failed to retrieve queue:', error);
      return [];
    }
  }, []);

  /**
   * Enqueue a new offline entry
   * Deduplicates by date: same date replaces older entry
   */
  const enqueue = useCallback(
    (entry: Omit<OfflineEntry, 'ts'>) => {
      try {
        if (typeof window === 'undefined') return;

        const newEntry: OfflineEntry = {
          ...entry,
          ts: Date.now(),
        };

        let currentQueue = getQueue();

        // Deduplication: if entry has a date in body, check for existing entry with same date
        if (entry.body && typeof entry.body.date === 'string') {
          const newDate = entry.body.date;
          currentQueue = currentQueue.filter((e) => {
            // Remove entries with same date (will replace with new one)
            return !(
              e.body &&
              typeof e.body.date === 'string' &&
              e.body.date === newDate
            );
          });
        }

        // Add new entry
        currentQueue.push(newEntry);

        // Persist to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentQueue));
        setQueue(currentQueue);

        console.log('[useOfflineQueue] Entry queued:', newEntry);
      } catch (error) {
        console.error('[useOfflineQueue] Failed to enqueue entry:', error);
      }
    },
    [getQueue]
  );

  /**
   * Sync queued entries
   * Processes in chronological order (oldest first)
   * Removes on success, keeps on failure for retry
   */
  const sync = useCallback(async () => {
    if (isSyncing || typeof window === 'undefined') return;

    setIsSyncing(true);
    let currentQueue = getQueue();

    if (currentQueue.length === 0) {
      setIsSyncing(false);
      return;
    }

    // Sort by timestamp (chronological order)
    currentQueue = currentQueue.sort((a, b) => a.ts - b.ts);

    let successCount = 0;
    let failureCount = 0;
    const updatedQueue: OfflineEntry[] = [];

    for (const entry of currentQueue) {
      try {
        console.log('[useOfflineQueue] Syncing:', entry.path, entry.method);

        const response = await fetch(entry.path, {
          method: entry.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: entry.body ? JSON.stringify(entry.body) : undefined,
        });

        if (response.ok) {
          console.log('[useOfflineQueue] Sync success:', entry.path);
          successCount++;
          // Don't add to updatedQueue (removes from queue)
        } else {
          console.warn('[useOfflineQueue] Sync failed (status):', response.status);
          failureCount++;
          updatedQueue.push(entry); // Keep failed entry for retry
        }
      } catch (error) {
        console.error('[useOfflineQueue] Sync error:', error);
        failureCount++;
        updatedQueue.push(entry); // Keep failed entry for retry
      }
    }

    // Update queue with remaining entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
    setQueue(updatedQueue);
    setIsSyncing(false);

    console.log(
      `[useOfflineQueue] Sync complete: ${successCount} success, ${failureCount} failed, ${updatedQueue.length} remaining`
    );

    return { successCount, failureCount, remainingCount: updatedQueue.length };
  }, [getQueue, isSyncing]);

  /**
   * Clear all queued entries
   */
  const clear = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(STORAGE_KEY);
      setQueue([]);
      console.log('[useOfflineQueue] Queue cleared');
    } catch (error) {
      console.error('[useOfflineQueue] Failed to clear queue:', error);
    }
  }, []);

  /**
   * Initialize queue from localStorage on mount
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initialQueue = getQueue();
    setQueue(initialQueue);
  }, [getQueue]);

  /**
   * Listen to online event and sync
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      console.log('[useOfflineQueue] Online event detected');
      await sync();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [sync]);

  return {
    queue,
    getQueue,
    enqueue,
    sync,
    clear,
    isSyncing,
  };
}
