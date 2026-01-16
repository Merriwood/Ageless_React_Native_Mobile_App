import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../theme';

/**
 * Root Index - Redirects to login
 * The _layout.tsx handles auth state and will redirect to dashboard if authenticated
 */
export default function Home() {
  useEffect(() => {
    // Redirect to login - _layout.tsx will handle auth check
    // and redirect to dashboard if already authenticated
    router.replace('/(auth)/login');
  }, []);

  // Show loading while redirecting
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
