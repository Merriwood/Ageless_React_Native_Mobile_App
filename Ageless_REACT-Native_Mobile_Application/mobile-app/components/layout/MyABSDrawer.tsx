import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { theme } from '../../theme';

interface BodyPart {
  id: string;
  name: string;
  icon: string;
}

interface MyABSDrawerProps {
  isVisible?: boolean;
  onClose?: () => void;
  onBodyPartSelect?: (bodyPart: string) => void;
}

const BODY_PARTS: BodyPart[] = [
  { id: 'abs', name: 'Abs', icon: '💪' },
  { id: 'chest', name: 'Chest', icon: '🫀' },
  { id: 'back', name: 'Back', icon: '🔙' },
  { id: 'shoulders', name: 'Shoulders', icon: '⬆️' },
  { id: 'biceps', name: 'Biceps', icon: '💪' },
  { id: 'triceps', name: 'Triceps', icon: '💪' },
  { id: 'forearms', name: 'Forearms', icon: '🦾' },
  { id: 'legs', name: 'Legs', icon: '🦵' },
  { id: 'calves', name: 'Calves', icon: '🦵' },
  { id: 'glutes', name: 'Glutes', icon: '🍑' },
];

export function MyABSDrawer({
  isVisible = false,
  onClose,
  onBodyPartSelect,
}: MyABSDrawerProps) {
  const [weight, setWeight] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  const handleBodyPartSelect = (bodyPartId: string) => {
    setSelectedBodyPart(bodyPartId);
    if (onBodyPartSelect) {
      onBodyPartSelect(bodyPartId);
    }
  };

  const renderBodyPartItem = ({ item }: { item: BodyPart }) => (
    <TouchableOpacity
      style={[
        styles.bodyPartItem,
        selectedBodyPart === item.id && styles.bodyPartItemSelected,
      ]}
      onPress={() => handleBodyPartSelect(item.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.bodyPartIcon}>{item.icon}</Text>
      <View style={styles.bodyPartContent}>
        <Text
          style={[
            styles.bodyPartName,
            selectedBodyPart === item.id && styles.bodyPartNameSelected,
          ]}
        >
          {item.name}
        </Text>
      </View>
      <Text
        style={[
          styles.bodyPartChevron,
          selectedBodyPart === item.id && styles.bodyPartChevronSelected,
        ]}
      >
        ›
      </Text>
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
            <Text style={styles.drawerTitle}>My ABS</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Weight Section */}
          <View style={styles.weightSection}>
            <Text style={styles.weightLabel}>Body Weight</Text>
            <TextInput
              style={styles.weightInput}
              placeholder="Enter weight (lbs)"
              placeholderTextColor={theme.colors.text.secondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              maxLength={6}
            />
          </View>

          {/* Body Parts List */}
          <View style={styles.bodyPartsContainer}>
            <Text style={styles.bodyPartsTitle}>Select Area</Text>
            <FlatList
              data={BODY_PARTS}
              renderItem={renderBodyPartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </View>

          {/* Footer Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  drawerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
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
  bodyPartsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  bodyPartsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  bodyPartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
  },
  bodyPartItemSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  bodyPartIcon: {
    fontSize: 20,
    marginRight: theme.spacing.lg,
  },
  bodyPartContent: {
    flex: 1,
  },
  bodyPartName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text.primary,
  },
  bodyPartNameSelected: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  bodyPartChevron: {
    fontSize: 20,
    color: theme.colors.text.secondary,
  },
  bodyPartChevronSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.text.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.text.onPrimary,
  },
});
