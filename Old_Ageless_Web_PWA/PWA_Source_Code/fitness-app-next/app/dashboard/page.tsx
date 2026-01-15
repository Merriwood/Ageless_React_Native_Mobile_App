'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/DatePicker'
import { EXERCISES } from '@/lib/constants/exercises'
import { getTodayDate, calculateProgress } from '@/lib/utils'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weight, setWeight] = useState('')
  const [exercises, setExercises] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [lastPayload, setLastPayload] = useState<string>('')
  const [toastMessage, setToastMessage] = useState('')
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { enqueue, getQueue } = useOfflineQueue()

  // Helper to format date as YYYY-MM-DD
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Load workout when date changes
  useEffect(() => {
    loadWorkoutForDate()
  }, [selectedDate])

  const loadWorkoutForDate = async () => {
    setLoading(true)
    try {
      const dateStr = formatDateForApi(selectedDate)
      let currentWeight = ''
      let currentExercises = {}

      // 1. Try to fetch from server
      try {
        const response = await fetch(`/api/workouts/${dateStr}`)
        if (response.ok) {
          const data = await response.json()
          if (data) {
            currentWeight = data.weight?.toString() || ''
            currentExercises = data.fitnessData || {}
          }
        }
      } catch (err) {
        console.warn('[Dashboard] Fetch failed, checking offline queue', err)
      }

      // 2. Check offline queue for pending changes
      // This fixes the "Split Brain" issue where local changes were ignored
      const queue = getQueue()
      const pendingEntry = queue.find(entry => {
        if (entry.body && typeof entry.body.date === 'string') {
          return entry.body.date === dateStr
        }
        return false
      })

      if (pendingEntry && pendingEntry.body) {
        console.log('[Dashboard] Applying pending offline changes for', dateStr)
        const body = pendingEntry.body as any
        if (body.weight !== undefined && body.weight !== null) {
          currentWeight = body.weight.toString()
        }
        if (body.fitnessData) {
          currentExercises = body.fitnessData
        }
      }

      setWeight(currentWeight)
      setExercises(currentExercises)
      
      // Initialize lastPayload to prevent unnecessary save on load
      const initialPayload = {
        date: dateStr,
        weight: currentWeight ? parseFloat(currentWeight) : null,
        fitnessData: currentExercises,
      }
      setLastPayload(JSON.stringify(initialPayload))

    } catch (error) {
      console.error('Failed to load workout:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Auto-save logic
   * Source of Truth: claude.md Section 0.2.C, 20.1.F
   */
  const saveData = async () => {
    try {
      const dateStr = formatDateForApi(selectedDate)
      const payload = {
        date: dateStr,
        weight: weight ? parseFloat(weight) : null,
        fitnessData: exercises,
      }

      // Duplicate detection: if identical to last payload, skip
      const currentPayload = JSON.stringify(payload)
      if (currentPayload === lastPayload) {
        // console.log('[Dashboard] Skipping duplicate save')
        return
      }
      setLastPayload(currentPayload)

      // Check if online
      if (!navigator.onLine) {
        console.log('[Dashboard] Offline: queueing entry')
        enqueue({
          path: '/api/workouts',
          method: 'POST',
          body: payload,
        })
        setToastMessage('Offline: entry queued to sync')
        setTimeout(() => setToastMessage(''), 2000)
        return
      }

      // Online: send immediately
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Trigger refresh events for open modals
        window.dispatchEvent(new Event('history:refresh'))
        window.dispatchEvent(new Event('summary:refresh'))
        setToastMessage('✓ Entry saved')
        setTimeout(() => setToastMessage(''), 2000)
      } else {
        // Server error (500, etc) - Queue for retry
        console.warn('[Dashboard] Server error, queueing for retry')
        enqueue({
          path: '/api/workouts',
          method: 'POST',
          body: payload,
        })
        setToastMessage('✗ Save failed, queued for retry')
        setTimeout(() => setToastMessage(''), 2000)
      }
    } catch (error) {
      console.error('[Dashboard] Auto-save failed:', error)
      // Network error (fetch failed) - Always queue
      enqueue({
        path: '/api/workouts',
        method: 'POST',
        body: {
          date: formatDateForApi(selectedDate),
          weight: weight ? parseFloat(weight) : null,
          fitnessData: exercises,
        },
      })
      setToastMessage('Offline: entry queued to sync')
      setTimeout(() => setToastMessage(''), 2000)
    }
  }

  // Effect to trigger auto-save when data changes
  useEffect(() => {
    if (loading) return

    const timer = setTimeout(() => {
      saveData()
    }, 2000)

    return () => clearTimeout(timer)
  }, [weight, exercises, loading, selectedDate]) // Dependencies ensure we have latest state

  const incrementExercise = (exerciseId: string) => {
    setExercises((prev) => {
      const current = prev[exerciseId] || 0
      const exercise = EXERCISES.find(e => e.id === exerciseId)
      const maxSets = exercise?.maxSets || 4
      const newValue = Math.min(current + 1, maxSets)

      return {
        ...prev,
        [exerciseId]: newValue,
      }
    })
  }

  const decrementExercise = (exerciseId: string) => {
    setExercises((prev) => {
      const newValue = Math.max((prev[exerciseId] || 0) - 1, 0)

      return {
        ...prev,
        [exerciseId]: newValue,
      }
    })
  }

  const completed = Object.values(exercises).filter((v) => v > 0).length
  const progress = calculateProgress(completed, EXERCISES.length)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-muted">Loading workout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex justify-center">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date)}
        />
      </div>

      {/* Header with Progress */}
      <div className="text-center bg-surface p-6 rounded-xl shadow-elev">
        <h2 className="text-2xl font-bold mb-2">Today's Workout</h2>
        <div className="text-lg text-text-muted mb-3">
          Progress: <span className="font-bold text-primary">{completed}</span>/
          {EXERCISES.length} exercises ({progress}%)
        </div>
        <div className="w-full bg-border rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-3 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Weight Input */}
      <Card>
        <CardContent className="pt-6">
          <label htmlFor="weight" className="block text-sm font-medium mb-2">
            Weight (lbs)
          </label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="Enter your weight (optional)"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value)
            }}
          />
        </CardContent>
      </Card>

      {/* Exercise Grid - RESPONSIVE: 180px < 600px, 240px >= 600px */}
      <div className="grid gap-5 exercise-grid">
        {EXERCISES.map((exercise) => {
          const count = exercises[exercise.id] || 0
          const isCompleted = count >= exercise.maxSets

          return (
            <Card key={exercise.id} completed={isCompleted}>
              <CardHeader>
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                <CardDescription>
                  Target: {exercise.targetReps} {exercise.unit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => decrementExercise(exercise.id)}
                    disabled={count === 0}
                    className="w-11 h-11 rounded-[14px] text-lg shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                  >
                    -
                  </Button>
                  <div className="text-[22px] font-bold w-10 text-center">
                    {count}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => incrementExercise(exercise.id)}
                    disabled={count >= exercise.maxSets}
                    className="w-11 h-11 rounded-[14px] text-lg shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                  >
                    +
                  </Button>
                </div>
                <div className="text-sm text-center text-text-muted">
                  {count} / {exercise.maxSets} sets
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

    </div>
  )
}
