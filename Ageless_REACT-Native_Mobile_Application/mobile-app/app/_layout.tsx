import React, { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth, User } from "../hooks/useAuth";
import { validateToken } from "../api/auth";
import { theme } from "../theme";
import { WorkoutProvider } from "../context/WorkoutContext";
import { UIProvider } from "../context/UIContext";
import "../global.css";

/**
 * Root Layout with Multiple Contexts
 * Handles:
 * - Loading auth state from storage
 * - Validating tokens on app boot
 * - Routing based on auth status
 * - Showing splash/loader during auth check
 * - Wrapping app with Workout, UI, and Auth contexts
 *
 * Context Nesting Order (inside-out):
 * 1. SafeAreaProvider (react-native-safe-area-context)
 * 2. UIProvider (toast, sync status, network detection)
 * 3. WorkoutProvider (entries cache, load/save/delete)
 * 4. Auth is handled by useAuth hook (from Phase 1)
 */

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { token, user, isLoading: authLoading, loadAuthState, clearToken } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  /**
   * Boot sequence:
   * 1. Load token from storage
   * 2. If token exists, validate via /api/me
   * 3. If 401, clear token → show login
   * 4. If valid, show dashboard
   * 5. If no token, show login
   */
  useEffect(() => {
    const bootApp = async () => {
      try {
        // Load auth state and get the token directly (avoids race condition)
        const loadedToken = await loadAuthState();

        // If token exists, validate it with backend
        if (loadedToken) {
          try {
            await validateToken();
            // Token is valid, user is authenticated
          } catch (error) {
            // Token is invalid or expired
            await clearToken();
          }
        }
      } catch (error) {
        // Silent fail - will redirect to login
      } finally {
        setIsChecking(false);
      }
    };

    bootApp();
  }, []);

  /**
   * Route protection logic
   * Redirect based on auth state
   */
  useEffect(() => {
    if (isChecking || authLoading) {
      // Still loading, don't navigate
      return;
    }

    const isInAuthGroup = segments[0] === "(auth)";

    if (!token) {
      // No token: must be in auth group
      if (!isInAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      // Has token: should not be in auth group
      if (isInAuthGroup) {
        router.replace("/dashboard");
      }
    }
  }, [token, segments, isChecking, authLoading]);

  // Show splash/loader while checking auth state
  if (isChecking || authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <UIProvider>
      <WorkoutProvider>
        <Slot />
      </WorkoutProvider>
    </UIProvider>
  );
}

/**
 * Root Layout Export
 * Wraps RootLayoutContent with SafeAreaProvider at the top level
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutContent />
    </SafeAreaProvider>
  );
}
