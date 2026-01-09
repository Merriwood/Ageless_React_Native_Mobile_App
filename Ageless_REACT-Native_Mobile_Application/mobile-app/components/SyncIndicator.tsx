/**
 * SyncIndicator Component
 *
 * Detailed sync status modal/overlay
 * Shows:
 * - Queue size and pending items
 * - Last sync time
 * - Sync errors and conflicts
 * - Manual sync button
 * - Conflict resolution options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { useUI } from '../context/UIContext';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useSyncTriggers } from '../hooks/useSyncTriggers';

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
  },
  modalView: {
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
    maxHeight: '80%',
  },

  // Header
  header: {
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },

  // Status rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceAlt,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  value: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },

  // Status badges
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: theme.colors.status.warning + '20',
  },
  statusSyncing: {
    backgroundColor: theme.colors.status.warning + '20',
  },
  statusError: {
    backgroundColor: theme.colors.status.error + '20',
  },
  statusText: {
    ...theme.typography.label,
  },
  statusTextPending: {
    color: theme.colors.status.warning,
  },
  statusTextSyncing: {
    color: theme.colors.status.warning,
  },
  statusTextError: {
    color: theme.colors.status.error,
  },

  // Sections
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },

  // Items list
  itemsContainer: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.base,
    gap: theme.spacing.base,
    maxHeight: 150,
  },
  itemRow: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.base,
    borderRadius: theme.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.status.warning,
  },
  itemDate: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  itemStatus: {
    ...theme.typography.label,
    color: theme.colors.text.primary,
  },

  // Conflicts section
  conflictContainer: {
    backgroundColor: theme.colors.status.error + '10',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  conflictTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.status.error,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  conflictButtons: {
    flexDirection: 'row',
    gap: theme.spacing.base,
  },
  conflictButton: {
    flex: 1,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  keepLocalButton: {
    backgroundColor: theme.colors.status.error,
  },
  useServerButton: {
    backgroundColor: theme.colors.text.secondary,
  },
  conflictButtonText: {
    color: theme.colors.text.onPrimary,
    ...theme.typography.label,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border.light,
  },
  primaryButtonText: {
    color: theme.colors.text.onPrimary,
    ...theme.typography.button,
  },
  secondaryButtonText: {
    color: theme.colors.text.secondary,
    ...theme.typography.button,
  },

  // Empty state
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});

// ============================================================================
// COMPONENT
// ============================================================================

interface SyncIndicatorProps {
  visible: boolean;
  onClose: () => void;
}

export function SyncIndicator({ visible, onClose }: SyncIndicatorProps) {
  const { syncStatus, offlineQueueSize } = useUI();
  const { queue, getConflictItems, resolveConflict } = useOfflineQueue();
  const { syncNow, isSyncing } = useSyncTriggers();
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);

  const pendingItems = queue.filter(item => item.status === 'pending');
  const failedItems = queue.filter(item => item.status === 'failed');
  const conflictItems = getConflictItems();

  // ========================================================================
  // HELPERS
  // ========================================================================

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Sync Status</Text>
            </View>

            {/* Status */}
            <View style={styles.row}>
              <Text style={styles.label}>Current Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  syncStatus === 'syncing' && styles.statusSyncing,
                  syncStatus === 'error' && styles.statusError,
                  syncStatus === 'idle' && styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    syncStatus === 'syncing' && styles.statusTextSyncing,
                    syncStatus === 'error' && styles.statusTextError,
                    syncStatus === 'idle' && styles.statusTextPending,
                  ]}
                >
                  {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
                </Text>
              </View>
            </View>

            {/* Queue Metrics */}
            <View style={[styles.row, { marginTop: 12 }]}>
              <Text style={styles.label}>Queue Size</Text>
              <Text style={styles.value}>{offlineQueueSize} items</Text>
            </View>

            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.label}>Pending Sync</Text>
              <Text style={styles.value}>{pendingItems.length} items</Text>
            </View>

            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Items</Text>
                <View style={styles.itemsContainer}>
                  {pendingItems.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemDate}>{item.date}</Text>
                      <Text style={styles.itemStatus}>
                        Retry {item.retryCount}/{item.maxRetries}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Failed Items */}
            {failedItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Failed Items ({failedItems.length})</Text>
                <View style={styles.itemsContainer}>
                  {failedItems.map(item => (
                    <View
                      key={item.id}
                      style={[styles.itemRow, { borderLeftColor: '#DC2626' }]}
                    >
                      <Text style={styles.itemDate}>{item.date}</Text>
                      <Text style={[styles.itemStatus, { color: '#DC2626' }]}>
                        Failed
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Conflicts */}
            {conflictItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conflicts ({conflictItems.length})</Text>
                {conflictItems.map(item => (
                  <View key={item.id} style={styles.conflictContainer}>
                    <Text style={styles.conflictTitle}>
                      {item.date} - Server has newer data
                    </Text>
                    <View style={styles.conflictButtons}>
                      <TouchableOpacity
                        style={[styles.conflictButton, styles.keepLocalButton]}
                        onPress={() => {
                          resolveConflict(item.id, 'keep-local');
                          setExpandedConflict(null);
                        }}
                      >
                        <Text style={styles.conflictButtonText}>Keep Local</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.conflictButton, styles.useServerButton]}
                        onPress={() => {
                          resolveConflict(item.id, 'use-server');
                          setExpandedConflict(null);
                        }}
                      >
                        <Text style={styles.conflictButtonText}>Use Server</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Empty State */}
            {pendingItems.length === 0 && failedItems.length === 0 && conflictItems.length === 0 && (
              <Text style={styles.emptyText}>Everything is synced</Text>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={syncNow}
              disabled={isSyncing()}
            >
              {isSyncing() ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>Sync Now</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default SyncIndicator;
