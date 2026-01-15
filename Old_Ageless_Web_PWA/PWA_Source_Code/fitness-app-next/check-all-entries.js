const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAllData() {
  try {
    // Check all users
    const users = await prisma.users.findMany({
      select: { id: true, email: true }
    })
    console.log('Users in database:')
    users.forEach(u => console.log(`  - ID: ${u.id}, Email: ${u.email}`))

    // Check all entries
    const entries = await prisma.entries.findMany({
      select: {
        id: true,
        user_id: true,
        entry_date: true,
        weight: true,
        fitness_data: true
      },
      orderBy: { entry_date: 'desc' },
      take: 10
    })

    console.log(`\nTotal entries in database: ${entries.length}`)
    if (entries.length > 0) {
      console.log('\nRecent entries:')
      entries.forEach(e => {
        console.log(`  - ID: ${e.id}, User: ${e.user_id}, Date: ${e.entry_date.toISOString().split('T')[0]}`)
        console.log(`    Weight: ${e.weight}, Exercises: ${Object.keys(e.fitness_data).length}`)
      })
    } else {
      console.log('\n❌ NO ENTRIES IN DATABASE AT ALL')
      console.log('This explains why Summary page is empty.')
      console.log('\nTo fix: Create workout entries by using the dashboard.')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllData()
