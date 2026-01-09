import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for API routes that use auth
export const dynamic = 'force-dynamic'

interface WeeklySummaryRow {
  week_of_sunday: Date
  weight_avg: number | null
  workout_count: number
  totals: any // JSONB type
}

/**
 * GET /api/summary
 *
 * Returns aggregated weekly workout summaries for the authenticated user.
 * Matches the original app's /api/summary endpoint functionality.
 *
 * Response format:
 * [
 *   {
 *     weekOfSunday: "2025-10-12",
 *     weightAvg: 175.5,
 *     workoutCount: 5,
 *     totals: { "Bike": 15, "Abs": 12, ... }
 *   }
 * ]
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // Use Prisma raw query to replicate original SQL aggregation logic
    // This computes weekly summaries server-side for optimal performance
    const result = await prisma.$queryRaw<WeeklySummaryRow[]>`
      WITH base AS (
        SELECT
          (entry_date - EXTRACT(dow FROM entry_date)::int * INTERVAL '1 day')::date AS week_of_sunday,
          entry_date,
          weight,
          fitness_data
        FROM entries
        WHERE user_id = ${userId}
      ),
      weight_agg AS (
        SELECT
          week_of_sunday,
          AVG(weight)::numeric(6,2) AS weight_avg
        FROM base
        GROUP BY week_of_sunday
      ),
      workout_count AS (
        SELECT
          week_of_sunday,
          COUNT(DISTINCT entry_date) AS workout_count
        FROM base
        GROUP BY week_of_sunday
      ),
      per_key AS (
        SELECT
          (e.entry_date - EXTRACT(dow FROM e.entry_date)::int * INTERVAL '1 day')::date AS week_of_sunday,
          k.key,
          SUM((k.value)::int) AS sum_val
        FROM entries e
        CROSS JOIN LATERAL jsonb_each_text(e.fitness_data) AS k(key, value)
        WHERE e.user_id = ${userId}
        GROUP BY 1, k.key
      ),
      totals AS (
        SELECT
          week_of_sunday,
          jsonb_object_agg(key, sum_val) AS totals
        FROM per_key
        GROUP BY week_of_sunday
      )
      SELECT
        w.week_of_sunday,
        w.weight_avg,
        wc.workout_count,
        COALESCE(t.totals, '{}'::jsonb) AS totals
      FROM weight_agg w
      LEFT JOIN workout_count wc USING (week_of_sunday)
      LEFT JOIN totals t USING (week_of_sunday)
      ORDER BY w.week_of_sunday DESC
    `

    // Transform snake_case to camelCase for frontend
    const summaries = result.map(row => ({
      weekOfSunday: row.week_of_sunday.toISOString().split('T')[0],
      weightAvg: row.weight_avg ? Number(row.weight_avg) : null,
      workoutCount: Number(row.workout_count),
      totals: row.totals as Record<string, number>,
    }))

    return NextResponse.json(summaries)
  } catch (error) {
    console.error('GET /api/summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary data' },
      { status: 500 }
    )
  }
}
