/**
 * OfflineBadge Component
 *
 * Visual indicator for offline status and sync state
 * Displays in header/top bar with color and icon
 * - Gray: offline mode
 * - Orange: syncing
 * - Green pulse: online
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useUI } from '../context/UIContext';

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  offline: {
    backgroundColor: '#EF4444', // Red
  },
  syncing: {
    backgroundColor: '#F97316', // Orange
  },
  online: {
    backgroundColor: '#10B981', // Green
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  spinningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

// ============================================================================
// COMPONENT
// ============================================================================

export function OfflineBadge() {
  const { isOnline, syncStatus, offlineQueueSize } = useUI();
  const spinAnim = React.useRef(new Animated.Value(0)).current;

  // ========================================================================
  // ANIMATION: SPINNING DOT FOR SYNCING STATE
  // ========================================================================

  useEffect(() => {
    if (syncStatus === 'syncing') {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [syncStatus, spinAnim]);

  const spinStyle = {
    transform: [
      {
        rotate: spinAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  // ========================================================================
  // DETERMINE STATE AND DISPLAY
  // ========================================================================

  if (!isOnline) {
    return (
      <View style={[styles.container, styles.offline]}>
        <View style={styles.dot} />
        <Text style={styles.text}>Offline</Text>
        {offlineQueueSize > 0 && (
          <Text style={[styles.text, { marginLeft: 4 }]}>
            ({offlineQueueSize} pending)
          </Text>
        )}
      </View>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <View style={[styles.container, styles.syncing]}>
        <Animated.View style={[styles.spinningDot, spinStyle]} />
        <Text style={styles.text}>Syncing...</Text>
      </View>
    );
  }

  if (syncStatus === 'error') {
    return (
      <View style={[styles.container, styles.offline]}>
        <View style={styles.dot} />
        <Text style={styles.text}>Sync Error</Text>
      </View>
    );
  }

  // Online and idle - show minimal indicator
  return (
    <View style={[styles.container, styles.online]}>
      <View style={styles.dot} />
      <Text style={styles.text}>Online</Text>
    </View>
  );
}

export default OfflineBadge;
