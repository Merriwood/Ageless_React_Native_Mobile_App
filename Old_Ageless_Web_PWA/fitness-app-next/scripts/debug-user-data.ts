import { prisma } from '../lib/prisma'

async function debugUserData() {
  try {
    // Get the test user you just created
    const newUsers = await prisma.users.findMany({
      where: {
        email: {
          contains: 'test'
        }
      },
      select: {
        id: true,
        email: true,
        created_at: true,
        _count: {
          select: {
            entries: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    })

    console.log('🔍 Recent Test Users:')
    console.log('=' .repeat(70))
    newUsers.forEach(user => {
      console.log(`  [ID: ${user.id}] ${user.email}`)
      console.log(`    Created: ${user.created_at?.toLocaleString()}`)
      console.log(`    Workouts: ${user._count.entries}`)
      console.log()
    })

    // Check if there are entries for these users
    if (newUsers.length > 0) {
      const userId = newUsers[0].id
      const entries = await prisma.entries.findMany({
        where: {
          user_id: userId
        },
        select: {
          id: true,
          entry_date: true,
          weight: true,
          fitness_data: true
        },
        orderBy: {
          entry_date: 'desc'
        },
        take: 5
      })

      console.log(`📊 Workouts for ${newUsers[0].email}:`)
      console.log('=' .repeat(70))
      if (entries.length === 0) {
        console.log('  ❌ NO WORKOUTS FOUND')
        console.log('  This is expected for a newly registered user.')
        console.log()
      } else {
        entries.forEach(entry => {
          const data = entry.fitness_data as any
          const totalSets = Object.values(data || {}).reduce(
            (sum: number, val: any) => sum + (Number(val) || 0),
            0
          ) as number
          console.log(`  Date: ${entry.entry_date.toLocaleDateString()}`)
          console.log(`  Weight: ${entry.weight || 'Not recorded'}`)
          console.log(`  Total Sets: ${totalSets}`)
          console.log()
        })
      }
    }

    // Show existing user with most data
    const userWithData = await prisma.users.findFirst({
      where: {
        entries: {
          some: {}
        }
      },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            entries: true
          }
        }
      },
      orderBy: {
        entries: {
          _count: 'desc'
        }
      }
    })

    if (userWithData) {
      console.log('👤 User with Most Workout Data:')
      console.log('=' .repeat(70))
      console.log(`  Email: ${userWithData.email}`)
      console.log(`  User ID: ${userWithData.id}`)
      console.log(`  Total Workouts: ${userWithData._count.entries}`)
      console.log()
      console.log('💡 TIP: To see historical data, you need to login with this user.')
      console.log('   (You would need to know their password)')
      console.log()
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUserData()
