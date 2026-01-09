/**
 * Summary Modal Component
 *
 * CRITICAL: Summary table column order is IMMUTABLE.
 * Exactly 14 columns in fixed order (Week Of, Avg Weight, 11 exercises, Total Sets).
 * DO NOT insert columns mid-structure. Future exercises MUST append AFTER column 14.
 *
 * Source of Truth: claude.md Section 0.2.E, 20.1.B
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { EXERCISES } from '@/lib/constants/exercises'
import { useDrawer } from '@/contexts/DrawerContext'

/**
 * IMMUTABLE SUMMARY TABLE COLUMNS
 * as const enforces immutability at TypeScript level
 * Exactly 14 items: [Week Of, Avg Weight, Bike, Abs, ..., Row, Total Sets]
 */
const IMMUTABLE_SUMMARY_COLUMNS = [
  'Week Of',
  'Avg Weight',
  'Bike',
  'Abs',
  'Chest Press',
  'Leg Press',
  'Lat',
  'Military',
  'Crunch',
  'Bicep Curls',
  'Triceps',
  'Overhead Pull',
  'Row',
  'Total Sets',
] as const

// Validation: Ensure exactly 14 columns
if (IMMUTABLE_SUMMARY_COLUMNS.length !== 14) {
  throw new Error(
    `Summary columns corrupted: expected exactly 14 columns, got ${IMMUTABLE_SUMMARY_COLUMNS.length}`
  )
}

interface ServerSummary {
  weekOfSunday: string
  weightAvg: number | null
  workoutCount: number
  totals: Record<string, number>
}

interface WeeklySummary {
  weekStart: Date
  weekEnd: Date
  totalWorkouts: number
  avgWeight: number | null
  totalSets: number
  exerciseBreakdown: Record<string, number>
  completionRate: number
}

export function SummaryModal() {
  const { isSummaryModalOpen, closeSummaryModal, refreshSummary } = useDrawer()
  const [loading, setLoading] = useState(false)
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([])
  const [overallStats, setOverallStats] = useState({
    totalWorkouts: 0,
    avgWeight: null as number | null,
    totalSets: 0,
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isSummaryModalOpen) {
      loadData()
      // Focus close button when modal opens for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    }
  }, [isSummaryModalOpen, refreshTrigger])

  // Listen for external refresh triggers (e.g., after workout save)
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger((prev) => prev + 1)
    }

    window.addEventListener('summary:refresh', handleRefresh)
    return () => window.removeEventListener('summary:refresh', handleRefresh)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Use new server-side summary API for optimal performance
      const response = await fetch('/api/summary')
      if (response.ok) {
        const data: ServerSummary[] = await response.json()
        transformServerData(data)
      }
    } catch (error) {
      console.error('Failed to load summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const transformServerData = (serverData: ServerSummary[]) => {
    if (serverData.length === 0) {
      setWeeklySummaries([])
      setOverallStats({ totalWorkouts: 0, avgWeight: null, totalSets: 0 })
      return
    }

    // Transform server response to UI format
    const summaries: WeeklySummary[] = serverData.map((week) => {
      const weekStart = new Date(week.weekOfSunday + 'T00:00:00')
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const totalSets = Object.values(week.totals).reduce((sum, sets) => sum + sets, 0)

      // Calculate completion rate
      const completedExercises = Object.keys(week.totals).length
      const totalPossibleExercises = week.workoutCount * EXERCISES.length
      const completionRate =
        totalPossibleExercises > 0
          ? Math.round((Object.values(week.totals).filter((s) => s > 0).length / totalPossibleExercises) * 100)
          : 0

      return {
        weekStart,
        weekEnd,
        totalWorkouts: week.workoutCount,
        avgWeight: week.weightAvg,
        totalSets,
        exerciseBreakdown: week.totals,
        completionRate,
      }
    })

    setWeeklySummaries(summaries)

    // Calculate overall stats from all weeks
    const totalWorkouts = summaries.reduce((sum, week) => sum + week.totalWorkouts, 0)
    const allWeights = summaries.map((w) => w.avgWeight).filter((w): w is number => w != null)
    const overallAvgWeight =
      allWeights.length > 0 ? allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length : null
    const totalSets = summaries.reduce((sum, week) => sum + week.totalSets, 0)

    setOverallStats({
      totalWorkouts,
      avgWeight: overallAvgWeight,
      totalSets,
    })
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


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeSummaryModal()
    }
  }

  if (!isSummaryModalOpen) return null

  return (
    <div
      id="summary-modal"
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <div className="modal-content">
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close"
          aria-label="Close Summary"
          onClick={closeSummaryModal}
        >
          ✕
        </button>

        <div className="modal-inner">
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-text-muted">Loading summary...</p>
              </div>
            </div>
          ) : weeklySummaries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
              <p className="text-text-muted mb-6">Complete some workouts to see your weekly summary!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center bg-surface p-6 rounded-xl shadow-elev">
                <h2 id="summary-modal-title" className="text-2xl font-bold mb-2">
                  Progress Summary
                </h2>
                <p className="text-text-muted">Weekly workout totals</p>
              </div>

              {/* Summary Table - IMMUTABLE COLUMN ORDER */}
              <div className="table-container">
                <table className="summary-table">
                  <thead>
                    <tr>
                      {/* Using immutable columns constant (not dynamic map) */}
                      {IMMUTABLE_SUMMARY_COLUMNS.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklySummaries.map((summary, index) => (
                      <tr key={index}>
                        <td>{formatWeekRange(summary.weekStart, summary.weekEnd)}</td>
                        <td className="num-right">
                          {summary.avgWeight ? summary.avgWeight.toFixed(1) : ''}
                        </td>
                        {EXERCISES.map((exercise) => (
                          <td key={exercise.id} className="num-right">
                            {summary.exerciseBreakdown[exercise.id] || 0}
                          </td>
                        ))}
                        <td className="num-right">
                          <strong>{summary.totalSets}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
