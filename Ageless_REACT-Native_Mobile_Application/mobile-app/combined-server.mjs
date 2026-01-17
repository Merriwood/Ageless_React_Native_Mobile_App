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
