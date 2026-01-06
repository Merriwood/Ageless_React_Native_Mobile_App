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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },

  // Header
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Status rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },

  // Status badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusSyncing: {
    backgroundColor: '#DBEAFE',
  },
  statusError: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextSyncing: {
    color: '#1E40AF',
  },
  statusTextError: {
    color: '#991B1B',
  },

  // Sections
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  // Items list
  itemsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    gap: 8,
    maxHeight: 150,
  },
  itemRow: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F97316',
  },
  itemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Conflicts section
  conflictContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  conflictTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  conflictButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  conflictButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  keepLocalButton: {
    backgroundColor: '#DC2626',
  },
  useServerButton: {
    backgroundColor: '#6B7280',
  },
  conflictButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#D1D5DB',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty state
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
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
