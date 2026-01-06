import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUI } from '../../context/UIContext';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useUI();

  // Placeholder user data - would come from context/API
  const userEmail = 'user@example.com';
  const userId = 'user-123';
  const appVersion = '1.0.0';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            // Clear authentication state
            // await clearAuth();
            showToast('Logged out successfully', 'success');
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout failed:', error);
            showToast('Logout failed', 'error');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature is coming soon',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            showToast('Account deletion is coming soon', 'info');
          },
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showToast('Could not open link', 'error');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header_bar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
          {/* User Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <Card style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
                  <View style={{ marginLeft: theme.spacing.base }}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{userEmail}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                  <View style={{ marginLeft: theme.spacing.base }}>
                    <Text style={styles.infoLabel}>User ID</Text>
                    <Text style={styles.infoValue}>{userId}</Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <Card style={styles.card}>
              <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
                <View style={styles.settingLeft}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.settingLabel}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.settingLabel}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </Card>
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>

            <Card style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                  <View style={{ marginLeft: theme.spacing.base }}>
                    <Text style={styles.infoLabel}>App Version</Text>
                    <Text style={styles.infoValue}>{appVersion}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('https://example.com/terms')}
              >
                <Text style={styles.linkText}>Terms of Service</Text>
                <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('https://example.com/privacy')}
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
                <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Danger Zone Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.status.error }]}>
              Danger Zone
            </Text>

            <Card style={styles.card}>
              <TouchableOpacity
                style={styles.dangerRow}
                onPress={handleDeleteAccount}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.status.error} />
                <Text style={styles.dangerText}>Delete Account</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <Button
              variant="danger"
              onPress={handleLogout}
              disabled={loading}
              style={styles.logoutButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="log-out-outline" size={18} color={theme.colors.status.error} />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </View>
            </Button>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: theme.spacing.xl * 2 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header_bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.base,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginHorizontal: theme.spacing.base,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.status.error,
    marginLeft: theme.spacing.base,
  },
  logoutButton: {
    marginHorizontal: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.status.error,
  },
});
