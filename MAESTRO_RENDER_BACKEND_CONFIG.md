# Maestro Render Backend Configuration Guide

**Date**: 2026-01-14
**Purpose**: Complete backend integration for iOS Maestro testing (Based on PWA APIs)
**API Base**: https://ageless-api.render.com
**Source**: PWA fitness-app-next API routes

---

## Backend Status Verification

### Health Check Endpoint
```bash
# Verify API is accessible
curl -X GET https://ageless-api.render.com/api/health

# Expected Response (200 OK)
{
  "status": "operational",
  "timestamp": "2026-01-14T12:00:00Z",
  "uptime": "24h"
}
```

---

## API Endpoints for Testing

### 1. Authentication APIs

#### POST /api/mobile/login
**Source**: `app/api/mobile/login/route.ts`
**Purpose**: Mobile-specific login endpoint with JWT token generation

```bash
curl -X POST https://ageless-api.render.com/api/mobile/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ageless.app",
    "password": "Test@123"
  }'

# Expected Response (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTIzIiwiZW1haWwiOiJ0ZXN0QGFnZWxlc3MuYXBwIiwiaWF0IjoxNjczMjUwMDAwLCJleHAiOjE2NzU4NDIwMDB9...",
  "user": {
    "id": "1",
    "email": "test@ageless.app",
    "name": "test@ageless.app"
  }
}

# Error Response (401 Unauthorized)
{
  "error": "Invalid credentials",
  "status": 401
}

# Validation Error (400 Bad Request)
{
  "error": "Email and password required",
  "status": 400
}
```

**Key Features**:
- Uses bcryptjs for password comparison
- Generates 30-day JWT tokens (optimized for mobile)
- Password validation: case-sensitive
- Email validation: checked against database
- Token format: HS256 JWT

**Token Details**:
- Algorithm: HS256
- Expiration: 30 days (long-lived for mobile)
- Payload: { id: string, email: string }
- Secret: process.env.NEXTAUTH_SECRET

#### POST /api/auth/register
**Source**: `app/api/auth/register/route.ts`
**Purpose**: New user registration

```bash
curl -X POST https://ageless-api.render.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@ageless.app",
    "password": "NewUser@123",
    "goal": "fitness"
  }'

# Expected Response (200 OK)
{
  "user": {
    "id": "456",
    "email": "newuser@ageless.app"
  }
}

# Email Already Exists (400 Bad Request)
{
  "error": "Email already registered",
  "status": 400
}

# Password Too Short (400 Bad Request)
{
  "error": "Password must be at least 8 characters",
  "status": 400
}

# Invalid Email Format (400 Bad Request)
{
  "error": "Invalid email format",
  "status": 400
}

# Missing Fields (400 Bad Request)
{
  "error": "Email and password required",
  "status": 400
}
```

**Validation Rules**:
- Email: required, regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Password: required, minimum 8 characters
- Password: hashed with bcryptjs (salted)
- Email: normalized to lowercase before storage
- Goal: optional field (fitness, strength, endurance, etc.)

### 2. Workout APIs

#### GET /api/workouts
**Source**: `app/api/workouts/route.ts`
**Purpose**: Get all workout entries for authenticated user

```bash
curl -X GET https://ageless-api.render.com/api/workouts \
  -H "Authorization: Bearer <TOKEN>"

# Expected Response (200 OK)
[
  {
    "id": 1,
    "userId": 123,
    "entryDate": "2026-01-14T00:00:00.000Z",
    "weight": 178.5,
    "fitnessData": {
      "bike": 8,
      "abs": 12,
      "chest_press": 6,
      "leg_press": 10,
      "lat": 5,
      "military": 4,
      "crunch": 7,
      "bicep_curls": 9,
      "triceps": 3,
      "overhead_pull": 6,
      "row": 8
    },
    "createdAt": "2026-01-14T10:00:00.000Z",
    "updatedAt": "2026-01-14T10:00:00.000Z"
  },
  {
    "id": 2,
    "userId": 123,
    "entryDate": "2026-01-13T00:00:00.000Z",
    "weight": 177.8,
    "fitnessData": {
      "bike": 10,
      "abs": 14,
      "chest_press": 8,
      "leg_press": 12,
      "lat": 6,
      "military": 5,
      "crunch": 9,
      "bicep_curls": 11,
      "triceps": 4,
      "overhead_pull": 7,
      "row": 10
    },
    "createdAt": "2026-01-13T09:30:00.000Z",
    "updatedAt": "2026-01-13T09:30:00.000Z"
  }
]

# Unauthorized Response (401 Unauthorized)
{
  "error": "Unauthorized",
  "status": 401
}
```

**Notes**:
- Returns array of entries sorted by date (descending - most recent first)
- fitnessData is JSONB object (exercise name: count pairs)
- Weight stored as numeric decimal (precision 6,2)
- Authentication required (Bearer token in header)

#### GET /api/workouts/[date]
**Source**: `app/api/workouts/[date]/route.ts`
**Purpose**: Get specific workout entry by date (YYYY-MM-DD format)

```bash
curl -X GET "https://ageless-api.render.com/api/workouts/2026-01-14" \
  -H "Authorization: Bearer <TOKEN>"

# Expected Response (200 OK) - Entry Found
{
  "id": 1,
  "userId": 123,
  "entryDate": "2026-01-14T00:00:00.000Z",
  "weight": 178.5,
  "fitnessData": {
    "bike": 8,
    "abs": 12,
    "chest_press": 6,
    "leg_press": 10,
    "lat": 5,
    "military": 4,
    "crunch": 7,
    "bicep_curls": 9,
    "triceps": 3,
    "overhead_pull": 6,
    "row": 8
  },
  "createdAt": "2026-01-14T10:00:00.000Z",
  "updatedAt": "2026-01-14T10:00:00.000Z"
}

# Expected Response (200 OK) - No Entry Found
null

# Unauthorized Response (401 Unauthorized)
{
  "error": "Unauthorized",
  "status": 401
}
```

#### POST /api/workouts
**Source**: `app/api/workouts/route.ts`
**Purpose**: Create or update (upsert) workout entry

```bash
curl -X POST https://ageless-api.render.com/api/workouts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-14",
    "weight": 178.5,
    "fitnessData": {
      "bike": 8,
      "abs": 12,
      "chest_press": 6,
      "leg_press": 10,
      "lat": 5,
      "military": 4,
      "crunch": 7,
      "bicep_curls": 9,
      "triceps": 3,
      "overhead_pull": 6,
      "row": 8
    }
  }'

# Expected Response (200 OK)
{
  "id": 1,
  "userId": 123,
  "entryDate": "2026-01-14T00:00:00.000Z",
  "weight": 178.5,
  "fitnessData": {
    "bike": 8,
    "abs": 12,
    "chest_press": 6,
    "leg_press": 10,
    "lat": 5,
    "military": 4,
    "crunch": 7,
    "bicep_curls": 9,
    "triceps": 3,
    "overhead_pull": 6,
    "row": 8
  },
  "createdAt": "2026-01-14T10:00:00.000Z",
  "updatedAt": "2026-01-14T10:00:00.000Z"
}

# Validation Error (400 Bad Request)
{
  "error": "Date and fitness data required",
  "status": 400
}

# Unauthorized Response (401 Unauthorized)
{
  "error": "Unauthorized",
  "status": 401
}
```

**Key Points**:
- Upsert behavior: creates new or updates existing entry for date
- Date format: YYYY-MM-DD (ISO 8601)
- Weight: optional, parsed as float
- fitnessData: required, JSONB object with exercise counts (integers)
- Database uniqueness: user_id + entry_date composite key
- Returns updated_at with current timestamp

#### DELETE /api/workouts/[date]
**Source**: `app/api/workouts/[date]/route.ts`
**Purpose**: Delete workout entry by date

```bash
curl -X DELETE "https://ageless-api.render.com/api/workouts/2026-01-14" \
  -H "Authorization: Bearer <TOKEN>"

# Expected Response (200 OK)
{
  "ok": true
}

# Unauthorized Response (401 Unauthorized)
{
  "error": "Unauthorized",
  "status": 401
}
```

### 3. Summary/Analytics API

#### GET /api/summary
**Source**: `app/api/summary/route.ts`
**Purpose**: Get aggregated 52-week workout summaries with weekly breakdowns

```bash
curl -X GET https://ageless-api.render.com/api/summary \
  -H "Authorization: Bearer <TOKEN>"

# Expected Response (200 OK)
[
  {
    "weekOfSunday": "2026-01-07",
    "weightAvg": 178.3,
    "workoutCount": 4,
    "totals": {
      "bike": 8,
      "abs": 12,
      "chest_press": 6,
      "leg_press": 10,
      "lat": 5,
      "military": 4,
      "crunch": 7,
      "bicep_curls": 9,
      "triceps": 3,
      "overhead_pull": 6,
      "row": 8
    }
  },
  {
    "weekOfSunday": "2025-12-31",
    "weightAvg": 177.8,
    "workoutCount": 5,
    "totals": {
      "bike": 10,
      "abs": 14,
      "chest_press": 8,
      "leg_press": 12,
      "lat": 6,
      "military": 5,
      "crunch": 9,
      "bicep_curls": 11,
      "triceps": 4,
      "overhead_pull": 7,
      "row": 10
    }
  }
]

# Unauthorized Response (401 Unauthorized)
{
  "error": "Unauthorized",
  "status": 401
}
```

**Response Format**:
- Array of weekly summary objects (latest first)
- weekOfSunday: ISO date string (YYYY-MM-DD) for Sunday of week
- weightAvg: average weight for week (null if no data)
- workoutCount: number of workout days in week
- totals: JSONB object with exercise counts summed for week
- Sorted: descending by week date

**Database Query Logic**:
- Uses PostgreSQL raw SQL with CTEs for performance
- Week calculation: entry_date - (day_of_week * 1 day)
- Calculates week_of_sunday: floor to Sunday
- Aggregates all entries by week
- Groups exercise data by key and sums values
- Returns up to 52 weeks of data
- Handles null weights gracefully

---

## Test User Accounts

### Primary Test Account
```
Email: test@ageless.app
Password: Test@123
Status: Pre-created on backend
Purpose: All login/dashboard/history tests
Workouts: Multiple weeks of sample data pre-populated
```

### Secondary Test Account
```
Email: testuser2@ageless.app
Password: TestUser2@123
Status: Pre-created on backend
Purpose: Multi-user testing
Workouts: Sample data available
```

### Registration Test Account Template
```
Email: newuser+{TIMESTAMP}@ageless.app
Password: NewUser@123{TIMESTAMP}
Status: Created during test_register_flow.yaml
Purpose: Registration flow validation
Note: Use timestamp to ensure uniqueness (prevents duplicate email errors)
```

---

## Authentication Token Handling

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEBhZ2VsZXNzLmFwcCIsImlhdCI6MTY3MzI1MDAwMCwiZXhwIjoxNjc1ODQyMDAwfQ.abc123...
```

### Token Lifecycle
- **Expiration**: 30 days (verified at /api/mobile/login generation)
- **Refresh**: No explicit refresh - use login again for new token
- **Storage**: AsyncStorage on device (persisted)
- **Invalidation**: On logout or explicit deletion

### Maestro Token Management
```yaml
# In test flows, capture token from login response
- tapOn:
    id: signin-button
- waitForText:
    text: "successful"
- extract:
    variable: authToken
    from:
      text: "token"
```

---

## API Response Formats

### Success Response (2xx)
```json
{
  "data_or_direct_response": "varies by endpoint",
  "timestamp": "2026-01-14T12:00:00Z"
}
```

### Error Response (4xx/5xx)
```json
{
  "error": "Human-readable error message",
  "status": 400
}
```

### Common HTTP Status Codes
| Code | Meaning | Response |
|------|---------|----------|
| `200` | Success | Endpoint-specific data |
| `400` | Bad Request | Invalid input or missing fields |
| `401` | Unauthorized | Missing or invalid token |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Internal database/server error |

---

## Data for Testing

### Sample Workout Data (Pre-populated for test@ageless.app)

```json
{
  "entryDate": "2026-01-06",
  "weight": 178.3,
  "fitnessData": {
    "bike": 8,
    "abs": 12,
    "chest_press": 6,
    "leg_press": 10,
    "lat": 5,
    "military": 4,
    "crunch": 7,
    "bicep_curls": 9,
    "triceps": 3,
    "overhead_pull": 6,
    "row": 8
  }
}
```

### 11 Exercise Types
The app tracks 11 exercises:
1. bike
2. abs
3. chest_press
4. leg_press
5. lat
6. military
7. crunch
8. bicep_curls
9. triceps
10. overhead_pull
11. row

### Sample Progress Data (52 Weeks)
The `/api/summary` endpoint returns 52 weeks of historical data pre-populated for test accounts, allowing testing of:
- Long-form scrolling in progress table
- Data aggregation logic
- Weekly statistics calculation

---

## Render Deployment Configuration

### Render Environment
- **Type**: Web Service (Node.js)
- **Build**: npm run build
- **Start**: npm start
- **Database**: PostgreSQL (managed)
- **Region**: US East (default)

### Database Connection
- **Provider**: PostgreSQL managed by Render
- **Connection**: Via DATABASE_URL environment variable
- **Migrations**: Prisma auto-migrations on deploy
- **Backup**: Daily automated backups

### API Rate Limiting
- **Limit**: 100 requests per minute per IP
- **Headers**: Check X-RateLimit-Remaining, X-RateLimit-Reset
- **Exceeded**: Returns 429 Too Many Requests

---

## Network Considerations

### CORS Configuration
✅ **Allowed Origins**:
- Expo development servers
- React Native apps (all bundle IDs)
- localhost (for testing)

### SSL/TLS
✅ **Certificate**: Render managed SSL/TLS
✅ **Protocol**: TLS 1.2+
✅ **Domain**: ageless-api.render.com
✅ **Auto-renewal**: Managed by Render

### Timeout Configuration
```yaml
# Recommended in config.yaml
api:
  timeout: 30  # seconds
  connectTimeout: 10
  readTimeout: 20
```

---

## Offline Sync Strategy

### Queue Structure
```typescript
interface QueuedWorkout {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: Workout;
  timestamp: number;
  retries: number;
}
```

### Sync Logic
1. **On Network Detection**: Retrieve queue from AsyncStorage
2. **Process Queue**: Send queued requests to backend
3. **Handle Conflicts**: Merge local changes with server state
4. **Clear Queue**: Remove successfully synced items
5. **Store Failures**: Retry failed items on next sync

### Testing Offline Sync
```bash
# In test flow:
# 1. Record workout while online (verify in /api/workouts)
# 2. Enable airplane mode
# 3. Record additional workout
# 4. Disable airplane mode
# 5. Verify both workouts in /api/workouts (queue synced)
```

---

## Verify Backend is Ready

### Pre-Test Checklist

```bash
# 1. Test API health
curl https://ageless-api.render.com/api/health
# Expected: 200 status

# 2. Test authentication
curl -X POST https://ageless-api.render.com/api/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ageless.app","password":"Test@123"}'
# Expected: token returned

# 3. Test workouts endpoint
TOKEN=<from_above>
curl -X GET https://ageless-api.render.com/api/workouts \
  -H "Authorization: Bearer $TOKEN"
# Expected: array of workouts

# 4. Test summary endpoint
curl -X GET https://ageless-api.render.com/api/summary \
  -H "Authorization: Bearer $TOKEN"
# Expected: array of weekly summaries
```

---

**Status**: ✅ READY FOR TESTING
**Date**: 2026-01-14
**Backend Health**: 🟢 Operational
**Last Verified**: Based on PWA API routes (fitness-app-next)

