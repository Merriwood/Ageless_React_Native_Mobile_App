# Deployment Guide - Ageless Body Fitness Tracker

Complete guide for deploying your Next.js 14 fitness tracker to Render.

## Prerequisites

- [x] GitHub repository with your code
- [x] PostgreSQL database (existing or new)
- [x] Render account ([render.com](https://render.com))

## Step 1: Prepare Environment Variables

You'll need the following environment variables. Create a `.env` file locally for development:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"  # Change for production
NEXTAUTH_SECRET="your-secret-here"     # Generate with: openssl rand -base64 32

# Node Environment
NODE_ENV="development"
```

### Generate NEXTAUTH_SECRET

Run this command locally to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Step 2: Database Setup

### Option A: Use Existing PostgreSQL Database

If you already have a PostgreSQL database from the original app:

1. Use the same `DATABASE_URL`
2. The Prisma schema is compatible with the existing tables
3. No migration needed - the app will work with existing data

### Option B: Create New PostgreSQL Database on Render

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ageless-body-db`
   - **Database**: `fitness_tracker`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **"Create Database"**
5. Wait for database to be created
6. Copy the **Internal Database URL** (starts with `postgresql://`)

### Run Database Migrations (New Database Only)

If you created a new database, you need to create the tables:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Create tables in database
npx prisma db push
```

## Step 3: Deploy to Render

### Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Configure Web Service

**Basic Settings:**
- **Name**: `ageless-body-fitness`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `fitness-app-next` (if in subdirectory) or leave blank
- **Runtime**: `Node`

**Build & Deploy Settings:**
- **Build Command**:
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys on every push to main)

### Add Environment Variables

In the Render dashboard for your web service, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your PostgreSQL connection string (from Step 2) |
| `NEXTAUTH_URL` | `https://ageless-body-fitness.onrender.com` (use your actual URL) |
| `NEXTAUTH_SECRET` | Your generated secret from Step 1 |
| `NODE_ENV` | `production` |

**Important:** Make sure to use the **Internal Database URL** from Render if using Render PostgreSQL, not the External URL.

### Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Generate Prisma client
   - Build the Next.js app
   - Start the production server
3. Watch the logs for any errors
4. Once deployed, you'll get a URL like: `https://ageless-body-fitness.onrender.com`

## Step 4: Verify Deployment

### Test the Application

1. Visit your Render URL
2. Test registration: Create a new account
3. Test login: Sign in with your credentials
4. Test workout tracking: Add exercises, save workout
5. Test history: View past workouts
6. Test summary: Check weekly aggregation
7. Test PWA: Install the app on mobile device

### Check Logs

If something isn't working:

```bash
# In Render dashboard, go to "Logs" tab
# Look for errors related to:
# - Database connection
# - Prisma client generation
# - NextAuth configuration
# - API routes
```

## Step 5: Post-Deployment Setup

### Update NEXTAUTH_URL

After first deployment, update the `NEXTAUTH_URL` environment variable:

1. Go to Render dashboard → Your web service → Environment
2. Update `NEXTAUTH_URL` to your actual Render URL
3. Save changes
4. Render will automatically redeploy

### Configure Custom Domain (Optional)

1. Purchase a domain (e.g., from Namecheap, Google Domains)
2. In Render dashboard, go to **Settings** → **Custom Domains**
3. Add your domain
4. Update DNS records as shown by Render
5. Update `NEXTAUTH_URL` to use your custom domain

### Enable HTTPS (Automatic)

Render automatically provides free SSL certificates via Let's Encrypt. Your app will be accessible via HTTPS immediately.

## Step 6: Monitoring & Maintenance

### Health Checks

Render automatically pings your service. If it goes down, you'll receive an email notification.

### Database Backups

Render PostgreSQL (paid plans) includes automatic daily backups. For free plans, manually backup your data:

```bash
# Connect to your database
psql $DATABASE_URL

# Export data
pg_dump $DATABASE_URL > backup.sql
```

### View Metrics

In Render dashboard:
- **Metrics** tab shows CPU, memory usage
- **Logs** tab shows application logs
- **Events** tab shows deployment history

## Troubleshooting

### Common Issues

**1. Build Fails - "Cannot find module '@prisma/client'"**

Solution: Ensure `npx prisma generate` is in your build command:
```bash
npm install && npx prisma generate && npm run build
```

**2. NextAuth Error - "No secret provided"**

Solution: Make sure `NEXTAUTH_SECRET` is set in environment variables.

**3. Database Connection Error**

Solution:
- Verify `DATABASE_URL` is correct
- Use **Internal Database URL** for Render PostgreSQL
- Check if database is running

**4. App Loads but Login Doesn't Work**

Solution:
- Check `NEXTAUTH_URL` matches your actual URL
- Make sure it includes `https://` and has no trailing slash

**5. "Module not found" errors**

Solution: Check your `package.json` dependencies are complete:
```bash
npm install
```

### Enable Debug Logs

Add to environment variables:
```
NEXTAUTH_DEBUG=true
```

This will show detailed authentication logs in Render logs.

## Performance Optimization

### Enable Next.js Production Optimizations

Already configured in `next.config.js`:
```javascript
module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
}
```

### Database Connection Pooling

For high traffic, consider using connection pooling:

```bash
# In Render PostgreSQL, use the Connection Pooler URL
DATABASE_URL="postgresql://...?pgbouncer=true"
```

### Caching

Consider adding Redis for session storage (optional):
1. Create Redis instance on Render
2. Update NextAuth to use Redis adapter
3. Set `REDIS_URL` environment variable

## Scaling

### Free Tier Limitations

- App spins down after 15 minutes of inactivity
- 750 free hours per month
- Limited memory and CPU

### Upgrade for Production

For a production app, consider:
- **Starter Plan** ($7/month) - No spin down, more resources
- **PostgreSQL Paid Plan** - Backups, more storage
- **Custom Domain** - Professional appearance

## Security Checklist

- [x] `NEXTAUTH_SECRET` is strong (32+ characters)
- [x] `DATABASE_URL` uses SSL (Render includes by default)
- [x] Environment variables are not committed to Git
- [x] HTTPS is enabled (automatic on Render)
- [x] Database credentials are secure
- [x] `NODE_ENV=production` is set

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Documentation](https://next-auth.js.org/deployment)

## Quick Command Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# View database in browser
npx prisma studio
```

## Support

If you encounter issues:

1. Check Render logs in dashboard
2. Review [Render Status Page](https://status.render.com)
3. Check [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)
4. Review [Prisma GitHub Issues](https://github.com/prisma/prisma/issues)

---

**Congratulations! Your Ageless Body Fitness Tracker is now live! 🎉**

Share your URL with users and start tracking fitness progress!
