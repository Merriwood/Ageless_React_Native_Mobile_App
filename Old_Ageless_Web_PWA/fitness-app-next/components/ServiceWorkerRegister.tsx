/**
 * Service Worker Registration Component
 * Must be a separate client component to avoid "use client" in server context
 *
 * Source of Truth: claude.md Section 0.5, 20.1.A
 */

'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW] Service Workers not supported')
      return
    }

    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[SW] Registered successfully:', registration)
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error)
      })
  }, [])

  return null
}
