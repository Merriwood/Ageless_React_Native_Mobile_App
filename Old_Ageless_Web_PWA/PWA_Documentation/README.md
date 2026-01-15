# Ageless. Fitness Tracker (Client)

## Icon cropping/generation (Windows / PowerShell)

Use the included script to center-crop any square-ish source image and emit all app icons:

```
powershell -ExecutionPolicy Bypass -File .\resize-icon.ps1 -InputPath "web\icons\logo_icon.PNG" -OutDir "web\icons"
```

Options:
- `-Background` default transparent (e.g., `#00FFFFFF`); use `#FFFFFFFF` for white.
- `-MaskPad` padding ratio for maskable (default 0.10).

Outputs: favicon 16/32, apple-touch-icon 180, icon-192, icon-512, maskable-512.

## Data Model
Exercise:
- id (UUID/string)
- name
- sets
- reps
- totalReps
- date (ISO)
- dayKey (UTC YYYY-MM-DD)

## Consistency Features
- Safe parse + corrupt backup
- UUID ids (no millisecond collisions)
- dayKey (timezone-stable grouping)
- Dedup by id before every persist
- Queued writes (animation frame)
- Cross-tab merge via storage event (additive)
- Auth sync via storage event
- Service worker caches only static shell (no stale dynamic duplication)

## Adding Features Safely
Add new fields without removing existing; run normalization on load. Use idempotent merges.

## Testing Checklist
See section below.

mbh_appVersion: 1.0.0
## Future Enhancements
- Optional IndexedDB migration
- Export / import for manual backup
- Server sync layer with idempotent reconciliation (retain current dedup semantics)

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
3. Set root directory to `web`
4. (Runtime config) Provide backend URL via `runtime-config.js` (see Runtime Frontend Configuration section below) or leave blank for same-origin deployment.

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
   # Copy example runtime config and set local API base (or keep empty for same-origin proxy)
   copy runtime-config.example.js runtime-config.js
   # (Optional) Edit runtime-config.js -> API_BASE_URL: "http://localhost:10000"
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

## Runtime Frontend Configuration

The client now supports an external (gitignored) runtime configuration file so deployments don't require editing `app.js`.

How it works:
1. The HTML (`index.html` deploy variant) defines `window.__MBH_RUNTIME_FALLBACK__` with safe defaults.
2. (Optional) You create `web/runtime-config.js` (ignored by git) to define `window.__MBH_RUNTIME_CONFIG__`.
3. A small bootstrap script merges both into `window.__MBH_CONFIG` (shallow merge; explicit keys override fallback).
4. `web/app.js` reads `API_BASE_URL` from `window.__MBH_CONFIG` (falls back to relative URLs if blank/undefined).

To customize per environment:
```bash
cd web
copy runtime-config.example.js runtime-config.js   # Windows PowerShell
# or: cp runtime-config.example.js runtime-config.js (mac/Linux)
```
Edit `runtime-config.js` values (e.g. `API_BASE_URL: "https://your-backend.onrender.com"`). Do NOT commit this file.

Available fields (extend as needed):
- `API_BASE_URL` (string) – Prefix for API calls ('' means same-origin).
- `FEATURE_FLAGS` (object) – Toggle experimental features.
- `BUILD_METADATA` (object) – Optional build info (version, commit, timestamp).

Why: Enables environment-specific values (staging, prod, local) without mutating version-controlled source or risking merge conflicts.

If `runtime-config.js` is absent the app still functions using fallback defaults.

## Documentation

- Detailed Behavior Specification: see `BEHAVIOR_SPEC.md` (state machine, persistence rules, acceptance criteria)
- Full User Flows: see `USER_FLOWS.md`
- Concise User Flows Summary: see `USER_FLOWS_SHORT.md`

These documents define canonical flows. Update them when adding or modifying endpoints, storage keys, or offline behavior to avoid drift.

## License

MIT License
