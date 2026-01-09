# 🚀 DEPLOYMENT STEPS FOR RENDER

## Prerequisites
1. Install Git: https://git-scm.com/download/windows
2. GitHub account with repository: https://github.com/Merriwood/Fitness_tracker
3. Render account: https://render.com

## Step 1: Push Code to GitHub

**Option A: Using Git Command Line (after installing Git):**
```bash
cd "c:\Users\nkoval\OneDrive - FORBES MEDIA\Desktop\Steve files\Fitness_tracker"
git init
git add .
git commit -m "Restructure project for Render deployment"
git remote add origin https://github.com/Merriwood/Fitness_tracker.git
git branch -M main
git push -u origin main
```

**Option B: Using GitHub Desktop:**
1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Choose: `c:\Users\nkoval\OneDrive - FORBES MEDIA\Desktop\Steve files\Fitness_tracker`
5. Commit all files with message: "Restructure project for Render deployment"
6. Publish to GitHub (select existing repository: Merriwood/Fitness_tracker)

## Step 2: Deploy on Render (IN THIS ORDER)

### 🗄️ 1. Create PostgreSQL Database
1. Go to https://render.com/dashboard
2. Click "New +" → "PostgreSQL"
3. **Name**: `fitness-tracker-db`
4. **Database**: `fitness_tracker`
5. **User**: (auto-generated)
6. **Plan**: Free
7. Click "Create Database"
8. **SAVE the "Internal Database URL"** (starts with postgresql://)

### 🔧 2. Deploy Backend API
1. Click "New +" → "Web Service"
2. Connect GitHub → Select "Merriwood/Fitness_tracker"
3. **Configure Service:**
   - **Name**: `fitness-tracker-api`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

4. **Add Environment Variables:**
   - `DATABASE_URL`: [Paste Internal Database URL from Step 1]
   - `JWT_SECRET`: `your-super-secure-random-string-12345`
   - `CORS_ORIGIN`: `*` (will update after frontend deployment)
   - `NODE_ENV`: `production`

5. Click "Create Web Service"
6. **Wait for deployment to complete** (5-10 minutes)
7. **SAVE your backend URL** (e.g., `https://fitness-tracker-api-xyz.onrender.com`)

### 🔧 3. Run Database Migration
1. Go to your backend service dashboard
2. Click "Shell" tab (wait for it to load)
3. Run: `npm run migrate`
4. Should see "Connected" or table creation messages

### 🌐 4. Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect GitHub → Select "Merriwood/Fitness_tracker"
3. **Configure Service:**
   - **Name**: `fitness-tracker-web`
   - **Root Directory**: `web`
   - **Build Command**: (leave empty)
   - **Publish Directory**: `.`

4. Click "Create Static Site"
5. **Wait for deployment** (2-3 minutes)
6. **SAVE your frontend URL** (e.g., `https://fitness-tracker-web-abc.onrender.com`)

## Step 3: Update Configuration

### 🔄 1. Update Frontend API URL
1. Edit `web/app.js` line 3
2. Change: `const API_BASE = "https://fitness-tracker-api.onrender.com";`
3. To your actual backend URL: `const API_BASE = "https://fitness-tracker-api-xyz.onrender.com";`
4. Commit and push to GitHub (frontend will auto-redeploy)

### 🔄 2. Update Backend CORS
1. Go to backend service → Environment tab
2. Edit `CORS_ORIGIN` 
3. Change from `*` to your frontend URL: `https://fitness-tracker-web-abc.onrender.com`
4. Save (service will restart)

## Step 4: Test Your App

1. Visit your frontend URL
2. Register a new account
3. Try tracking some exercises
4. Check that data saves and loads properly

## 🎯 Final URLs
- **Frontend**: https://fitness-tracker-web-abc.onrender.com
- **Backend**: https://fitness-tracker-api-xyz.onrender.com
- **Database**: (internal only)

## 🐛 Troubleshooting

**Frontend shows errors:**
- Check browser console (F12)
- Verify API_BASE URL is correct
- Ensure backend is running

**Can't register/login:**
- Check backend logs in Render dashboard
- Verify database migration ran successfully
- Check JWT_SECRET is set

**CORS errors:**
- Update CORS_ORIGIN with correct frontend URL
- Ensure no trailing slashes in URLs

## 📝 Notes
- Free tier has some limitations (may sleep when inactive)
- SSL/HTTPS is automatic on Render
- Services auto-deploy on GitHub pushes
- Backend URL format: `https://[service-name]-[random].onrender.com`
