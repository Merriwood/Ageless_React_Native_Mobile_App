import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";

/**
 * Environment-based API configuration
 */
const API_CONFIG = {
  development: "http://localhost:3000",
  staging: "https://api-staging.yourapp.com",
  production: "https://api.yourapp.com",
};

const getBaseURL = (): string => {
  // Use __DEV__ flag from React Native or NODE_ENV
  const isDev =
    typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV === "development";

  if (isDev) {
    return API_CONFIG.development;
  }

  // Could use other environment variables or config
  return API_CONFIG.production;
};

/**
 * Create Axios instance with default configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: getBaseURL(),
    timeout: 30000, // 30 seconds
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Global Axios instance
 */
let apiClient = createAxiosInstance();

/**
 * Request interceptor
 * Adds JWT Bearer token to Authorization header
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from SecureStore
      const token = await SecureStore.getItemAsync("auth_token");

      if (token) {
        // Add Bearer token to headers
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add Request ID for debugging (optional)
      config.headers["X-Request-ID"] =
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return config;
    } catch (error) {
      // If token retrieval fails, continue without token
      console.error("[API Client] Failed to retrieve token:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles errors and retry logic
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear token and user data (force logout)
      try {
        await SecureStore.deleteItemAsync("auth_token");
      } catch (err) {
        console.error("[API Client] Failed to clear token on 401:", err);
      }

      // Redirect to login would be handled by app-level routing
      // Return error with special flag
      const unauthorizedError = new Error("Unauthorized");
      (unauthorizedError as any).code = "UNAUTHORIZED";
      return Promise.reject(unauthorizedError);
    }

    // Handle 5xx errors with exponential backoff retry
    if (error.response?.status && error.response.status >= 500) {
      // Check retry count
      config.retryCount = config.retryCount || 0;

      if (config.retryCount < 3) {
        config.retryCount += 1;

        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, config.retryCount - 1) * 1000;

        console.warn(
          `[API Client] Retrying request (attempt ${config.retryCount}/3) after ${delayMs}ms`
        );

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(apiClient(config));
          }, delayMs);
        });
      }
    }

    // Network timeout errors
    if (error.code === "ECONNABORTED") {
      const timeoutError = new Error("Request timeout - server not responding");
      (timeoutError as any).code = "TIMEOUT";
      return Promise.reject(timeoutError);
    }

    // Network errors (no internet, etc.)
    if (error.message === "Network Error" || !error.response) {
      const networkError = new Error("Network error - please check your connection");
      (networkError as any).code = "NETWORK_ERROR";
      return Promise.reject(networkError);
    }

    // Default error
    return Promise.reject(error);
  }
);

/**
 * API Client export
 * Usage: import { apiClient } from './api/client'
 */
export { apiClient };

/**
 * Helper function to create a fresh client instance
 * Useful if API_CONFIG needs to change at runtime
 */
export const refreshApiClient = (): void => {
  apiClient = createAxiosInstance();
  // Reapply interceptors
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await SecureStore.getItemAsync("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers["X-Request-ID"] =
          `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return config;
      } catch (error) {
        console.error("[API Client] Failed to retrieve token:", error);
        return config;
      }
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;

      if (error.response?.status === 401) {
        try {
          await SecureStore.deleteItemAsync("auth_token");
        } catch (err) {
          console.error("[API Client] Failed to clear token on 401:", err);
        }
        const unauthorizedError = new Error("Unauthorized");
        (unauthorizedError as any).code = "UNAUTHORIZED";
        return Promise.reject(unauthorizedError);
      }

      if (error.response?.status && error.response.status >= 500) {
        config.retryCount = config.retryCount || 0;
        if (config.retryCount < 3) {
          config.retryCount += 1;
          const delayMs = Math.pow(2, config.retryCount - 1) * 1000;
          console.warn(
            `[API Client] Retrying request (attempt ${config.retryCount}/3) after ${delayMs}ms`
          );
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(apiClient(config));
            }, delayMs);
          });
        }
      }

      if (error.code === "ECONNABORTED") {
        const timeoutError = new Error("Request timeout - server not responding");
        (timeoutError as any).code = "TIMEOUT";
        return Promise.reject(timeoutError);
      }

      if (error.message === "Network Error" || !error.response) {
        const networkError = new Error("Network error - please check your connection");
        (networkError as any).code = "NETWORK_ERROR";
        return Promise.reject(networkError);
      }

      return Promise.reject(error);
    }
  );
};
