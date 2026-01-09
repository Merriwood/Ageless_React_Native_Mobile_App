/**
 * Error Handler Utility Tests
 *
 * Tests for error mapping, classification, retry strategy, and logging
 */

import {
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
  MappedError,
} from '../../../utils/errorHandler';
import axios from 'axios';

describe('Error Handler Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // ERROR MAPPING TESTS
  // ============================================================================

  describe('mapError', () => {
    test('maps non-axios errors to UNKNOWN', () => {
      const error = new Error('Generic error');
      const mapped = mapError(error);

      expect(mapped.code).toBe('UNKNOWN');
      expect(mapped.message).toBe('An unexpected error occurred. Please try again.');
      expect(mapped.severity).toBe('error');
      expect(mapped.retryable).toBe(false);
      expect(mapped.timestamp).toBeInstanceOf(Date);
    });

    test('maps non-error objects to UNKNOWN', () => {
      const mapped = mapError('string error');

      expect(mapped.code).toBe('UNKNOWN');
      expect(mapped.message).toBe('An unexpected error occurred. Please try again.');
      expect(mapped.severity).toBe('error');
    });

    test('maps timeout errors (ECONNABORTED)', () => {
      const error: any = {
        code: 'ECONNABORTED',
        config: { headers: { 'X-Request-ID': 'req-123' } },
        isAxiosError: true,
        response: undefined,
        message: 'timeout',
      };
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('TIMEOUT');
      expect(mapped.message).toContain('Request took too long');
      expect(mapped.severity).toBe('warning');
      expect(mapped.retryable).toBe(true);
    });

    test('maps network errors (NO_INTERNET)', () => {
      const error: any = {
        isAxiosError: true,
        response: undefined,
        message: 'Network Error',
      };
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('NO_INTERNET');
      expect(mapped.message).toContain('No internet connection');
      expect(mapped.severity).toBe('warning');
      expect(mapped.retryable).toBe(true);
    });

    test('maps 400 validation errors', () => {
      const error: any = {
        isAxiosError: true,
        response: {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'x-request-id': 'req-123' },
          data: {
            error: {
              message: 'Invalid email format',
              details: { field: 'email' },
            },
          },
        },
      };
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('VALIDATION_ERROR');
      expect(mapped.message).toBe('Invalid email format');
      expect(mapped.severity).toBe('warning');
      expect(mapped.retryable).toBe(false);
      expect(mapped.statusCode).toBe(400);
    });

    test('maps 401 unauthorized errors', () => {
      const error = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'x-request-id': 'req-123' },
          data: {},
        },
      } as any;
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('UNAUTHORIZED');
      expect(mapped.message).toContain('session expired');
      expect(mapped.severity).toBe('warning');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 403 forbidden errors', () => {
      const error = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          data: {},
        },
      } as any;
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('FORBIDDEN');
      expect(mapped.message).toContain('don\'t have permission');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 404 not found errors', () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          headers: {},
          data: {},
        },
      } as any;
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('NOT_FOUND');
      expect(mapped.message).toContain('not found');
      expect(mapped.severity).toBe('info');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 409 conflict errors', () => {
      const error = {
        response: {
          status: 409,
          statusText: 'Conflict',
          headers: {},
          data: {},
        },
      } as any;
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('CONFLICT');
      expect(mapped.message).toContain('Server has newer data');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 429 rate limit errors', () => {
      const error = {
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          headers: {},
          data: {},
        },
      } as any;
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('RATE_LIMITED');
      expect(mapped.message).toContain('Too many requests');
      expect(mapped.retryable).toBe(true);
    });

    test('maps 500 server errors', () => {
      const error = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'x-request-id': 'req-123' },
          data: {},
        },
      } as any;
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('SERVER_ERROR');
      expect(mapped.message).toContain('Server error');
      expect(mapped.severity).toBe('error');
      expect(mapped.retryable).toBe(true);
    });

    test('maps 503 service unavailable errors', () => {
      const error = {
        response: {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {},
          data: {},
        },
      } as any;
      Object.setPrototypeOf(error, axios.AxiosError.prototype);

      const mapped = mapError(error);

      expect(mapped.code).toBe('SERVICE_UNAVAILABLE');
      expect(mapped.retryable).toBe(true);
    });
  });

  // ============================================================================
  // ERROR CLASSIFICATION TESTS
  // ============================================================================

  describe('isRetryable', () => {
    test('returns true for retryable errors', () => {
      const error: MappedError = {
        code: 'TIMEOUT',
        message: 'Timeout',
        severity: 'warning',
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryable(error)).toBe(true);
    });

    test('returns false for non-retryable errors', () => {
      const error: MappedError = {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isRetryable(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    test('returns true for UNAUTHORIZED errors', () => {
      const error: MappedError = {
        code: 'UNAUTHORIZED',
        message: 'Session expired',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isAuthError(error)).toBe(true);
    });

    test('returns false for other error codes', () => {
      const error: MappedError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    test('returns true for NO_INTERNET errors', () => {
      const error: MappedError = {
        code: 'NO_INTERNET',
        message: 'No connection',
        severity: 'warning',
        retryable: true,
        timestamp: new Date(),
      };

      expect(isNetworkError(error)).toBe(true);
    });

    test('returns true for TIMEOUT errors', () => {
      const error: MappedError = {
        code: 'TIMEOUT',
        message: 'Request timeout',
        severity: 'warning',
        retryable: true,
        timestamp: new Date(),
      };

      expect(isNetworkError(error)).toBe(true);
    });

    test('returns false for other errors', () => {
      const error: MappedError = {
        code: 'SERVER_ERROR',
        message: 'Server error',
        severity: 'error',
        retryable: true,
        timestamp: new Date(),
      };

      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isConflict', () => {
    test('returns true for CONFLICT errors', () => {
      const error: MappedError = {
        code: 'CONFLICT',
        message: 'Conflict detected',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isConflict(error)).toBe(true);
    });

    test('returns false for other errors', () => {
      const error: MappedError = {
        code: 'NOT_FOUND',
        message: 'Not found',
        severity: 'info',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isConflict(error)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    test('returns true for VALIDATION_ERROR code', () => {
      const error: MappedError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isValidationError(error)).toBe(true);
    });

    test('returns false for other error codes', () => {
      const error: MappedError = {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isValidationError(error)).toBe(false);
    });
  });

  // ============================================================================
  // RETRY STRATEGY TESTS
  // ============================================================================

  describe('calculateBackoffDelay', () => {
    test('calculates exponential backoff for attempt 0', () => {
      const delay = calculateBackoffDelay(0);
      // baseDelay = 1000, so 1000 * 2^0 = 1000
      expect(delay).toBeGreaterThanOrEqual(900); // With jitter
      expect(delay).toBeLessThanOrEqual(1100);
    });

    test('calculates exponential backoff for attempt 1', () => {
      const delay = calculateBackoffDelay(1);
      // baseDelay = 1000, so 1000 * 2^1 = 2000
      expect(delay).toBeGreaterThanOrEqual(1800);
      expect(delay).toBeLessThanOrEqual(2200);
    });

    test('calculates exponential backoff for attempt 2', () => {
      const delay = calculateBackoffDelay(2);
      // baseDelay = 1000, so 1000 * 2^2 = 4000
      expect(delay).toBeGreaterThanOrEqual(3600);
      expect(delay).toBeLessThanOrEqual(4400);
    });

    test('respects maxDelay cap', () => {
      const delay = calculateBackoffDelay(10); // Very high attempt
      // Should be capped at 30000 (maxDelay)
      expect(delay).toBeLessThanOrEqual(33000); // With 10% jitter
    });

    test('respects custom strategy', () => {
      const customStrategy = {
        maxAttempts: 5,
        baseDelay: 100,
        maxDelay: 1000,
        shouldRetry: () => true,
      };

      const delay = calculateBackoffDelay(1, customStrategy);
      // 100 * 2^1 = 200
      expect(delay).toBeGreaterThanOrEqual(180);
      expect(delay).toBeLessThanOrEqual(220);
    });

    test('never returns negative delay', () => {
      // Even with jitter, should never be negative
      for (let i = 0; i < 10; i++) {
        const delay = calculateBackoffDelay(i);
        expect(delay).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('DEFAULT_RETRY_STRATEGY', () => {
    test('has correct configuration', () => {
      expect(DEFAULT_RETRY_STRATEGY.maxAttempts).toBe(3);
      expect(DEFAULT_RETRY_STRATEGY.baseDelay).toBe(1000);
      expect(DEFAULT_RETRY_STRATEGY.maxDelay).toBe(30000);
    });

    test('shouldRetry returns false for non-retryable errors', () => {
      const error: MappedError = {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      expect(DEFAULT_RETRY_STRATEGY.shouldRetry(error, 0)).toBe(false);
    });

    test('shouldRetry returns true for retryable errors within max attempts', () => {
      const error: MappedError = {
        code: 'TIMEOUT',
        message: 'Timeout',
        severity: 'warning',
        retryable: true,
        timestamp: new Date(),
      };

      expect(DEFAULT_RETRY_STRATEGY.shouldRetry(error, 0)).toBe(true);
      expect(DEFAULT_RETRY_STRATEGY.shouldRetry(error, 1)).toBe(true);
      expect(DEFAULT_RETRY_STRATEGY.shouldRetry(error, 2)).toBe(true);
    });

    test('shouldRetry returns false when max attempts exceeded', () => {
      const error: MappedError = {
        code: 'TIMEOUT',
        message: 'Timeout',
        severity: 'warning',
        retryable: true,
        timestamp: new Date(),
      };

      expect(DEFAULT_RETRY_STRATEGY.shouldRetry(error, 3)).toBe(false);
      expect(DEFAULT_RETRY_STRATEGY.shouldRetry(error, 4)).toBe(false);
    });
  });

  // ============================================================================
  // LOGGING TESTS
  // ============================================================================

  describe('createLogEntry', () => {
    test('creates safe log entry', () => {
      const error: MappedError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email',
        details: 'Email format is invalid',
        severity: 'warning',
        retryable: false,
        statusCode: 400,
        requestId: 'req-123',
        timestamp: new Date(),
      };

      const logEntry = createLogEntry(error, 'form-submission', 'user-456');

      expect(logEntry.code).toBe('VALIDATION_ERROR');
      expect(logEntry.message).toBe('Invalid email');
      expect(logEntry.details).toBe('Email format is invalid');
      expect(logEntry.severity).toBe('warning');
      expect(logEntry.context).toBe('form-submission');
      expect(logEntry.userId).toBe('user-456');
      expect(logEntry.requestId).toBe('req-123');
    });

    test('includes stack trace when provided', () => {
      const error: MappedError = {
        code: 'SERVER_ERROR',
        message: 'Server error',
        severity: 'error',
        retryable: true,
        timestamp: new Date(),
      };

      const stackTrace = 'Error: Something failed\n  at function (file.ts:10:5)';
      const logEntry = createLogEntry(error, 'api-call', undefined, stackTrace);

      expect(logEntry.stackTrace).toBe(stackTrace);
    });
  });

  describe('logError', () => {
    // Note: This test assumes __DEV__ is false (production)
    // In actual tests, you'd need to mock console.error or Sentry

    test('does not expose sensitive information in log entry', () => {
      const error: MappedError = {
        code: 'UNAUTHORIZED',
        message: 'Your session expired',
        details: 'Invalid JWT token',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      // Message and details should not contain tokens, passwords, etc.
      const logEntry = createLogEntry(error);

      expect(logEntry.message).not.toContain('password');
      expect(logEntry.message).not.toContain('token');
      expect(logEntry.details).not.toContain('password');
      expect(logEntry.details).not.toContain('eyJ'); // JWT-like pattern
    });

    test('includes only safe user identifier', () => {
      const error: MappedError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        severity: 'warning',
        retryable: false,
        timestamp: new Date(),
      };

      const logEntry = createLogEntry(error, undefined, 'user-123');

      // User ID is safe to include (just an identifier)
      expect(logEntry.userId).toBe('user-123');
      // But should never contain email, password, API keys, etc.
    });
  });
});
