'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose?.()
      }, 300) // Wait for slide-out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isMounted) return null

  const toast = (
    <div
      className={`toast ${!isVisible ? 'opacity-0 translate-y-4' : ''}`}
      style={{
        backgroundColor: type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#111',
      }}
    >
      {message}
    </div>
  )

  return createPortal(toast, document.body)
}

// Hook for easier toast management
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; props: ToastProps }>>([])

  const showToast = (message: string, type?: ToastProps['type'], duration?: number) => {
    const id = Date.now()
    setToasts((prev) => [
      ...prev,
      {
        id,
        props: {
          message,
          type,
          duration,
          onClose: () => setToasts((t) => t.filter((toast) => toast.id !== id)),
        },
      },
    ])
  }

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast.props} />
      ))}
    </>
  )

  return { showToast, ToastContainer }
}
