import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword(email: string, newPassword: string) {
  try {
    console.log(`🔐 Resetting password for: ${email}\n`)

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      return
    }

    console.log(`✓ Found user (ID: ${user.id})\n`)

    // Hash new password
    const passwordHash = await hash(newPassword, 12)

    // Update password
    await prisma.users.update({
      where: { email },
      data: { password_hash: passwordHash },
    })

    console.log(`✅ Password reset successfully!`)
    console.log(`\nNew credentials:`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${newPassword}\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Reset password for sdworkin@newurbangroup.com
const email = process.argv[2] || 'sdworkin@newurbangroup.com'
const password = process.argv[3] || 'Test123!'

resetPassword(email, password)
