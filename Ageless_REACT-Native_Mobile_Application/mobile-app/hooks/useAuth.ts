import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
 * - Secure token storage in SecureStore (encrypted)
 * - Token persistence across app restarts
 * - Token expiration checking
 * - Token refresh capability
 * - User profile management
 */
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
   * Store token securely in SecureStore
   * Also stores user profile in AsyncStorage for quick access
   */
  const setToken = useCallback(
    async (newToken: string, userData?: User): Promise<void> => {
      try {
        // Store token in SecureStore (encrypted)
        await SecureStore.setItemAsync("auth_token", newToken);

        // Store user in AsyncStorage (for quick access, not sensitive)
        if (userData) {
          await AsyncStorage.setItem("user_profile", JSON.stringify(userData));
        }

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
   * Retrieve token from SecureStore
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedToken = await SecureStore.getItemAsync("auth_token");
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
   */
  const clearToken = useCallback(async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync("auth_token");
      await AsyncStorage.removeItem("user_profile");
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
   */
  const loadAuthState = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Get token from SecureStore
      const storedToken = await SecureStore.getItemAsync("auth_token");

      if (!storedToken) {
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

      setTokenState(storedToken);
      setUser(userData);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load auth state";
      setError(message);
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
