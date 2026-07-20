import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { changePassword } from '../../api/auth';
import { useUI } from '../../context/UIContext';

interface ChangePasswordModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  isVisible = false,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useUI();

  const handleChangePassword = async () => {
    setError('');

    // Validate inputs
    if (!oldPassword.trim()) {
      setError('Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      showToast('Password changed successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Change Password</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.status.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Current Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your current password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showOldPassword}
                  editable={!isLoading}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
                <Pressable
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showOldPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </Pressable>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showNewPassword}
                  editable={!isLoading}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <Pressable
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.text.onPrimary} />
              ) : (
                <Text style={styles.submitButtonText}>Change Password</Text>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.status.error}20`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.status.error,
    padding: theme.spacing.base,
    borderRadius: 8,
    marginBottom: theme.spacing.base,
  },
  errorText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.status.error,
    fontSize: 13,
    flex: 1,
  },
  formGroup: {
    marginBottom: theme.spacing.base,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  eyeIcon: {
    padding: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.base,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.onPrimary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
