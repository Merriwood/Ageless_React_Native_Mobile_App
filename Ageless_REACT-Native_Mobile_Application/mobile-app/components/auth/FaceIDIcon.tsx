import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../../theme';

interface FaceIDIconProps {
  isScanning?: boolean;
  size?: number;
}

export function FaceIDIcon({ isScanning = true, size = 80 }: FaceIDIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.parallel([
          // Scale animation: 1 -> 1.1 -> 1
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          // Opacity animation for glow effect
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      // Reset to idle state
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isScanning, scaleAnim, opacityAnim]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow layer */}
      <Animated.View
        style={[
          styles.glowLayer,
          {
            width: size,
            height: size,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.glow,
            {
              width: size,
              height: size,
            },
          ]}
        />
      </Animated.View>

      {/* Icon container */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: size * 0.6 }]}>👤</Text>
      </Animated.View>

      {/* Scan lines */}
      {isScanning && (
        <>
          <View
            style={[
              styles.scanLine,
              styles.scanLineHorizontal,
              { width: size, top: '25%' },
            ]}
          />
          <View
            style={[
              styles.scanLine,
              styles.scanLineHorizontal,
              { width: size, top: '50%' },
            ]}
          />
          <View
            style={[
              styles.scanLine,
              styles.scanLineHorizontal,
              { width: size, top: '75%' },
            ]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    borderRadius: 999,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: `rgba(${parseInt(theme.colors.primary.slice(1, 3), 16)}, ${parseInt(
      theme.colors.primary.slice(3, 5),
      16
    )}, ${parseInt(theme.colors.primary.slice(5, 7), 16)}, 0.1)`,
    zIndex: 2,
  },
  icon: {
    fontWeight: '600',
  },
  scanLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(52, 199, 89, 0.6)',
    zIndex: 1,
  },
  scanLineHorizontal: {
    left: 0,
    right: 0,
  },
});
