import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { theme } from '../../theme';

interface ScanModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  userId?: string;
}

export function ScanModal({
  isVisible = false,
  onClose,
  userId = 'USER_123456',
}: ScanModalProps) {
  const scanOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isVisible) {
      // Pulsing animation for scan effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(scanOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isVisible, scanOpacity]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan QR Code</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* QR Canvas Area */}
            <View style={styles.qrContainer}>
              <View style={styles.qrBorder} />

              {/* QR Placeholder with pulsing effect */}
              <Animated.View
                style={[
                  styles.qrPlaceholder,
                  { opacity: scanOpacity },
                ]}
              >
                <Text style={styles.qrIcon}>📱</Text>
              </Animated.View>

              {/* Corner markers */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            {/* Scan line animation */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  opacity: scanOpacity,
                },
              ]}
            />

            {/* User ID Display */}
            <View style={styles.userIdSection}>
              <Text style={styles.userIdLabel}>Your User ID:</Text>
              <View style={styles.userIdBox}>
                <Text style={styles.userIdText}>{userId}</Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsIcon}>👁️</Text>
              <Text style={styles.instructionsText}>
                Scan with another device to sync
              </Text>
            </View>
          </View>

          {/* Footer Button */}
          <TouchableOpacity
            style={styles.closeButton2}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText2}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.full,
  },
  closeButtonText: {
    fontSize: 28,
    color: theme.colors.text.secondary,
    fontWeight: '400',
  },
  contentContainer: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  qrContainer: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    overflow: 'hidden',
  },
  qrBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
  },
  qrIcon: {
    fontSize: 72,
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: theme.colors.primary,
  },
  topLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 8,
    right: 8,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    alignSelf: 'center',
    width: '80%',
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
  userIdSection: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  userIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  userIdBox: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minWidth: 200,
  },
  userIdText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  instructionsSection: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
  },
  instructionsIcon: {
    fontSize: 24,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  closeButton2: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  closeButtonText2: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.text.onPrimary,
  },
});
