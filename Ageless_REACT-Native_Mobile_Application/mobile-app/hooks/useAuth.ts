import { useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenManager } from "../api/tokenManager";

/**
 * JWT token payload structure
 */
export interface JWTPayload {
  sub: string; // user_id
  email: string;
  goal?: string | string[];
  iat?: number;
  exp?: number;
}

/**
 * User profile structure
 */
export interface User {
  id: string;
  email: string;
  goal?: string | string[];
}

/**
 * useAuth Hook
 * Manages authentication state, token storage, and session persistence
 *
 * Features:
 * - Secure token storage in SecureStore (native) or AsyncStorage (web)
 * - Token persistence across app restarts
 * - Token expiration checking
 * - Token refresh capability
 * - User profile management
 */

/**
 * Helper: Store token securely (platform-aware)
 * Uses SecureStore on native platforms, AsyncStorage on web
 */
const storeTokenSecurely = async (
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
    console.error(`[useAuth] Failed to store ${key}:`, err);
    throw err;
  }
};

/**
 * Helper: Retrieve token securely (platform-aware)
 */
const retrieveTokenSecurely = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      // On web, use AsyncStorage
      return await AsyncStorage.getItem(key);
    } else {
      // On native platforms, use SecureStore
      return await SecureStore.getItemAsync(key);
    }
  } catch (err) {
    console.error(`[useAuth] Failed to retrieve ${key}:`, err);
    return null;
  }
};

/**
 * Helper: Delete token securely (platform-aware)
 */
const deleteTokenSecurely = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // On web, use AsyncStorage
      await AsyncStorage.removeItem(key);
    } else {
      // On native platforms, use SecureStore
      await SecureStore.deleteItemAsync(key);
    }
  } catch (err) {
    console.error(`[useAuth] Failed to delete ${key}:`, err);
    throw err;
  }
};

export const useAuth = () => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Decode JWT token (client-side)
   * Note: This is for reading payload only, not verification
   * Server should verify the signature
   */
  const decodeToken = useCallback((jwtToken: string): JWTPayload | null => {
    try {
      const parts = jwtToken.split(".");
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );
      return decoded;
    } catch {
      return null;
    }
  }, []);

  /**
   * Check if token is expired
   */
  const isTokenExpired = useCallback((jwtToken: string): boolean => {
    const decoded = decodeToken(jwtToken);
    if (!decoded || !decoded.exp) return false;

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  }, [decodeToken]);

  /**
   * Store token securely in SecureStore (encrypted on native, AsyncStorage on web)
   * Also stores user profile in AsyncStorage for quick access
   * Syncs with tokenManager for API client authentication
   */
  const setToken = useCallback(
    async (newToken: string, userData?: User): Promise<void> => {
      try {
        // Store token securely (platform-aware)
        await storeTokenSecurely("auth_token", newToken);

        // Store user in AsyncStorage (for quick access, not sensitive)
        if (userData) {
          await AsyncStorage.setItem("user_profile", JSON.stringify(userData));
        }

        // Sync with tokenManager for API client
        tokenManager.setToken(newToken);

        setTokenState(newToken);
        setUser(userData || null);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to store token";
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * Retrieve token from SecureStore (or AsyncStorage on web)
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedToken = await retrieveTokenSecurely("auth_token");
      return storedToken || null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to retrieve token";
      setError(message);
      return null;
    }
  }, []);

  /**
   * Clear token and user data (logout)
   * Also clears tokenManager for API client
   */
  const clearToken = useCallback(async (): Promise<void> => {
    try {
      await deleteTokenSecurely("auth_token");
      await AsyncStorage.removeItem("user_profile");

      // Clear tokenManager for API client
      tokenManager.clearToken();

      setTokenState(null);
      setUser(null);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to clear token";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Load token and user data from storage (called on app boot)
   * Syncs with tokenManager for API client authentication
   */
  const loadAuthState = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Get token from storage (platform-aware)
      const storedToken = await retrieveTokenSecurely("auth_token");

      if (!storedToken) {
        tokenManager.clearToken();
        setTokenState(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        // Token expired, clear it
        await clearToken();
        setIsLoading(false);
        return;
      }

      // Get user profile from AsyncStorage
      const userJson = await AsyncStorage.getItem("user_profile");
      const userData = userJson ? JSON.parse(userJson) : null;

      // Sync with tokenManager for API client
      tokenManager.setToken(storedToken);

      setTokenState(storedToken);
      setUser(userData);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load auth state";
      setError(message);
      tokenManager.clearToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isTokenExpired, clearToken]);

  /**
   * Load auth state on hook mount
   */
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  return {
    // State
    token,
    user,
    isLoading,
    error,

    // Computed
    isAuthenticated: !!token && !isTokenExpired(token || ""),

    // Methods
    setToken,
    getToken,
    clearToken,
    isTokenExpired,
    loadAuthState,
  };
};
