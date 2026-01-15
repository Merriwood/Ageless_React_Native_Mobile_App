# Database Credential Rotation Guide
**CRITICAL SECURITY FIX**
**Status:** ⚠️ **ACTION REQUIRED**

---

## Why This Is Needed

The current database credentials are exposed in the `.env` file and could be accessed by anyone with file system access. For production security, these credentials **must be rotated**.

**Current Database:**
- Host: `dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com`
- Database: `fitness_tracker_db_ewht`
- User: `fitness_tracker_db_ewht_user`
- ⚠️ Password: `m4sxNiEGxSkhPYpHJDI6uiL2rIu41GsD` (EXPOSED)

---

## Step-by-Step Instructions

### Option A: Rotate Credentials via Render Dashboard (Recommended)

**Time Required:** 10 minutes

#### Step 1: Access Render Dashboard
1. Go to https://dashboard.render.com
2. Log in with your Render account
3. Navigate to your database: `fitness_tracker_db_ewht`

#### Step 2: Rotate Credentials
1. Click on your database in the dashboard
2. Go to the **"Settings"** tab
3. Scroll down to **"Credentials"** section
4. Click **"Rotate Credentials"** button
5. Confirm the action

#### Step 3: Get New Connection String
1. After rotation, copy the new **Internal Database URL**
2. It will look like:
   ```
   postgresql://new_user:new_password@dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com/fitness_tracker_db_ewht
   ```

#### Step 4: Update .env File
1. Open `/workspaces/Fitness_tracker/fitness-app-next/.env`
2. Replace the `DATABASE_URL` line:
   ```env
   # OLD (DELETE THIS):
   DATABASE_URL="postgresql://fitness_tracker_db_ewht_user:m4sxNiEGxSkhPYpHJDI6uiL2rIu41GsD@dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com/fitness_tracker_db_ewht"

   # NEW (PASTE YOUR NEW URL):
   DATABASE_URL="postgresql://[new_user]:[new_password]@dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com/fitness_tracker_db_ewht"
   ```

#### Step 5: Verify Connection
```bash
cd /workspaces/Fitness_tracker/fitness-app-next
npx prisma db pull
```

**Expected Output:**
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "fitness_tracker_db_ewht"

✔ Introspected 2 models and wrote them into prisma/schema.prisma
```

If you see this, the connection is successful! ✅

#### Step 6: Update Production Environment
When deploying to production (Vercel/other), update the `DATABASE_URL` environment variable in your hosting platform's dashboard with the new credentials.

---

### Option B: Create New Database User (Alternative)

If you prefer not to rotate the main credentials, you can create a new database user:

**Time Required:** 15 minutes

#### Step 1: Connect to Database
```bash
PGPASSWORD='m4sxNiEGxSkhPYpHJDI6uiL2rIu41GsD' psql -h dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com -U fitness_tracker_db_ewht_user -d fitness_tracker_db_ewht
```

#### Step 2: Create New User
```sql
-- Generate a strong password first (run in bash):
-- openssl rand -base64 32

-- Create new user with strong password
CREATE USER app_user WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';

-- Grant permissions
GRANT CONNECT ON DATABASE fitness_tracker_db_ewht TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Grant permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

\q
```

#### Step 3: Update .env
```env
DATABASE_URL="postgresql://app_user:YOUR_STRONG_PASSWORD_HERE@dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com/fitness_tracker_db_ewht"
```

#### Step 4: Verify
```bash
npx prisma db pull
```

---

## After Credential Rotation

### ✅ Verification Checklist:
- [ ] New credentials work locally (`npx prisma db pull`)
- [ ] Application starts without errors
- [ ] Can login to application
- [ ] Can create/view workouts
- [ ] Old credentials no longer work
- [ ] New credentials documented securely

### 🔒 Security Best Practices:
- [ ] Never commit `.env` file to Git
- [ ] Use different credentials for dev/staging/production
- [ ] Rotate credentials every 90 days
- [ ] Store production credentials in secure vault (e.g., Vercel environment variables)
- [ ] Limit database user permissions (principle of least privilege)

---

## Production Deployment

When deploying to production:

### Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update `DATABASE_URL` with new credentials
3. Redeploy application

### Render:
1. Go to Render Dashboard → Your Web Service → Environment
2. Add/Update `DATABASE_URL` with new credentials
3. Trigger manual deploy

### Other Platforms:
Follow your hosting platform's documentation for updating environment variables.

---

## Troubleshooting

### Error: "Connection refused"
**Solution:** Check that the host and port are correct. Render PostgreSQL uses port 5432 by default.

### Error: "Authentication failed"
**Solution:**
1. Verify you copied the entire DATABASE_URL correctly
2. Ensure no extra spaces in the connection string
3. Try rotating credentials again

### Error: "SSL required"
**Solution:** Add `?sslmode=require` to the end of your DATABASE_URL:
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Error: "Database does not exist"
**Solution:** Verify the database name is correct (should be `fitness_tracker_db_ewht`)

---

## Quick Command Reference

```bash
# Test database connection
npx prisma db pull

# Generate new password
openssl rand -base64 32

# Connect to database
PGPASSWORD='password' psql -h host -U user -d database

# Run migrations after credential change
npx prisma migrate deploy

# Regenerate Prisma Client
npx prisma generate
```

---

## Status After Completion

Once you've rotated the credentials:

**Before:**
- ❌ Database password exposed
- ❌ Security risk present
- ⚠️ Not production-ready

**After:**
- ✅ New secure credentials
- ✅ Old credentials revoked
- ✅ Production-ready

---

## Next Steps

After rotating credentials:
1. ✅ Update production environment variables
2. ✅ Test deployment
3. ✅ Document new credentials securely
4. ✅ Set calendar reminder for next rotation (90 days)

---

**Created:** October 18, 2025
**Priority:** CRITICAL
**Estimated Time:** 10-15 minutes
