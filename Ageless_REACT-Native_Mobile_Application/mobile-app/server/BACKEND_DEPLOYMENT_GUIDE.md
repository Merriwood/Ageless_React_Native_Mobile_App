# Backend API Deployment Guide - Render

## Overview

The backend API for Ageless is a Node.js/Express server that handles authentication, workout tracking, and fitness data management. It must be deployed as a **separate Render Web Service** from the frontend.

## Prerequisites

- Render account (free tier)
- GitHub repository access
- PostgreSQL database on Render

## Step 1: Create PostgreSQL Database on Render

If you don't already have a database:

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ageless-db`
   - **Database**: `fitness`
   - **User**: `postgres`
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait for it to finish (5-10 minutes)
6. Copy the **Internal Database URL** (you'll need this)

## Step 2: Deploy Backend API

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect GitHub Repository**:
   - Select: `Merriwood/Ageless_React_Native_Mobile_App`
   - Confirm authorization

4. **Configure Service**:
   - **Name**: `ageless-api` (⚠️ IMPORTANT - creates the domain)
   - **Root Directory**: `Old_Ageless_Web_PWA/PWA_Source_Code/server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   - Click **"Add Environment Variable"** for each:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | Required |
   | `DATABASE_URL` | [From PostgreSQL step] | Internal connection string |
   | `JWT_SECRET` | [Generate random string] | Use `openssl rand -base64 32` |
   | `PORT` | `10000` | Render assigns this |
   | `CORS_ORIGIN` | `https://locali-corp.onrender.com` | Frontend URL |

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)

## Step 3: Verify Deployment

Once deployed, your API will be at:
```
https://ageless-api.onrender.com
```

Test the health endpoint:
```bash
curl https://ageless-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "operational",
  "timestamp": "2026-01-16T...",
  "uptime": "..."
}
```

## Step 4: Update Frontend to Use Backend

The frontend is already configured to use `https://ageless-api.render.com` by default (in `api/client.ts`).

**No additional changes needed** - the frontend and backend are now connected!

## Step 5: Create Test Account

The database includes a pre-created test account:
- **Email**: `test@ageless.app`
- **Password**: `Test@123`

Try logging in on the frontend at: `https://locali-corp.onrender.com`

## Troubleshooting

### Backend doesn't start
- Check build logs in Render dashboard
- Verify DATABASE_URL is set correctly
- Ensure root directory is `Old_Ageless_Web_PWA/PWA_Source_Code/server`

### Login fails
- Verify backend is running (`https://ageless-api.onrender.com/api/health`)
- Check CORS_ORIGIN matches frontend URL
- Review backend logs for database connection errors

### Database connection errors
- Ensure DATABASE_URL uses **Internal Database URL** (not Public)
- Free PostgreSQL goes to sleep after 7 days of inactivity

### Cold starts
- Free tier services sleep after 15 minutes of inactivity
- First request may take 30+ seconds

## API Endpoints

Once deployed, these endpoints are available:

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/me` - Get current user profile

### Workouts
- `GET /api/workouts` - List all workouts
- `GET /api/workouts/[date]` - Get workout for specific date
- `POST /api/workouts` - Create new workout
- `DELETE /api/workouts/[date]` - Delete workout

### Summary
- `GET /api/summary` - Get fitness summary/analytics

## Next Steps

1. Monitor backend logs in Render dashboard
2. Test login with `test@ageless.app / Test@123`
3. Verify frontend can fetch data from backend
4. Set up error tracking (optional: Sentry)

---

**Need help?** Check the logs in Render dashboard or contact support.
