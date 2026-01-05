/**
 * IMMUTABLE EXERCISE LIST
 *
 * CRITICAL: This exercise set is immutable and part of permanent UI design.
 * Exactly 11 exercises in fixed order. DO NOT modify names, goals, or order.
 * Any future exercises MUST be added as new properties, not here.
 *
 * Source of Truth: claude.md Section 0.10, 20.1.C
 */

export interface Exercise {
  id: string
  name: string
  maxSets: number
  targetReps: number
  unit: 'sets' | 'minutes' | 'reps'
}

export const EXERCISES = [
  {
    id: 'bike',
    name: 'Bike',
    maxSets: 4,
    targetReps: 60,
    unit: 'minutes',
  },
  {
    id: 'abs',
    name: 'Abs',
    maxSets: 4,
    targetReps: 100,
    unit: 'reps',
  },
  {
    id: 'chestPress',
    name: 'Chest Press',
    maxSets: 4,
    targetReps: 20,
    unit: 'reps',
  },
  {
    id: 'legPress',
    name: 'Leg Press',
    maxSets: 4,
    targetReps: 20,
    unit: 'reps',
  },
  {
    id: 'lat',
    name: 'Lat',
    maxSets: 4,
    targetReps: 20,
    unit: 'reps',
  },
  {
    id: 'military',
    name: 'Military',
    maxSets: 4,
    targetReps: 20,
    unit: 'reps',
  },
  {
    id: 'crunch',
    name: 'Crunch',
    maxSets: 4,
    targetReps: 100,
    unit: 'reps',
  },
  {
    id: 'bicepCurls',
    name: 'Bicep Curls',
    maxSets: 4,
    targetReps: 20,
    unit: 'reps',
  },
  {
    id: 'triceps',
    name: 'Triceps',
    maxSets: 4,
    targetReps: 40,
    unit: 'reps',
  },
  {
    id: 'overheadPull',
    name: 'Overhead Pull',
    maxSets: 4,
    targetReps: 40,
    unit: 'reps',
  },
  {
    id: 'row',
    name: 'Row',
    maxSets: 4,
    targetReps: 20,
    unit: 'reps',
  },
] as const

export const TOTAL_EXERCISES = EXERCISES.length

export type FitnessData = Record<string, number>
