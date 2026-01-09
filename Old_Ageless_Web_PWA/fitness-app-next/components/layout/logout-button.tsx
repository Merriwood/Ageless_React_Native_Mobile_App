'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

export function LogoutButton({ userEmail }: { userEmail?: string | null }) {
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm hover:bg-white/30 transition-fast cursor-pointer"
        title={userEmail || 'User menu'}
      >
        {userEmail?.[0].toUpperCase() || 'U'}
      </button>

      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-elev border border-border z-20">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-text truncate">
                {userEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface-alt transition-fast flex items-center gap-2"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
