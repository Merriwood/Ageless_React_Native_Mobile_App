export interface WorkoutEntry {
  id: number;
  date: string; // ISO string YYYY-MM-DD
  weight?: number;
  fitnessData: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}
