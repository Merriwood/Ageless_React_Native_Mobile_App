// Quick test script to check summary API response
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSummaryQuery() {
  try {
    // Use a test user ID - adjust this to match your actual user
    const userId = 1

    console.log('Testing summary query for user:', userId)
    console.log('=====================================\n')

    // First, check if there are any entries
    const entriesCount = await prisma.entries.count({
      where: { user_id: userId }
    })
    console.log('Total entries for user:', entriesCount)

    if (entriesCount === 0) {
      console.log('\n❌ NO ENTRIES FOUND - This is why summary is empty!')
      console.log('You need to create workout entries first.\n')
      await prisma.$disconnect()
      return
    }

    // Check raw entries
    const recentEntries = await prisma.entries.findMany({
      where: { user_id: userId },
      orderBy: { entry_date: 'desc' },
      take: 3
    })

    console.log('\nRecent entries:')
    recentEntries.forEach(entry => {
      console.log(`  - Date: ${entry.entryDate.toISOString().split('T')[0]}`)
      console.log(`    Weight: ${entry.weight}`)
      console.log(`    Exercises: ${Object.keys(entry.fitnessData).length}`)
      console.log(`    Data: ${JSON.stringify(entry.fitnessData).substring(0, 100)}...`)
    })

    // Now test the summary query
    console.log('\n\nTesting summary aggregation query:')
    console.log('=====================================\n')

    const result = await prisma.$queryRaw`
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
      LIMIT 5
    `

    console.log('Summary query results:')
    console.log(JSON.stringify(result, null, 2))

    if (result.length === 0) {
      console.log('\n❌ QUERY RETURNED EMPTY - Checking why...')

      // Debug: Check what the base CTE returns
      const baseCheck = await prisma.$queryRaw`
        SELECT
          (entry_date - EXTRACT(dow FROM entry_date)::int * INTERVAL '1 day')::date AS week_of_sunday,
          entry_date,
          weight
        FROM entries
        WHERE user_id = ${userId}
        LIMIT 5
      `
      console.log('\nBase CTE check:', baseCheck)
    } else {
      console.log(`\n✅ Found ${result.length} weekly summaries`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSummaryQuery()
