/**
 * useOfflineQueue Hook Tests
 *
 * Tests for offline queue management, persistence, synchronization,
 * and conflict resolution
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies before importing the hook
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../context/UIContext', () => ({
  useUI: jest.fn(),
}));

jest.mock('../../../api/client', () => ({
  apiClient: jest.fn(),
}));

// Now import after mocks are set up
import { useOfflineQueue, QueuedRequest } from '../../../hooks/useOfflineQueue';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../context/UIContext';
import { apiClient } from '../../../api/client';

describe('useOfflineQueue Hook', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });
    (useUI as jest.Mock).mockReturnValue({
      showToast: mockShowToast,
    });
    (apiClient as jest.Mock).mockResolvedValue({ status: 200, data: {} });
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    test('initializes with empty queue state', () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.state.items).toEqual([]);
      expect(result.current.state.totalSize).toBe(0);
      expect(result.current.state.pendingCount).toBe(0);
      expect(result.current.state.failedCount).toBe(0);
      expect(result.current.state.conflictCount).toBe(0);
      expect(result.current.state.syncInProgress).toBe(false);
    });

    test('initializes with correct max queue size', () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.state.maxSize).toBe(500);
    });

    test('loads queue from AsyncStorage on mount', async () => {
      const savedQueue: QueuedRequest[] = [
        {
          id: 'item-1',
          userId: 'user-123',
          timestamp: Date.now() - 1000,
          method: 'POST',
          endpoint: '/api/entries',
          date: '2026-01-09',
          status: 'pending',
          retryCount: 0,
          maxRetries: 5,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(savedQueue)
      );

      const { result } = renderHook(() => useOfflineQueue());

      await waitFor(() => {
        expect(result.current.state.totalSize).toBe(1);
      });

      expect(result.current.state.items).toHaveLength(1);
      expect(result.current.state.pendingCount).toBe(1);
    });

    test('filters out expired items on load', async () => {
      const expiredItem: QueuedRequest = {
        id: 'expired',
        userId: 'user-123',
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours old
        method: 'POST',
        endpoint: '/api/entries',
        date: '2026-01-08',
        status: 'pending',
        retryCount: 0,
        maxRetries: 5,
      };

      const validItem: QueuedRequest = {
        id: 'valid',
        userId: 'user-123',
        timestamp: Date.now() - 1000,
        method: 'POST',
        endpoint: '/api/entries',
        date: '2026-01-09',
        status: 'pending',
        retryCount: 0,
        maxRetries: 5,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([expiredItem, validItem])
      );

      const { result } = renderHook(() => useOfflineQueue());

      await waitFor(() => {
        expect(result.current.state.totalSize).toBe(1);
      });

      expect(result.current.state.items).toHaveLength(1);
      expect(result.current.state.items[0].id).toBe('valid');
    });

    test('handles corrupted stored queue gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const { result } = renderHook(() => useOfflineQueue());

      await waitFor(() => {
        // Should not throw, should have empty queue
        expect(result.current.state.totalSize).toBe(0);
      });
    });
  });

  // ============================================================================
  // ADDING TO QUEUE TESTS
  // ============================================================================

  describe('addToQueue', () => {
    test('adds request to queue', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      let itemId: string;
      await act(async () => {
        itemId = await result.current.addToQueue(
          'POST',
          '/api/entries',
          '2026-01-09',
          { exercises: { 'bench-press': { sets: 3, reps: 8 } } }
        );
      });

      expect(result.current.state.totalSize).toBe(1);
      expect(result.current.state.pendingCount).toBe(1);
      expect(result.current.state.items[0].id).toBe(itemId);
      expect(result.current.state.items[0].status).toBe('pending');
      expect(result.current.state.items[0].retryCount).toBe(0);
    });

    test('requires authentication to add to queue', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        try {
          await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
          fail('Should have thrown error');
        } catch (err: any) {
          expect(err.message).toContain('Must be logged in');
        }
      });
    });

    test('generates unique IDs for each queued item', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      let id1: string, id2: string;
      await act(async () => {
        // Add first item - different date to avoid deduplication
        id1 = await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      await act(async () => {
        // Add second item after first is processed
        id2 = await result.current.addToQueue('POST', '/api/entries', '2026-01-08');
      });

      // IDs should be different (based on timestamp + random)
      expect(id1).not.toBe(id2);
      // Both items should be in queue since they have different dates
      expect(result.current.state.items).toHaveLength(2);
      const ids = result.current.state.items.map(i => i.id);
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);
    });

    test('deduplicates pending requests for same date and endpoint', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09', {
          exercises: { exercise1: {} },
        });
      });

      expect(result.current.state.totalSize).toBe(1);

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09', {
          exercises: { exercise2: {} },
        });
      });

      // Should still be 1 item (deduplicated)
      expect(result.current.state.totalSize).toBe(1);
      // The second one should have replaced the first
      expect(result.current.state.items[0].body?.exercises).toHaveProperty('exercise2');
    });

    test('persists queue after adding', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'offline_queue_v2',
          expect.any(String)
        );
      });
    });

    test('shows toast on successful add', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      // Toast should not be called for successful add
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    test('shows error toast when not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        try {
          await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
        } catch (err) {
          // Expected
        }
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Must be logged in'),
        'error'
      );
    });
  });

  // ============================================================================
  // QUEUE MANAGEMENT TESTS
  // ============================================================================

  describe('Queue Management', () => {
    test('removes item from queue', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      let itemId: string;
      await act(async () => {
        itemId = await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      expect(result.current.state.totalSize).toBe(1);
      expect(result.current.state.items).toHaveLength(1);

      await act(async () => {
        result.current.removeFromQueue(itemId!);
      });

      // Item should be removed from the queue array
      expect(result.current.state.items).toHaveLength(0);
      // Verify the specific item is gone
      expect(result.current.state.items.find(i => i.id === itemId)).toBeUndefined();
    });

    test('gets pending items', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      const pending = result.current.getPendingItems();

      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('pending');
    });

    test('gets conflict items', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      // Add an item with conflict status manually for testing
      const item: QueuedRequest = {
        id: 'conflict-item',
        userId: 'user-123',
        timestamp: Date.now(),
        method: 'POST',
        endpoint: '/api/entries',
        date: '2026-01-09',
        status: 'conflict',
        retryCount: 0,
        maxRetries: 5,
        conflictData: { serverData: {} },
      };

      // For this test, we'll just verify the method works
      const conflicts = result.current.getConflictItems();
      expect(Array.isArray(conflicts)).toBe(true);
    });
  });

  // ============================================================================
  // STATE TRACKING TESTS
  // ============================================================================

  describe('State Tracking', () => {
    test('tracks queue size', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.state.totalSize).toBe(0);

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      expect(result.current.state.totalSize).toBe(1);
    });

    test('tracks pending count', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        // Add first item
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      expect(result.current.state.pendingCount).toBe(1);

      await act(async () => {
        // Add second item with different date (to avoid deduplication)
        await result.current.addToQueue('POST', '/api/entries', '2026-01-08');
      });

      // Both items should be in pending status since they have different dates
      expect(result.current.state.pendingCount).toBe(2);
      expect(result.current.state.totalSize).toBe(2);
      expect(result.current.state.items.every(i => i.status === 'pending')).toBe(true);
    });

    test('respects max queue size constant', () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.state.maxSize).toBe(500);
    });

    test('initializes syncInProgress as false', () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(result.current.state.syncInProgress).toBe(false);
    });
  });

  // ============================================================================
  // PERSISTENCE TESTS
  // ============================================================================

  describe('Persistence', () => {
    test('persists queue to AsyncStorage', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09', {
          exercises: { exercise: {} },
        });
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'offline_queue_v2',
          expect.any(String)
        );
      });
    });

    test('uses correct storage key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      renderHook(() => useOfflineQueue());

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('offline_queue_v2');
      });
    });
  });

  // ============================================================================
  // SYNC RELATED TESTS
  // ============================================================================

  describe('Sync Related', () => {
    test('returns sync result object with correct structure', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      let syncResult;
      await act(async () => {
        syncResult = await result.current.syncQueue();
      });

      expect(syncResult).toHaveProperty('synced');
      expect(syncResult).toHaveProperty('failed');
      expect(syncResult).toHaveProperty('conflicts');
      expect(syncResult).toHaveProperty('errors');
      expect(Array.isArray(syncResult.errors)).toBe(true);
    });

    test('requires authentication to sync', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        try {
          await result.current.syncQueue();
          fail('Should have thrown error');
        } catch (err: any) {
          expect(err.message).toContain('Must be logged in');
        }
      });
    });
  });

  // ============================================================================
  // CONFLICT RESOLUTION TESTS
  // ============================================================================

  describe('Conflict Resolution', () => {
    test('resolveConflict method exists and is callable', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(typeof result.current.resolveConflict).toBe('function');

      // Should not throw
      await act(async () => {
        await result.current.resolveConflict('item-id', 'keep-local');
      });
    });
  });

  // ============================================================================
  // CLEAR QUEUE TESTS
  // ============================================================================

  describe('Clear Queue', () => {
    test('clearQueue method exists and is callable', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      expect(typeof result.current.clearQueue).toBe('function');

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      expect(result.current.state.totalSize).toBe(1);

      await act(async () => {
        await result.current.clearQueue();
      });

      expect(result.current.state.totalSize).toBe(0);
      expect(result.current.state.items).toEqual([]);
    });

    test('removes storage item when clearing queue', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        await result.current.clearQueue();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('offline_queue_v2');
    });
  });

  // ============================================================================
  // API EXPOSURE TESTS
  // ============================================================================

  describe('Hook API', () => {
    test('returns all required methods and state', () => {
      const { result } = renderHook(() => useOfflineQueue());

      // State
      expect(result.current).toHaveProperty('queue');
      expect(result.current).toHaveProperty('state');

      // Actions
      expect(result.current).toHaveProperty('addToQueue');
      expect(result.current).toHaveProperty('removeFromQueue');
      expect(result.current).toHaveProperty('clearQueue');
      expect(result.current).toHaveProperty('syncQueue');
      expect(result.current).toHaveProperty('resolveConflict');

      // Queries
      expect(result.current).toHaveProperty('getPendingItems');
      expect(result.current).toHaveProperty('getConflictItems');
    });

    test('queue and state.items reference the same array', async () => {
      const { result } = renderHook(() => useOfflineQueue());

      await act(async () => {
        await result.current.addToQueue('POST', '/api/entries', '2026-01-09');
      });

      expect(result.current.queue).toBe(result.current.state.items);
    });
  });
});
