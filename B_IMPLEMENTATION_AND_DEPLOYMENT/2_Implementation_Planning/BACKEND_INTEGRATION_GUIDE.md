# Backend Integration Guide - Phase 2 Real Data Testing

**Date:** 2026-01-09
**Status:** Ready for Implementation
**Target:** Connect mobile app to Render API for real workout data

---

## Overview

Phase 2 is currently using **mocked data** for the 298 unit tests. To enable **REAL backend testing**, we need to:

1. ✅ Create `api/client.ts` - HTTP client configuration
2. ✅ Configure Render API endpoint
3. ✅ Set up API authentication (if required)
4. ✅ Test with real workout data from the PWA backend

---

## Current Status

### What Exists
- ✅ `api/summary.ts` - Imports `./client` but file doesn't exist yet
- ✅ Render backend (fitness-app-next) running on Render.com
- ✅ Database with real user workout data
- ✅ PWA successfully fetching from `/api/summary` endpoint

### What's Missing
- ❌ `api/client.ts` - HTTP client for mobile app
- ❌ Environment configuration (API endpoint URL)
- ❌ Error handling for API failures
- ❌ Real data integration testing

---

## Step 1: Find Render API Configuration

The Render backend is already set up. We need to:

1. **Locate the Render API endpoint**
   - Check PWA render.yaml or deployment logs
   - Find the API URL (typically: https://ageless-api.render.com or similar)

2. **Verify /api/summary endpoint exists**
   - PWA is using it successfully
   - Same endpoint will work for mobile app

3. **Check API authentication**
   - Determine if JWT token is needed
   - Check if CORS is configured for mobile app

---

## Step 2: Create api/client.ts

Create the HTTP client that will be used by all API modules:

```typescript
/**
 * HTTP Client Configuration
 *
 * Handles all API requests with:
 * - Base URL configuration
 * - Authentication headers
 * - Error handling
 * - Request/response interceptors
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  'https://ageless-api.render.com'; // Replace with actual Render URL

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.instance.interceptors.request.use(
      async (config) => {
        // If you need JWT token, add here:
        // const token = await getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          status: error.response?.status,
          code: error.code,
        };

        if (error.response?.status === 401) {
          // Handle unauthorized - maybe clear auth
          // authService.clearToken();
        }

        return Promise.reject(apiError);
      }
    );
  }

  // Generic GET request
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.instance.get<T>(url, { params });
    return response.data;
  }

  // Generic POST request
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data);
    return response.data;
  }

  // Generic PUT request
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url);
    return response.data;
  }

  // Get the underlying axios instance for advanced usage
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const client = new ApiClient();
```

---

## Step 3: Environment Configuration

Create `.env.local` file in the mobile-app root:

```bash
# Render API Configuration
REACT_APP_API_URL=https://ageless-api.render.com
REACT_APP_API_TIMEOUT=30000

# Or if running locally:
# REACT_APP_API_URL=http://localhost:3000
```

---

## Step 4: Verify API Endpoint Format

The `api/summary.ts` is calling:
```typescript
client.get<SummaryResponse>('/api/summary', {
  params: { startDate, endDate },
})
```

Verify the backend `/api/summary` endpoint:

**Expected Request:**
```
GET /api/summary?startDate=2026-01-01&endDate=2026-01-07
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-01-01",
      "endDate": "2026-01-07",
      "dayCount": 7
    },
    "stats": {
      "exercises": {
        "bike": { "sets": 5, "totalReps": 0, "avgSets": 5, "daysActive": 1 },
        "abs": { "sets": 3, "totalReps": 0, "avgSets": 3, "daysActive": 1 },
        "chest press": { "sets": 4, "totalReps": 0, "avgSets": 4, "daysActive": 1 },
        // ... all 12 exercises
      },
      "totalSets": 50,
      "totalWorkouts": 7,
      "daysActive": 5,
      "averageSetsPerDay": 10,
      "currentStreak": 5,
      "personalBests": {
        "bike": 5,
        "abs": 3,
        // ... exercise records
      }
    },
    "generatedAt": "2026-01-09T12:00:00Z"
  }
}
```

---

## Step 5: Create Mock Client for Testing

For offline/mock testing, create `api/client.mock.ts`:

```typescript
/**
 * Mock HTTP Client - For testing without real backend
 */

import { AxiosInstance } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class MockApiClient {
  async get<T>(url: string, params?: any): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (url === '/api/summary') {
      // Return mock workout summary data
      return {
        success: true,
        data: {
          period: {
            startDate: params.startDate,
            endDate: params.endDate,
            dayCount: 7,
          },
          stats: {
            exercises: {
              'bike': { sets: 5, totalReps: 0, avgSets: 5, daysActive: 1 },
              'abs': { sets: 3, totalReps: 0, avgSets: 3, daysActive: 1 },
              'chest press': { sets: 4, totalReps: 0, avgSets: 4, daysActive: 1 },
              'leg press': { sets: 4, totalReps: 0, avgSets: 4, daysActive: 1 },
              'lat': { sets: 2, totalReps: 0, avgSets: 2, daysActive: 1 },
              'military': { sets: 3, totalReps: 0, avgSets: 3, daysActive: 1 },
              'crunch': { sets: 6, totalReps: 0, avgSets: 6, daysActive: 1 },
              'bicep curls': { sets: 4, totalReps: 0, avgSets: 4, daysActive: 1 },
              'triceps': { sets: 3, totalReps: 0, avgSets: 3, daysActive: 1 },
              'overhead pull': { sets: 2, totalReps: 0, avgSets: 2, daysActive: 1 },
              'row': { sets: 3, totalReps: 0, avgSets: 3, daysActive: 1 },
              'weight': { sets: 1, totalReps: 0, avgSets: 170.5, daysActive: 1 },
            },
            totalSets: 40,
            totalWorkouts: 1,
            daysActive: 1,
            averageSetsPerDay: 40,
            currentStreak: 1,
            personalBests: {},
          },
          generatedAt: new Date().toISOString(),
        },
      } as T;
    }

    throw new Error(`Unknown endpoint: ${url}`);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    throw new Error('POST not implemented in mock');
  }

  async put<T>(url: string, data?: any): Promise<T> {
    throw new Error('PUT not implemented in mock');
  }

  async delete<T>(url: string): Promise<T> {
    throw new Error('DELETE not implemented in mock');
  }

  getInstance() {
    return null as any;
  }
}

export const client = new MockApiClient();
```

---

## Step 6: Implementation Checklist

### Create Files
- [ ] `api/client.ts` - Real HTTP client
- [ ] `.env.local` - Environment configuration
- [ ] (Optional) `api/client.mock.ts` - Mock client for offline testing

### Configure Environment
- [ ] Add REACT_APP_API_URL to `.env.local`
- [ ] Test connection to Render API
- [ ] Verify CORS is configured (if needed)

### Test Integration
- [ ] Run app: `npm start`
- [ ] Open Progress Summary modal
- [ ] Wait for real data to load
- [ ] Verify 52 weeks display with real workout data
- [ ] Test error handling (disconnect network)
- [ ] Run `npm test` - verify 298 tests still pass

### Verify Data Format
- [ ] Check that exercise names match API response
- [ ] Verify week ranges calculate correctly
- [ ] Check that total sets match sum of exercises
- [ ] Validate average weights display correctly

---

## Step 7: Troubleshooting

### Error: "Cannot find module './client'"
**Solution:** Create `api/client.ts` with the code above

### Error: "Network error - Failed to fetch"
**Solution:**
- Check that REACT_APP_API_URL is correct
- Verify Render backend is running
- Check CORS configuration
- Verify firewall allows connections

### Error: "Exercise names don't match"
**Solution:**
- Check the actual exercise names in API response
- Update exercise name mappings in `get52WeekSummary()`
- Current mappings:
  ```typescript
  bike: summary.stats.exercises['bike']?.sets || 0,
  abs: summary.stats.exercises['abs']?.sets || 0,
  chestPress: summary.stats.exercises['chest press']?.sets || 0,
  // ... etc
  ```

### Error: "Week ranges are incorrect"
**Solution:**
- Verify `_formatWeekRange()` is using Sunday-Saturday correctly
- Check timezone handling
- Test with known dates

### Tests failing after adding real API
**Solution:**
- Jest mocks need to mock the axios client
- Use `jest.mock('./client')` to provide mock
- Or use `api/client.mock.ts` for testing

---

## Next Steps

1. **Immediate:**
   - [ ] Create `api/client.ts` (use code above)
   - [ ] Create `.env.local` with Render API URL
   - [ ] Find actual Render API URL and exercise names

2. **Testing:**
   - [ ] Run app with real backend
   - [ ] Execute PHASE_2_TESTING_CHECKLIST.md tests
   - [ ] Document any data format mismatches
   - [ ] Fix exercise name mappings if needed

3. **Verification:**
   - [ ] Load 52 weeks of real data
   - [ ] Verify week ranges are correct
   - [ ] Verify exercise data is accurate
   - [ ] Test error scenarios
   - [ ] Run full test suite

---

## Questions to Answer

To finalize the setup, clarify:

1. **What is the exact Render API URL?**
   - e.g., `https://ageless-api.render.com`
   - Or: `https://your-service-name.render.com`

2. **What are the exact exercise names in the API?**
   - Current mapping assumes: 'bike', 'abs', 'chest press', 'leg press', 'lat', 'military', 'crunch', 'bicep curls', 'triceps', 'overhead pull', 'row', 'weight'
   - Need to verify these match the backend exactly

3. **Is authentication required?**
   - JWT token?
   - API key?
   - Basic auth?

4. **Are there any CORS restrictions?**
   - Need to allow requests from mobile app domain

---

## Additional Resources

- **PWA Backend:** `/Old_Ageless_Web_PWA/fitness-app-next/app/api/summary/route.ts`
- **Mobile App API:** `api/summary.ts` (already implemented)
- **Render Docs:** https://render.com/docs
- **Axios Docs:** https://axios-http.com/docs/intro

---

**Status:** Ready to implement real backend integration
**Next Action:** Create `api/client.ts` and configure environment

