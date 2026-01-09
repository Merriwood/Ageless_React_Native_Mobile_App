# 🚀 QUICKSTART GUIDE - Complete the Fitness Tracker

This guide provides **copy-paste ready code** to complete the remaining 60% of the application. The foundation (40%) is already built.

## ✅ What's Already Done

- ✅ Next.js 14 + TypeScript + Tailwind setup
- ✅ Prisma ORM + Database schema
- ✅ NextAuth authentication configured
- ✅ Global styles matching original design
- ✅ Type definitions and utilities
- ✅ UI components: Button, Input, Card

## 🎯 What You Need to Build (Follow in Order)

### STEP 1: Create Register API Route (10 minutes)

**File: `app/api/auth/register/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, goal } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        goal: Array.isArray(goal) ? goal.join(',') : goal || null,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
```

### STEP 2: Create Auth Layout (5 minutes)

**File: `app/(auth)/layout.tsx`**
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="login-overlay">
      {children}
    </div>
  )
}
```

### STEP 3: Create Login Page (20 minutes)

**File: `app/(auth)/login/page.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="p-10 pb-6 text-center">
        <h1 className="text-3xl font-semibold">Ageless Body.</h1>
      </div>

      <div className="mx-5 mb-5 rounded-xl bg-surface p-6 shadow-elev border border-border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-normal mb-2">Welcome</h2>
          <p className="text-sm text-text-muted">Track your daily workout progress</p>
        </div>
      </div>

      <div className="mx-5 mb-3 rounded-xl bg-surface p-6 shadow-elev border border-border">
        <h2 className="text-xl font-semibold mb-4">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
              >
                👁
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>

      <div className="mx-5 mb-5 rounded-xl bg-surface p-6 text-center shadow-elev border border-border">
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create new account
        </Link>
      </div>

      <div className="h-18 bg-[#222] flex items-center justify-around px-5 rounded-b-xl">
        <button className="text-white text-sm py-3 px-2">📞 Call us</button>
        <button className="text-white text-sm py-3 px-2">📍 Find us</button>
        <button className="text-white text-sm py-3 px-2">⋯ More</button>
      </div>
    </div>
  )
}
```

### STEP 4: Create Register Page (25 minutes)

**File: `app/(auth)/register/page.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

const GOALS = ['Mind', 'Body', 'Heart', 'Nutrition', 'Other']

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, goal: selectedGoals }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // After successful registration, redirect to login
      router.push('/login?registered=true')
    } catch (err) {
      setError('An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="p-10 pb-6 text-center">
        <h1 className="text-3xl font-semibold">Ageless Body.</h1>
      </div>

      <div className="mx-5 mb-5 rounded-xl bg-surface p-6 shadow-elev border border-border">
        <h2 className="text-xl font-semibold mb-4">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-text-muted mt-1">At least 8 characters</p>
          </div>

          <div>
            <label className="block text-base font-medium mb-3">
              Goal (optional)
            </label>
            <div className="space-y-2">
              {GOALS.map(goal => (
                <label key={goal} className="flex items-center gap-2 p-1">
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    onChange={() => toggleGoal(goal)}
                    className="w-5 h-5 accent-primary"
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
      </div>

      <div className="mx-5 mb-5 rounded-xl bg-surface p-6 text-center shadow-elev border border-border">
        <Link href="/login" className="text-primary font-medium hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  )
}
```

### STEP 5: Create Dashboard Layout (30 minutes)

**File: `app/(dashboard)/layout.tsx`**
```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-4 text-center">
        <h1 className="text-xl font-semibold">Ageless Body.</h1>
      </header>
      <main className="flex-1 container mx-auto p-5 pb-24">
        {children}
      </main>
      <nav className="pwa-nav">
        <button className="pwa-nav__btn is-active" type="button">
          <span className="pwa-nav__icon">🏠</span>
          <span className="pwa-nav__label">Home</span>
        </button>
        <button className="pwa-nav__btn" type="button">
          <span className="pwa-nav__icon">⭐</span>
          <span className="pwa-nav__label">My Body</span>
        </button>
        <button className="pwa-nav__btn" type="button">
          <span className="pwa-nav__icon">📷</span>
          <span className="pwa-nav__label">Scan</span>
        </button>
        <button className="pwa-nav__btn" type="button">
          <span className="pwa-nav__icon">🎧</span>
          <span className="pwa-nav__label">Media</span>
        </button>
        <button className="pwa-nav__btn" type="button">
          <span className="pwa-nav__icon">🎁</span>
          <span className="pwa-nav__label">Rewards</span>
        </button>
      </nav>
    </div>
  )
}
```

## 📋 REMAINING STEPS (Copy implementations from existing app)

### STEP 6: Create Workout API Routes
- `app/api/workouts/route.ts` - GET all, POST new/update
- `app/api/workouts/[date]/route.ts` - GET by date, DELETE

### STEP 7: Create Dashboard Page
- `app/(dashboard)/page.tsx` - Today's workout with 11 exercise cards
- Copy exercise tracking logic from `/web/app.js` lines matching station creation

### STEP 8: Create History & Summary Pages
- `app/(dashboard)/history/page.tsx`
- `app/(dashboard)/summary/page.tsx`
- Copy table rendering logic from existing app

### STEP 9: Add PWA Support
- Copy `icons/` folder from existing app
- Create `public/manifest.json`
- Test installation

### STEP 10: Final Testing & Deployment
- Test all auth flows
- Test workout CRUD
- Deploy to Render with existing DATABASE_URL

## 🔧 TESTING COMMANDS

```bash
# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 PRIORITY NEXT STEPS

1. **Copy Register API** (Step 1) - 10 min
2. **Build Auth Pages** (Steps 2-4) - 50 min
3. **Create Dashboard** (Step 5) - 30 min
4. **Add Workout API** (Step 6) - 60 min
5. **Build Workout Page** (Step 7) - 90 min

**Total estimated time: 4-5 hours for core functionality**

## 💡 Tips

- The existing `/web/app.js` contains all workout logic - copy and adapt to React
- Database schema is identical - no changes needed
- All styling classes are in `globals.css`
- Use existing types from `types/index.ts`

## 🆘 If You Get Stuck

1. Check `README.md` for architecture details
2. Review `/web/app.js` for original logic
3. Types are in `types/index.ts`
4. Database schema in `prisma/schema.prisma`

You have everything needed to complete this in **one focused day of coding**.
