import { apiClient } from "./client";
import { User } from "../hooks/useAuth";

/**
 * Authentication API Module
 * Handles all auth-related API calls
 */

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  goal?: string | string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Register a new user account
 * POST /api/auth/register
 */
export const register = async (
  email: string,
  password: string,
  goal?: string | string[]
): Promise<AuthResponse> => {
  try {
    const payload: RegisterPayload = {
      email,
      password,
      ...(goal && { goal }),
    };

    console.log('[api/auth] Calling POST /api/auth/register for:', email);
    const response = await apiClient.post<AuthResponse>("/api/auth/register", payload);
    console.log('[api/auth] Registration success for:', email);
    return response;
  } catch (error) {
    console.error('[api/auth] Registration error:', error);
    if (error instanceof Error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
    throw new Error("Registration failed");
  }
};

/**
 * Login with email and password
 * POST /api/auth/login
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const payload: LoginPayload = {
      email,
      password,
    };

    console.log('[api/auth] Calling POST /api/auth/login for:', email);
    const response = await apiClient.post<AuthResponse>("/api/auth/login", payload);
    console.log('[api/auth] Login success for:', email);
    return response;
  } catch (error) {
    console.error('[api/auth] Login error:', error);
    if (error instanceof Error) {
      throw new Error(`Login failed: ${error.message}`);
    }
    throw new Error("Login failed");
  }
};

/**
 * Logout (invalidate session on backend)
 * POST /api/auth/logout
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post("/api/auth/logout");
  } catch {
    // Logout is best-effort, silently ignore errors
  }
};

/**
 * Validate current session
 * GET /api/me
 * Returns current user profile if token is valid
 */
export const validateToken = async (): Promise<User> => {
  try {
    // apiClient.get already returns response.data, so response IS { user: User }
    const response = await apiClient.get<{ user: User }>("/api/me");
    return response.user;
  } catch (error) {
    if (error instanceof Error && (error as any).code === "UNAUTHORIZED") {
      throw new Error("Session expired");
    }
    throw error;
  }
};

/**
 * Refresh authentication token (optional, if backend supports it)
 * POST /api/auth/refresh
 */
export const refreshToken = async (
  currentToken?: string
): Promise<AuthResponse> => {
  try {
    // apiClient.post already returns response.data
    const response = await apiClient.post<AuthResponse>("/api/auth/refresh", {
      token: currentToken,
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
    throw new Error("Token refresh failed");
  }
};

/**
 * Error mapping for user-friendly messages
 */
export const mapAuthError = (error: any): string => {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("Network error")) {
      return "Network connection failed. Please check your internet.";
    }

    // Timeout errors
    if (error.message.includes("timeout")) {
      return "Server not responding. Please try again.";
    }

    // Auth errors
    if (error.message.includes("Invalid credentials")) {
      return "Incorrect email or password.";
    }

    if (error.message.includes("Session expired")) {
      return "Your session has expired. Please log in again.";
    }

    if (error.message.includes("already exists")) {
      return "This email is already registered.";
    }

    if (error.message.includes("Registration failed")) {
      return "Registration failed. Please try again.";
    }

    if (error.message.includes("Login failed")) {
      return "Login failed. Please try again.";
    }

    // Default to provided message
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
};
