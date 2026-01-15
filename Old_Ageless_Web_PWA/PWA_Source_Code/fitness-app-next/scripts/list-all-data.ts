import { prisma } from '../lib/prisma'

async function listAllData() {
  try {
    console.log('=' .repeat(70))
    console.log('🔍 FITNESS TRACKER DATABASE - COMPLETE DATA LISTING')
    console.log('=' .repeat(70))
    console.log()

    // Get all users
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        goal: true,
        created_at: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    console.log(`👥 ALL USERS (${users.length} total):`)
    console.log('-'.repeat(70))
    users.forEach((user) => {
      console.log(`  [ID: ${user.id}] ${user.email}`)
      console.log(`    Goal: ${user.goal || 'Not set'}`)
      console.log(`    Created: ${user.created_at?.toLocaleDateString()}`)
      console.log(`    Workout Entries: ${user._count.entries}`)
      console.log()
    })

    // Get all entries with full fitness data
    const entries = await prisma.entries.findMany({
      select: {
        id: true,
        user_id: true,
        entry_date: true,
        weight: true,
        fitness_data: true,
        created_at: true,
        users: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        entry_date: 'desc',
      },
      take: 20, // Show last 20 entries
    })

    console.log()
    console.log(`🏋️  RECENT WORKOUT ENTRIES (showing last 20 of ${await prisma.entries.count()}):`)
    console.log('-'.repeat(70))

    entries.forEach((entry) => {
      const fitnessData = entry.fitness_data as any
      const exerciseCount = Object.keys(fitnessData || {}).length
      const totalSets = Object.values(fitnessData || {}).reduce(
        (sum: number, val: any) => sum + (Number(val) || 0),
        0
      ) as number
      const completedExercises = Object.values(fitnessData || {}).filter(
        (val: any) => Number(val) > 0
      ).length

      console.log(`  [Entry #${entry.id}] ${entry.users?.email || 'Unknown'}`)
      console.log(`    Date: ${entry.entry_date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}`)
      console.log(`    Weight: ${entry.weight ? `${entry.weight} lbs` : 'Not recorded'}`)
      console.log(`    Exercises: ${completedExercises}/${exerciseCount} completed | Total Sets: ${totalSets}`)

      // Show which exercises were done
      const completedList = Object.entries(fitnessData || {})
        .filter(([_, sets]) => Number(sets) > 0)
        .map(([exercise, sets]) => `${exercise}(${sets})`)
        .join(', ')

      if (completedList) {
        console.log(`    Completed: ${completedList}`)
      }
      console.log()
    })

    // Show sample JSON structure
    console.log()
    console.log('📋 SAMPLE FITNESS DATA JSON STRUCTURE:')
    console.log('-'.repeat(70))
    const sampleEntry = entries[0]
    if (sampleEntry) {
      console.log(JSON.stringify(sampleEntry.fitness_data, null, 2))
    }

    // Statistics
    console.log()
    console.log('📊 DATABASE STATISTICS:')
    console.log('-'.repeat(70))

    const stats = await prisma.entries.aggregate({
      _count: true,
      _avg: {
        weight: true,
      },
    })

    const oldestEntry = await prisma.entries.findFirst({
      orderBy: { entry_date: 'asc' },
      select: { entry_date: true },
    })

    const newestEntry = await prisma.entries.findFirst({
      orderBy: { entry_date: 'desc' },
      select: { entry_date: true },
    })

    console.log(`  Total Workout Entries: ${stats._count}`)
    console.log(`  Average Weight: ${stats._avg.weight ? `${Number(stats._avg.weight).toFixed(1)} lbs` : 'N/A'}`)
    console.log(`  Date Range: ${oldestEntry?.entry_date.toLocaleDateString()} → ${newestEntry?.entry_date.toLocaleDateString()}`)

    // Calculate total sets across all workouts
    const allEntries = await prisma.entries.findMany({
      select: { fitness_data: true },
    })

    const totalSetsAllTime = allEntries.reduce((sum, entry) => {
      const data = entry.fitness_data as any
      return sum + Object.values(data || {}).reduce(
        (s: number, v: any) => s + (Number(v) || 0),
        0
      ) as number
    }, 0)

    console.log(`  Total Sets All-Time: ${totalSetsAllTime}`)
    console.log()

    console.log('=' .repeat(70))
    console.log('✅ Database listing complete!')
    console.log('=' .repeat(70))

  } catch (error) {
    console.error('❌ Error listing data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

listAllData()
