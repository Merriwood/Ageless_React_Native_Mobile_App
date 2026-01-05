import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, useSafeAreaInsets } from 'react-native';
import { theme } from '../../theme';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onPress?: () => void;
}

interface PWANavProps {
  onNavigate?: (tab: string) => void;
  activeTab?: string;
}

export function PWANav({ onNavigate, activeTab = 'home' }: PWANavProps) {
  const [active, setActive] = useState(activeTab);
  const insets = useSafeAreaInsets();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <HomeIcon />,
      href: 'home',
    },
    {
      id: 'myabs',
      label: 'My ABS',
      icon: <StarIcon />,
      onPress: () => handlePress('myabs'),
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: <ScanIcon />,
      onPress: () => handlePress('scan'),
    },
    {
      id: 'listen',
      label: 'Listen',
      icon: <ListenIcon />,
      onPress: () => handlePress('listen'),
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: <RewardsIcon />,
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
            {item.icon}
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

// Icon Components
function HomeIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Text style={styles.iconText}>🏠</Text>
    </View>
  );
}

function StarIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Text style={styles.iconText}>⭐</Text>
    </View>
  );
}

function ScanIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Text style={styles.iconText}>📱</Text>
    </View>
  );
}

function ListenIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Text style={styles.iconText}>🎧</Text>
    </View>
  );
}

function RewardsIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Text style={styles.iconText}>🎁</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.base,
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
