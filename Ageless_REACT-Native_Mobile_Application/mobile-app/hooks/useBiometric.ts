import { useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * useBiometric Hook
 * Manages biometric authentication (Face ID, Touch ID)
 *
 * Features:
 * - Detect device biometric capability
 * - Trigger Face ID/Touch ID prompt
 * - Store/retrieve biometric credentials securely (platform-aware)
 * - Fallback to password authentication
 * - Retry logic with 3 attempts before fallback
 */

/**
 * Helper: Store biometric credentials securely (platform-aware)
 * Uses SecureStore on native platforms, AsyncStorage on web
 */
const storeBiometricCredentials = async (
  key: string,
  value: string
): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // On web, use AsyncStorage (no native secure storage available)
      await AsyncStorage.setItem(key, value);
    } else {
      // On native platforms, use SecureStore for encryption
      await SecureStore.setItemAsync(key, value);
    }
  } catch (err) {
    console.error(`[useBiometric] Failed to store ${key}:`, err);
    throw err;
  }
};

/**
 * Helper: Retrieve biometric credentials securely (platform-aware)
 */
const retrieveBiometricCredentials = async (
  key: string
): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      // On web, use AsyncStorage
      return await AsyncStorage.getItem(key);
    } else {
      // On native platforms, use SecureStore
      return await SecureStore.getItemAsync(key);
    }
  } catch (err) {
    console.error(`[useBiometric] Failed to retrieve ${key}:`, err);
    return null;
  }
};

/**
 * Helper: Delete biometric credentials securely (platform-aware)
 */
const deleteBiometricCredentials = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // On web, use AsyncStorage
      await AsyncStorage.removeItem(key);
    } else {
      // On native platforms, use SecureStore
      await SecureStore.deleteItemAsync(key);
    }
  } catch (err) {
    console.error(`[useBiometric] Failed to delete ${key}:`, err);
    throw err;
  }
};

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  /**
   * Check if device supports biometric authentication
   * Checks both hardware availability AND enrollment status
   */
  const checkBiometricAvailable = useCallback(async (): Promise<boolean> => {
    try {
      // Skip biometric check on web
      if (Platform.OS === "web") {
        console.log("[useBiometric] Web platform - biometrics not supported");
        setIsAvailable(false);
        return false;
      }

      // Check if device has biometric hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      console.log("[useBiometric] Has hardware:", hasHardware);

      if (!hasHardware) {
        setIsAvailable(false);
        return false;
      }

      // Check if biometrics are enrolled (Face ID/Touch ID set up)
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log("[useBiometric] Is enrolled:", isEnrolled);

      if (!isEnrolled) {
        setIsAvailable(false);
        setError("Please set up Face ID or Touch ID in your device settings");
        return false;
      }

      // Get supported biometric types
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log("[useBiometric] Supported types:", supportedTypes);

      // Determine which type is available
      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType("Face ID");
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        setBiometricType("Touch ID");
      }

      setIsAvailable(true);
      setError(null);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to check biometric";
      console.error("[useBiometric] Error:", message);
      setError(message);
      setIsAvailable(false);
      return false;
    }
  }, []);

  /**
   * Trigger biometric authentication prompt
   * Returns boolean indicating success
   */
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setError("Biometric authentication not available on this device");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        reason: "Authenticate to access your fitness data",
        fallbackLabel: "Use passcode instead",
        disableDeviceFallback: false, // Allow fallback to device password
        requireConfirmation: true,
      });

      if (result.success) {
        setRetryCount(0);
        return true;
      } else if (result.error === "user_cancel") {
        setError("Authentication cancelled");
        return false;
      } else if (result.error === "user_fallback") {
        // User chose to use password instead
        setError("Please use password authentication");
        return false;
      } else {
        // Authentication failed, increment retry count
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        if (newRetryCount >= MAX_RETRIES) {
          setError(
            `Maximum authentication attempts (${MAX_RETRIES}) exceeded. Please use password instead.`
          );
          return false;
        } else {
          setError(
            `Authentication failed. ${MAX_RETRIES - newRetryCount} attempts remaining.`
          );
          return false;
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Biometric authentication failed";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, retryCount]);

  /**
   * Store biometric credentials (encrypted)
   * Used for quick login with Face ID after initial password login
   */
  const saveCredentials = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!isAvailable) {
        return;
      }

      try {
        // Store credentials in SecureStore (encrypted) - platform-aware
        // In production, only store a hash or token, not the plain password
        await storeBiometricCredentials(
          "biometric_credentials",
          JSON.stringify({ email, password })
        );
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to store biometric credentials";
        setError(message);
        // Don't throw - biometric credentials are optional
      }
    },
    [isAvailable]
  );

  /**
   * Retrieve stored biometric credentials
   */
  const getBiometricCredentials = useCallback(
    async (): Promise<{ email: string; password: string } | null> => {
      try {
        const credentialsJson = await retrieveBiometricCredentials(
          "biometric_credentials"
        );
        if (!credentialsJson) return null;

        return JSON.parse(credentialsJson);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to retrieve biometric credentials";
        setError(message);
        return null;
      }
    },
    []
  );

  /**
   * Clear stored biometric credentials (on logout)
   */
  const clearBiometricCredentials = useCallback(async (): Promise<void> => {
    try {
      await deleteBiometricCredentials("biometric_credentials");
      setRetryCount(0);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error
            ? err.message
            : "Failed to clear biometric credentials";
      setError(message);
      // Don't throw - clearing is best-effort
    }
  }, []);

  /**
   * Check biometric availability on hook mount
   */
  useEffect(() => {
    checkBiometricAvailable();
  }, [checkBiometricAvailable]);

  return {
    // State
    isAvailable,
    biometricType,
    isLoading,
    error,
    retryCount,
    attemptsRemaining: Math.max(0, MAX_RETRIES - retryCount),

    // Methods
    authenticate,
    checkBiometricAvailable,
    saveCredentials,
    getBiometricCredentials,
    clearBiometricCredentials,
  };
};
