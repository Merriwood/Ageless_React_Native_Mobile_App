import { prisma } from '../lib/prisma'

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database connection...\n')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!\n')

    // Get database info
    const result = await prisma.$queryRaw<any[]>`
      SELECT current_database(), current_user, version();
    `
    console.log('📊 Database Info:')
    console.log('  Database:', result[0].current_database)
    console.log('  User:', result[0].current_user)
    console.log('  Version:', result[0].version.split(' ').slice(0, 2).join(' '))
    console.log()

    // List all tables
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    console.log('📋 Tables in database:')
    tables.forEach((t) => console.log(`  - ${t.table_name}`))
    console.log()

    // Count users
    const userCount = await prisma.users.count()
    console.log(`👥 Total users: ${userCount}`)

    // Count entries
    const entryCount = await prisma.entries.count()
    console.log(`📝 Total workout entries: ${entryCount}`)
    console.log()

    // Get sample user (first one)
    if (userCount > 0) {
      const sampleUser = await prisma.users.findFirst({
        select: {
          id: true,
          email: true,
          goal: true,
          created_at: true,
        },
      })
      console.log('👤 Sample users:')
      console.log('  ID:', sampleUser?.id)
      console.log('  Email:', sampleUser?.email)
      console.log('  Goal:', sampleUser?.goal || 'Not set')
      console.log('  Created:', sampleUser?.created_at)
      console.log()
    }

    // Get sample entry with fitness data
    if (entryCount > 0) {
      const sampleEntry = await prisma.entries.findFirst({
        select: {
          id: true,
          user_id: true,
          entry_date: true,
          weight: true,
          fitness_data: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      })
      console.log('🏋️  Sample workout entry:')
      console.log('  Entry ID:', sampleEntry?.id)
      console.log('  User ID:', sampleEntry?.user_id)
      console.log('  Date:', sampleEntry?.entry_date)
      console.log('  Weight:', sampleEntry?.weight ? `${sampleEntry.weight} lbs` : 'Not recorded')
      console.log('  Fitness Data (JSON):')
      console.log(JSON.stringify(sampleEntry?.fitness_data, null, 2))
      console.log()

      // Count exercises in this entry
      const exerciseCount = Object.keys((sampleEntry?.fitness_data as any) || {}).length
      const totalSets = Object.values((sampleEntry?.fitness_data as any) || {}).reduce(
        (sum: number, val: any) => sum + (Number(val) || 0),
        0
      ) as number
      console.log(`  Exercises tracked: ${exerciseCount}`)
      console.log(`  Total sets: ${totalSets}`)
    }

    console.log('\n✅ Database verification complete!')
  } catch (error) {
    console.error('❌ Database verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()
