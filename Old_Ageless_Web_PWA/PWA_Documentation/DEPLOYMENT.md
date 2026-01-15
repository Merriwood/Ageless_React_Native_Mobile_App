# Deployment Guide

## Render Deployment (Recommended)

### Prerequisites
1. GitHub repository with this code
2. Render account (free tier available)

### Step 1: Deploy Database
1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `fitness-tracker-db`
4. Plan: Free
5. Click "Create Database"
6. Save the "Internal Database URL" for later

### Step 2: Deploy Backend API
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `fitness-tracker-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `DATABASE_URL`: [Internal Database URL from Step 1]
   - `JWT_SECRET`: `your-super-secure-random-string-here`
   - `CORS_ORIGIN`: `*` (temporarily, will update after frontend deployment)
   - `NODE_ENV`: `production`
5. Click "Create Web Service"
6. Wait for deployment to complete
7. Copy the service URL (e.g., `https://fitness-tracker-api-xyz.onrender.com`)

### Step 3: Run Database Migration
1. Go to your backend service dashboard
2. Click "Shell" tab
3. Run: `npm run migrate`
4. Verify tables are created

### Step 4: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect the same GitHub repository
3. Configure service:
   - **Name**: `fitness-tracker-web`
   - **Root Directory**: `web`
   - **Build Command**: (leave empty)
   - **Publish Directory**: `.` (current directory)

### Step 5: Update Configuration
1. **Update Frontend API URL**:
   - Edit `web/app.js` line 2
   - Replace `https://your-backend-service.onrender.com` with your actual backend URL
   - Commit and push changes

2. **Update Backend CORS**:
   - Go to backend service → Environment
   - Update `CORS_ORIGIN` to your frontend URL (e.g., `https://fitness-tracker-web-abc.onrender.com`)
   - Save changes (service will restart automatically)

### Step 6: Create Icons (Optional)
Create PNG files in `web/icons/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)  
- `maskable-512.png` (512x512px, maskable design)

## Alternative Deployment Options

### Netlify + Railway
- **Frontend**: Netlify (Static Site)
- **Backend**: Railway (Web Service + PostgreSQL)

### Vercel + PlanetScale
- **Frontend**: Vercel (Static Site)
- **Backend**: Vercel (Serverless Functions)
- **Database**: PlanetScale (MySQL)

### Self-Hosted
- **Requirements**: VPS with Node.js 18+, PostgreSQL, NGINX
- **Process**: Clone repo, setup environment, configure reverse proxy

## Troubleshooting

### Common Issues:

1. **Frontend can't connect to backend**:
   - Check API_BASE URL in `web/app.js`
   - Verify CORS_ORIGIN in backend environment
   - Ensure backend service is running

2. **Database connection errors**:
   - Verify DATABASE_URL is correct
   - Check if migration was run: `npm run migrate`
   - Ensure PostgreSQL service is running

3. **Authentication issues**:
   - Check JWT_SECRET is set
   - Verify same secret used across restarts
   - Clear browser localStorage if needed

4. **PWA not installing**:
   - Ensure HTTPS is enabled
   - Check manifest.webmanifest is accessible
   - Verify service worker registration

### Debug Commands:
```bash
# Check backend health
curl https://your-backend-url.onrender.com/healthz

# Check database connection
# (In backend service shell)
node -e "import('./db.js').then(db => db.query('SELECT NOW()'))"

# View backend logs
# (In Render dashboard → service → Logs)
```

## Production Checklist

- [ ] Backend deployed and healthy
- [ ] Database created and migrated
- [ ] Frontend deployed with correct API URL
- [ ] CORS configured properly
- [ ] Environment variables set securely
- [ ] HTTPS enabled on both services
- [ ] PWA icons uploaded
- [ ] Test user registration/login
- [ ] Test workout tracking functionality
- [ ] Test offline functionality

## Security Notes

- Never commit `.env` files
- Use strong, unique JWT_SECRET
- Enable HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities
