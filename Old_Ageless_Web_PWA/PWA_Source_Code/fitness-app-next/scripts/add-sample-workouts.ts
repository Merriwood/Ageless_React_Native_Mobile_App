import { prisma } from '../lib/prisma'

async function addSampleWorkouts() {
  try {
    // Find the test@test.com user
    const user = await prisma.users.findUnique({
      where: { email: 'test@test.com' }
    })

    if (!user) {
      console.log('❌ User test@test.com not found')
      return
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)
    console.log()
    console.log('📝 Adding 5 sample workouts...')
    console.log()

    // Create 5 sample workouts (last 5 days)
    const workouts = []
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Sample workout data - varied exercises
      const fitnessData: Record<string, number> = {
        'Bike': i === 0 ? 1 : 0,
        'Abs': i % 2 === 0 ? 4 : 0,
        'Chest Press': i < 3 ? 4 : 0,
        'Leg Press': 4,
        'Lat': i % 2 === 1 ? 4 : 0,
        'Military': i < 2 ? 4 : 0,
        'Crunch': i === 1 ? 4 : 0,
        'Bicep Curls': i > 1 ? 4 : 0,
        'Triceps': 4,
        'Overhead Pull': i === 0 ? 4 : 0,
        'Row': i % 2 === 0 ? 4 : 0,
      }

      const weight = 150 + (i * 0.5) // Slight weight variation

      workouts.push({
        user_id: user.id,
        entry_date: date,
        weight: weight,
        fitness_data: fitnessData,
      })
    }

    // Insert workouts
    for (const workout of workouts) {
      const created = await prisma.entries.create({
        data: workout
      })

      const totalSets = Object.values(workout.fitness_data).reduce(
        (sum, val) => sum + val, 0
      )
      const completedExercises = Object.values(workout.fitness_data).filter(
        val => val > 0
      ).length

      console.log(`  ✅ ${workout.entry_date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${workout.weight} lbs - ${completedExercises}/11 exercises - ${totalSets} sets`)
    }

    console.log()
    console.log('🎉 Sample workouts added successfully!')
    console.log()
    console.log('💡 Refresh your browser to see the data in:')
    console.log('   - History tab')
    console.log('   - Summary tab')
    console.log()

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleWorkouts()
