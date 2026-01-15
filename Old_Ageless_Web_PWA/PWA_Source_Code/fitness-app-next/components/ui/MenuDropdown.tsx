'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface MenuItem {
  label: string
  action?: () => void
  href?: string
  disabled?: boolean
  hasSubmenu?: boolean
  divider?: boolean
}

export function MenuDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      label: 'History',
      href: '/dashboard/history',
    },
    {
      label: 'Summary',
      href: '/dashboard/summary',
    },
    {
      label: 'Profile',
      disabled: true,
    },
    {
      label: 'Settings',
      disabled: true,
    },
    {
      divider: true,
      label: '',
    },
    {
      label: 'Sign Out',
      action: () => signOut({ callbackUrl: '/login' }),
    },
  ]

  return (
    <div className="menu-container" ref={menuRef}>
      {/* Menu Icon */}
      <button
        className={`menu-icon ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <Image
          src="/icons/menu_icon.png"
          alt="Menu"
          width={40}
          height={40}
          priority
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="dropdown-menu show"
          style={{
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  style={{
                    height: '1px',
                    background: '#E2E3E6',
                    margin: '8px 0',
                  }}
                />
              )
            }

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="dropdown-item"
                  onClick={() => setIsOpen(false)}
                  data-disabled={item.disabled ? 'true' : undefined}
                  style={{
                    pointerEvents: item.disabled ? 'none' : 'auto',
                  }}
                >
                  {item.label}
                  {item.hasSubmenu && (
                    <span style={{ position: 'absolute', right: '16px', opacity: 0.6 }}>
                      ▸
                    </span>
                  )}
                </Link>
              )
            }

            return (
              <button
                key={item.label}
                type="button"
                className="dropdown-item"
                onClick={() => {
                  item.action?.()
                  setIsOpen(false)
                }}
                disabled={item.disabled}
                data-disabled={item.disabled ? 'true' : undefined}
              >
                {item.label}
                {item.hasSubmenu && (
                  <span style={{ position: 'absolute', right: '16px', opacity: 0.6 }}>
                    ▸
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
