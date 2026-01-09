'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FaceIDIcon } from '@/components/auth/FaceIDIcon'
import Link from 'next/link'
import Image from 'next/image'

const GOALS = ['Mind', 'Body', 'Heart', 'Nutrition', 'Other']

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formExpanded, setFormExpanded] = useState(true)

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          goal: selectedGoals,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Success - redirect to login
      router.push('/login?registered=true')
    } catch (err) {
      setError('An error occurred. Please try again.')
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
            <h2 className="welcome-title">Join Us</h2>
            <p className="welcome-subtitle">Create your account to get started</p>
          </div>
        </div>

        {/* Collapsible Register Header */}
        <div className="sign-in-section">
          <div
            className={`sign-in-header ${formExpanded ? 'expanded' : ''}`}
            onClick={() => setFormExpanded(!formExpanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFormExpanded(!formExpanded)}
          >
            <h2 className="sign-in-title">Create Account</h2>
            <span className="collapse-arrow">⌄</span>
          </div>
        </div>

        {/* Form Section (Collapsible) */}
        <div className="form-section" style={{ display: formExpanded ? 'block' : 'none' }}>
          <div className={`form-content ${formExpanded ? 'show' : ''}`}>
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
                  placeholder="Enter your password (8+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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

              <div className="form-group password-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group" id="goalsGroup">
                <label className="form-label" style={{ fontSize: '120%' }}>
                  Goal
                </label>
                <div
                  className="goals-options"
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  {GOALS.map((goal) => (
                    <label
                      key={goal}
                      className="goal-option"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 2px' }}
                    >
                      <input
                        type="checkbox"
                        name="goal[]"
                        value={goal}
                        checked={selectedGoals.includes(goal)}
                        onChange={() => toggleGoal(goal)}
                        disabled={loading}
                      />
                      <span>{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="sign-in-button"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register'}
              </Button>
            </form>
          </div>
        </div>

        {/* Forgot Section */}
        <div className="forgot-section show">
          <div className="forgot-content">
            <div style={{ margin: '10px 0', color: '#666666' }}>Already have an account?</div>
            <Link href="/login" className="forgot-link">
              Sign in
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
