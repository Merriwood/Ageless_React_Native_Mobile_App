# Sentry Setup Guide

## Purpose
This guide explains how to set up Sentry for remote error tracking and performance monitoring in the Ageless mobile app.

---

## What is Sentry?

Sentry is a platform for monitoring errors and performance in production applications. It:

- **Captures unhandled exceptions** - Automatically reports crashes
- **Groups errors** - Groups similar errors together for trending
- **Tracks performance** - Monitors slow requests and app performance
- **Provides context** - Shows what happened before the error
- **Sanitizes sensitive data** - Never logs passwords or tokens

---

## Setup Steps

### 1. Create Sentry Account

1. Go to https://sentry.io
2. Sign up (free tier available)
3. Create new organization
4. Create new project for React Native

### 2. Get Your DSN

After creating project:

1. Go to Settings → Client Keys (DSN)
2. Copy the DSN (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 3. Add Environment Variable

Create `.env` file in project root:

```
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
APP_VERSION=1.0.0
```

Or in `.env.production`:

```
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
APP_VERSION=1.0.0
```

### 4. Install Sentry Package

```bash
npm install @sentry/react-native
cd ios && pod install && cd ..
```

### 5. Initialize Sentry in App

In `app.tsx` or main entry point, add at the **very top**:

```typescript
import { initSentry } from './lib/sentry';

// Must be first thing - before any other code
initSentry();

// ... rest of your app imports
```

### 6. Set User Context on Login

After user logs in (in `useAuth.ts`), set user context:

```typescript
import { setSentryUser } from '../lib/sentry';

// After successful login
setSentryUser(user.id);

// After logout
setSentryUser(null);
```

---

## Integration Points

### Automatic Error Capture

These are automatically sent to Sentry:

- ❌ Unhandled exceptions
- ❌ Network errors (5xx, timeout, etc.)
- ❌ Validation errors
- ❌ Crashes

### Manual Error Capture

For specific errors, use:

```typescript
import { captureSentryError, captureSentryMessage } from '../lib/sentry';

try {
  await saveEntry(date, exercises);
} catch (error) {
  captureSentryError(error, {
    level: 'error',
    tags: { operation: 'saveEntry' },
    extra: { date, exerciseCount: exercises.length }
  });
}
```

### Error Handler Integration

The `errorHandler.ts` automatically sends errors to Sentry:

```typescript
import { logError } from '../utils/errorHandler';

const error = mapError(axiosError);
logError(error, 'API request failed', userId);
// ^ Automatically sent to Sentry in production
```

---

## Configuration Options

### Environment-Specific Settings

**Development**:
- Errors logged to console only
- Performance monitoring disabled (0% sample rate)
- No errors sent to Sentry

**Production**:
- Errors sent to Sentry
- 10% of requests sampled for performance monitoring
- 5% of sessions profiled

### Customization

Edit `lib/sentry.ts` to change:

- `tracesSampleRate` - Performance monitoring percentage (0-1)
- `profilesSampleRate` - Session profiling percentage (0-1)
- `ignoreErrors` - Error patterns to ignore
- `beforeSend` - Custom error filtering

---

## Sensitive Data Handling

The setup automatically sanitizes:

- ✅ Authorization headers (removed)
- ✅ Passwords and secrets (filtered)
- ✅ API keys (filtered)
- ✅ Personal identifiable info (PII)

Only sends:
- Error message
- Error code
- Error context (technical details)
- User ID (not email)
- Request ID (for tracing)

---

## Viewing Errors

### In Sentry Dashboard

1. Go to https://sentry.io
2. Login to your project
3. Click "Issues" to see all errors
4. Click on error to see details:
   - **Breadcrumbs** - What happened before error
   - **Tags** - Error code, context, etc.
   - **Context** - Technical details
   - **User** - Who experienced the error (ID only)

### Grouping

Errors automatically grouped by:
- Error message
- Error code
- Stack trace

Click "Mark as Regression" to notify your team.

---

## Alerts & Notifications

### Email Alerts

Setup in Sentry:
1. Settings → Alerts
2. Create rule: "Send me email when new issue occurs"
3. Or: "Alert when error spike detected"

### Slack Integration

1. Settings → Integrations
2. Add Slack workspace
3. Create rules to post to #errors channel

---

## Testing Sentry Setup

In development, manually trigger an error to test:

```typescript
import * as Sentry from '@sentry/react-native';

// In a test screen/component:
<Button
  title="Test Sentry Error"
  onPress={() => {
    throw new Error('Test error from Sentry setup');
  }}
/>
```

Note: Won't send to Sentry in dev mode, but will show in console.

To test in production build:
```bash
eas build -p ios --profile production
# Install on device and trigger error
```

---

## Performance Monitoring

### What's Tracked

- **Screen loads** - How long screens take to render
- **API requests** - How long API calls take
- **Database queries** - How long queries take
- **App startup** - How long app takes to start

### Viewing Performance

In Sentry:
1. Go to "Performance" tab
2. See slowest transactions
3. Drill down to see individual spans

### Example: Slow API Request

If an API request is slow:
1. Sentry shows transaction duration
2. Shows request span details
3. Shows exact endpoint and parameters

---

## Best Practices

### Do

- ✅ Initialize Sentry early (before other code)
- ✅ Set user context after login
- ✅ Use tags for categorization
- ✅ Include context in errors
- ✅ Review errors regularly
- ✅ Act on error trends

### Don't

- ❌ Log passwords or tokens (automatically filtered)
- ❌ Send large amounts of data
- ❌ Spam errors (use sampling)
- ❌ Initialize Sentry multiple times

---

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN** - Verify correct in `.env`
2. **Check Environment** - Only sends in production (`__DEV__ === false`)
3. **Check Network** - Ensure app has internet access
4. **Check Filters** - Error might be in `ignoreErrors` list

### Too Many Errors?

1. **Increase sample rate** - Lower `tracesSampleRate`
2. **Add ignore patterns** - Add to `ignoreErrors`
3. **Use beforeSend** - Filter in custom logic

### Performance Impact?

- **Minimal** - Most overhead is in error capture
- **Profiling** - Only 5% of sessions profiled
- **Requests** - Only 10% sampled for performance
- **Dev mode** - No network overhead

---

## Costs

- **Free tier** - 5,000 events/month
- **Paid plans** - Start at $29/month

For small app with ~100 users, free tier likely sufficient.

Upgrade in Sentry settings if needed.

---

## Next Steps

1. Create Sentry account and get DSN
2. Add to `.env` file
3. Install `@sentry/react-native`
4. Initialize in app entry point
5. Test with manual error
6. Setup alerts and integrations
7. Review errors in Sentry dashboard

---

## Documentation Links

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Sentry Configuration](https://docs.sentry.io/product/releases/health/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Error Grouping](https://docs.sentry.io/product/issues/grouping-fingerprinting/)

---

**Setup Time**: 30 minutes
**Difficulty**: Easy
**Impact**: High (production visibility)

Once configured, Sentry automatically catches and reports all errors in production, providing critical visibility into app health.
