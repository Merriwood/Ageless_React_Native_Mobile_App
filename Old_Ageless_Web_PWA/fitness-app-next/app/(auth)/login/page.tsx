'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FaceIDIcon } from '@/components/auth/FaceIDIcon'
import Link from 'next/link'
import Image from 'next/image'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formExpanded, setFormExpanded] = useState(true)
  const [saveUserId, setSaveUserId] = useState(false)
  const registered = searchParams.get('registered')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-overlay">
      <div className="login-container">
        {/* Header with Logo */}
        <div className="login-header">
          <Image
            src="/apple-touch-icon.png"
            alt="Ageless Logo"
            width={72}
            height={72}
            className="login-heart-logo"
            style={{
              display: 'block',
              margin: '0 auto 16px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            priority
          />
          <h1 className="app-title">Ageless.</h1>
        </div>

        {/* Welcome Section with Face ID */}
        <div className="welcome-section">
          <div className="welcome-content">
            <FaceIDIcon />
            <h2 className="welcome-title">Welcome</h2>
            <p className="welcome-subtitle">Track your daily workout progress</p>
          </div>
        </div>

        {/* Collapsible Sign In Header */}
        <div className="sign-in-section">
          <div
            className={`sign-in-header ${formExpanded ? 'expanded' : ''}`}
            onClick={() => setFormExpanded(!formExpanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFormExpanded(!formExpanded)}
          >
            <h2 className="sign-in-title">Sign in</h2>
            <span className="collapse-arrow">⌄</span>
          </div>
        </div>

        {/* Form Section (Collapsible) */}
        <div className="form-section" style={{ display: formExpanded ? 'block' : 'none' }}>
          <div className={`form-content ${formExpanded ? 'show' : ''}`}>
            {registered && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                Account created successfully! Please sign in.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group password-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
                <span
                  className="password-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowPassword(!showPassword)}
                >
                  👁
                </span>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="save-userid"
                  className="checkbox-input"
                  checked={saveUserId}
                  onChange={(e) => setSaveUserId(e.target.checked)}
                />
                <label htmlFor="save-userid" className="checkbox-label">
                  Save user ID
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  type="submit"
                  className="sign-in-button"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
                <Link href="/register" style={{ flex: 1 }}>
                  <Button
                    type="button"
                    className="sign-in-button"
                    style={{ background: '#555' }}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Forgot Section */}
        <div className="forgot-section show">
          <div className="forgot-content">
            <Link href="#" className="forgot-link">
              Forgot user ID or password?
            </Link>
            <div style={{ margin: '10px 0', color: '#666666' }}>or</div>
            <Link href="/register" className="forgot-link">
              Create new account
            </Link>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation">
          <button className="nav-button">📞 Call us</button>
          <button className="nav-button">📍 Find us</button>
          <button className="nav-button">⋯ More</button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
