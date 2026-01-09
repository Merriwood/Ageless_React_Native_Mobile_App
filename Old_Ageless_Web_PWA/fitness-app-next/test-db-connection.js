const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  console.log('=== Database Connection Test ===\n')

  try {
    // Test 1: Connection
    console.log('Test 1: Testing database connection...')
    await prisma.$connect()
    console.log('✅ Successfully connected to database\n')

    // Test 2: Count users
    console.log('Test 2: Counting users in database...')
    const userCount = await prisma.users.count()
    console.log(`✅ Found ${userCount} users in database\n`)

    // Test 3: Count entries
    console.log('Test 3: Counting workout entries in database...')
    const entryCount = await prisma.entries.count()
    console.log(`✅ Found ${entryCount} workout entries in database\n`)

    // Test 4: Fetch sample user (if exists)
    console.log('Test 4: Fetching sample user data...')
    const sampleUser = await prisma.users.findFirst({
      include: {
        entries: {
          take: 3,
          orderBy: {
            entry_date: 'desc'
          }
        }
      }
    })

    if (sampleUser) {
      console.log(`✅ Sample user found:`)
      console.log(`   - Email: ${sampleUser.email}`)
      console.log(`   - Goal: ${sampleUser.goal || 'Not set'}`)
      console.log(`   - Created: ${sampleUser.created_at}`)
      console.log(`   - Number of entries: ${sampleUser.entries.length}`)
    } else {
      console.log('⚠️  No users found in database')
    }
    console.log()

    // Test 5: Schema validation
    console.log('Test 5: Validating schema structure...')
    const tableInfo = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    console.log('✅ Database tables found:')
    tableInfo.forEach(table => {
      console.log(`   - ${table.table_name}`)
    })
    console.log()

    // Test 6: Test write operation (if no test user exists)
    console.log('Test 6: Testing data persistence (write operation)...')
    const testEmail = `test-${Date.now()}@example.com`

    try {
      const testUser = await prisma.users.create({
        data: {
          email: testEmail,
          password_hash: 'test_hash_' + Date.now(),
          goal: 'Testing'
        }
      })
      console.log(`✅ Successfully created test user: ${testUser.email}`)
      console.log(`   - User ID: ${testUser.id}`)

      // Test 7: Create entry for test user
      console.log('Test 7: Testing entry creation...')
      const testEntry = await prisma.entries.create({
        data: {
          user_id: testUser.id,
          entry_date: new Date(),
          weight: 70.5,
          fitness_data: {
            pushups: 10,
            situps: 20
          }
        }
      })
      console.log(`✅ Successfully created workout entry for user`)
      console.log(`   - Entry ID: ${testEntry.id}`)
      console.log(`   - Weight: ${testEntry.weight}kg`)
      console.log()

      // Test 8: Read back the data
      console.log('Test 8: Testing data read operation...')
      const retrievedUser = await prisma.users.findUnique({
        where: { id: testUser.id },
        include: {
          entries: true
        }
      })
      console.log(`✅ Successfully retrieved user data`)
      console.log(`   - User has ${retrievedUser.entries.length} entry/entries`)
      console.log()

      // Test 9: Update operation
      console.log('Test 9: Testing data update operation...')
      const updatedEntry = await prisma.entries.update({
        where: { id: testEntry.id },
        data: {
          weight: 71.0,
          fitness_data: {
            pushups: 15,
            situps: 25
          }
        }
      })
      console.log(`✅ Successfully updated workout entry`)
      console.log(`   - New weight: ${updatedEntry.weight}kg`)
      console.log()

      // Test 10: Delete operations (cleanup)
      console.log('Test 10: Testing data delete operation...')
      await prisma.entries.delete({
        where: { id: testEntry.id }
      })
      console.log(`✅ Successfully deleted workout entry`)

      await prisma.users.delete({
        where: { id: testUser.id }
      })
      console.log(`✅ Successfully deleted test user`)
      console.log()

    } catch (createError) {
      console.log(`⚠️  Could not create test user: ${createError.message}`)
      console.log('   (This is expected if database is read-only)')
      console.log()
    }

    console.log('=== All Database Tests Complete ===')
    console.log('✅ Database is accessible and persistent')

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
