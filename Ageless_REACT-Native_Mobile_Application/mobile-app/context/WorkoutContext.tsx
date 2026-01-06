/**
 * WorkoutContext
 *
 * Global state management for workout entries and caching
 * Handles entry loading, saving, caching, and offline state
 * Uses React Context API with custom hooks for optimal performance
 */

import React, { createContext, useCallback, useEffect, useState, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { entriesAPI, WorkoutEntry, Exercise } from '../api/entries';
import { summaryAPI } from '../api/summary';
import { historyAPI } from '../api/history';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WorkoutContextType {
  // State
  entries: Map<string, WorkoutEntry>;
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasLocalChanges: boolean;

  // Actions
  loadEntry: (date: string) => Promise<WorkoutEntry | null>;
  saveEntry: (date: string, exercises: Exercise, weight?: number) => Promise<WorkoutEntry>;
  deleteEntry: (date: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  clearError: () => void;
  clearCache: () => void;
}

export type WorkoutContextProps = WorkoutContextType;

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();

  // State
  const [entries, setEntries] = useState<Map<string, WorkoutEntry>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // ========================================================================
  // PERSISTENCE: Load cached entries on mount
  // ========================================================================

  useEffect(() => {
    const loadCachedEntries = async () => {
      if (!user?.id) return;

      try {
        const cached = await AsyncStorage.getItem(`workout_cache_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setEntries(new Map(parsed));
        }
      } catch (err) {
        console.error('Failed to load cached entries:', err);
        // Silently fail - cache is optional
      }
    };

    loadCachedEntries();
  }, [user?.id]);

  // ========================================================================
  // PERSISTENCE: Save entries to AsyncStorage whenever they change
  // ========================================================================

  useEffect(() => {
    const persistEntries = async () => {
      if (!user?.id || entries.size === 0) return;

      try {
        const serialized = Array.from(entries.entries());
        await AsyncStorage.setItem(`workout_cache_${user.id}`, JSON.stringify(serialized));
      } catch (err) {
        console.error('Failed to persist entries:', err);
        // Silently fail - persistence is optional
      }
    };

    // Debounce persistence (wait 2 seconds after last change)
    const timer = setTimeout(persistEntries, 2000);
    return () => clearTimeout(timer);
  }, [entries, user?.id]);

  // ========================================================================
  // LOAD ENTRY
  // ========================================================================

  const loadEntry = useCallback(
    async (date: string): Promise<WorkoutEntry | null> => {
      if (!user?.id || !token) {
        setError('Must be logged in to load entries');
        return null;
      }

      // Check if already in cache
      if (entries.has(date)) {
        return entries.get(date) || null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const entry = await entriesAPI.getEntry(date);

        if (entry) {
          setEntries((prev) => {
            const updated = new Map(prev);
            updated.set(date, entry);
            return updated;
          });
        }

        return entry;
      } catch (err: any) {
        const message =
          err.message || 'Failed to load entry. Please try again.';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, token, entries]
  );

  // ========================================================================
  // SAVE ENTRY
  // ========================================================================

  const saveEntry = useCallback(
    async (date: string, exercises: Exercise, weight?: number): Promise<WorkoutEntry> => {
      if (!user?.id || !token) {
        throw new Error('Must be logged in to save entries');
      }

      setIsSaving(true);
      setError(null);

      try {
        const saved = await entriesAPI.saveEntry(date, exercises, weight);

        // Update local cache
        setEntries((prev) => {
          const updated = new Map(prev);
          updated.set(date, saved);
          return updated;
        });

        // Clear related caches
        summaryAPI.clearCache();
        historyAPI.clearCache();

        // Mark as synced
        setHasLocalChanges(false);

        return saved;
      } catch (err: any) {
        // Handle conflict (server has newer data)
        if ((err as any).code === 'CONFLICT') {
          const serverData = (err as any).serverData;
          const conflictError = new Error(
            'Server has newer data. Would you like to keep your changes or use the server version?'
          );
          (conflictError as any).code = 'CONFLICT';
          (conflictError as any).serverData = serverData;
          setError(conflictError.message);
          throw conflictError;
        }

        const message =
          err.message || 'Failed to save entry. Please try again.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [user?.id, token]
  );

  // ========================================================================
  // DELETE ENTRY
  // ========================================================================

  const deleteEntry = useCallback(
    async (date: string): Promise<void> => {
      if (!user?.id || !token) {
        throw new Error('Must be logged in to delete entries');
      }

      setIsSaving(true);
      setError(null);

      try {
        await entriesAPI.deleteEntry(date);

        // Remove from local cache
        setEntries((prev) => {
          const updated = new Map(prev);
          updated.delete(date);
          return updated;
        });

        // Clear related caches
        summaryAPI.clearCache();
        historyAPI.clearCache();

        // Mark as synced
        setHasLocalChanges(false);
      } catch (err: any) {
        const message =
          err.message || 'Failed to delete entry. Please try again.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [user?.id, token]
  );

  // ========================================================================
  // ERROR HANDLING
  // ========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================================
  // CACHE MANAGEMENT
  // ========================================================================

  const clearCache = useCallback(async () => {
    entriesAPI.clearCache();
    summaryAPI.clearCache();
    historyAPI.clearCache();
    historyAPI.resetPagination();

    // Clear from AsyncStorage
    if (user?.id) {
      await AsyncStorage.removeItem(`workout_cache_${user.id}`);
    }

    setEntries(new Map());
  }, [user?.id]);

  // ========================================================================
  // LOGOUT CLEANUP
  // ========================================================================

  useEffect(() => {
    if (!user) {
      clearCache();
    }
  }, [user, clearCache]);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value: WorkoutContextType = {
    entries,
    selectedDate,
    isLoading,
    isSaving,
    error,
    hasLocalChanges,
    loadEntry,
    saveEntry,
    deleteEntry,
    setSelectedDate,
    clearError,
    clearCache,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);

  if (context === undefined) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }

  return context;
}

// ============================================================================
// EXPORT
// ============================================================================

export default WorkoutContext;
