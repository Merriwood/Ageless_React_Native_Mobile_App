'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EXERCISES } from '@/lib/constants/exercises'
import type { WorkoutEntry } from '@/types'

interface WeeklySummary {
  weekStart: Date
  weekEnd: Date
  totalWorkouts: number
  avgWeight: number | null
  totalSets: number
  exerciseBreakdown: Record<string, number>
  completionRate: number
}

export default function SummaryPage() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
        generateWeeklySummaries(data)
      }
    } catch (error) {
      console.error('Failed to load workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklySummaries = (workouts: WorkoutEntry[]) => {
    if (workouts.length === 0) {
      setWeeklySummaries([])
      return
    }

    // Group workouts by week
    const weekMap = new Map<string, WorkoutEntry[]>()

    workouts.forEach((workout) => {
      const date = new Date(workout.entryDate)
      const weekStart = getWeekStart(date)
      const weekKey = weekStart.toISOString()

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, [])
      }
      weekMap.get(weekKey)!.push(workout)
    })

    // Calculate summaries for each week
    const summaries: WeeklySummary[] = []

    weekMap.forEach((weekWorkouts, weekKey) => {
      const weekStart = new Date(weekKey)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      // Calculate average weight
      const weightsWithValue = weekWorkouts
        .map((w) => w.weight)
        .filter((w): w is number => w != null)
      const avgWeight =
        weightsWithValue.length > 0
          ? weightsWithValue.reduce((sum, w) => sum + Number(w), 0) /
            weightsWithValue.length
          : null

      // Calculate total sets and exercise breakdown
      let totalSets = 0
      const exerciseBreakdown: Record<string, number> = {}

      weekWorkouts.forEach((workout) => {
        Object.entries(workout.fitnessData).forEach(([exerciseId, sets]) => {
          totalSets += sets
          exerciseBreakdown[exerciseId] =
            (exerciseBreakdown[exerciseId] || 0) + sets
        })
      })

      // Calculate completion rate
      const totalPossibleExercises = weekWorkouts.length * EXERCISES.length
      const completedExercises = weekWorkouts.reduce((sum, workout) => {
        return (
          sum +
          Object.values(workout.fitnessData).filter((sets) => sets > 0).length
        )
      }, 0)
      const completionRate = Math.round(
        (completedExercises / totalPossibleExercises) * 100
      )

      summaries.push({
        weekStart,
        weekEnd,
        totalWorkouts: weekWorkouts.length,
        avgWeight,
        totalSets,
        exerciseBreakdown,
        completionRate,
      })
    })

    // Sort by week start (most recent first)
    summaries.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())

    setWeeklySummaries(summaries)
  }

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day // Adjust to Sunday
    return new Date(d.setDate(diff))
  }

  const formatWeekRange = (start: Date, end: Date): string => {
    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${startStr} - ${endStr}`
  }

  const getTopExercises = (
    breakdown: Record<string, number>,
    count: number = 3
  ) => {
    return Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([exerciseId, sets]) => {
        const exercise = EXERCISES.find((e) => e.id === exerciseId)
        return { name: exercise?.name || exerciseId, sets }
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-muted">Loading summary...</p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
        <p className="text-text-muted mb-6">
          Complete some workouts to see your weekly summary!
        </p>
      </div>
    )
  }

  // Overall stats
  const totalWorkouts = entries.length
  const allWeights = entries
    .map((e) => e.weight)
    .filter((w): w is number => w != null)
  const overallAvgWeight =
    allWeights.length > 0
      ? allWeights.reduce((sum, w) => sum + Number(w), 0) / allWeights.length
      : null

  const allSets = entries.reduce((sum, entry) => {
    return sum + Object.values(entry.fitnessData).reduce((s, v) => s + v, 0)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-surface p-6 rounded-xl shadow-elev">
        <h2 className="text-2xl font-bold mb-2">Fitness Summary</h2>
        <p className="text-text-muted">Your progress at a glance</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Workouts</CardDescription>
            <CardTitle className="text-3xl">{totalWorkouts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Avg Weight</CardDescription>
            <CardTitle className="text-3xl">
              {overallAvgWeight ? `${overallAvgWeight.toFixed(1)} lbs` : '—'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Sets</CardDescription>
            <CardTitle className="text-3xl">{allSets}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Weekly Summaries */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Weekly Breakdown</h3>

        {weeklySummaries.map((summary, index) => {
          const topExercises = getTopExercises(summary.exerciseBreakdown)

          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      {formatWeekRange(summary.weekStart, summary.weekEnd)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {summary.totalWorkouts} workout
                      {summary.totalWorkouts !== 1 ? 's' : ''} completed
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {summary.completionRate}%
                    </div>
                    <div className="text-xs text-text-muted">completion</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-text-muted mb-1">
                      Avg Weight
                    </div>
                    <div className="text-xl font-bold">
                      {summary.avgWeight
                        ? `${summary.avgWeight.toFixed(1)} lbs`
                        : '—'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-text-muted mb-1">
                      Total Sets
                    </div>
                    <div className="text-xl font-bold">{summary.totalSets}</div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-sm text-text-muted mb-1">
                      Avg Sets/Workout
                    </div>
                    <div className="text-xl font-bold">
                      {Math.round(summary.totalSets / summary.totalWorkouts)}
                    </div>
                  </div>
                </div>

                {topExercises.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Top Exercises
                    </div>
                    <div className="space-y-2">
                      {topExercises.map((exercise, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-text-muted">
                            {i + 1}. {exercise.name}
                          </span>
                          <span className="font-medium">
                            {exercise.sets} sets
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-muted">Week Progress</span>
                    <span className="font-medium">
                      {summary.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 transition-all duration-300"
                      style={{ width: `${summary.completionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
