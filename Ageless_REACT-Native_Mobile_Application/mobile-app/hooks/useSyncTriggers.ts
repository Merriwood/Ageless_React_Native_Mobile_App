/**
 * useSyncTriggers Hook
 *
 * Manages background sync triggers:
 * - Network state change (online/offline)
 * - App state change (foreground/background)
 * - Periodic interval (5 minutes)
 * - Manual trigger
 *
 * Integrates with useOfflineQueue for automatic syncing
 */

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineQueue } from './useOfflineQueue';
import { useNetwork } from '../context/UIContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SyncTriggerConfig {
  enableNetworkSync: boolean; // Sync when network comes online
  enableAppStateSync: boolean; // Sync when app becomes active
  enablePeriodicSync: boolean; // Sync every 5 minutes
  periodicSyncInterval: number; // Milliseconds (default: 5 min)
  minSyncInterval: number; // Don't sync more frequently than this (default: 30s)
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: SyncTriggerConfig = {
  enableNetworkSync: true,
  enableAppStateSync: true,
  enablePeriodicSync: true,
  periodicSyncInterval: 5 * 60 * 1000, // 5 minutes
  minSyncInterval: 30 * 1000, // 30 seconds
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useSyncTriggers(config: Partial<SyncTriggerConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { syncQueue, getPendingItems } = useOfflineQueue();
  const { isOnline } = useNetwork();

  // Track last sync time to avoid syncing too frequently
  const lastSyncTimeRef = useRef<number>(0);
  const appStateSubscriptionRef = useRef<any>(null);
  const networkSubscriptionRef = useRef<any>(null);
  const periodicSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  // ========================================================================
  // PERFORM SYNC (WITH DEBOUNCING)
  // ========================================================================

  const performSync = useCallback(
    async (trigger: 'network' | 'appstate' | 'periodic' | 'manual') => {
      // Prevent concurrent syncs
      if (isSyncingRef.current) {
        if (__DEV__) {
          console.log('[useSyncTriggers] Sync already in progress, skipping');
        }
        return;
      }

      // Respect minimum sync interval
      const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
      if (timeSinceLastSync < finalConfig.minSyncInterval && trigger !== 'manual') {
        if (__DEV__) {
          console.log(
            `[useSyncTriggers] Sync blocked - only ${timeSinceLastSync}ms since last sync`
          );
        }
        return;
      }

      // Check if there are pending items to sync
      const pendingItems = getPendingItems();
      if (pendingItems.length === 0) {
        if (__DEV__) {
          console.log('[useSyncTriggers] No pending items, skipping sync');
        }
        return;
      }

      isSyncingRef.current = true;
      lastSyncTimeRef.current = Date.now();

      try {
        if (__DEV__) {
          console.log(
            `[useSyncTriggers] Starting sync (trigger: ${trigger}, pending: ${pendingItems.length})`
          );
        }

        const result = await syncQueue();

        if (__DEV__) {
          console.log('[useSyncTriggers] Sync completed:', {
            synced: result.synced,
            failed: result.failed,
            conflicts: result.conflicts,
          });
        }
      } catch (err) {
        console.error('[useSyncTriggers] Sync failed:', err);
      } finally {
        isSyncingRef.current = false;
      }
    },
    [syncQueue, getPendingItems, finalConfig.minSyncInterval]
  );

  // ========================================================================
  // NETWORK STATE CHANGE HANDLER
  // ========================================================================

  const handleNetworkStateChange = useCallback(
    (state: any) => {
      const wasOnline = isOnline;
      const isNowOnline = state.isConnected ?? true;

      if (finalConfig.enableNetworkSync && !wasOnline && isNowOnline) {
        if (__DEV__) {
          console.log('[useSyncTriggers] Network came back online, triggering sync');
        }
        performSync('network');
      }
    },
    [isOnline, finalConfig.enableNetworkSync, performSync]
  );

  // ========================================================================
  // APP STATE CHANGE HANDLER
  // ========================================================================

  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      if (finalConfig.enableAppStateSync && nextAppState === 'active') {
        if (__DEV__) {
          console.log('[useSyncTriggers] App became active, triggering sync');
        }
        performSync('appstate');
      }
    },
    [finalConfig.enableAppStateSync, performSync]
  );

  // ========================================================================
  // SETUP NETWORK LISTENER
  // ========================================================================

  useEffect(() => {
    if (!finalConfig.enableNetworkSync) return;

    networkSubscriptionRef.current = NetInfo.addEventListener(handleNetworkStateChange);

    return () => {
      if (networkSubscriptionRef.current) {
        networkSubscriptionRef.current();
      }
    };
  }, [finalConfig.enableNetworkSync, handleNetworkStateChange]);

  // ========================================================================
  // SETUP APP STATE LISTENER
  // ========================================================================

  useEffect(() => {
    if (!finalConfig.enableAppStateSync) return;

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [finalConfig.enableAppStateSync, handleAppStateChange]);

  // ========================================================================
  // SETUP PERIODIC SYNC TIMER
  // ========================================================================

  useEffect(() => {
    if (!finalConfig.enablePeriodicSync) {
      if (periodicSyncTimerRef.current) {
        clearInterval(periodicSyncTimerRef.current);
        periodicSyncTimerRef.current = null;
      }
      return;
    }

    periodicSyncTimerRef.current = setInterval(() => {
      if (__DEV__) {
        console.log('[useSyncTriggers] Periodic sync triggered');
      }
      performSync('periodic');
    }, finalConfig.periodicSyncInterval);

    return () => {
      if (periodicSyncTimerRef.current) {
        clearInterval(periodicSyncTimerRef.current);
        periodicSyncTimerRef.current = null;
      }
    };
  }, [finalConfig.enablePeriodicSync, finalConfig.periodicSyncInterval, performSync]);

  // ========================================================================
  // CLEANUP ON UNMOUNT
  // ========================================================================

  useEffect(() => {
    return () => {
      if (appStateSubscriptionRef.current) {
        appStateSubscriptionRef.current();
      }
      if (networkSubscriptionRef.current) {
        networkSubscriptionRef.current();
      }
      if (periodicSyncTimerRef.current) {
        clearInterval(periodicSyncTimerRef.current);
      }
    };
  }, []);

  // ========================================================================
  // RETURN PUBLIC API
  // ========================================================================

  return {
    // Manually trigger sync (ignores minSyncInterval)
    syncNow: () => performSync('manual'),

    // Check if sync is currently in progress
    isSyncing: () => isSyncingRef.current,

    // Get time since last sync
    timeSinceLastSync: () => Date.now() - lastSyncTimeRef.current,
  };
}
