import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

interface MyABSDrawerProps {
  isVisible?: boolean;
  onClose?: () => void;
  onHistoryPress?: () => void;
  onSummaryPress?: () => void;
  onProgressPress?: () => void;
  onWeightChange?: (weight: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  enabled: boolean;
  onPress?: () => void;
}

export function MyABSDrawer({
  isVisible = false,
  onClose,
  onHistoryPress,
  onSummaryPress,
  onProgressPress,
  onWeightChange,
}: MyABSDrawerProps) {
  const { user } = useAuth();
  const [weight, setWeight] = useState('');

  const menuItems: MenuItem[] = [
    { id: 'history', label: 'History', enabled: true, onPress: onHistoryPress },
    { id: 'summary', label: 'Summary', enabled: true, onPress: onSummaryPress },
    { id: 'progress', label: 'Progress', enabled: true, onPress: onProgressPress },
    { id: 'aerobic', label: 'Aerobic (Coming Soon)', enabled: false },
    { id: 'strength', label: 'Strength (Coming Soon)', enabled: false },
    { id: 'balance', label: 'Balance & Flex (Coming Soon)', enabled: false },
    { id: 'stretch', label: 'Stretch (Coming Soon)', enabled: false },
    { id: 'custom', label: 'Custom (Coming Soon)', enabled: false },
    { id: 'assessments', label: 'Assessments (Coming Soon)', enabled: false },
    { id: 'goals', label: 'Goals (Coming Soon)', enabled: false },
    { id: 'rewards', label: 'Rewards (Coming Soon)', enabled: false },
  ];

  // Load weight from storage when drawer opens
  useEffect(() => {
    if (isVisible) {
      loadWeight();
    }
  }, [isVisible]);

  const loadWeight = async () => {
    try {
      if (!user?.id) return;
      const savedWeight = await AsyncStorage.getItem(`weight_${user.id}`);
      if (savedWeight) {
        setWeight(savedWeight);
      }
    } catch (e) {
      console.error('Weight load error:', e);
    }
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    onWeightChange?.(value);

    // Save to storage
    if (user?.id) {
      if (value) {
        AsyncStorage.setItem(`weight_${user.id}`, value).catch(e => {
          console.error('Weight save error:', e);
        });
      }
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.enabled && item.onPress) {
      item.onPress();
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        !item.enabled && styles.menuItemDisabled,
      ]}
      onPress={() => handleMenuPress(item)}
      activeOpacity={item.enabled ? 0.7 : 1}
      disabled={!item.enabled}
    >
      <Text
        style={[
          styles.menuLabel,
          !item.enabled && styles.menuLabelDisabled,
        ]}
      >
        {item.label}
      </Text>
      {item.enabled && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* Drawer Container */}
        <View style={styles.drawerContainer}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>My Body</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.drawerContent}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {/* Weight Section */}
            <View style={styles.weightSection}>
              <Text style={styles.weightLabel}>Weight</Text>
              <TextInput
                style={styles.weightInput}
                placeholder="Enter weight"
                placeholderTextColor={theme.colors.text.secondary}
                value={weight}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                maxLength={6}
              />
            </View>

            {/* Menu Section */}
            <View style={styles.menuSection}>
              {menuItems.map((item) => renderMenuItem(item))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '85%',
    ...theme.shadows.lg,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  drawerTitle: {
    fontSize: 18, // text-lg font-semibold
    fontWeight: '600',
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
    fontSize: 24,
    color: theme.colors.text.secondary,
    fontWeight: '400',
  },
  weightSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  weightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  weightInput: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surfaceAlt,
  },
  menuSection: {
    paddingHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    flex: 1,
  },
  menuLabelDisabled: {
    color: theme.colors.text.secondary,
  },
});
