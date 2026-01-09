// Core type definitions for the Fitness Tracker app

export interface User {
  id: number
  email: string
  goal?: string | null
  createdAt: Date
}

export interface WorkoutEntry {
  id: number
  userId: number
  entryDate: Date
  weight?: number | null
  fitnessData: Record<string, number>
  createdAt: Date
  updatedAt: Date
}

export interface WeeklySummary {
  weekOfSunday: string
  weightAvg: number | null
  totals: Record<string, number>
}

export interface OfflineQueueItem {
  date: string
  weight?: number
  fitnessData: Record<string, number>
  timestamp: number
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  goal?: string[]
}

export interface AuthResponse {
  user: {
    id: number
    email: string
  }
}

// Form types
export interface WorkoutFormData {
  weight?: number
  exercises: Record<string, number>
}
