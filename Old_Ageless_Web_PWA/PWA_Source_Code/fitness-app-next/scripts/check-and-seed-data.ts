import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Checking database for existing data...\n')

    // Check for users
    const users = await prisma.users.findMany()
    console.log(`✓ Found ${users.length} users`)

    // Check for entries
    const entries = await prisma.entries.findMany()
    console.log(`✓ Found ${entries.length} workout entries\n`)

    if (entries.length > 0) {
      console.log('📊 Sample entries:')
      entries.slice(0, 5).forEach((entry) => {
        console.log(`  - ID: ${entry.id}, User: ${entry.user_id}, Date: ${entry.entry_date}, Weight: ${entry.weight}`)
        console.log(`    Exercises: ${JSON.stringify(entry.fitness_data)}`)
      })
      console.log('\n✅ Database has existing data! History and Summary pages should work.\n')
    } else {
      console.log('⚠️  No workout entries found in database.')
      console.log('📝 Creating sample workout data for demo@ageless.com user...\n')

      // Find demo user
      const demoUser = await prisma.users.findUnique({
        where: { email: 'demo@ageless.com' },
      })

      if (!demoUser) {
        console.log('❌ Demo user not found. Please register demo@ageless.com first.')
        return
      }

      console.log(`✓ Found demo user (ID: ${demoUser.id})\n`)

      // Create sample workout data for the past 2 weeks
      const today = new Date()
      const sampleWorkouts = []

      for (let i = 0; i < 14; i++) {
        const workoutDate = new Date(today)
        workoutDate.setDate(workoutDate.getDate() - i)
        workoutDate.setHours(0, 0, 0, 0)

        // Random workout data
        const fitnessData: Record<string, number> = {}
        const exercises = ['pushups', 'situps', 'squats', 'pullups', 'dips', 'lunges', 'plank', 'burpees']

        // Randomly complete 4-6 exercises with 1-4 sets each
        const numExercises = 4 + Math.floor(Math.random() * 3)
        const shuffled = exercises.sort(() => 0.5 - Math.random())

        for (let j = 0; j < numExercises; j++) {
          fitnessData[shuffled[j]] = 1 + Math.floor(Math.random() * 4)
        }

        const weight = 150 + Math.random() * 10 // Weight between 150-160 lbs

        sampleWorkouts.push({
          user_id: demoUser.id,
          entry_date: workoutDate,
          weight: Math.round(weight * 10) / 10,
          fitness_data: fitnessData,
        })
      }

      // Insert sample data
      for (const workout of sampleWorkouts) {
        await prisma.entries.create({
          data: workout,
        })
        console.log(`✓ Created workout for ${workout.entry_date.toLocaleDateString()}`)
      }

      console.log(`\n✅ Created ${sampleWorkouts.length} sample workout entries!`)
      console.log('📊 History and Summary pages should now display data.\n')
    }

    // Summary stats
    const entriesByUser = await prisma.entries.groupBy({
      by: ['user_id'],
      _count: {
        id: true,
      },
    })

    console.log('📈 Entries by user:')
    for (const group of entriesByUser) {
      const user = await prisma.users.findUnique({ where: { id: group.user_id || 0 } })
      console.log(`  - ${user?.email}: ${group._count.id} workouts`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
