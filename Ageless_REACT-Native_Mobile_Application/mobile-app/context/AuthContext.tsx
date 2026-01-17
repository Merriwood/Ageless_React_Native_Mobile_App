import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenManager } from "../api/tokenManager";

/**
 * User profile structure
 */
export interface User {
  id: string;
  email: string;
  goal?: string | string[];
}

/**
 * Auth context state and methods
 */
interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setToken: (newToken: string, userData?: User) => Promise<void>;
  getToken: () => Promise<string | null>;
  clearToken: () => Promise<void>;
  loadAuthState: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Helper: Store token securely (platform-aware)
 */
const storeTokenSecurely = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

/**
 * Helper: Retrieve token securely (platform-aware)
 */
const retrieveTokenSecurely = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    return null;
  }
};

/**
 * Helper: Delete token securely (platform-aware)
 */
const deleteTokenSecurely = async (key: string): Promise<void> => {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

/**
 * Decode JWT token payload (client-side, no verification)
 */
const decodeToken = (jwtToken: string): { exp?: number } | null => {
  try {
    const parts = jwtToken.split(".");
    if (parts.length !== 3) return null;
    // Use atob for web, Buffer for native
    const payload = Platform.OS === "web"
      ? atob(parts[1])
      : Buffer.from(parts[1], "base64").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
const isTokenExpired = (jwtToken: string): boolean => {
  const decoded = decodeToken(jwtToken);
  if (!decoded || !decoded.exp) return false;
  return Date.now() >= decoded.exp * 1000;
};

/**
 * AuthProvider - Wraps app to provide shared auth state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Store token and user data
   */
  const setToken = useCallback(async (newToken: string, userData?: User): Promise<void> => {
    try {
      await storeTokenSecurely("auth_token", newToken);
      if (userData) {
        await AsyncStorage.setItem("user_profile", JSON.stringify(userData));
      }
      tokenManager.setToken(newToken);
      setTokenState(newToken);
      setUser(userData || null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to store token";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get token from storage
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await retrieveTokenSecurely("auth_token");
    } catch {
      return null;
    }
  }, []);

  /**
   * Clear token and user data (logout)
   */
  const clearToken = useCallback(async (): Promise<void> => {
    try {
      await deleteTokenSecurely("auth_token");
      await AsyncStorage.removeItem("user_profile");
      tokenManager.clearToken();
      setTokenState(null);
      setUser(null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clear token";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Load auth state from storage
   */
  const loadAuthState = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      const storedToken = await retrieveTokenSecurely("auth_token");

      if (!storedToken) {
        tokenManager.clearToken();
        setTokenState(null);
        setUser(null);
        return null;
      }

      if (isTokenExpired(storedToken)) {
        await deleteTokenSecurely("auth_token");
        await AsyncStorage.removeItem("user_profile");
        tokenManager.clearToken();
        setTokenState(null);
        setUser(null);
        return null;
      }

      const userJson = await AsyncStorage.getItem("user_profile");
      const userData = userJson ? JSON.parse(userJson) : null;

      tokenManager.setToken(storedToken);
      setTokenState(storedToken);
      setUser(userData);
      setError(null);

      return storedToken;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load auth state";
      setError(message);
      tokenManager.clearToken();
      setTokenState(null);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load auth state on mount
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const value: AuthContextType = {
    token,
    user,
    isLoading,
    error,
    isAuthenticated: !!token && !isTokenExpired(token),
    setToken,
    getToken,
    clearToken,
    loadAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook - consumes AuthContext
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
