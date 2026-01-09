import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { email },
    })

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await compare(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use-in-prod')
    const token = await new SignJWT({ 
      id: user.id.toString(), 
      email: user.email 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // Long lived token for mobile
      .sign(secret)

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.email,
      }
    })

  } catch (error) {
    console.error('Mobile login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
