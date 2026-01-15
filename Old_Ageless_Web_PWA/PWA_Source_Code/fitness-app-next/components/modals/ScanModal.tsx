'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useDrawer } from '@/contexts/DrawerContext'

export function ScanModal() {
  const { isScanModalOpen, closeScanModal } = useDrawer()
  const { data: session } = useSession()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isScanModalOpen && closeButtonRef.current) {
      // Focus close button when modal opens for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    }
  }, [isScanModalOpen])

  // Generate QR code when modal opens
  useEffect(() => {
    if (isScanModalOpen && session?.user?.email && qrCodeRef.current) {
      // Clear previous QR code
      qrCodeRef.current.innerHTML = ''

      // Use simple QR code generation with canvas
      generateQRCode(session.user.email, qrCodeRef.current)
    }
  }, [isScanModalOpen, session?.user?.email])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeScanModal()
    }
  }

  if (!isScanModalOpen) return null

  return (
    <div
      id="scan-modal"
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-modal-title"
    >
      <div className="modal-content scan-modal-content">
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close"
          aria-label="Close Scan"
          onClick={closeScanModal}
        >
          ✕
        </button>

        <div className="modal-inner">
          <div className="text-center bg-surface p-6 rounded-xl shadow-elev">
            <h2 id="scan-modal-title" className="text-2xl font-bold mb-2">
              Your QR Code
            </h2>
            <p className="text-text-muted">
              Share your fitness profile by scanning this code
            </p>
          </div>

          <div className="scan-modal-body">
            {/* QR Code Display */}
            <div className="scan-qr-container">
              <div ref={qrCodeRef} className="scan-qr-code"></div>
            </div>

            {/* User Email Display */}
            <div className="scan-identifier">
              <p className="text-sm text-text-muted mb-1">Account:</p>
              <p className="text-base font-medium text-center break-all">
                {session?.user?.email || 'No email found'}
              </p>
            </div>

            {/* Instructions */}
            <div className="scan-instructions">
              <p className="text-sm text-text-muted text-center">
                Have others scan this code to connect with your fitness profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Generate QR code using the qrcode library
 */
async function generateQRCode(text: string, container: HTMLElement) {
  try {
    // Dynamically import QRCode to avoid SSR issues
    const QRCode = (await import('qrcode')).default

    // Create canvas
    const canvas = document.createElement('canvas')
    const size = 260

    // Generate QR code
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 2,
      color: {
        dark: '#111111',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    container.appendChild(canvas)
  } catch (err) {
    console.error('QR code generation failed:', err)
    container.innerHTML = '<p class="text-red-500">Failed to generate QR code</p>'
  }
}
