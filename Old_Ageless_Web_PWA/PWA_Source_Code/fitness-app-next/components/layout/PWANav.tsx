'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useDrawer } from '@/contexts/DrawerContext'

export function PWANav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { openMyABSDrawer, openScanModal } = useDrawer()

  // Don't hide nav during loading - show it always to prevent layout shift
  // The drawer context will handle any authentication-dependent actions

  const navItems = [
    {
      href: '/dashboard',
      label: 'Home',
      dataTab: 'home',
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      ),
    },
    {
      href: null, // No navigation - opens drawer instead
      label: 'My ABS',
      dataTab: 'myabs',
      onClick: openMyABSDrawer,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9L12 16.8 6.8 19.3l1-5.9L3.5 9.2l5.9-.9L12 3Z" />
        </svg>
      ),
    },
    {
      href: null, // No navigation - opens modal instead
      label: 'Scan',
      dataTab: 'scan',
      onClick: openScanModal,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
        >
          <rect x="1" y="1" width="7" height="7" />
          <rect x="2" y="2" width="5" height="5" fill="#fff" />
          <rect x="3" y="3" width="3" height="3" />
          <rect x="16" y="1" width="7" height="7" />
          <rect x="17" y="2" width="5" height="5" fill="#fff" />
          <rect x="18" y="3" width="3" height="3" />
          <rect x="1" y="16" width="7" height="7" />
          <rect x="2" y="17" width="5" height="5" fill="#fff" />
          <rect x="3" y="18" width="3" height="3" />
          <rect x="10" y="10" width="4" height="4" />
          <rect x="16" y="10" width="2" height="2" />
          <rect x="19" y="10" width="2" height="2" />
          <rect x="22" y="10" width="1" height="1" />
          <rect x="10" y="16" width="2" height="2" />
          <rect x="13" y="16" width="2" height="2" />
          <rect x="16" y="16" width="7" height="2" />
          <rect x="16" y="19" width="4" height="4" />
          <rect x="21" y="19" width="2" height="4" />
        </svg>
      ),
    },
    {
      href: null, // No navigation - opens external link instead
      label: 'Listen',
      dataTab: 'listen',
      skipActiveState: true, // Don't set active state for external navigation
      onClick: () => {
        const url = 'https://www.siriusxm.com/player'
        const win = window.open(url, '_blank', 'noopener,noreferrer')
        if (!win) window.location.href = url
      },
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1" />
          <path d="M4 12v5a2 2 0 0 0 2 2h1" />
          <circle cx="8" cy="17" r="1" />
          <circle cx="16" cy="17" r="1" />
        </svg>
      ),
    },
    {
      href: '/dashboard/rewards',
      label: 'Rewards',
      dataTab: 'rewards',
      icon: (
        <Image
          src="/boxicon.png"
          alt="Rewards"
          width={24}
          height={24}
          style={{ display: 'block' }}
        />
      ),
    },
  ]

  return (
    <nav className="pwa-nav">
      {navItems.map((item, index) => {
        // Don't apply active state if skipActiveState is true (e.g., Listen tab)
        const isActive = item.skipActiveState ? false : (item.href ? pathname === item.href : false)

        // If item has onClick (like My ABS, Scan, Listen), render button instead of Link
        if (item.onClick) {
          return (
            <button
              key={item.dataTab}
              onClick={item.onClick}
              className={`pwa-nav__btn ${isActive ? 'is-active' : ''}`}
              data-tab={item.dataTab}
            >
              <span className="pwa-nav__icon">{item.icon}</span>
              <span className="pwa-nav__label">{item.label}</span>
            </button>
          )
        }

        // Regular navigation item
        return (
          <Link
            key={item.href}
            href={item.href!}
            className={`pwa-nav__btn ${isActive ? 'is-active' : ''}`}
            data-tab={item.dataTab}
          >
            <span className="pwa-nav__icon">{item.icon}</span>
            <span className="pwa-nav__label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
