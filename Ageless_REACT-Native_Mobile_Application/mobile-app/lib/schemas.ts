/**
 * Zod Schemas for API Response Validation
 *
 * Runtime validation of API responses to ensure data integrity
 * Protects against backend changes, data corruption, or MITM attacks
 * Used in api/client.ts response interceptor
 */

import { z } from 'zod';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

// ISO date format (YYYY-MM-DD)
const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// ISO timestamp (full datetime)
const ISOTimestampSchema = z.string().datetime();

// UUID format
const UUIDSchema = z.string().uuid();

// ============================================================================
// WORKOUT ENTRY SCHEMAS
// ============================================================================

export const ExerciseSchema = z.record(z.string(), z.number().int().positive());

export const WorkoutEntrySchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  date: ISODateSchema,
  exercises: ExerciseSchema,
  weight: z.number().positive().optional(),
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

export type WorkoutEntry = z.infer<typeof WorkoutEntrySchema>;

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

// GET /api/entries (paginated list)
export const EntriesResponseSchema = z.object({
  entries: z.array(WorkoutEntrySchema),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type EntriesResponse = z.infer<typeof EntriesResponseSchema>;

// GET /api/entries/:date (single entry)
export const EntryResponseSchema = WorkoutEntrySchema.nullable();

export type EntryResponse = z.infer<typeof EntryResponseSchema>;

// POST /api/entries (save entry)
export const SaveEntryResponseSchema = WorkoutEntrySchema;

export type SaveEntryResponse = z.infer<typeof SaveEntryResponseSchema>;

// DELETE /api/entries/:date (delete entry)
export const DeleteEntryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type DeleteEntryResponse = z.infer<typeof DeleteEntryResponseSchema>;

// ============================================================================
// SUMMARY & STATS SCHEMAS
// ============================================================================

export const ExerciseStatsSchema = z.object({
  sets: z.number().int().nonnegative(),
  totalReps: z.number().int().nonnegative(),
  avgSets: z.number().nonnegative(),
  daysActive: z.number().int().nonnegative(),
});

export const WorkoutStatsSchema = z.object({
  exercises: z.record(ExerciseStatsSchema),
  totalSets: z.number().int().nonnegative(),
  totalWorkouts: z.number().int().nonnegative(),
  daysActive: z.number().int().nonnegative(),
  averageSetsPerDay: z.number().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
  personalBests: z.record(z.number().int().positive()),
});

export type WorkoutStats = z.infer<typeof WorkoutStatsSchema>;

// GET /api/summary
export const SummaryResponseSchema = z.object({
  period: z.object({
    startDate: ISODateSchema,
    endDate: ISODateSchema,
    dayCount: z.number().int().positive(),
  }),
  stats: WorkoutStatsSchema,
  generatedAt: ISOTimestampSchema,
});

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: UUIDSchema,
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

export type User = z.infer<typeof UserSchema>;

// GET /api/me (current user)
export const MeResponseSchema = z.object({
  user: UserSchema,
});

export type MeResponse = z.infer<typeof MeResponseSchema>;

// POST /api/auth/login
export const LoginResponseSchema = z.object({
  token: z.string(), // JWT token
  user: UserSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// POST /api/auth/register
export const RegisterResponseSchema = z.object({
  token: z.string(), // JWT token
  user: UserSchema,
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

// ============================================================================
// ERROR RESPONSE SCHEMA
// ============================================================================

export const ErrorDetailsSchema = z.record(z.any()).optional();

export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: ErrorDetailsSchema,
    timestamp: ISOTimestampSchema,
    requestId: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Safely parse and validate data
 * Returns parsed data or throws with clear error message
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        const path = issue.path.join('.');
        return `${path || 'root'}: ${issue.message}`;
      });

      const message = `Invalid ${context}: ${issues.join('; ')}`;
      const validationError = new Error(message);
      (validationError as any).code = 'VALIDATION_ERROR';
      (validationError as any).issues = error.issues;
      throw validationError;
    }

    throw error;
  }
}

/**
 * Safe parse (returns null on validation failure instead of throwing)
 * Useful for optional fields or defensive coding
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Schemas
  WorkoutEntrySchema,
  ExerciseSchema,
  UserSchema,
  WorkoutStatsSchema,

  // Responses
  EntriesResponseSchema,
  EntryResponseSchema,
  SaveEntryResponseSchema,
  DeleteEntryResponseSchema,
  SummaryResponseSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
  MeResponseSchema,
  ErrorResponseSchema,

  // Helpers
  validateSchema,
  safeParse,
};
