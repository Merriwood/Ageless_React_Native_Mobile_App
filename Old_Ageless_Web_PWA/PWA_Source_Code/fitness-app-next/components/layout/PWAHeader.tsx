'use client'

import { useSession } from 'next-auth/react'
import { MenuDropdown } from '@/components/ui/MenuDropdown'

export function PWAHeader() {
  const { data: session, status } = useSession()

  // Don't return null during loading - show header skeleton/placeholder
  // This ensures the header space is always reserved

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-primary text-white z-[400] flex items-center justify-center"
      style={{ padding: '10px 56px 12px 16px', minHeight: '48px' }}
    >
      <h1 className="text-lg font-semibold">Ageless.</h1>

      {/* Menu positioned absolutely on right - only show when authenticated */}
      {session && (
        <div className="absolute right-[14px] top-1/2 -translate-y-1/2">
          <MenuDropdown />
        </div>
      )}
    </header>
  )
}
