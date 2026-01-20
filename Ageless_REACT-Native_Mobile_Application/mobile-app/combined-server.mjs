/**
 * Combined Server
 * Serves both React web frontend and Express API backend
 * 
 * Structure:
 * - Static files (React web app) from ./dist/
 * - API endpoints from ./server/auth.js, etc.
 * - Fallback to index.html for React Router SPA
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from "bcryptjs";

// Load server auth/db modules
import { register, login, requireAuth } from "./server/auth.js";
import { query } from "./server/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env.local');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Helmet with CSP disabled for Expo web bundles (which use inline scripts)
app.use(helmet({
  contentSecurityPolicy: false,
  // Keep other security headers but allow inline scripts from Expo
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));
// CORS configuration - restrict to known origins
const allowedOrigins = [
  'https://locali-corp.onrender.com',
  'https://ageless.app',
  process.env.CORS_ORIGIN,  // Allow override via environment variable
].filter(Boolean);  // Remove undefined values

// In development, allow localhost
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[request] ${req.method} ${req.path}`);
  next();
});

// Database setup
let migrated = false;
async function runMigrationsOnce() {
  if (migrated) return;
  if (!process.env.DATABASE_URL) {
    console.warn('[startup] DATABASE_URL not set; skipping migration');
    return;
  }
  console.log('[startup] DATABASE_URL configured, running migrations...');
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'server', 'schema.sql'), 'utf8');
    await query(sql);
    // Ensure goal column exists
    try {
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS goal TEXT");
    } catch (e) {
      console.warn('[startup] goal column ensure failed (non-fatal):', e.message);
    }
    
    // Seed test user if it doesn't exist
    try {
      const testUserExists = await query("SELECT id FROM users WHERE email = $1", ["test@ageless.app"]);
      if (!testUserExists.rows.length) {
        console.log('[startup] Hashing test password...');
        const hash = await bcrypt.hash('Test@123', 10);
        console.log('[startup] Password hashed, inserting test user...');
        await query(
          "INSERT INTO users(email, password_hash, goal) VALUES ($1, $2, $3)",
          ["test@ageless.app", hash, null]
        );
        console.log('[startup] Test user seeded ✓');
      } else {
        console.log('[startup] Test user already exists ✓');
      }
    } catch (e) {
      if (e.code === '23505') { // Unique violation
        console.log('[startup] Test user already exists (duplicate key) ✓');
      } else {
        console.error('[startup] Test user seeding failed:', e.message);
      }
    }
    
    migrated = true;
    console.log('[startup] Database schema ensured ✓');
  } catch (e) {
    console.error('[startup] Migration failed (continuing):', e.message);
  }
}

// ============ API ENDPOINTS ============

console.log('[startup] Registering API routes...');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
console.log('[startup] ✓ GET /api/health');

// Debug endpoint - check database entries count (for debugging sync issues)
app.get('/api/debug/entries-count', async (req, res) => {
  try {
    const { rows } = await query('SELECT COUNT(*) as count FROM entries');
    const entriesCount = parseInt(rows[0]?.count || '0');
    const { rows: userRows } = await query('SELECT COUNT(*) as count FROM users');
    const usersCount = parseInt(userRows[0]?.count || '0');
    res.json({ entriesCount, usersCount, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ GET /api/debug/entries-count');

// Debug endpoint - check entries per user (for debugging user-specific issues)
app.get('/api/debug/entries-by-user', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT u.id, u.email, COUNT(e.id) as entry_count
      FROM users u
      LEFT JOIN entries e ON u.id = e.user_id
      GROUP BY u.id, u.email
      ORDER BY entry_count DESC
    `);
    res.json({ users: rows, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ GET /api/debug/entries-by-user');

// Debug endpoint - only available in development
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/test-user', (req, res) => {
    res.json({ message: 'test-user endpoint works', timestamp: new Date().toISOString() });
  });
  console.log('[startup] ✓ GET /api/debug/test-user (dev only)');
}

// Authentication endpoints
app.post('/api/auth/register', register);
console.log('[startup] ✓ POST /api/auth/register');

app.post('/api/auth/login', login);
console.log('[startup] ✓ POST /api/auth/login');

app.post('/api/mobile/login', login); // Mobile-specific alias
console.log('[startup] ✓ POST /api/mobile/login');

// Protected endpoint - get current user
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    // Token uses 'sub' for user id (JWT standard)
    const userId = req.user.sub || req.user.id;
    const result = await query(
      'SELECT id, email, goal FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ GET /api/me');

// ============ ENTRIES API ============

// GET /api/entries - List all entries for user
app.get('/api/entries', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { rows } = await query(
      `SELECT id, entry_date as date, weight, fitness_data as exercises, created_at, updated_at
       FROM entries WHERE user_id=$1 ORDER BY entry_date DESC`,
      [userId]
    );
    // Transform to expected format
    const entries = rows.map(row => ({
      id: row.id?.toString() || row.date,
      date: row.date,
      userId: userId.toString(),
      weight: row.weight,
      exercises: row.exercises || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    res.json({ entries, total: entries.length, hasMore: false });
  } catch (err) {
    console.error('GET /api/entries error:', err);
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ GET /api/entries');

// GET /api/entries/:date - Get single entry
app.get('/api/entries/:date', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { date } = req.params;
    const { rows } = await query(
      `SELECT id, entry_date as date, weight, fitness_data as exercises, created_at, updated_at
       FROM entries WHERE user_id=$1 AND entry_date=$2`,
      [userId, date]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    const row = rows[0];
    res.json({
      id: row.id?.toString() || row.date,
      date: row.date,
      userId: userId.toString(),
      weight: row.weight,
      exercises: row.exercises || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (err) {
    console.error('GET /api/entries/:date error:', err);
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ GET /api/entries/:date');

// POST /api/entries - Create or update entry
app.post('/api/entries', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { date, exercises, weight } = req.body || {};
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    const fitnessData = exercises || {};
    const { rows } = await query(
      `INSERT INTO entries(user_id, entry_date, weight, fitness_data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, entry_date)
       DO UPDATE SET weight=EXCLUDED.weight, fitness_data=EXCLUDED.fitness_data, updated_at=now()
       RETURNING id, entry_date as date, weight, fitness_data as exercises, created_at, updated_at`,
      [userId, date, weight ?? null, fitnessData]
    );
    const row = rows[0];
    res.json({
      id: row.id?.toString() || row.date,
      date: row.date,
      userId: userId.toString(),
      weight: row.weight,
      exercises: row.exercises || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (err) {
    console.error('POST /api/entries error:', err);
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ POST /api/entries');

// DELETE /api/entries/:date - Delete entry
app.delete('/api/entries/:date', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { date } = req.params;
    await query('DELETE FROM entries WHERE user_id=$1 AND entry_date=$2', [userId, date]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/entries/:date error:', err);
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ DELETE /api/entries/:date');

// ============ SUMMARY API ============

// GET /api/summary - Get weekly summary data
app.get('/api/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { rows } = await query(
      `WITH base AS (
          SELECT (entry_date - EXTRACT(DOW FROM entry_date)::int * INTERVAL '1 day')::date AS week_of_sunday,
                 weight,
                 fitness_data
          FROM entries
          WHERE user_id = $1
        ), weight_agg AS (
          SELECT week_of_sunday, AVG(weight)::numeric(6,2) AS weight_avg
          FROM base
          GROUP BY week_of_sunday
        ), per_key AS (
          SELECT (e.entry_date - EXTRACT(DOW FROM e.entry_date)::int * INTERVAL '1 day')::date AS week_of_sunday,
                 k.key,
                 SUM((k.value)::int) AS sum_val
          FROM entries e
          CROSS JOIN LATERAL jsonb_each_text(e.fitness_data) AS k(key, value)
          WHERE e.user_id = $1
          GROUP BY 1, k.key
        ), totals AS (
          SELECT week_of_sunday, jsonb_object_agg(key, sum_val) AS totals
          FROM per_key
          GROUP BY week_of_sunday
        )
        SELECT w.week_of_sunday,
               w.weight_avg,
               COALESCE(t.totals, '{}'::jsonb) AS totals
        FROM weight_agg w
        LEFT JOIN totals t USING (week_of_sunday)
        ORDER BY w.week_of_sunday DESC;`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/summary error:', err);
    res.status(500).json({ error: err.message });
  }
});
console.log('[startup] ✓ GET /api/summary');

console.log('[startup] All API routes registered!');

// ============ STATIC FILES (React Web App) ============

const distPath = path.join(__dirname, 'dist');

// Serve static files
app.use(express.static(distPath));

// SPA fallback - route all non-API requests to index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ============ START SERVER ============

// Run migrations then start server
runMigrationsOnce().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════╗
║   Ageless App Server Running       ║
╠════════════════════════════════════╣
║ Frontend: http://localhost:${PORT}        ║
║ API:      http://localhost:${PORT}/api  ║
║ Health:   http://localhost:${PORT}/api/health ║
╚════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
