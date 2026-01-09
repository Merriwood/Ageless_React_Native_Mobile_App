'use client'

import { useEffect, useRef } from 'react'
import { useDrawer } from '@/contexts/DrawerContext'

export function MyABSDrawer() {
  const {
    isMyABSDrawerOpen,
    closeMyABSDrawer,
    openHistoryModal,
    openSummaryModal,
  } = useDrawer()

  const weightInputRef = useRef<HTMLInputElement>(null)

  // Focus weight input when drawer opens
  useEffect(() => {
    if (isMyABSDrawerOpen && weightInputRef.current) {
      setTimeout(() => {
        weightInputRef.current?.focus()
      }, 50)
    }
  }, [isMyABSDrawerOpen])

  // Sync weight with main dashboard weight input
  useEffect(() => {
    if (isMyABSDrawerOpen) {
      try {
        const existingWeight = document.getElementById('weight') as HTMLInputElement
        if (existingWeight && weightInputRef.current) {
          weightInputRef.current.value = existingWeight.value
        } else {
          // Load from localStorage if no dashboard weight input
          const lastWeight = localStorage.getItem('mbh_lastWeight')
          if (lastWeight && weightInputRef.current) {
            weightInputRef.current.value = lastWeight
          }
        }
      } catch (e) {
        console.error('Weight sync error:', e)
      }
    }
  }, [isMyABSDrawerOpen])

  const handleWeightChange = () => {
    if (!weightInputRef.current) return

    try {
      const value = weightInputRef.current.value

      // Sync with main dashboard weight input
      const existingWeight = document.getElementById('weight') as HTMLInputElement
      if (existingWeight) {
        existingWeight.value = value
        existingWeight.dispatchEvent(new Event('input', { bubbles: true }))
      }

      // Save to localStorage
      if (value) {
        localStorage.setItem('mbh_lastWeight', value)
      }
    } catch (e) {
      console.error('Weight update error:', e)
    }
  }

  const handleHistoryClick = () => {
    openHistoryModal()
  }

  const handleSummaryClick = () => {
    openSummaryModal()
  }

  if (!isMyABSDrawerOpen) return null

  return (
    <div
      id="mybody-drawer"
      className={isMyABSDrawerOpen ? 'open' : ''}
      role="dialog"
      aria-modal="false"
      aria-labelledby="mybody-drawer-title"
    >
      <div className="mybody-drawer__inner">
        <button
          type="button"
          className="mybody-drawer__close"
          aria-label="Close My Body panel"
          onClick={closeMyABSDrawer}
        >
          ✕
        </button>

        <header className="mybody-drawer__header">
          <h1 id="mybody-drawer-title" className="mybody-title">
            My Body
          </h1>
        </header>

        <div className="mybody-drawer__content" aria-label="My Body entries" role="region">
          {/* Weight Input Section */}
          <div className="mybody-section mybody-weight-block">
            <label htmlFor="mybody-weight" className="mybody-weight-label">
              Weight
            </label>
            <input
              id="mybody-weight"
              ref={weightInputRef}
              type="number"
              inputMode="decimal"
              placeholder="Enter weight"
              className="mybody-weight-input"
              onChange={handleWeightChange}
              onInput={handleWeightChange}
            />
          </div>

          {/* Navigation Menu */}
          <nav className="mybody-nav" aria-label="My Body menu">
            <ul className="mybody-list" id="mybodyList">
              <li className="mybody-item">
                <button
                  type="button"
                  className="mybody-link"
                  onClick={handleHistoryClick}
                >
                  History
                  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </li>
              <li className="mybody-item">
                <button
                  type="button"
                  className="mybody-link"
                  onClick={handleSummaryClick}
                >
                  Summary
                  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Aerobic (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Strength (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Balance & Flex (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Stretch (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Custom (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Assessments (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Goals (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Progress (Coming Soon)
                </button>
              </li>
              <li className="mybody-item disabled">
                <button type="button" className="mybody-link" disabled>
                  Rewards (Coming Soon)
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}
