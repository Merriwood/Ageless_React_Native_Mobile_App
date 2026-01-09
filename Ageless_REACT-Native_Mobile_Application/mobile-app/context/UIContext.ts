/**
 * UIContext
 *
 * Global UI state management
 * Pure TypeScript implementation (no JSX) wrapping useUILogic hook
 * Provides Context API interface for access throughout app
 */

import React, { createContext, useContext } from 'react';
import { useUILogic, UILogicState, ToastType, Toast, SyncStatus } from '../hooks/useUILogic';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type { ToastType, Toast, SyncStatus };

export interface UIContextType {
  // Toast State
  toasts: Toast[];
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    dismissible?: boolean
  ) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // Network State
  isOnline: boolean;
  isConnecting: boolean;

  // Sync State
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  offlineQueueSize: number;
  setOfflineQueueSize: (size: number) => void;

  // UI Flags
  showOfflineBadge: boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const UIContext = createContext<UIContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function UIProvider({ children }: { children: React.ReactNode }) {
  // Use the pure logic hook
  const logicState = useUILogic();

  // Map logic state to context type (they're the same, just aliased)
  const value: UIContextType = {
    // Toast
    toasts: logicState.toasts,
    showToast: logicState.showToast,
    dismissToast: logicState.dismissToast,
    clearToasts: logicState.clearToasts,

    // Network
    isOnline: logicState.isOnline,
    isConnecting: logicState.isConnecting,

    // Sync
    syncStatus: logicState.syncStatus,
    setSyncStatus: logicState.setSyncStatus,
    offlineQueueSize: logicState.offlineQueueSize,
    setOfflineQueueSize: logicState.setOfflineQueueSize,

    // UI Flags
    showOfflineBadge: logicState.showOfflineBadge,
  };

  // Use createElement to avoid JSX transformer
  return React.createElement(
    UIContext.Provider,
    { value },
    children
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useUI(): UIContextType {
  const context = useContext(UIContext);

  if (context === undefined) {
    throw new Error('useUI must be used within UIProvider');
  }

  return context;
}

// ============================================================================
// CONVENIENCE HOOKS (for common operations)
// ============================================================================

export function useToast() {
  const { showToast, dismissToast, clearToasts } = useUI();

  return {
    success: (message: string, duration?: number) =>
      showToast(message, 'success', duration),
    error: (message: string, duration?: number) =>
      showToast(message, 'error', duration),
    warning: (message: string, duration?: number) =>
      showToast(message, 'warning', duration),
    info: (message: string, duration?: number) =>
      showToast(message, 'info', duration),
    dismiss: dismissToast,
    clearAll: clearToasts,
  };
}

export function useSync() {
  const { syncStatus, setSyncStatus, offlineQueueSize, setOfflineQueueSize } = useUI();

  return {
    status: syncStatus,
    setStatus: setSyncStatus,
    queueSize: offlineQueueSize,
    setQueueSize: setOfflineQueueSize,
    isSyncing: syncStatus === 'syncing',
  };
}

export function useNetwork() {
  const { isOnline, isConnecting } = useUI();

  return {
    isOnline,
    isConnecting,
    isOffline: !isOnline,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default UIContext;
