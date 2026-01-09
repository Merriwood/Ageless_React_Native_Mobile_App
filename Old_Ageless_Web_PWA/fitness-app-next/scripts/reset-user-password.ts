import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/auth'

async function resetPassword() {
  try {
    const email = 'sdworkin@newurbangroup.com'
    const newPassword = 'test1234'

    console.log('🔐 Password Reset Tool')
    console.log('=' .repeat(70))
    console.log()

    // Find the user
    const user = await prisma.users.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`❌ User ${email} not found`)
      return
    }

    console.log(`✅ Found users: ${email} (ID: ${user.id})`)
    console.log()

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update the password
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: newPasswordHash
      }
    })

    console.log('✅ Password has been reset successfully!')
    console.log()
    console.log('📝 New Login Credentials:')
    console.log('=' .repeat(70))
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${newPassword}`)
    console.log()
    console.log('💡 You can now login with these credentials to see the 56 historical workouts')
    console.log()

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
