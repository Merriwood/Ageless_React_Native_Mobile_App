/**
 * UIContext
 *
 * Global UI state management
 * Handles toast notifications, sync status, network connectivity
 * Uses React Context API with useCallback for performance
 */

import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  dismissible: boolean;
}

export type SyncStatus = 'idle' | 'syncing' | 'error';

export interface UIContextType {
  // Toast State
  toasts: Toast[];
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    dismissible?: boolean
  ) => string; // Returns toast ID
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
  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Network State
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [offlineQueueSize, setOfflineQueueSize] = useState(0);

  // ========================================================================
  // NETWORK MONITORING
  // ========================================================================

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsOnline(connected);
      setIsConnecting(state.isInternetReachable ?? false);

      // Show notification when connection status changes
      if (!connected && toasts.length === 0) {
        // Network went down
        const toastId = `toast_${Date.now()}`;
        setToasts([
          {
            id: toastId,
            message: 'No internet connection',
            type: 'warning',
            duration: 0, // Don't auto-dismiss
            dismissible: false,
          },
        ]);
      } else if (connected && isOnline === false) {
        // Network came back up
        const toastId = `toast_${Date.now()}`;
        setToasts((prev) => [
          ...prev.filter((t) => t.type !== 'warning'),
          {
            id: toastId,
            message: 'Back online',
            type: 'success',
            duration: 2000,
            dismissible: true,
          },
        ]);
      }
    });

    return () => unsubscribe();
  }, [isOnline, toasts]);

  // ========================================================================
  // TOAST MANAGEMENT
  // ========================================================================

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration: number = 3000,
      dismissible: boolean = true
    ): string => {
      const toastId = `toast_${Date.now()}_${Math.random()}`;

      const newToast: Toast = {
        id: toastId,
        message,
        type,
        duration,
        dismissible,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss if duration > 0
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(toastId);
        }, duration);

        return toastId;
      }

      return toastId;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // ========================================================================
  // SYNC STATUS MANAGEMENT
  // ========================================================================

  const handleSetSyncStatus = useCallback((status: SyncStatus) => {
    setSyncStatus(status);

    // Show toast for sync completion
    if (status === 'idle') {
      if (offlineQueueSize === 0) {
        // Only show if there were pending items
        // (Don't spam with "synced" if nothing was queued)
      }
    } else if (status === 'syncing') {
      // Optionally show "syncing..." but it can clutter UI
      // Most apps don't show this unless there's a noticeable delay
    } else if (status === 'error') {
      showToast('Sync failed. Will retry when online.', 'error', 4000);
    }
  }, [offlineQueueSize, showToast]);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  // Show offline badge when offline OR syncing
  const showOfflineBadge = !isOnline || syncStatus === 'syncing';

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value: UIContextType = {
    // Toast
    toasts,
    showToast,
    dismissToast,
    clearToasts,

    // Network
    isOnline,
    isConnecting,

    // Sync
    syncStatus,
    setSyncStatus: handleSetSyncStatus,
    offlineQueueSize,
    setOfflineQueueSize,

    // UI Flags
    showOfflineBadge,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
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
