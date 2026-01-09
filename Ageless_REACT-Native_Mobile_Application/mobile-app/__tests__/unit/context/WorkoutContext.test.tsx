/**
 * WorkoutContext Tests
 *
 * Tests for workout context provider including:
 * - Entry loading, saving, and deletion
 * - Cache management and persistence
 * - Conflict resolution
 * - Error handling
 * - User isolation
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock dependencies before importing the context
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../../api/entries');
jest.mock('../../../api/summary');
jest.mock('../../../api/history');

// Now import after mocks are set up
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutProvider, useWorkout } from '../../../context/WorkoutContext';
import { useAuth } from '../../../hooks/useAuth';
import * as entriesAPI from '../../../api/entries';
import * as summaryAPI from '../../../api/summary';
import * as historyAPI from '../../../api/history';

describe('WorkoutContext', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
  };

  const mockToken = 'test-token-123';

  const mockWorkoutEntry = {
    id: 'entry-1',
    date: '2026-01-09',
    exercises: { name: 'Push-ups', sets: 3, reps: 10 },
    weight: 180,
    createdAt: '2026-01-09T10:00:00Z',
    updatedAt: '2026-01-09T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock useAuth
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: mockToken,
    });

    // Mock API methods
    (entriesAPI.getEntry as jest.Mock).mockResolvedValue(mockWorkoutEntry);
    (entriesAPI.saveEntry as jest.Mock).mockResolvedValue(mockWorkoutEntry);
    (entriesAPI.deleteEntry as jest.Mock).mockResolvedValue(undefined);

    // Mock cache clearing methods
    (summaryAPI.clearCache as jest.Mock).mockReturnValue(undefined);
    (historyAPI.clearCache as jest.Mock).mockReturnValue(undefined);
    (historyAPI.resetPagination as jest.Mock).mockReturnValue(undefined);

    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Initialization', () => {
    test('initializes with default state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      expect(result.current).toHaveProperty('entries');
      expect(result.current).toHaveProperty('selectedDate');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isSaving');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('hasLocalChanges');
    });

    test('initializes with empty entries map', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      expect(result.current.entries.size).toBe(0);
    });

    test('initializes with loading and saving flags false', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    test('initializes with no error', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      expect(result.current.error).toBeNull();
    });

    test('initializes with no local changes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      expect(result.current.hasLocalChanges).toBe(false);
    });

    test('initializes selectedDate to today', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      const today = new Date().toISOString().split('T')[0];
      expect(result.current.selectedDate).toBe(today);
    });

    test('throws error when used outside WorkoutProvider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useWorkout());
      }).toThrow('useWorkout must be used within WorkoutProvider');

      spy.mockRestore();
    });
  });

  // ============================================================================
  // LOAD ENTRY TESTS
  // ============================================================================

  describe('loadEntry', () => {
    test('loads entry from API and caches it', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        const entry = await result.current.loadEntry('2026-01-09');
        expect(entry).toEqual(mockWorkoutEntry);
      });

      expect(entriesAPI.getEntry).toHaveBeenCalledWith('2026-01-09');
      expect(result.current.entries.has('2026-01-09')).toBe(true);
    });

    test('returns cached entry on second load without API call', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // First load
      await act(async () => {
        await result.current.loadEntry('2026-01-09');
      });

      (entriesAPI.getEntry as jest.Mock).mockClear();

      // Second load
      await act(async () => {
        const entry = await result.current.loadEntry('2026-01-09');
        expect(entry).toEqual(mockWorkoutEntry);
      });

      expect(entriesAPI.getEntry).not.toHaveBeenCalled();
    });

    test('sets loading flag during fetch', async () => {
      let loadingDuringCall = false;
      (entriesAPI.getEntry as jest.Mock).mockImplementation(async () => {
        loadingDuringCall = result.current.isLoading;
        return mockWorkoutEntry;
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.loadEntry('2026-01-09');
      });

      expect(loadingDuringCall).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    test('clears error when successfully loading', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Set an error first
      await act(async () => {
        (entriesAPI.getEntry as jest.Mock).mockRejectedValueOnce(
          new Error('Test error')
        );
        await result.current.loadEntry('2026-01-08');
      });

      expect(result.current.error).not.toBeNull();

      // Now load successfully
      (entriesAPI.getEntry as jest.Mock).mockResolvedValueOnce(mockWorkoutEntry);
      await act(async () => {
        await result.current.loadEntry('2026-01-09');
      });

      expect(result.current.error).toBeNull();
    });

    test('handles API errors gracefully', async () => {
      const errorMessage = 'Failed to load entry. Please try again.';
      (entriesAPI.getEntry as jest.Mock).mockRejectedValueOnce(
        new Error('API error')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        const entry = await result.current.loadEntry('2026-01-09');
        expect(entry).toBeNull();
      });

      expect(result.current.error).toBe('API error');
    });

    test('requires authentication to load entries', async () => {
      (useAuth as jest.Mock).mockReturnValueOnce({
        user: null,
        token: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        const entry = await result.current.loadEntry('2026-01-09');
        expect(entry).toBeNull();
      });

      expect(result.current.error).toBe('Must be logged in to load entries');
      expect(entriesAPI.getEntry).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // SAVE ENTRY TESTS
  // ============================================================================

  describe('saveEntry', () => {
    test('saves entry to API and caches it', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        const saved = await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises,
          180
        );
        expect(saved).toEqual(mockWorkoutEntry);
      });

      expect(entriesAPI.saveEntry).toHaveBeenCalledWith(
        '2026-01-09',
        mockWorkoutEntry.exercises,
        180
      );
      expect(result.current.entries.has('2026-01-09')).toBe(true);
    });

    test('sets saving flag during save', async () => {
      let savingDuringCall = false;
      (entriesAPI.saveEntry as jest.Mock).mockImplementation(async () => {
        savingDuringCall = result.current.isSaving;
        return mockWorkoutEntry;
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      expect(savingDuringCall).toBe(true);
      expect(result.current.isSaving).toBe(false);
    });

    test('clears error on successful save', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      expect(result.current.error).toBeNull();
    });

    test('clears hasLocalChanges flag after successful save', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      expect(result.current.hasLocalChanges).toBe(false);
    });

    test('clears related caches (summary and history) after save', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      expect(summaryAPI.clearCache).toHaveBeenCalled();
      expect(historyAPI.clearCache).toHaveBeenCalled();
    });

    test('handles conflict errors with server data', async () => {
      const serverData = { ...mockWorkoutEntry, weight: 185 };
      const conflictError = new Error(
        'Server has newer data. Would you like to keep your changes or use the server version?'
      );
      (conflictError as any).code = 'CONFLICT';
      (conflictError as any).serverData = serverData;

      (entriesAPI.saveEntry as jest.Mock).mockRejectedValueOnce(
        conflictError
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.saveEntry(
            '2026-01-09',
            mockWorkoutEntry.exercises
          );
        });
      }).rejects.toThrow();

      expect(result.current.error).toContain('Server has newer data');
    });

    test('handles generic API errors', async () => {
      (entriesAPI.saveEntry as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.saveEntry(
            '2026-01-09',
            mockWorkoutEntry.exercises
          );
        });
      }).rejects.toThrow();

      expect(result.current.error).toBe('Network error');
    });

    test('requires authentication to save entries', async () => {
      (useAuth as jest.Mock).mockReturnValueOnce({
        user: null,
        token: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.saveEntry(
            '2026-01-09',
            mockWorkoutEntry.exercises
          );
        });
      }).rejects.toThrow('Must be logged in to save entries');
    });
  });

  // ============================================================================
  // DELETE ENTRY TESTS
  // ============================================================================

  describe('deleteEntry', () => {
    test('deletes entry from API and cache', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // First add an entry to cache
      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      expect(result.current.entries.has('2026-01-09')).toBe(true);

      // Now delete it
      await act(async () => {
        await result.current.deleteEntry('2026-01-09');
      });

      expect(entriesAPI.deleteEntry).toHaveBeenCalledWith('2026-01-09');
      expect(result.current.entries.has('2026-01-09')).toBe(false);
    });

    test('sets saving flag during delete', async () => {
      let savingDuringCall = false;
      (entriesAPI.deleteEntry as jest.Mock).mockImplementation(async () => {
        savingDuringCall = result.current.isSaving;
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Add entry first
      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      // Delete it
      await act(async () => {
        await result.current.deleteEntry('2026-01-09');
      });

      expect(savingDuringCall).toBe(true);
      expect(result.current.isSaving).toBe(false);
    });

    test('clears related caches (summary and history) after delete', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Add entry first
      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      (summaryAPI.clearCache as jest.Mock).mockClear();
      (historyAPI.clearCache as jest.Mock).mockClear();

      // Delete it
      await act(async () => {
        await result.current.deleteEntry('2026-01-09');
      });

      expect(summaryAPI.clearCache).toHaveBeenCalled();
      expect(historyAPI.clearCache).toHaveBeenCalled();
    });

    test('clears hasLocalChanges flag after successful delete', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Add entry first
      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      // Delete it
      await act(async () => {
        await result.current.deleteEntry('2026-01-09');
      });

      expect(result.current.hasLocalChanges).toBe(false);
    });

    test('handles delete errors gracefully', async () => {
      (entriesAPI.deleteEntry as jest.Mock).mockRejectedValueOnce(
        new Error('Delete failed')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Add entry first
      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      // Try to delete it
      await expect(async () => {
        await act(async () => {
          await result.current.deleteEntry('2026-01-09');
        });
      }).rejects.toThrow();

      expect(result.current.error).toBe('Delete failed');
    });

    test('requires authentication to delete entries', async () => {
      (useAuth as jest.Mock).mockReturnValueOnce({
        user: null,
        token: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.deleteEntry('2026-01-09');
        });
      }).rejects.toThrow('Must be logged in to delete entries');
    });
  });

  // ============================================================================
  // PERSISTENCE TESTS
  // ============================================================================

  describe('Persistence', () => {
    test('loads cached entries from AsyncStorage on mount', async () => {
      const cachedEntries = [
        ['2026-01-08', mockWorkoutEntry],
        [
          '2026-01-07',
          { ...mockWorkoutEntry, date: '2026-01-07', id: 'entry-2' },
        ],
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(cachedEntries)
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.entries.size).toBe(2);
      });

      expect(result.current.entries.get('2026-01-08')).toEqual(
        mockWorkoutEntry
      );
    });

    test('uses correct AsyncStorage key with user ID', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(
          `workout_cache_${mockUser.id}`
        );
      });
    });

    test('persists entries to AsyncStorage with debounce', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      // Advance timers to trigger debounced save
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          `workout_cache_${mockUser.id}`,
          expect.any(String)
        );
      });
    });

    test('handles corrupted AsyncStorage gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        'invalid json'
      );

      jest.spyOn(console, 'error').mockImplementation();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.entries.size).toBe(0);
      });

      jest.spyOn(console, 'error').mockRestore();
    });

    test('silently fails on AsyncStorage write errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      jest.spyOn(console, 'error').mockImplementation();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      // Should still have the entry cached in memory
      expect(result.current.entries.has('2026-01-09')).toBe(true);

      jest.spyOn(console, 'error').mockRestore();
    });
  });

  // ============================================================================
  // CACHE MANAGEMENT TESTS
  // ============================================================================

  describe('Cache Management', () => {
    test('clearCache removes all entries', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Add entries
      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
        await result.current.saveEntry(
          '2026-01-08',
          mockWorkoutEntry.exercises
        );
      });

      expect(result.current.entries.size).toBe(2);

      // Clear cache
      await act(async () => {
        await result.current.clearCache();
      });

      expect(result.current.entries.size).toBe(0);
    });

    test('clearCache clears all API caches', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.clearCache();
      });

      expect(entriesAPI.clearCache).toHaveBeenCalled();
      expect(summaryAPI.clearCache).toHaveBeenCalled();
      expect(historyAPI.clearCache).toHaveBeenCalled();
      expect(historyAPI.resetPagination).toHaveBeenCalled();
    });

    test('clearCache removes AsyncStorage entry', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      await act(async () => {
        await result.current.clearCache();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        `workout_cache_${mockUser.id}`
      );
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    test('clearError clears the error state', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Set an error
      (entriesAPI.saveEntry as jest.Mock).mockRejectedValueOnce(
        new Error('Save failed')
      );

      await act(async () => {
        try {
          await result.current.saveEntry(
            '2026-01-09',
            mockWorkoutEntry.exercises
          );
        } catch {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    test('setSelectedDate updates the selected date', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result } = renderHook(() => useWorkout(), { wrapper });

      act(() => {
        result.current.setSelectedDate('2026-01-15');
      });

      expect(result.current.selectedDate).toBe('2026-01-15');
    });
  });

  // ============================================================================
  // LOGOUT CLEANUP TESTS
  // ============================================================================

  describe('Logout Cleanup', () => {
    test('clears cache when user logs out', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      const { result, rerender } = renderHook(() => useWorkout(), { wrapper });

      // Add entries
      await act(async () => {
        await result.current.saveEntry(
          '2026-01-09',
          mockWorkoutEntry.exercises
        );
      });

      expect(result.current.entries.size).toBe(1);

      // Simulate logout
      (useAuth as jest.Mock).mockReturnValueOnce({
        user: null,
        token: null,
      });

      // Re-render to trigger logout effect
      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(result.current.entries.size).toBe(0);
      });
    });
  });

  // ============================================================================
  // USER ISOLATION TESTS
  // ============================================================================

  describe('User Isolation', () => {
    test('uses different cache keys for different users', async () => {
      // First user
      (useAuth as jest.Mock).mockReturnValueOnce({
        user: { id: 'user-1', email: 'user1@example.com' },
        token: 'token-1',
      });

      const wrapper1 = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      renderHook(() => useWorkout(), { wrapper1 });

      // Check first user's cache key
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('workout_cache_user-1');

      jest.clearAllMocks();

      // Second user
      (useAuth as jest.Mock).mockReturnValueOnce({
        user: { id: 'user-2', email: 'user2@example.com' },
        token: 'token-2',
      });

      const wrapper2 = ({ children }: { children: React.ReactNode }) => (
        <WorkoutProvider>{children}</WorkoutProvider>
      );

      renderHook(() => useWorkout(), { wrapper2 });

      // Check second user's cache key
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('workout_cache_user-2');
    });
  });
});
