# Quick Start Guide

Get your fitness tracker running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (existing or new)
- Terminal/command line access

## Step 1: Environment Configuration (2 minutes)

Create a `.env` file in the `fitness-app-next` directory:

```bash
cd fitness-app-next
touch .env
```

Add these variables to `.env`:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/fitness_tracker"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Environment
NODE_ENV="development"
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### Database URL Format

```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

**Examples:**

Local PostgreSQL:
```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/fitness_tracker"
```

Render PostgreSQL:
```
DATABASE_URL="postgresql://user:pass@host.oregon-postgres.render.com/dbname"
```

## Step 2: Install Dependencies (1 minute)

```bash
npm install
```

This installs all required packages including Next.js, React, Prisma, NextAuth, and more.

## Step 3: Setup Database (1 minute)

### Option A: Use Existing Database

If you already have the fitness tracker database with users and entries tables, just generate Prisma client:

```bash
npx prisma generate
```

### Option B: Create New Database

If starting fresh, create the tables:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

This creates:
- `users` table (id, email, password_hash, goal, created_at)
- `entries` table (id, user_id, entry_date, weight, fitness_data, created_at, updated_at)

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

## Step 5: Test the Application (30 seconds)

1. Open http://localhost:3000 in your browser
2. Click "Create new account" to register
3. Fill in email, password, and select goals
4. Click "Register"
5. Login with your credentials
6. Start tracking workouts!

## Verify Everything Works

### ✅ Registration
- Go to http://localhost:3000
- Should redirect to /login
- Click "Create new account"
- Fill form and submit
- Should redirect to /login with success message

### ✅ Login
- Enter email and password
- Click "Sign in"
- Should redirect to /dashboard

### ✅ Dashboard
- Should see "Today's Workout" header
- Should see 11 exercise cards (Bike, Abs, Chest Press, etc.)
- Should see weight input field
- Progress bar at 0%

### ✅ Track Workout
- Click + button on any exercise
- Counter should increment (0 → 1)
- Progress bar should update
- Enter weight in weight field
- Click "Save Workout"
- Should see success message

### ✅ History
- Click "History" tab in bottom navigation
- Should see your saved workout
- Click "Delete" to remove it (with confirmation)

### ✅ Summary
- Click "Summary" tab
- Should see overall stats (total workouts, avg weight, total sets)
- Should see weekly breakdown with completion rates

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running: `psql -U postgres -l`
- Test connection: `psql $DATABASE_URL`

### Issue: "No secret provided for NextAuth"

**Solution:**
- Make sure `.env` file exists in `fitness-app-next` directory
- Verify `NEXTAUTH_SECRET` is set (use `openssl rand -base64 32`)
- Restart dev server after adding env variable

### Issue: "@prisma/client not found"

**Solution:**
```bash
npx prisma generate
npm run dev
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Issue: "Module not found"

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Open database GUI
npx prisma studio

# Check TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint
```

## Database Management

### View Database in Browser

```bash
npx prisma studio
```

Opens http://localhost:5555 with a GUI to view/edit data.

### Reset Database (Caution!)

```bash
# This will delete all data
npx prisma db push --force-reset
```

### Backup Database

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore Database

```bash
psql $DATABASE_URL < backup.sql
```

## Testing on Mobile

### Option 1: Same Network

1. Find your computer's IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Update `.env`:
   ```env
   NEXTAUTH_URL="http://192.168.1.X:3000"
   ```

3. On your phone, visit: `http://192.168.1.X:3000`

### Option 2: ngrok

1. Install ngrok: https://ngrok.com
2. Run:
   ```bash
   ngrok http 3000
   ```
3. Update `NEXTAUTH_URL` to ngrok URL
4. Visit ngrok URL on phone

## Environment Variables Reference

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | ✅ Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | `http://localhost:3000` | ✅ Yes | App URL (no trailing slash) |
| `NEXTAUTH_SECRET` | `random-32-char-string` | ✅ Yes | Secret for JWT signing |
| `NODE_ENV` | `development` | ❌ Optional | Environment (development/production) |

## Next Steps

Once everything works locally:

1. **Test All Features**
   - Register new users
   - Track workouts
   - View history
   - Check summary

2. **Deploy to Production**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Push to GitHub
   - Deploy on Render

3. **Add Optional Features**
   - Offline support
   - Charts/graphs
   - Photo uploads
   - More exercises

## Need Help?

1. Check [README.md](./README.md) for full documentation
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
3. Check [PROJECT_COMPLETION_SUMMARY.md](./PROJECT_COMPLETION_SUMMARY.md) for what's been built
4. Review Next.js docs: https://nextjs.org/docs
5. Review Prisma docs: https://www.prisma.io/docs

---

**Congratulations! Your fitness tracker is now running! 🎉**

Start tracking your workouts and building that ageless body!
