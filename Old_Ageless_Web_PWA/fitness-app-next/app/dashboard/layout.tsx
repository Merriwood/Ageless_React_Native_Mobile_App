import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PWAHeader } from '@/components/layout/PWAHeader'
import { PWANav } from '@/components/layout/PWANav'
import { MyABSDrawer } from '@/components/layout/MyABSDrawer'
import { HistoryModal } from '@/components/modals/HistoryModal'
import { SummaryModal } from '@/components/modals/SummaryModal'
import { ScanModal } from '@/components/modals/ScanModal'
import { SessionProvider } from '@/components/SessionProvider'
import { DrawerProvider } from '@/contexts/DrawerContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <SessionProvider>
      <DrawerProvider>
        <div className="min-h-screen bg-bg">
          {/* PWA Header with Menu */}
          <PWAHeader />

          {/* Main Content - Padding to account for fixed header and bottom nav */}
          <main className="pt-[48px] pb-[80px]">
            <div className="w-full max-w-[860px] mx-auto px-5 py-6">
              {children}
            </div>
          </main>

          {/* Bottom Navigation - Client component with active state handling */}
          <PWANav />

          {/* My ABS Drawer - Overlay for weight input and menu */}
          <MyABSDrawer />

          {/* History Modal - Full workout history with expandable rows */}
          <HistoryModal />

          {/* Summary Modal - Weekly breakdown and statistics */}
          <SummaryModal />

          {/* Scan Modal - QR code scanner */}
          <ScanModal />
        </div>
      </DrawerProvider>
    </SessionProvider>
  )
}
