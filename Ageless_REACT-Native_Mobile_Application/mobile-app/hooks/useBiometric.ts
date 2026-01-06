import { useState, useCallback, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

/**
 * useBiometric Hook
 * Manages biometric authentication (Face ID, Touch ID)
 *
 * Features:
 * - Detect device biometric capability
 * - Trigger Face ID/Touch ID prompt
 * - Store/retrieve biometric credentials securely
 * - Fallback to password authentication
 * - Retry logic with 3 attempts before fallback
 */
export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  /**
   * Check if device supports biometric authentication
   */
  const checkBiometricAvailable = useCallback(async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync();

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
      }

      return compatible;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to check biometric";
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
  const storeBiometricCredentials = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!isAvailable) {
        return;
      }

      try {
        // Store credentials in SecureStore (encrypted)
        // In production, only store a hash or token, not the plain password
        await SecureStore.setItemAsync(
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
        const credentialsJson = await SecureStore.getItemAsync(
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
      await SecureStore.deleteItemAsync("biometric_credentials");
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
    storeBiometricCredentials,
    getBiometricCredentials,
    clearBiometricCredentials,
  };
};
