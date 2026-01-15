const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuthFlow() {
  console.log('=== Authentication Flow Test ===\n')

  const testEmail = `auth-test-${Date.now()}@example.com`
  const testPassword = 'Test1234!'

  try {
    // Test 1: Registration
    console.log('Test 1: User Registration...')
    const passwordHash = await bcrypt.hash(testPassword, 10)

    const newUser = await prisma.users.create({
      data: {
        email: testEmail,
        password_hash: passwordHash,
        goal: 'Body, Mind'
      }
    })
    console.log(`✅ User registered successfully`)
    console.log(`   - Email: ${newUser.email}`)
    console.log(`   - User ID: ${newUser.id}`)
    console.log(`   - Goal: ${newUser.goal}`)
    console.log()

    // Test 2: Login validation
    console.log('Test 2: Login validation...')
    const user = await prisma.users.findUnique({
      where: { email: testEmail }
    })

    if (!user) {
      throw new Error('User not found after registration')
    }

    const passwordValid = await bcrypt.compare(testPassword, user.password_hash)

    if (passwordValid) {
      console.log(`✅ Login successful - password validated`)
      console.log(`   - User authenticated: ${user.email}`)
    } else {
      throw new Error('Password validation failed')
    }
    console.log()

    // Test 3: Wrong password
    console.log('Test 3: Invalid password detection...')
    const wrongPasswordValid = await bcrypt.compare('WrongPassword123', user.password_hash)

    if (!wrongPasswordValid) {
      console.log(`✅ Invalid password correctly rejected`)
    } else {
      throw new Error('Wrong password was incorrectly accepted')
    }
    console.log()

    // Test 4: Non-existent user
    console.log('Test 4: Non-existent user detection...')
    const nonExistentUser = await prisma.users.findUnique({
      where: { email: 'nonexistent@example.com' }
    })

    if (!nonExistentUser) {
      console.log(`✅ Non-existent user correctly not found`)
    } else {
      throw new Error('Non-existent user was found')
    }
    console.log()

    // Test 5: Duplicate email prevention
    console.log('Test 5: Duplicate email prevention...')
    try {
      await prisma.users.create({
        data: {
          email: testEmail,
          password_hash: passwordHash,
          goal: 'Other'
        }
      })
      throw new Error('Duplicate email was allowed')
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`✅ Duplicate email correctly rejected`)
      } else {
        throw error
      }
    }
    console.log()

    // Test 6: Session data retrieval
    console.log('Test 6: Session data retrieval...')
    const sessionUser = await prisma.users.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        goal: true,
        created_at: true
      }
    })

    console.log(`✅ Session data retrieved successfully`)
    console.log(`   - User ID: ${sessionUser.id}`)
    console.log(`   - Email: ${sessionUser.email}`)
    console.log(`   - Goal: ${sessionUser.goal}`)
    console.log()

    // Cleanup
    console.log('Cleaning up test user...')
    await prisma.users.delete({
      where: { id: newUser.id }
    })
    console.log(`✅ Test user deleted`)
    console.log()

    console.log('=== All Authentication Tests Passed ===')
    console.log('✅ Registration working')
    console.log('✅ Login validation working')
    console.log('✅ Password hashing working')
    console.log('✅ Duplicate email prevention working')
    console.log('✅ Session data retrieval working')

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testAuthFlow()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
