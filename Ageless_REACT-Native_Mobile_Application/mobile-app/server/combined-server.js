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

// Load server auth/db modules
import { register, login, requireAuth } from "./auth.js";
import { query } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));
app.use(cors({
  origin: "*",
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    migrated = true;
    console.log('[startup] Database schema ensured ✓');
  } catch (e) {
    console.error('[startup] Migration failed (continuing):', e.message);
  }
}

// ============ API ENDPOINTS ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication endpoints
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/mobile/login', login); // Mobile-specific alias

// Protected endpoint - get current user
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, goal FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Summary (52-week weekly totals grouped by Sunday)
app.get("/api/summary", requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `with base as (
          select (entry_date - extract(dow from entry_date)::int * interval '1 day')::date as week_of_sunday,
                 weight,
                 fitness_data
          from entries
          where user_id = $1
        ), weight_agg as (
          select week_of_sunday, avg(weight)::numeric(6,2) as weight_avg
          from base
          group by week_of_sunday
        ), per_key as (
          select (e.entry_date - extract(dow from e.entry_date)::int * interval '1 day')::date as week_of_sunday,
                 k.key,
                 sum((k.value)::int) as sum_val
          from entries e
          cross join lateral jsonb_each_text(e.fitness_data) as k(key, value)
          where e.user_id = $1
          group by 1, k.key
        ), totals as (
          select week_of_sunday, jsonb_object_agg(key, sum_val) as totals
          from per_key
          group by week_of_sunday
        )
        select w.week_of_sunday,
               w.weight_avg,
               coalesce(t.totals, '{}'::jsonb) as totals
        from weight_agg w
        left join totals t using (week_of_sunday)
        order by w.week_of_sunday desc;`,
      [req.user.sub]
    );
    res.json(rows);
  } catch (error) {
    console.error("Summary endpoint error:", error);
    res.status(500).json({ error: "Failed to fetch summary data: " + error.message });
  }
});

// ============ STATIC FILES (React Web App) ============

const distPath = path.join(__dirname, 'dist');

// Serve static files
app.use(express.static(distPath));

// SPA fallback - route all non-API requests to index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
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
