'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EXERCISES } from '@/lib/constants/exercises'
import { formatDate } from '@/lib/utils'
import type { WorkoutEntry } from '@/types'

export default function HistoryPage() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (entryId: number, entryDate: Date) => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    setDeleting(entryId)
    try {
      const dateStr = new Date(entryDate).toISOString().split('T')[0]
      const response = await fetch(`/api/workouts/${dateStr}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
      } else {
        alert('Failed to delete workout')
      }
    } catch (error) {
      console.error('Error deleting workout:', error)
      alert('Error deleting workout')
    } finally {
      setDeleting(null)
    }
  }

  const calculateTotalSets = (fitnessData: Record<string, number>) => {
    return Object.values(fitnessData).reduce((sum, sets) => sum + sets, 0)
  }

  const calculateCompletedExercises = (fitnessData: Record<string, number>) => {
    return Object.values(fitnessData).filter((sets) => sets > 0).length
  }

  const toggleRow = (entryId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  const getExerciseName = (exerciseId: string): string => {
    const exercise = EXERCISES.find((e) => e.id === exerciseId)
    return exercise?.name || exerciseId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-muted">Loading history...</p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold mb-2">No Workout History</h2>
        <p className="text-text-muted mb-6">
          Start tracking your workouts to see your history here!
        </p>
        <Button onClick={() => (window.location.href = '/dashboard')}>
          Go to Today's Workout
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-surface p-6 rounded-xl shadow-elev">
        <h2 className="text-2xl font-bold mb-2">Workout History</h2>
        <p className="text-text-muted">
          {entries.length} workout{entries.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th
                      className="bg-bg font-semibold sticky top-0 z-10"
                      style={{
                        width: '80px',
                        padding: '12px 8px',
                        textAlign: 'left',
                        borderBottom: '2px solid #ddd',
                      }}
                    >
                      Date
                    </th>
                    <th
                      className="bg-bg font-semibold sticky top-0 z-10"
                      style={{
                        width: '70px',
                        padding: '12px 8px',
                        textAlign: 'right',
                        borderBottom: '2px solid #ddd',
                      }}
                    >
                      Weight
                    </th>
                    <th
                      className="bg-bg font-semibold sticky top-0 z-10"
                      style={{
                        width: '50px',
                        padding: '12px 8px',
                        textAlign: 'right',
                        borderBottom: '2px solid #ddd',
                      }}
                    >
                      Completed
                    </th>
                    <th
                      className="bg-bg font-semibold sticky top-0 z-10"
                      style={{
                        minWidth: '200px',
                        padding: '12px 8px',
                        textAlign: 'left',
                        borderBottom: '2px solid #ddd',
                      }}
                    >
                      Details
                    </th>
                    <th
                      className="bg-bg font-semibold sticky top-0 z-10"
                      style={{
                        width: '80px',
                        padding: '12px 8px',
                        textAlign: 'right',
                        borderBottom: '2px solid #ddd',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const totalSets = calculateTotalSets(entry.fitnessData)
                    const completedExercises = calculateCompletedExercises(
                      entry.fitnessData
                    )
                    const isExpanded = expandedRows.has(entry.id)

                    return (
                      <>
                        <tr
                          key={entry.id}
                          className="hover:bg-[#f9f9f9] transition-colors cursor-pointer"
                          style={{ borderBottom: isExpanded ? 'none' : '1px solid #eee' }}
                          onClick={() => toggleRow(entry.id)}
                        >
                          <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                              <div>
                                <div className="font-medium">
                                  {formatDate(new Date(entry.entryDate))}
                                </div>
                                <div className="text-sm text-text-muted">
                                  {new Date(entry.entryDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px', verticalAlign: 'top', textAlign: 'right' }}>
                            {entry.weight ? (
                              <span className="font-medium">{entry.weight}</span>
                            ) : (
                              <span className="text-text-muted">—</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 8px', verticalAlign: 'top', textAlign: 'right' }}>
                            <span className="font-medium">{completedExercises}</span>
                          </td>
                          <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                            <span className="font-medium">{totalSets}</span>
                            <span className="text-text-muted"> sets</span>
                          </td>
                          <td style={{ padding: '10px 8px', verticalAlign: 'top', textAlign: 'right' }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                const dateStr = new Date(entry.entryDate)
                                  .toISOString()
                                  .split('T')[0]
                                window.location.href = `/dashboard?date=${dateStr}`
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(entry.id, entry.entryDate)
                              }}
                              disabled={deleting === entry.id}
                            >
                              {deleting === entry.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${entry.id}-details`} style={{ borderBottom: '1px solid #eee' }}>
                            <td colSpan={5} style={{ padding: '0 8px 16px 48px', backgroundColor: '#f9f9f9' }}>
                              <div className="space-y-2">
                                <div className="font-semibold text-sm mb-3 mt-2">Exercise Breakdown:</div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {Object.entries(entry.fitnessData)
                                    .filter(([, sets]) => sets > 0)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([exerciseId, sets]) => (
                                      <div
                                        key={exerciseId}
                                        className="flex items-center justify-between bg-white p-2 rounded border border-border"
                                      >
                                        <span className="text-sm">{getExerciseName(exerciseId)}</span>
                                        <span className="font-bold text-primary">{sets} sets</span>
                                      </div>
                                    ))}
                                </div>
                                {Object.keys(entry.fitnessData).filter(
                                  (key) => entry.fitnessData[key] === 0
                                ).length > 0 && (
                                  <>
                                    <div className="font-semibold text-sm mb-2 mt-4">Skipped:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(entry.fitnessData)
                                        .filter(([, sets]) => sets === 0)
                                        .map(([exerciseId]) => (
                                          <span
                                            key={exerciseId}
                                            className="text-xs text-text-muted bg-white px-2 py-1 rounded border border-border"
                                          >
                                            {getExerciseName(exerciseId)}
                                          </span>
                                        ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {entries.map((entry) => {
          const totalSets = calculateTotalSets(entry.fitnessData)
          const completedExercises = calculateCompletedExercises(entry.fitnessData)
          const isExpanded = expandedRows.has(entry.id)

          return (
            <Card key={entry.id}>
              <CardHeader onClick={() => toggleRow(entry.id)} className="cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {formatDate(new Date(entry.entryDate))}
                      </CardTitle>
                      <p className="text-sm text-text-muted mt-1">
                        {new Date(entry.entryDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                        })}
                      </p>
                    </div>
                  </div>
                  {entry.weight && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">{entry.weight}</div>
                      <div className="text-xs text-text-muted">lbs</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-6">
                  <div>
                    <div className="text-sm text-text-muted mb-1">Exercises</div>
                    <div className="text-xl font-bold">
                      {completedExercises}
                      <span className="text-text-muted text-base font-normal">
                        {' '}
                        / {EXERCISES.length}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-muted mb-1">Total Sets</div>
                    <div className="text-xl font-bold">{totalSets}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="font-semibold text-sm">Exercise Breakdown:</div>
                    <div className="space-y-2">
                      {Object.entries(entry.fitnessData)
                        .filter(([, sets]) => sets > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([exerciseId, sets]) => (
                          <div
                            key={exerciseId}
                            className="flex items-center justify-between bg-[#f9f9f9] p-2 rounded"
                          >
                            <span className="text-sm">{getExerciseName(exerciseId)}</span>
                            <span className="font-bold text-primary">{sets} sets</span>
                          </div>
                        ))}
                    </div>
                    {Object.keys(entry.fitnessData).filter(
                      (key) => entry.fitnessData[key] === 0
                    ).length > 0 && (
                      <>
                        <div className="font-semibold text-sm mt-3">Skipped:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(entry.fitnessData)
                            .filter(([, sets]) => sets === 0)
                            .map(([exerciseId]) => (
                              <span
                                key={exerciseId}
                                className="text-xs text-text-muted bg-[#f9f9f9] px-2 py-1 rounded"
                              >
                                {getExerciseName(exerciseId)}
                              </span>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const dateStr = new Date(entry.entryDate)
                        .toISOString()
                        .split('T')[0]
                      window.location.href = `/dashboard?date=${dateStr}`
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(entry.id, entry.entryDate)}
                    disabled={deleting === entry.id}
                  >
                    {deleting === entry.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
