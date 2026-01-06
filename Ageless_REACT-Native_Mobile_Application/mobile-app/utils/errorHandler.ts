/**
 * Error Handler Utility
 *
 * Maps technical errors to user-friendly messages
 * Categorizes errors for logging and recovery
 * Never exposes sensitive information
 */

import axios, { AxiosError } from 'axios';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ErrorCode =
  | 'NO_INTERNET'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface MappedError {
  code: ErrorCode;
  message: string; // User-friendly
  details?: string; // Technical details (dev only)
  severity: ErrorSeverity;
  retryable: boolean;
  statusCode?: number;
  requestId?: string;
  timestamp: Date;
}

// ============================================================================
// ERROR MAPPING
// ============================================================================

/**
 * Map any error to user-friendly message and metadata
 * Never exposes passwords, tokens, or internal details
 */
export function mapError(error: unknown): MappedError {
  const now = new Date();

  // Network error (no response from server)
  if (!axios.isAxiosError(error)) {
    return {
      code: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again.',
      details: error instanceof Error ? error.message : String(error),
      severity: 'error',
      retryable: false,
      timestamp: now,
    };
  }

  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return {
      code: 'TIMEOUT',
      message: 'Request took too long. Please check your connection and try again.',
      details: 'Request timeout after 30 seconds',
      severity: 'warning',
      retryable: true,
      requestId: error.config?.headers?.['X-Request-ID'] as string,
      timestamp: now,
    };
  }

  // Network error (no internet)
  if (!error.response) {
    return {
      code: 'NO_INTERNET',
      message: 'No internet connection. Your changes will sync when you\'re back online.',
      details: error.message,
      severity: 'warning',
      retryable: true,
      timestamp: now,
    };
  }

  const status = error.response.status;
  const requestId = error.response.headers?.['x-request-id'] as string;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return {
        code: 'VALIDATION_ERROR',
        message: error.response.data?.error?.message || 'Invalid input. Please check and try again.',
        details: JSON.stringify(error.response.data?.error?.details),
        severity: 'warning',
        retryable: false,
        statusCode: status,
        requestId,
        timestamp: now,
      };

    case 401:
      return {
        code: 'UNAUTHORIZED',
        message: 'Your session expired. Please log in again.',
        details: 'Invalid or expired JWT token',
        severity: 'warning',
        retryable: false, // Don't retry - needs re-login
        statusCode: status,
        requestId,
        timestamp: now,
      };

    case 403:
      return {
        code: 'FORBIDDEN',
        message: 'You don\'t have permission to do this.',
        details: 'Access denied',
        severity: 'warning',
        retryable: false,
        statusCode: status,
        requestId,
        timestamp: now,
      };

    case 404:
      return {
        code: 'NOT_FOUND',
        message: 'Data not found. It may have been deleted.',
        details: 'Resource not found on server',
        severity: 'info',
        retryable: false,
        statusCode: status,
        requestId,
        timestamp: now,
      };

    case 409:
      return {
        code: 'CONFLICT',
        message: 'Server has newer data. Would you like to keep your changes or use the server version?',
        details: 'Conflict detected - server data differs from local changes',
        severity: 'warning',
        retryable: false, // User must resolve manually
        statusCode: status,
        requestId,
        timestamp: now,
      };

    case 429:
      return {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment and try again.',
        details: 'Rate limit exceeded',
        severity: 'warning',
        retryable: true,
        statusCode: status,
        requestId,
        timestamp: now,
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        code: status === 503 ? 'SERVICE_UNAVAILABLE' : 'SERVER_ERROR',
        message: 'Server error. Please try again in a moment.',
        details: `HTTP ${status}: ${error.response.statusText}`,
        severity: 'error',
        retryable: true,
        statusCode: status,
        requestId,
        timestamp: now,
      };

    default:
      return {
        code: 'UNKNOWN',
        message: 'Something went wrong. Please try again.',
        details: `HTTP ${status}`,
        severity: 'error',
        retryable: true,
        statusCode: status,
        requestId,
        timestamp: now,
      };
  }
}

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

export function isRetryable(error: MappedError): boolean {
  return error.retryable;
}

export function isAuthError(error: MappedError): boolean {
  return error.code === 'UNAUTHORIZED';
}

export function isNetworkError(error: MappedError): boolean {
  return error.code === 'NO_INTERNET' || error.code === 'TIMEOUT';
}

export function isConflict(error: MappedError): boolean {
  return error.code === 'CONFLICT';
}

export function isValidationError(error: MappedError): boolean {
  return error.code === 'VALIDATION_ERROR';
}

// ============================================================================
// RETRY STRATEGY
// ============================================================================

export interface RetryStrategy {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  shouldRetry: (error: MappedError, attempt: number) => boolean;
}

// Default retry strategy for exponential backoff
export const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  shouldRetry: (error: MappedError, attempt: number) => {
    // Don't retry auth or validation errors
    if (!error.retryable) return false;

    // Don't retry if we've exceeded max attempts
    if (attempt >= 3) return false;

    return true;
  },
};

/**
 * Calculate exponential backoff delay
 * Formula: min(baseDelay * (2 ^ attempt), maxDelay) + jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  strategy: RetryStrategy = DEFAULT_RETRY_STRATEGY
): number {
  const exponentialDelay = strategy.baseDelay * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, strategy.maxDelay);

  // Add jitter (±10%) to prevent thundering herd
  const jitter = cappedDelay * 0.1 * (Math.random() - 0.5);

  return Math.max(0, cappedDelay + jitter);
}

// ============================================================================
// ERROR LOGGING (Safe)
// ============================================================================

export interface LogEntry {
  timestamp: Date;
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  details?: string;
  requestId?: string;
  userId?: string; // If authenticated
  context?: string; // Where error occurred
  stackTrace?: string;
}

/**
 * Create safe log entry (no sensitive data)
 * Safe to send to Sentry, Firebase, or logging service
 */
export function createLogEntry(
  error: MappedError,
  context?: string,
  userId?: string,
  stackTrace?: string
): LogEntry {
  return {
    timestamp: error.timestamp,
    code: error.code,
    message: error.message,
    severity: error.severity,
    details: error.details, // Safe - no passwords/tokens
    requestId: error.requestId,
    userId, // Safe - just ID
    context,
    stackTrace,
  };
}

/**
 * Log error safely (no sensitive data)
 * In dev: console, in prod: Sentry
 */
export function logError(error: MappedError, context?: string, userId?: string): void {
  const logEntry = createLogEntry(error, context, userId);

  // In development, log to console
  if (__DEV__) {
    console.error(`[${error.code}] ${context || 'Error'}:`, logEntry);
    return;
  }

  // In production, send to Sentry
  try {
    const { captureSentryError } = require('../lib/sentry');
    if (captureSentryError) {
      captureSentryError(new Error(error.message), {
        level: error.severity as any,
        tags: {
          errorCode: error.code,
          context: context || 'unknown',
        },
        extra: {
          requestId: error.requestId,
          details: error.details,
        },
      });
    }
  } catch (sentryErr) {
    // Silently fail if Sentry not configured
    if (__DEV__) {
      console.warn('[logError] Sentry integration failed:', sentryErr);
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  mapError,
  isRetryable,
  isAuthError,
  isNetworkError,
  isConflict,
  isValidationError,
  calculateBackoffDelay,
  createLogEntry,
  logError,
  DEFAULT_RETRY_STRATEGY,
};
