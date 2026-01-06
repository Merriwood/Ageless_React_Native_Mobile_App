import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import { mapError, logError, DEFAULT_RETRY_STRATEGY } from "../utils/errorHandler";

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
 * Create unique request ID for tracking
 */
const createRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

      // Add Request ID for debugging
      config.headers["X-Request-ID"] = createRequestId();

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
 * Validates responses, handles errors, and implements retry logic
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    const requestId = config?.headers?.["X-Request-ID"];

    // Map error to user-friendly message
    const mappedError = mapError(error);

    // Log error safely (no sensitive data)
    logError(mappedError, `API Request failed: ${config?.method?.toUpperCase()} ${config?.url}`);

    // Handle 401 Unauthorized (clear token and force logout)
    if (mappedError.code === "UNAUTHORIZED") {
      try {
        await SecureStore.deleteItemAsync("auth_token");
      } catch (err) {
        console.error("[API Client] Failed to clear token on 401:", err);
      }

      // Return mapped error (app routing handles redirect to login)
      return Promise.reject(mappedError);
    }

    // Handle retryable errors with exponential backoff
    if (mappedError.retryable && mappedError.code !== "UNAUTHORIZED") {
      config.retryCount = config.retryCount || 0;

      // Use retry strategy
      const shouldRetry = DEFAULT_RETRY_STRATEGY.shouldRetry(mappedError, config.retryCount);

      if (shouldRetry) {
        config.retryCount += 1;

        // Calculate exponential backoff delay
        const delayMs = Math.pow(2, config.retryCount - 1) * 1000;
        const cappedDelay = Math.min(delayMs, 30000);

        if (__DEV__) {
          console.warn(
            `[API Client] Retrying ${config.method?.toUpperCase()} ${config.url} ` +
              `(attempt ${config.retryCount}/${DEFAULT_RETRY_STRATEGY.maxAttempts}) ` +
              `after ${cappedDelay}ms`
          );
        }

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(apiClient(config));
          }, cappedDelay);
        });
      }
    }

    // Return mapped error with all context
    return Promise.reject({
      ...mappedError,
      originalError: error,
      requestId,
    });
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
