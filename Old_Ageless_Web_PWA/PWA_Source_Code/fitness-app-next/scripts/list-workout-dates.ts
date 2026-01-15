import { prisma } from '../lib/prisma'

async function listWorkoutDates() {
  try {
    console.log('=' .repeat(80))
    console.log('📅 ALL WORKOUT DATES')
    console.log('=' .repeat(80))
    console.log()

    // Get all entries ordered by date
    const entries = await prisma.entries.findMany({
      select: {
        id: true,
        user_id: true,
        entry_date: true,
        weight: true,
        fitness_data: true,
        users: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        entry_date: 'desc',
      },
    })

    console.log(`Total Workouts: ${entries.length}\n`)

    // Group by user
    const byUser = entries.reduce((acc, entry) => {
      const email = entry.users?.email || 'Unknown'
      if (!acc[email]) {
        acc[email] = []
      }
      acc[email].push(entry)
      return acc
    }, {} as Record<string, typeof entries>)

    // Display by user
    Object.entries(byUser).forEach(([email, userEntries]) => {
      console.log(`\n👤 ${email} (${userEntries.length} workouts)`)
      console.log('-'.repeat(80))

      userEntries.forEach((entry, index) => {
        const fitnessData = entry.fitness_data as any
        const completedExercises = Object.values(fitnessData || {}).filter(
          (val: any) => Number(val) > 0
        ).length
        const totalSets = Object.values(fitnessData || {}).reduce(
          (sum: number, val: any) => sum + (Number(val) || 0),
          0
        ) as number

        const dateStr = entry.entry_date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })

        const weightStr = entry.weight ? `${entry.weight} lbs` : 'No weight'

        console.log(
          `  ${String(index + 1).padStart(2, ' ')}. ${dateStr.padEnd(20, ' ')} | ` +
          `${weightStr.padEnd(12, ' ')} | ` +
          `${completedExercises}/${Object.keys(fitnessData).length} exercises | ` +
          `${totalSets} sets`
        )
      })
    })

    // Show calendar view for main user
    console.log('\n\n📊 CALENDAR VIEW - Most Active User')
    console.log('=' .repeat(80))

    const mainUser = Object.entries(byUser)
      .sort((a, b) => b[1].length - a[1].length)[0]

    if (mainUser) {
      const [email, userEntries] = mainUser
      console.log(`User: ${email}`)
      console.log()

      // Group by month
      const byMonth = userEntries.reduce((acc, entry) => {
        const monthKey = entry.entry_date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })
        if (!acc[monthKey]) {
          acc[monthKey] = []
        }
        acc[monthKey].push(entry)
        return acc
      }, {} as Record<string, typeof entries>)

      Object.entries(byMonth)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .forEach(([month, monthEntries]) => {
          console.log(`\n${month} (${monthEntries.length} workouts)`)

          // Create a simple calendar
          const days = monthEntries.map(e => e.entry_date.getDate()).sort((a, b) => a - b)
          const daysStr = days.map(d => String(d).padStart(2, ' ')).join(', ')
          console.log(`  Days: ${daysStr}`)
        })
    }

    // Workout frequency analysis
    console.log('\n\n📈 WORKOUT FREQUENCY ANALYSIS')
    console.log('=' .repeat(80))

    const allDates = entries.map(e => e.entry_date)
    const firstDate = allDates[allDates.length - 1]
    const lastDate = allDates[0]
    const daysDiff = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    const avgPerWeek = ((entries.length / daysDiff) * 7).toFixed(1)

    console.log(`First Workout: ${firstDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`)
    console.log(`Last Workout:  ${lastDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`)
    console.log(`Total Days:    ${daysDiff} days`)
    console.log(`Total Workouts: ${entries.length}`)
    console.log(`Average:       ${avgPerWeek} workouts per week`)

    // Day of week analysis
    const dayOfWeek = entries.reduce((acc, entry) => {
      const day = entry.entry_date.toLocaleDateString('en-US', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('\n📅 Workouts by Day of Week:')
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    dayOrder.forEach(day => {
      const count = dayOfWeek[day] || 0
      const bar = '█'.repeat(Math.round(count / 2))
      console.log(`  ${day.padEnd(10, ' ')}: ${String(count).padStart(2, ' ')} ${bar}`)
    })

    console.log('\n' + '=' .repeat(80))
    console.log('✅ Workout dates listing complete!')
    console.log('=' .repeat(80))

  } catch (error) {
    console.error('❌ Error listing workout dates:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

listWorkoutDates()
