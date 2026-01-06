# Architecture Design Document
## Ageless React Native Mobile Application

**Date**: January 6, 2026
**Version**: 1.0
**Status**: Approved for Phase 2 Implementation

---

## Executive Summary

This document defines the architecture for the Ageless React Native Mobile App, clarifying the division of responsibilities between frontend (mobile) and backend, and establishing core logic ownership for each tier.

**Core Principle**: **Backend owns business logic, Frontend owns user experience logic**

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   React Native Mobile App (Frontend)             │
│                         (User Experience)                        │
├─────────────────────────────────────────────────────────────────┤
│  • UI Rendering                                                   │
│  • Form Validation (client-side)                                 │
│  • Local Data Caching                                             │
│  • Offline State Management                                       │
│  • Sync State Tracking                                            │
│  • Error Presentation                                             │
│  • User Interaction Handling                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                  HTTPS/REST API
                   (JWT Bearer)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    Backend API Server                             │
│                    (Business Logic)                               │
├─────────────────────────────────────────────────────────────────┤
│  • Authentication & Authorization                                 │
│  • Data Validation (server-side, authoritative)                  │
│  • Business Rule Enforcement                                      │
│  • Database Transactions                                          │
│  • Data Consistency                                               │
│  • Audit Logging                                                  │
│  • Rate Limiting & Security                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                  SQL Queries
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    PostgreSQL Database                            │
│                  (Single Source of Truth)                         │
├─────────────────────────────────────────────────────────────────┤
│  • Users Table (authentication)                                   │
│  • Entries Table (workout data)                                   │
│  • Sessions Table (token tracking)                                │
│  • Audit Log Table                                                │
│  • Constraints & Triggers                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Logic Distribution

### **BACKEND (Source of Truth)**

The backend owns all **critical business logic** that must be enforced:

#### **1. Authentication & Authorization**
```
BACKEND RESPONSIBILITY:
✅ User registration (email validation, duplicate check, password hashing)
✅ User login (password verification, JWT generation)
✅ Token validation (JWT verification, expiration, signature)
✅ Token refresh (issue new token)
✅ Session management (track active sessions, revoke tokens)
✅ Permission checks (user can only modify their own data)

WHY BACKEND?
- Must be secure (passwords never leave backend)
- Single point of user verification
- Enforces rate limiting on auth attempts
- Prevents token forgery
- Maintains audit trail
```

#### **2. Data Validation (Authoritative)**
```
BACKEND RESPONSIBILITY:
✅ Email format validation
✅ Password strength enforcement
✅ Exercise name validation (against master list)
✅ Set count range validation (e.g., 1-10 max)
✅ Weight range validation (e.g., 20-500 lbs)
✅ Date format validation
✅ Duplicate entry prevention (only 1 entry per day per user)
✅ Business rule enforcement (e.g., "sets cannot exceed 10 per exercise")

WHY BACKEND?
- User can bypass frontend validation
- Backend is the authoritative validator
- Prevents invalid data in database
- Maintains data integrity
- API security requirement
```

#### **3. Data Ownership & Isolation**
```
BACKEND RESPONSIBILITY:
✅ User can only access/modify own data
✅ Entries belong to authenticated user (not just any user with entry ID)
✅ User cannot modify other users' data
✅ Track which user created/modified each record
✅ Enforce data ownership at database level

WHY BACKEND?
- Frontend can be hacked/spoofed
- Authorization must happen server-side
- User authentication proves identity
- Database constraints enforce ownership
```

#### **4. Database Transactions & Consistency**
```
BACKEND RESPONSIBILITY:
✅ Atomic operations (save all-or-nothing)
✅ Concurrent request handling (prevent race conditions)
✅ Conflict resolution (last-write-wins with timestamp)
✅ Referential integrity (users must exist before entries)
✅ ACID guarantees (Atomicity, Consistency, Isolation, Durability)

WHY BACKEND?
- Frontend doesn't have direct DB access
- DB transactions prevent data corruption
- SQL queries ensure atomic operations
- Concurrent users require server coordination
```

#### **5. Business Rules**
```
BACKEND RESPONSIBILITY:
✅ Workout entry rules (date cannot be in future, cannot have 0 sets)
✅ User profile rules (email must be unique, password must be strong)
✅ Data retention rules (entries older than 2 years archived)
✅ Rate limiting (5 login attempts per minute per IP)
✅ Feature flags (control which features are available)

WHY BACKEND?
- Business rules can change
- Must be enforced consistently
- All clients (mobile, web, API) follow same rules
- Server is single point of enforcement
```

#### **6. Audit Logging & Compliance**
```
BACKEND RESPONSIBILITY:
✅ Log who created/modified data and when
✅ Log authentication attempts (success/failure)
✅ Log failed validations
✅ Track data changes for compliance
✅ Never expose sensitive data in logs (no passwords, tokens)

WHY BACKEND?
- Compliance requirement
- Forensics and debugging
- Fraud detection
- Non-repudiation (user can't deny action)
```

---

### **FRONTEND (User Experience)**

The frontend owns all **user-facing logic** and **optimization**:

#### **1. User Interface**
```
FRONTEND RESPONSIBILITY:
✅ Render data to user
✅ Collect user input via forms
✅ Display loading states, error messages
✅ Show offline indicator
✅ Display sync status
✅ Animate transitions
✅ Format data for display (dates, numbers)

WHY FRONTEND?
- Only frontend renders UI
- Framework-specific (React Native)
- User experience is client-side responsibility
- Real-time feedback requires local state
```

#### **2. Client-Side Input Validation**
```
FRONTEND RESPONSIBILITY:
✅ Real-time form validation (as user types)
✅ Show validation error messages
✅ Disable submit button if form invalid
✅ Show password strength indicator
✅ Format input (e.g., uppercase email)

NOTE: This is SUPPLEMENTARY to backend validation
- Improves user experience (instant feedback)
- Reduces server load (don't send invalid data)
- But backend MUST also validate (never trust client)
```

#### **3. Local Data Caching**
```
FRONTEND RESPONSIBILITY:
✅ Cache API responses in AsyncStorage
✅ Return cached data while fetching fresh
✅ Invalidate cache on save/delete
✅ Implement TTL-based cache expiration
✅ Show "stale" indicator if cache is old

WHY FRONTEND?
- Improves perceived performance
- Works offline
- Reduces API calls
- User-specific (each device caches own data)
```

#### **4. Offline State Management**
```
FRONTEND RESPONSIBILITY:
✅ Detect network connectivity
✅ Queue requests when offline
✅ Persist queue to local storage
✅ Sync queue when coming online
✅ Show offline indicator to user
✅ Track sync status (pending, syncing, synced)

WHY FRONTEND?
- Device-specific (only frontend knows device network state)
- User experience (show offline mode)
- Optimization (batch requests, background sync)
- But backend must handle conflict resolution
```

#### **5. Form State Management**
```
FRONTEND RESPONSIBILITY:
✅ Manage form input state (what user has typed)
✅ Track form dirty state (unsaved changes)
✅ Handle form submission
✅ Show loading spinner during submission
✅ Show success/error toast after submission

WHY FRONTEND?
- Ephemeral state (only exists during user session)
- Framework-specific (React state, contexts)
- User experience (prevent double-submit, show progress)
```

#### **6. Error Presentation**
```
FRONTEND RESPONSIBILITY:
✅ Map technical errors to user-friendly messages
✅ Show retry button for retryable errors
✅ Highlight form fields with validation errors
✅ Show toast notifications for feedback
✅ Log errors to Sentry for debugging

WHY FRONTEND?
- User experience (technical error messages confuse users)
- Localization (translate messages)
- Context (user sees error in right place on screen)
```

#### **7. Session Management**
```
FRONTEND RESPONSIBILITY:
✅ Store JWT token securely (SecureStore)
✅ Include token in all API requests
✅ Handle 401 responses (token expired)
✅ Refresh token before expiration (optional)
✅ Clear token on logout
✅ Restore token on app launch

WHY FRONTEND?
- Token is client credential
- SecureStore is device-specific API
- Frontend detects 401 and re-authenticates
- But backend MUST validate token
```

#### **8. Navigation & Routing**
```
FRONTEND RESPONSIBILITY:
✅ Route users to login if not authenticated
✅ Route users to dashboard if authenticated
✅ Show correct screens based on user state
✅ Handle navigation transitions

WHY FRONTEND?
- Routing is UI-specific
- Only frontend knows current screen
- State-based navigation (conditional rendering)
```

---

## Request/Response Contract

### **API Request Format**

```typescript
// All requests follow this pattern:

POST /api/entries
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "date": "2026-01-06",           // ISO date string
  "exercises": {                   // Exercise name -> set count
    "pushups": 10,
    "situps": 8,
    "squats": 12
  },
  "weight": 180.5                 // Decimal number
}
```

### **API Response Format**

**Success Response (200-299)**:
```typescript
{
  "success": true,
  "data": {
    "id": "entry_123",
    "userId": "user_456",
    "date": "2026-01-06",
    "exercises": {
      "pushups": 10,
      "situps": 8,
      "squats": 12
    },
    "weight": 180.5,
    "createdAt": "2026-01-06T10:00:00Z",
    "updatedAt": "2026-01-06T10:00:00Z"
  }
}
```

**Error Response (4xx-5xx)**:
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",      // Machine-readable code
    "message": "Invalid set count",  // Human-readable message
    "details": {                     // Optional: field-level errors
      "exercises": {
        "pushups": "Must be between 1 and 10"
      }
    },
    "timestamp": "2026-01-06T10:00:00Z",
    "requestId": "req_789"           // For debugging
  }
}
```

### **Status Codes**

```
200 OK                      - Request succeeded
201 Created                 - Resource created
204 No Content              - Successful DELETE
400 Bad Request             - Validation error (client's fault)
401 Unauthorized            - Token invalid/expired (re-login)
403 Forbidden               - User lacks permission
404 Not Found               - Resource doesn't exist
409 Conflict                - Server data differs (offline sync)
429 Too Many Requests       - Rate limited (retry later)
500 Internal Server Error   - Backend error (retry)
503 Service Unavailable     - Maintenance (retry later)
```

---

## Data Models

### **User**
```typescript
interface User {
  id: string;              // UUID, generated by backend
  email: string;           // Unique, lowercase
  passwordHash: string;    // Never sent to frontend, never logged
  firstName: string;       // Optional
  lastName: string;        // Optional
  createdAt: Date;         // When account created
  updatedAt: Date;         // When profile last modified
  lastLoginAt: Date;       // For audit logging
}

// Backend creates and maintains
// Frontend receives only: id, email, firstName, lastName, createdAt
// Frontend NEVER receives: passwordHash
```

### **Entry (Workout)**
```typescript
interface Entry {
  id: string;                        // UUID
  userId: string;                    // Foreign key to User
  date: string;                      // ISO date (YYYY-MM-DD)
  exercises: Record<string, number>; // Exercise name -> set count
  weight: number;                    // Optional, in current unit
  createdAt: Date;                   // When entry created
  updatedAt: Date;                   // When last modified
}

// Backend validates:
// - userId matches authenticated user
// - date is valid and not in future
// - exercises exist in master list
// - sets are in valid range (1-10)
// - weight is in valid range (20-500)
// - no duplicate entries for same date/user

// Frontend displays all fields
// Frontend can modify: exercises, weight (if authorized)
// Frontend cannot modify: id, userId, createdAt, updatedAt
```

### **JWT Token**
```typescript
interface JWTPayload {
  sub: string;             // Subject (user ID)
  email: string;           // For convenience
  iat: number;             // Issued at (timestamp)
  exp: number;             // Expiration (timestamp)
  iss: string;             // Issuer (backend hostname)
}

// TTL: 30 days (2592000 seconds)
// Signed with HS256 or RS256
// Never exposed in logs
// Stored in SecureStore on frontend
```

---

## Security Boundaries

### **What the Backend Must Protect Against**

```
THREAT: User sends request with another user's ID in URL
DEFENSE: Backend validates request token matches requested user

THREAT: User modifies JWT token to extend expiration
DEFENSE: Backend validates token signature with secret key

THREAT: User bypasses client-side validation
DEFENSE: Backend performs complete server-side validation

THREAT: User sends malicious input in text fields
DEFENSE: Backend sanitizes all input before storing

THREAT: User makes 10,000 login attempts per second
DEFENSE: Backend rate limits (5 attempts per minute)

THREAT: Attacker intercepts requests
DEFENSE: All requests over HTTPS (encryption in transit)

THREAT: User's device is stolen
DEFENSE: SecureStore is encrypted (encryption at rest)

THREAT: Database is compromised
DEFENSE: Passwords are hashed with bcrypt (salted hash)
```

### **What the Frontend Must Protect Against**

```
THREAT: User session expires
DEFENSE: Refresh token or redirect to login on 401

THREAT: User goes offline
DEFENSE: Queue requests and sync when online

THREAT: Network is slow
DEFENSE: Show loading indicator, implement retry logic

THREAT: User loses data due to app crash
DEFENSE: Persist data locally before sending to server

THREAT: User sees confusing error message
DEFENSE: Map technical errors to user-friendly messages
```

---

## Implementation Order

### **Phase 1** ✅ (Complete)
- Frontend: UI, Navigation, Auth screens, SecureStore
- Backend: Assumed working (JWT, auth endpoints)

### **Phase 2** (In Progress)
- **Frontend**:
  - API integration (entries.ts, summary.ts)
  - WorkoutContext (state management)
  - Offline queue (AsyncStorage persistence)
  - Error handling & user feedback

- **Backend** (Assumption):
  - Endpoints already exist
  - Validation already implemented
  - Database already set up

### **Phase 3** (Testing)
- Frontend: Unit tests, integration tests, device testing
- Backend: Security review, load testing

### **Phase 4** (Production)
- Frontend: Auth library migration, build & sign
- Backend: Deployment, monitoring

---

## Key Principles

### **1. Defense in Depth**
- Frontend validates for UX, backend validates for security
- Never trust client input
- Always verify authorization server-side

### **2. Single Responsibility**
- Backend: Business logic, data consistency, security
- Frontend: User experience, local optimization, offline support

### **3. API Contract**
- Well-defined request/response format
- Consistent error handling
- Backward compatible versions

### **4. User Data Protection**
- No passwords on client
- No tokens in logs
- HTTPS-only communication
- Encryption at rest (SecureStore)

### **5. Offline-First Mentality**
- Queue requests locally
- Show offline indicator
- Sync transparently when online
- Handle conflicts gracefully

### **6. Error Recovery**
- Retry failed requests
- Show user-friendly errors
- Log technical details for debugging
- Fallback to cached data

---

## Technology Stack

### **Frontend (React Native)**
```
Core:
- React Native (base framework)
- Expo (development, managed build optional)
- Expo Router (file-based routing)
- React Context API (state management)

Storage & Async:
- expo-secure-store (JWT storage, encrypted)
- @react-native-async-storage/async-storage (cache, queue)

Communication:
- axios (HTTP client)
- expo-netinfo (network detection)

UI & UX:
- react-native (built-in components)
- NativeWind (tailwind CSS)
- expo-local-authentication (biometric)

Testing:
- Jest (unit tests)
- React Native Testing Library (component tests)

Monitoring:
- Sentry (error tracking)
- Firebase Analytics (optional)
```

### **Backend (Existing)**
```
Assumed Setup:
- Node.js/Express or Python/Django
- PostgreSQL database
- JWT authentication
- REST API endpoints
- Rate limiting middleware
- Logging & monitoring
- CORS configured for mobile
```

---

## Performance Targets

### **Frontend**
- App startup: <2 seconds
- Dashboard load (cached): <500ms
- API request: <3 seconds (with timeout/retry)
- Sync batch (10 requests): <5 seconds
- Memory usage: <100MB
- Battery impact: <5% per hour

### **Backend**
- API response: <100ms (p95)
- Database query: <50ms (p95)
- Throughput: >100 requests/second
- Availability: >99.9%

---

## Deployment Strategy

### **Frontend (Mobile)**
1. Phase 2-3: Test in Expo Go
2. Phase 4: Native builds (iOS via Xcode, Android via Android Studio)
3. Phase 4: Code signing & distribution
4. Phase 4: App Store submission

### **Backend (Assumed Existing)**
- Already deployed (Render, Heroku, or AWS)
- Already in production
- Mobile app integrates with existing endpoints

---

## Monitoring & Logging

### **Frontend Logging**
```
DO LOG:
✅ User actions (login, logout, save)
✅ Network requests (method, URL, status)
✅ Errors (with context)
✅ Performance metrics

DON'T LOG:
❌ Passwords
❌ JWT tokens
❌ User email (PII)
❌ Full request/response bodies (may contain above)
```

### **Backend Logging**
```
DO LOG:
✅ Authentication attempts (success/failure)
✅ Authorization failures
✅ Data modifications (who, what, when)
✅ API errors with request ID

DON'T LOG:
❌ Passwords
❌ Tokens
❌ Full request bodies
❌ Database passwords
```

---

## Conclusion

This architecture ensures:

1. **Security**: Backend validates everything
2. **Reliability**: Frontend handles failures gracefully
3. **Performance**: Frontend caches, batches, deduplicates
4. **User Experience**: Frontend shows progress, offline mode, friendly errors
5. **Maintainability**: Clear separation of concerns
6. **Scalability**: Backend can handle multiple clients

The React Native mobile app is a **smart client** that consumes a **dumb API**. The backend is the source of truth. The frontend optimizes user experience.

---

**Prepared By**: Claude Haiku 4.5
**Date**: January 6, 2026
**Status**: Approved for Implementation
