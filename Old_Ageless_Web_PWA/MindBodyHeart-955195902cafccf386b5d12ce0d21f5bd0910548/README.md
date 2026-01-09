# Fitness Tracker

A full-stack fitness tracking application with user authentication, progress tracking, and workout history.

## Project Structure

```
fitness-tracker/
├── server/          # Backend API (Node.js/Express)
│   ├── server.js    # Main server file
│   ├── db.js        # Database connection
│   ├── auth.js      # Authentication logic
│   ├── schema.sql   # Database schema
│   └── package.json # Server dependencies
├── web/             # Frontend (Vanilla JS PWA)
│   ├── index.html   # Main HTML file
│   ├── app.js       # Frontend JavaScript
│   ├── service-worker.js # PWA service worker
│   ├── manifest.webmanifest # PWA manifest
│   └── icons/       # PWA icons
└── .env.example     # Environment variables template
```

## Features

- **User Authentication**: Secure registration and login
- **Workout Tracking**: Track multiple exercises with sets/reps
- **Progress Visualization**: Real-time progress bar
- **History Management**: View and edit past workouts
- **Weekly Summaries**: Analyze workout patterns
- **Offline Support**: PWA with offline queueing
- **Mobile Responsive**: Works on all devices

## Tech Stack

**Backend:**
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- Vanilla JavaScript (ES6+)
- PWA (Progressive Web App)
- Service Worker for offline functionality
- Responsive CSS

## Deployment

### Option 1: Render (Recommended)

#### 1. Deploy Backend (Web Service)
1. Create PostgreSQL database on Render
2. Create Web Service from this repo
3. Set root directory to `server`
4. Set start command to `node server.js`
5. Add environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `CORS_ORIGIN` (your frontend URL)
   - `JWT_SECRET` (secure random string)
   - `NODE_ENV=production`
6. After deployment, run migration: `npm run migrate`

#### 2. Deploy Frontend (Static Site)
1. Create Static Site from this repo
2. Set root directory to `web`
3. Update `web/app.js` line 2 with your backend URL:
   ```javascript
   const API_BASE = "https://your-backend-service.onrender.com";
   ```

### Option 2: Other Platforms

#### Backend Requirements:
- Node.js 18+
- PostgreSQL database
- Environment variables set

#### Frontend Requirements:
- Static file hosting
- HTTPS (for PWA features)

## Local Development

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd fitness-tracker
   ```

2. **Backend setup:**
   ```bash
   cd server
   npm install
   cp ../.env.example .env
   # Edit .env with your database credentials
   npm run migrate
   npm start
   ```

3. **Frontend setup:**
   ```bash
   cd ../web
   # Update API_BASE in app.js to http://localhost:10000
   # Serve files with any static server
   npx serve .
   ```

## Environment Variables

Create `.env` in the server directory:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/fitness_tracker
JWT_SECRET=your-super-secure-secret-key
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/me` - Get current user
- `GET /api/entries` - Get all workout entries
- `GET /api/entries/:date` - Get specific date entry
- `POST /api/entries` - Create/update entry
- `DELETE /api/entries/:date` - Delete entry
- `GET /api/summary` - Get weekly summaries

## PWA Features

- **Offline Support**: Works without internet
- **Install Prompt**: Can be installed on mobile/desktop
- **Background Sync**: Syncs data when online
- **Push Notifications**: Ready for future features

## Exercises Tracked

- Bike (60 min)
- Abs (100 reps)
- Chest Press (20 reps)
- Leg Press (20 reps)
- Lat (20 reps)
- Military (20 reps)
- Crunch (100 reps)
- Bicep Curls (20 reps)
- Triceps (40 reps)
- Overhead Pull (40 reps)
- Row (20 reps)

Each exercise can be completed up to 4 sets maximum.

## License

MIT License
