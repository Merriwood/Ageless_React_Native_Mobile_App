import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { theme } from '../../theme';

interface BiometricIconProps {
  /** Type of biometric: 'Face ID' or 'Touch ID' */
  biometricType?: 'Face ID' | 'Touch ID' | null;
  /** Whether the icon is in scanning/loading state */
  isScanning?: boolean;
  /** Size of the icon container */
  size?: number;
  /** Callback when icon is pressed */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Test ID for E2E testing */
  testID?: string;
}

/**
 * Custom Face ID icon matching Apple iOS style
 * Features: corner brackets, face outline, eyes, nose, mouth
 */
const FaceIDSvg = ({ size, color }: { size: number; color: string }) => {
  const strokeWidth = size * 0.06;
  const cornerLength = size * 0.25;
  const cornerRadius = size * 0.12;
  const padding = size * 0.08;

  // Face dimensions (centered within the icon)
  const faceWidth = size * 0.45;
  const faceHeight = size * 0.55;
  const faceCenterX = size / 2;
  const faceCenterY = size / 2;

  // Eye positions
  const eyeRadius = size * 0.04;
  const eyeY = faceCenterY - faceHeight * 0.15;
  const eyeSpacing = faceWidth * 0.35;

  // Nose position
  const noseY = faceCenterY + faceHeight * 0.05;
  const noseHeight = size * 0.12;

  // Mouth position
  const mouthY = faceCenterY + faceHeight * 0.25;
  const mouthWidth = size * 0.15;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Top-left corner bracket */}
      <Path
        d={`M ${padding + cornerLength} ${padding}
            H ${padding + cornerRadius}
            Q ${padding} ${padding} ${padding} ${padding + cornerRadius}
            V ${padding + cornerLength}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />

      {/* Top-right corner bracket */}
      <Path
        d={`M ${size - padding - cornerLength} ${padding}
            H ${size - padding - cornerRadius}
            Q ${size - padding} ${padding} ${size - padding} ${padding + cornerRadius}
            V ${padding + cornerLength}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom-left corner bracket */}
      <Path
        d={`M ${padding} ${size - padding - cornerLength}
            V ${size - padding - cornerRadius}
            Q ${padding} ${size - padding} ${padding + cornerRadius} ${size - padding}
            H ${padding + cornerLength}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom-right corner bracket */}
      <Path
        d={`M ${size - padding} ${size - padding - cornerLength}
            V ${size - padding - cornerRadius}
            Q ${size - padding} ${size - padding} ${size - padding - cornerRadius} ${size - padding}
            H ${size - padding - cornerLength}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />

      {/* Left eye */}
      <Circle
        cx={faceCenterX - eyeSpacing}
        cy={eyeY}
        r={eyeRadius}
        fill={color}
      />

      {/* Right eye */}
      <Circle
        cx={faceCenterX + eyeSpacing}
        cy={eyeY}
        r={eyeRadius}
        fill={color}
      />

      {/* Nose (vertical line) */}
      <Path
        d={`M ${faceCenterX} ${noseY - noseHeight / 2} V ${noseY + noseHeight / 2}`}
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth (horizontal line) */}
      <Path
        d={`M ${faceCenterX - mouthWidth / 2} ${mouthY} H ${faceCenterX + mouthWidth / 2}`}
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

/**
 * Professional biometric authentication icon
 * Displays Face ID icon in Apple iOS style with animated scanning effect
 */
export function BiometricIcon({
  biometricType = 'Face ID',
  isScanning = false,
  size = 80,
  onPress,
  disabled = false,
  testID = 'biometric-icon',
}: BiometricIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isScanning) {
      // Scanning animation
      Animated.loop(
        Animated.parallel([
          // Scale pulse
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          // Glow pulse
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.2,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          // Outer ring pulse
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      // Reset animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isScanning, scaleAnim, opacityAnim, pulseAnim]);

  const iconColor = disabled ? theme.colors.text.secondary : theme.colors.primary;

  const content = (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Main icon container - clean white background */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: size * 0.17,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <FaceIDSvg size={size * 0.7} color={iconColor} />
      </Animated.View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        disabled={disabled || isScanning}
        activeOpacity={0.7}
        accessibilityLabel={`Sign in with ${biometricType || 'Face ID'}`}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    // Shadow for iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Shadow for Android
    elevation: 3,
  },
});

export default BiometricIcon;
