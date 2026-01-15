'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

interface DrawerContextType {
  // Drawer state
  isMyABSDrawerOpen: boolean
  openMyABSDrawer: () => void
  closeMyABSDrawer: () => void

  // Modal state
  isHistoryModalOpen: boolean
  isSummaryModalOpen: boolean
  isScanModalOpen: boolean
  openHistoryModal: () => void
  closHistoryModal: () => void
  openSummaryModal: () => void
  closeSummaryModal: () => void
  openScanModal: () => void
  closeScanModal: () => void

  // Refresh triggers
  refreshSummary: () => void
  refreshHistory: () => void

  // Close all
  closeAll: () => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isMyABSDrawerOpen, setIsMyABSDrawerOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)
  const [summaryRefreshTrigger, setSummaryRefreshTrigger] = useState(0)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)

  const openMyABSDrawer = useCallback(() => {
    setIsMyABSDrawerOpen(true)
  }, [])

  const closeMyABSDrawer = useCallback(() => {
    setIsMyABSDrawerOpen(false)
  }, [])

  const openHistoryModal = useCallback(() => {
    setIsMyABSDrawerOpen(false) // Close drawer first
    setIsSummaryModalOpen(false) // Close other modal
    setIsHistoryModalOpen(true)
  }, [])

  const closHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false)
  }, [])

  const openSummaryModal = useCallback(() => {
    setIsMyABSDrawerOpen(false) // Close drawer first
    setIsHistoryModalOpen(false) // Close other modal
    setIsScanModalOpen(false)
    setIsSummaryModalOpen(true)
  }, [])

  const closeSummaryModal = useCallback(() => {
    setIsSummaryModalOpen(false)
  }, [])

  const openScanModal = useCallback(() => {
    setIsMyABSDrawerOpen(false) // Close drawer
    setIsHistoryModalOpen(false) // Close other modals
    setIsSummaryModalOpen(false)
    setIsScanModalOpen(true)
  }, [])

  const closeScanModal = useCallback(() => {
    setIsScanModalOpen(false)
  }, [])

  const refreshSummary = useCallback(() => {
    setSummaryRefreshTrigger((prev) => prev + 1)
  }, [])

  const refreshHistory = useCallback(() => {
    setHistoryRefreshTrigger((prev) => prev + 1)
  }, [])

  const closeAll = useCallback(() => {
    setIsMyABSDrawerOpen(false)
    setIsHistoryModalOpen(false)
    setIsSummaryModalOpen(false)
    setIsScanModalOpen(false)
  }, [])

  // Global ESC key handler - closes overlays in priority order (highest z-index first)
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Priority order: Modals (z-index 400) → Drawers (z-index 380)
        if (isSummaryModalOpen) {
          event.preventDefault()
          closeSummaryModal()
        } else if (isHistoryModalOpen) {
          event.preventDefault()
          closHistoryModal()
        } else if (isScanModalOpen) {
          event.preventDefault()
          closeScanModal()
        } else if (isMyABSDrawerOpen) {
          event.preventDefault()
          closeMyABSDrawer()
        }
      }
    }

    // Add listener when any overlay is open
    if (isSummaryModalOpen || isHistoryModalOpen || isScanModalOpen || isMyABSDrawerOpen) {
      document.addEventListener('keydown', handleEscapeKey)

      // Cleanup
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [
    isSummaryModalOpen,
    isHistoryModalOpen,
    isScanModalOpen,
    isMyABSDrawerOpen,
    closeSummaryModal,
    closHistoryModal,
    closeScanModal,
    closeMyABSDrawer,
  ])

  return (
    <DrawerContext.Provider
      value={{
        isMyABSDrawerOpen,
        openMyABSDrawer,
        closeMyABSDrawer,
        isHistoryModalOpen,
        isSummaryModalOpen,
        isScanModalOpen,
        openHistoryModal,
        closHistoryModal,
        openSummaryModal,
        closeSummaryModal,
        openScanModal,
        closeScanModal,
        refreshSummary,
        refreshHistory,
        closeAll,
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider')
  }
  return context
}
