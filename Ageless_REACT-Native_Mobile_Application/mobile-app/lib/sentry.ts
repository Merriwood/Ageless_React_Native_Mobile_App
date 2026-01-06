/**
 * Sentry Configuration & Initialization
 *
 * Purpose: Remote error tracking and performance monitoring
 * - Captures unhandled exceptions
 * - Tracks performance (slow requests, etc.)
 * - Groups errors automatically
 * - Provides source maps for debugging
 * - Sanitizes sensitive data
 */

import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry with environment-specific configuration
 *
 * Must be called BEFORE any other code runs
 * Recommended: In app entry point (index.js or app.tsx)
 */
export function initSentry(): void {
  const isDevelopment = __DEV__;
  const environment = isDevelopment ? 'development' : 'production';

  Sentry.init({
    // Project configuration
    dsn: process.env.SENTRY_DSN || '',

    // Environment settings
    environment,
    enabled: !isDevelopment, // Don't send errors in dev, log locally instead

    // Release tracking (version)
    release: process.env.APP_VERSION || '1.0.0',

    // Performance monitoring
    tracesSampleRate: isDevelopment ? 0 : 0.1, // 10% in production, 0% in dev
    profilesSampleRate: isDevelopment ? 0 : 0.05, // 5% in production

    // Error processing
    beforeSend: (event, hint) => {
      // Never send sensitive data
      if (event.request) {
        // Redact Authorization header
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
        }
      }

      // Sanitize user context
      if (event.user) {
        // Only send userId, not email or other PII
        const sanitized = {
          id: event.user.id,
        };
        event.user = sanitized;
      }

      // Remove sensitive breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.filter(crumb => {
          // Remove breadcrumbs that contain sensitive data
          const message = JSON.stringify(crumb).toLowerCase();
          return !message.includes('password') &&
            !message.includes('token') &&
            !message.includes('secret') &&
            !message.includes('api-key');
        });
      }

      return event;
    },

    // Integrations
    integrations: [
      new Sentry.ReactNativeTracing({
        // Performance monitoring for screens
        enableNativeFramesTracking: true,
      }),
      new Sentry.CaptureConsole({
        levels: ['error', 'warn'],
      }),
    ],

    // Additional options
    maxBreadcrumbs: 100,
    attachStacktrace: true,
    ignoreErrors: [
      // Ignore known non-critical errors
      'Network request failed',
      'Non-Error promise rejection captured',
    ],
  });

  if (isDevelopment) {
    console.log('[Sentry] Initialized in development mode (errors logged locally)');
  }
}

/**
 * Set user context for error tracking
 *
 * Call this after user logs in
 * Only sends userId to preserve privacy
 */
export function setSentryUser(userId: string | null): void {
  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 *
 * Breadcrumbs appear in error context, showing what happened before the error
 */
export function addSentryBreadcrumb(
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
  data?: Record<string, any>
): void {
  Sentry.captureMessage(message, {
    level: level || 'info',
    contexts: {
      breadcrumb: {
        category: category || 'custom',
        ...data,
      },
    },
  });
}

/**
 * Capture error with context
 *
 * Use this in catch blocks or error handlers
 */
export function captureSentryError(
  error: Error,
  context?: {
    level?: Sentry.SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): void {
  Sentry.captureException(error, {
    level: context?.level || 'error',
    tags: context?.tags || {},
    contexts: {
      details: context?.extra || {},
    },
  });
}

/**
 * Capture message (non-error event)
 *
 * Use for important events that aren't errors
 */
export function captureSentryMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  tags?: Record<string, string>
): void {
  Sentry.captureMessage(message, {
    level,
    tags: tags || {},
  });
}

/**
 * Set tags for error grouping
 *
 * Tags help group similar errors together
 */
export function setSentryTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Set context for error details
 *
 * Context appears in error details for debugging
 */
export function setSentryContext(
  name: string,
  data: Record<string, any>
): void {
  Sentry.setContext(name, data);
}

/**
 * Export for use in error handler
 *
 * Integration point with errorHandler.ts
 */
export const SentryIntegration = {
  captureError: captureSentryError,
  captureMessage: captureSentryMessage,
  setUser: setSentryUser,
  addBreadcrumb: addSentryBreadcrumb,
  setTag: setSentryTag,
  setContext: setSentryContext,
};

export default Sentry;
