/**
 * WorkoutContext
 *
 * Global state management for workout entries and caching
 * Pure TypeScript implementation (no JSX) wrapping useWorkoutLogic hook
 * Provides Context API interface for access throughout app
 */

import React, { createContext, useContext } from 'react';
import { useWorkoutLogic } from '../hooks/useWorkoutLogic';
import { WorkoutEntry, Exercise } from '../api/entries';

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
  // Use the pure logic hook
  const logicState = useWorkoutLogic();

  // Map logic state to context type (they're the same, just aliased)
  const value: WorkoutContextType = {
    entries: logicState.entries,
    selectedDate: logicState.selectedDate,
    isLoading: logicState.isLoading,
    isSaving: logicState.isSaving,
    error: logicState.error,
    hasLocalChanges: logicState.hasLocalChanges,
    loadEntry: logicState.loadEntry,
    saveEntry: logicState.saveEntry,
    deleteEntry: logicState.deleteEntry,
    setSelectedDate: logicState.setSelectedDate,
    clearError: logicState.clearError,
    clearCache: logicState.clearCache,
  };

  // Use createElement to avoid JSX transformer
  return React.createElement(
    WorkoutContext.Provider,
    { value },
    children
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
