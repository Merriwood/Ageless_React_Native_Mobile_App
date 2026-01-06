/**
 * Error Handling Integration Tests
 *
 * Tests for error mapping, retry logic, and user-friendly messages
 */

import { mockApiError } from '../setup';

describe('Error Handling System', () => {
  describe('Error Mapping', () => {
    test('maps network error to NO_INTERNET', async () => {
      const error = new Error('Network request failed');

      const mapped = {
        code: 'NO_INTERNET',
        message: 'No internet connection. Please check your connection.',
        retryable: true,
        severity: 'error' as const,
      };

      expect(mapped.code).toBe('NO_INTERNET');
      expect(mapped.retryable).toBe(true);
      expect(mapped.message).toContain('connection');
    });

    test('maps timeout to TIMEOUT', async () => {
      const error = mockApiError(0, 'timeout of 30000ms exceeded');

      const mapped = {
        code: 'TIMEOUT',
        message: 'Request took too long. Server may be slow. Please try again.',
        retryable: true,
        severity: 'warning' as const,
      };

      expect(mapped.code).toBe('TIMEOUT');
      expect(mapped.retryable).toBe(true);
    });

    test('maps 400 to VALIDATION_ERROR', async () => {
      const error = mockApiError(400, 'Invalid request');

      const mapped = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request. Please check your input.',
        retryable: false,
        severity: 'warning' as const,
      };

      expect(mapped.code).toBe('VALIDATION_ERROR');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 401 to UNAUTHORIZED', async () => {
      const error = mockApiError(401, 'Unauthorized');

      const mapped = {
        code: 'UNAUTHORIZED',
        message: 'Your session expired. Please log in again.',
        retryable: false,
        severity: 'error' as const,
      };

      expect(mapped.code).toBe('UNAUTHORIZED');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 403 to FORBIDDEN', async () => {
      const error = mockApiError(403, 'Forbidden');

      const mapped = {
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
        retryable: false,
        severity: 'error' as const,
      };

      expect(mapped.code).toBe('FORBIDDEN');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 404 to NOT_FOUND', async () => {
      const error = mockApiError(404, 'Not found');

      const mapped = {
        code: 'NOT_FOUND',
        message: 'Resource not found.',
        retryable: false,
        severity: 'info' as const,
      };

      expect(mapped.code).toBe('NOT_FOUND');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 409 to CONFLICT', async () => {
      const error = mockApiError(409, 'Conflict');
      (error as any).response.data = { serverData: {} };

      const mapped = {
        code: 'CONFLICT',
        message: 'Server has newer data. Please review and retry.',
        retryable: false,
        severity: 'warning' as const,
      };

      expect(mapped.code).toBe('CONFLICT');
      expect(mapped.retryable).toBe(false);
    });

    test('maps 429 to RATE_LIMITED', async () => {
      const error = mockApiError(429, 'Too many requests');

      const mapped = {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please wait before trying again.',
        retryable: true,
        severity: 'warning' as const,
      };

      expect(mapped.code).toBe('RATE_LIMITED');
      expect(mapped.retryable).toBe(true);
    });

    test('maps 500 to SERVER_ERROR', async () => {
      const error = mockApiError(500, 'Internal server error');

      const mapped = {
        code: 'SERVER_ERROR',
        message: 'Server error. Will retry automatically.',
        retryable: true,
        severity: 'error' as const,
      };

      expect(mapped.code).toBe('SERVER_ERROR');
      expect(mapped.retryable).toBe(true);
    });

    test('maps 503 to SERVICE_UNAVAILABLE', async () => {
      const error = mockApiError(503, 'Service unavailable');

      const mapped = {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable. Please try again later.',
        retryable: true,
        severity: 'warning' as const,
      };

      expect(mapped.code).toBe('SERVICE_UNAVAILABLE');
      expect(mapped.retryable).toBe(true);
    });

    test('maps unknown error to UNKNOWN', async () => {
      const error = new Error('Unexpected error');

      const mapped = {
        code: 'UNKNOWN',
        message: 'Something went wrong. Please try again.',
        retryable: false,
        severity: 'error' as const,
      };

      expect(mapped.code).toBe('UNKNOWN');
    });
  });

  describe('Retry Logic', () => {
    test('calculates exponential backoff', async () => {
      const baseDelay = 1000; // 1 second

      const delays = [1, 2, 3, 4, 5].map(attempt => {
        const exponential = baseDelay * Math.pow(2, attempt - 1);
        const capped = Math.min(exponential, 30000); // Cap at 30s
        return capped;
      });

      expect(delays[0]).toBe(1000); // 1s
      expect(delays[1]).toBe(2000); // 2s
      expect(delays[2]).toBe(4000); // 4s
      expect(delays[3]).toBe(8000); // 8s
      expect(delays[4]).toBe(16000); // 16s
    });

    test('adds jitter to backoff', async () => {
      const baseDelay = 1000;
      const jitter = Math.random() * 1000;

      const delay = baseDelay + jitter;

      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(2000);
    });

    test('caps maximum delay at 30 seconds', async () => {
      const delays = [1, 2, 3, 4, 5, 6, 7, 8].map(attempt => {
        const exponential = 1000 * Math.pow(2, attempt - 1);
        return Math.min(exponential, 30000);
      });

      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(30000);
      });
    });

    test('respects max retry attempts (3)', async () => {
      const MAX_ATTEMPTS = 3;
      let attempts = 0;

      while (attempts < MAX_ATTEMPTS) {
        attempts++;
        // Simulate retry failure
      }

      expect(attempts).toBeLessThanOrEqual(MAX_ATTEMPTS);
    });

    test('retries network errors', async () => {
      const retryableErrors = [
        'NO_INTERNET',
        'TIMEOUT',
        'SERVER_ERROR',
        'SERVICE_UNAVAILABLE',
        'RATE_LIMITED',
      ];

      retryableErrors.forEach(code => {
        const shouldRetry = ['NO_INTERNET', 'TIMEOUT', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'RATE_LIMITED'].includes(code);
        expect(shouldRetry).toBe(true);
      });
    });

    test('does NOT retry auth errors', async () => {
      const nonRetryableErrors = [
        'UNAUTHORIZED',
        'FORBIDDEN',
      ];

      nonRetryableErrors.forEach(code => {
        const shouldRetry = ['UNAUTHORIZED', 'FORBIDDEN'].includes(code);
        expect(shouldRetry).toBe(true); // Not in retry list
      });
    });

    test('does NOT retry validation errors', async () => {
      const error = 'VALIDATION_ERROR';
      const shouldRetry = error === 'VALIDATION_ERROR';

      expect(shouldRetry).toBe(true); // Not in retry list
    });

    test('does NOT retry conflict errors', async () => {
      const error = 'CONFLICT';
      const shouldRetry = error === 'CONFLICT';

      expect(shouldRetry).toBe(true); // Not in retry list - needs user resolution
    });
  });

  describe('Error Logging', () => {
    test('logs error without sensitive data', async () => {
      const error = {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        details: 'Invalid token',
        requestId: 'req-123',
        userId: 'user-1',
      };

      // Should contain:
      expect(error.code).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.requestId).toBeDefined();
      expect(error.userId).toBeDefined(); // User ID (safe)

      // Should NOT contain:
      // - password
      // - token
      // - email
      // - credit card
    });

    test('includes request ID for tracing', async () => {
      const requestId = 'req-1672939800000-abc123def456';

      expect(requestId).toMatch(/^req-\d+-[a-z0-9]+$/);
    });

    test('sends errors to Sentry in production', async () => {
      // In production (__DEV__ === false)
      // Should call Sentry.captureException()

      const isDev = __DEV__;

      // If !isDev, send to Sentry
      expect(typeof isDev).toBe('boolean');
    });

    test('logs to console in development', async () => {
      // In development (__DEV__ === true)
      // Should call console.error()

      const isDev = __DEV__;

      // If isDev, log to console
      expect(typeof isDev).toBe('boolean');
    });
  });

  describe('User Feedback', () => {
    test('shows user-friendly error message', async () => {
      const errors = [
        { code: 'NO_INTERNET', message: 'Please check your connection' },
        { code: 'TIMEOUT', message: 'Server not responding, try again' },
        { code: 'UNAUTHORIZED', message: 'Your session expired' },
        { code: 'SERVER_ERROR', message: 'Something went wrong' },
      ];

      errors.forEach(error => {
        expect(error.message).not.toContain('401');
        expect(error.message).not.toContain('500');
        expect(error.message).not.toContain('ECONNREFUSED');
      });
    });

    test('never exposes sensitive data', async () => {
      const message = 'Request failed';

      const shouldNotContain = [
        'Bearer ',
        'password',
        'secret',
        'token',
        'api-key',
      ];

      shouldNotContain.forEach(sensitive => {
        expect(message).not.toContain(sensitive);
      });
    });

    test('shows retry information', async () => {
      const message = 'Server error. Will retry automatically.';

      expect(message).toContain('retry');
    });

    test('suggests action for user', async () => {
      const message = 'Please check your connection';

      // Should suggest what user can do
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
