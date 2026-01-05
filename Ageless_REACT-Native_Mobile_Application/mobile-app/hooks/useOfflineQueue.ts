import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineEntry {
  path: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  ts: number;
}

const STORAGE_KEY = 'ft.outbox';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load queue on mount
  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.error('[useOfflineQueue] Failed to load queue:', error);
    }
  };

  const getQueue = useCallback(async (): Promise<OfflineEntry[]> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[useOfflineQueue] Failed to retrieve queue:', error);
      return [];
    }
  }, []);

  const enqueue = useCallback(
    async (entry: Omit<OfflineEntry, 'ts'>) => {
      try {
        const newEntry: OfflineEntry = {
          ...entry,
          ts: Date.now(),
        };

        const currentQueue = await getQueue();
        
        // Deduplicate by date if present in body
        let updatedQueue = [...currentQueue];
        
        if (newEntry.body && typeof newEntry.body.date === 'string') {
          const dateToUpdate = newEntry.body.date;
          // Remove any existing entry for this date
          updatedQueue = updatedQueue.filter(item => {
            if (item.body && typeof item.body.date === 'string') {
              return item.body.date !== dateToUpdate;
            }
            return true;
          });
        }

        updatedQueue.push(newEntry);
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
        setQueue(updatedQueue);
        console.log('[useOfflineQueue] Enqueued entry:', newEntry);
      } catch (error) {
        console.error('[useOfflineQueue] Failed to enqueue:', error);
      }
    },
    [getQueue]
  );

  const clearQueue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setQueue([]);
    } catch (error) {
      console.error('[useOfflineQueue] Failed to clear queue:', error);
    }
  }, []);

  const removeEntry = useCallback(async (ts: number) => {
    try {
      const currentQueue = await getQueue();
      const updatedQueue = currentQueue.filter(entry => entry.ts !== ts);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
      setQueue(updatedQueue);
    } catch (error) {
      console.error('[useOfflineQueue] Failed to remove entry:', error);
    }
  }, [getQueue]);

  return {
    queue,
    enqueue,
    getQueue,
    clearQueue,
    removeEntry,
    isSyncing,
    setIsSyncing
  };
}
