import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, useSafeAreaInsets } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface NavItem {
  id: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  href?: string;
  onPress?: () => void;
}

interface BottomNavProps {
  onNavigate?: (tab: string) => void;
  activeTab?: string;
}

/**
 * BottomNav Component
 *
 * A React Native bottom tab navigation component with 5 main navigation items:
 * - Home: Dashboard/main view
 * - My ABS: Body tracking drawer
 * - Scan: QR code scan modal
 * - Listen: External link to Sirius XM
 * - Rewards: Rewards section
 *
 * Features:
 * - Active state styling (scale + color change)
 * - Icon animation on active (scale 1.08)
 * - Safe area inset handling for notched devices
 * - External link support
 */
export function BottomNav({ onNavigate, activeTab = 'home' }: BottomNavProps) {
  const [active, setActive] = useState(activeTab);
  const insets = useSafeAreaInsets();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => <HomeIcon active={active} />,
      href: 'home',
    },
    {
      id: 'myabs',
      label: 'My ABS',
      icon: (active) => <StarIcon active={active} />,
      onPress: () => handlePress('myabs'),
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: (active) => <ScanIcon active={active} />,
      onPress: () => handlePress('scan'),
    },
    {
      id: 'listen',
      label: 'Listen',
      icon: (active) => <ListenIcon active={active} />,
      onPress: () => handlePress('listen'),
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: (active) => <RewardsIcon active={active} />,
      href: 'rewards',
    },
  ];

  const handlePress = (tabId: string) => {
    setActive(tabId);
    if (onNavigate) {
      onNavigate(tabId);
    }

    // Special handling for external link
    if (tabId === 'listen') {
      Linking.openURL('https://www.siriusxm.com/player').catch(
        () => Linking.openURL('https://www.siriusxm.com')
      );
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.navButton, active === item.id && styles.navButtonActive]}
          onPress={() => handlePress(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, active === item.id && styles.iconContainerActive]}>
            {item.icon(active === item.id)}
          </View>
          <Text
            style={[
              styles.label,
              active === item.id && styles.labelActive,
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Icon Components (matching Web PWA icon style)
function HomeIcon({ active }: { active: boolean }) {
  return <Ionicons name={active ? "home" : "home-outline"} size={20} color={active ? theme.colors.primary : "#000"} />;
}

function StarIcon({ active }: { active: boolean }) {
  return <Ionicons name={active ? "star" : "star-outline"} size={20} color={active ? theme.colors.primary : "#000"} />;
}

function ScanIcon({ active }: { active: boolean }) {
  return <MaterialIcons name="qr-code" size={20} color={active ? theme.colors.primary : "#000"} />;
}

function ListenIcon({ active }: { active: boolean }) {
  return <Ionicons name={active ? "headphones" : "headphones-outline"} size={20} color={active ? theme.colors.primary : "#000"} />;
}

function RewardsIcon({ active }: { active: boolean }) {
  return <MaterialIcons name="card-giftcard" size={20} color={active ? theme.colors.primary : "#000"} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',  // Fixed positioning (Web PWA: fixed bottom-0 left-0 right-0)
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#d2d2d2', // CRITICAL FIX: Web PWA uses #d2d2d2 (not #E2E3E6)
    paddingTop: 6, // CRITICAL FIX: Web PWA uses 6px (not 4px from theme.spacing.xs)
    paddingHorizontal: 4, // CRITICAL FIX: Web PWA uses 4px (not 8px from theme.spacing.base)
    zIndex: 410, // CRITICAL FIX: Web PWA uses z-[410]
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  navButtonActive: {
    // Active state styling
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    transition: 'all 0.12s ease-out',
  },
  iconContainerActive: {
    transform: [{ scale: 1.08 }],
  },
  iconWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 13,
  },
  labelActive: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
