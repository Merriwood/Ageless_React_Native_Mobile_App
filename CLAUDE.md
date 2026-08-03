# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SterlingFit is a React Native fitness tracking mobile app built with Expo. It tracks 11 specific exercises with workout history and progress summaries. The app is a port from an existing PWA (reference in `Old_Ageless_Web_PWA/`).

## Development Commands

All commands run from `Ageless_REACT-Native_Mobile_Application/mobile-app/`:

```bash
# Install dependencies
npm install

# Start development server
npm start                    # Expo start (scan QR with Expo Go)
npm run ios                  # iOS simulator
npm run android              # Android emulator

# Testing
npm test                     # Run all Jest tests
npm test -- --watch          # Watch mode
npm test -- path/to/file     # Single test file
npm run test:coverage        # With coverage report

# Design audit
npm run audit:design         # Check design token compliance
```

### Maestro E2E Testing (iOS)

```bash
# From TESTING_AND_QA/maestro/
maestro test test_login_flow.yaml --udid=DEVICE_UDID
maestro test . --udid=DEVICE_UDID  # All tests
```

## Architecture

### Mobile App Structure (`Ageless_REACT-Native_Mobile_Application/mobile-app/`)

```
app/                    # Expo Router file-based routing
├── _layout.tsx         # Root layout with auth check, context providers
├── index.tsx           # Entry redirect
├── (auth)/             # Auth group (login, register)
├── dashboard/          # Main workout tracking screen
├── history/            # Workout history
└── profile/            # User profile

api/                    # API layer (axios-based)
├── client.ts           # HTTP client singleton with interceptors
├── auth.ts             # Authentication endpoints
├── entries.ts          # Workout entry CRUD
├── history.ts          # History queries
└── summary.ts          # Progress summary data

hooks/                  # Custom React hooks
├── useAuth.ts          # JWT token management (SecureStore)
├── useBiometric.ts     # Face ID/Touch ID authentication
├── useWorkoutLogic.ts  # Workout state machine
├── useUILogic.ts       # Toast, network, sync status
├── useOfflineQueue.ts  # Offline-first queue system
└── useSyncTriggers.ts  # Background sync coordination

context/                # React Context providers
├── UIContext.ts        # Global UI state (toasts, network, sync)
└── WorkoutContext.ts   # Workout entries cache

components/             # UI components by feature
├── ui/                 # Base UI primitives
├── dashboard/          # Dashboard-specific components
├── layout/             # Layout components (headers, nav)
├── modals/             # Modal dialogs
└── auth/               # Auth components (FaceIDIcon, etc.)

theme/                  # Design system
├── index.ts            # Theme exports
└── tokens.ts           # Colors, spacing, typography, shadows

lib/                    # Utilities
├── constants/exercises.ts  # IMMUTABLE exercise definitions
├── validation.ts       # Email/password validation
├── date-utils.ts       # Date formatting utilities
└── schemas.ts          # Data schemas
```

### Context Provider Nesting (in `_layout.tsx`)

```
SafeAreaProvider
  └── UIProvider (toast, sync, network)
        └── WorkoutProvider (entries cache)
              └── Slot (expo-router)
```

### Key Architectural Patterns

**API Client**: Singleton pattern with request/response interceptors. Base URL determined by environment variables with fallback to production URL.

**State Management**: Context API with logic extracted to hooks (`useWorkoutLogic` → `WorkoutContext`). No external state library.

**Offline-First**: `useOfflineQueue` manages failed requests with automatic retry when online. Network state tracked via `@react-native-community/netinfo`.

**Authentication Flow**:
1. App boot loads token from SecureStore
2. Validates via `/api/me` endpoint
3. Invalid token clears auth state → redirect to login
4. Valid token → redirect to dashboard

**Styling**: NativeWind (Tailwind for React Native) with design tokens in `theme/tokens.ts`. Use `clsx` and `tailwind-merge` for conditional classes.

## Critical Constraints

### Immutable Exercise List

The 11 exercises in `lib/constants/exercises.ts` are **permanently fixed**:
Bike, Abs, Chest Press, Leg Press, Lat, Military, Crunch, Bicep Curls, Triceps, Overhead Pull, Row

Do NOT modify names, order, or goals. New exercises must be added as separate properties.

### Test IDs for Maestro

Components include `testID` props for E2E testing. See `TESTING_AND_QA/maestro/README.md` for the full list of test IDs used in automation.

### API Integration Status

Login/register screens have API calls commented out (using `setTimeout` simulation). The actual `api.auth.login()` calls exist but are disabled pending backend deployment.

## Testing

**Unit tests**: `__tests__/unit/` - hooks, api client, contexts, utils
**Integration tests**: `__tests__/integration/` - offline queue, API, error handling
**E2E tests**: `TESTING_AND_QA/maestro/` - Maestro YAML flows for iOS

Coverage threshold: 70% (branches, functions, lines, statements)

## Environment Variables

```
EXPO_PUBLIC_API_URL     # Primary API URL
REACT_APP_API_URL       # Fallback API URL
```

Default: `http://localhost:3000` (dev), `https://ageless-api.render.com` (prod)

## Documentation Structure

- `A_DESIGN_AND_SPECIFICATIONS/` - Design system, component specs, architecture
- `B_IMPLEMENTATION_AND_DEPLOYMENT/` - Implementation guides, phase reports
- `C_TESTING_AND_VALIDATION/` - QA docs, HTML mockups for visual reference
- `D_PROJECT_INFORMATION/` - Project status, session history
- `Old_Ageless_Web_PWA/` - Original PWA source (reference for parity)
