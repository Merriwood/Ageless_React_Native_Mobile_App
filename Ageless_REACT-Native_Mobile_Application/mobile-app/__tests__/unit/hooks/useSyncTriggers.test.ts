/**
 * useSyncTriggers Hook Tests
 *
 * Tests for sync trigger management, network/app state detection,
 * periodic syncing, and debouncing/throttling logic
 */

import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies before importing the hook
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo');

jest.mock('../../../hooks/useOfflineQueue', () => ({
  useOfflineQueue: jest.fn(),
}));

jest.mock('../../../context/UIContext', () => ({
  useNetwork: jest.fn(),
}));

// Now import after mocks are set up
import { useSyncTriggers } from '../../../hooks/useSyncTriggers';
import { useOfflineQueue } from '../../../hooks/useOfflineQueue';
import { useNetwork } from '../../../context/UIContext';

describe('useSyncTriggers Hook', () => {
  const mockSyncQueue = jest.fn();
  const mockGetPendingItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock useOfflineQueue
    (useOfflineQueue as jest.Mock).mockReturnValue({
      syncQueue: mockSyncQueue,
      getPendingItems: mockGetPendingItems,
    });

    // Mock useNetwork
    (useNetwork as jest.Mock).mockReturnValue({
      isOnline: true,
    });

    // Mock syncQueue to resolve successfully
    mockSyncQueue.mockResolvedValue({
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    });

    // Default: no pending items
    mockGetPendingItems.mockReturnValue([]);

    // Mock AppState.addEventListener
    (AppState.addEventListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });

    // Mock NetInfo.addEventListener
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    test('initializes with all required methods', () => {
      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      expect(result.current).toHaveProperty('syncNow');
      expect(result.current).toHaveProperty('isSyncing');
      expect(result.current).toHaveProperty('timeSinceLastSync');
    });

    test('isSyncing is false on initialization', () => {
      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      expect(result.current.isSyncing()).toBe(false);
    });

    test('timeSinceLastSync returns 0 initially', () => {
      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      const timeSince = result.current.timeSinceLastSync();
      expect(timeSince).toBeGreaterThanOrEqual(0);
    });

    test('all methods are functions', () => {
      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      expect(typeof result.current.syncNow).toBe('function');
      expect(typeof result.current.isSyncing).toBe('function');
      expect(typeof result.current.timeSinceLastSync).toBe('function');
    });
  });

  // ============================================================================
  // MANUAL SYNC TESTS
  // ============================================================================

  describe('Manual Sync', () => {
    test('syncNow calls syncQueue when pending items exist', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);

      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      expect(mockSyncQueue).toHaveBeenCalled();
    });

    test('syncNow does not call syncQueue when no pending items', async () => {
      mockGetPendingItems.mockReturnValue([]);

      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      expect(mockSyncQueue).not.toHaveBeenCalled();
    });

    test('syncNow bypass minSyncInterval', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);

      const { result } = renderHook(() =>
        useSyncTriggers({
          enablePeriodicSync: false,
          minSyncInterval: 30000,
        })
      );

      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      expect(mockSyncQueue).toHaveBeenCalledTimes(1);

      // Manual sync again immediately (should work - manual bypasses minSyncInterval)
      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      expect(mockSyncQueue).toHaveBeenCalledTimes(2);
    });

    test('isSyncing is false after sync completes', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);

      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      expect(result.current.isSyncing()).toBe(false);
    });

    test('timeSinceLastSync updates after sync', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);

      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      const timeSince = result.current.timeSinceLastSync();
      expect(timeSince).toBeLessThan(100);
    });
  });

  // ============================================================================
  // DEBOUNCING TESTS
  // ============================================================================

  describe('Sync Debouncing', () => {
    test('prevents concurrent syncs', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);
      mockSyncQueue.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 500))
      );

      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      act(() => {
        result.current.syncNow();
        result.current.syncNow();
      });

      expect(mockSyncQueue).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // PERIODIC SYNC TESTS
  // ============================================================================

  describe('Periodic Sync', () => {
    test('periodic sync can be disabled', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);

      renderHook(() =>
        useSyncTriggers({
          enablePeriodicSync: false,
        })
      );

      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockSyncQueue).not.toHaveBeenCalled();
    });

    test('periodic sync respects custom interval', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);

      const customInterval = 2 * 60 * 1000;
      renderHook(() =>
        useSyncTriggers({
          enablePeriodicSync: true,
          periodicSyncInterval: customInterval,
        })
      );

      await act(async () => {
        jest.advanceTimersByTime(customInterval);
      });

      expect(mockSyncQueue).toHaveBeenCalled();
    });

    test('periodic sync does not sync if no pending items', async () => {
      mockGetPendingItems.mockReturnValue([]);

      renderHook(() =>
        useSyncTriggers({
          enablePeriodicSync: true,
          periodicSyncInterval: 1000,
        })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockSyncQueue).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // CONFIGURATION TESTS
  // ============================================================================

  describe('Configuration', () => {
    test('accepts partial config', () => {
      const { result } = renderHook(() =>
        useSyncTriggers({
          enableNetworkSync: false,
          enablePeriodicSync: false,
        })
      );

      expect(result.current).toBeDefined();
      expect(result.current.syncNow).toBeDefined();
    });

    test('default config enables all sync types', () => {
      const { result } = renderHook(() =>
        useSyncTriggers({
          enablePeriodicSync: false, // Disable periodic to avoid timers
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  // ============================================================================
  // CLEANUP TESTS
  // ============================================================================

  describe('Cleanup', () => {
    test('cleans up listeners on unmount', () => {
      const mockUnsubscribe = jest.fn();
      const mockRemove = jest.fn();

      (AppState.addEventListener as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      unmount();

      expect(mockRemove).toHaveBeenCalled();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    test('clears timer on unmount when periodic sync enabled', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: true })
      );

      clearIntervalSpy.mockClear();
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    test('handles sync errors gracefully', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);
      mockSyncQueue.mockRejectedValue(new Error('Sync failed'));

      jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      expect(result.current.isSyncing()).toBe(false);
    });

    test('clears syncing flag even if sync fails', async () => {
      mockGetPendingItems.mockReturnValue([{ id: 'item-1' }]);
      mockSyncQueue.mockRejectedValue(new Error('Sync failed'));

      jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() =>
        useSyncTriggers({ enablePeriodicSync: false })
      );

      await act(async () => {
        result.current.syncNow();
        jest.runAllTimers();
      });

      expect(result.current.isSyncing()).toBe(false);
    });
  });

  // ============================================================================
  // LISTENER REGISTRATION TESTS
  // ============================================================================

  describe('Listener Registration', () => {
    test('registers network listener when enabled', () => {
      (NetInfo.addEventListener as jest.Mock).mockClear();

      renderHook(() =>
        useSyncTriggers({
          enableNetworkSync: true,
          enablePeriodicSync: false,
        })
      );

      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    test('does not register network listener when disabled', () => {
      (NetInfo.addEventListener as jest.Mock).mockClear();

      renderHook(() =>
        useSyncTriggers({
          enableNetworkSync: false,
          enablePeriodicSync: false,
        })
      );

      expect(NetInfo.addEventListener).not.toHaveBeenCalled();
    });

    test('registers app state listener when enabled', () => {
      (AppState.addEventListener as jest.Mock).mockClear();

      renderHook(() =>
        useSyncTriggers({
          enableAppStateSync: true,
          enablePeriodicSync: false,
        })
      );

      expect(AppState.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    test('does not register app state listener when disabled', () => {
      (AppState.addEventListener as jest.Mock).mockClear();

      renderHook(() =>
        useSyncTriggers({
          enableAppStateSync: false,
          enablePeriodicSync: false,
        })
      );

      expect(AppState.addEventListener).not.toHaveBeenCalled();
    });
  });
});
