import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { query } from "./db.js";
import fs from 'fs';
import { register, login, requireAuth } from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server directory explicitly
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error('[startup] Failed to load .env:', envResult.error.message);
} else {
  console.log('[startup] Loaded .env from:', envPath);
  console.log('[startup] DATABASE_URL present:', !!process.env.DATABASE_URL);
}

const app = express();

// One-time migration guard
let migrated = false;
async function runMigrationsOnce() {
  if (migrated) return; // already done
  if (!process.env.DATABASE_URL) {
    console.warn('[startup] DATABASE_URL not set; skipping migration');
    return;
  }
  console.log('[startup] DATABASE_URL configured, running migrations...');
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await query(sql);
    // Defensive: ensure 'goal' column exists even if old DB predates change
    try {
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS goal TEXT");
    } catch (e) {
      console.warn('[startup] goal column ensure failed (non-fatal):', e.message);
    }
    migrated = true;
    console.log('[startup] Database schema ensured ✓');
  } catch (e) {
    console.error('[startup] Migration failed (continuing):', e.message);
    console.error('[startup] Full error:', e);
  }
}

// Re-usable safeguard (can be invoked on-demand if registration detects missing column)
async function ensureGoalColumn() {
  try {
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS goal TEXT");
  } catch (e) {
    console.warn('[ensureGoalColumn] failed:', e.message);
  }
}
app.use(helmet());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));
app.use(
  cors({
    origin: "*",
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Determine static base directory with a safe fallback.
// Prefer ../web when present; otherwise fall back to repo root (../) for preview branches.
const WEB_DIR = path.join(__dirname, '../web');
const ROOT_DIR = path.join(__dirname, '..');
const hasWebDir = fs.existsSync(WEB_DIR);
const staticBaseDir = hasWebDir ? WEB_DIR : ROOT_DIR;

// Block direct access to sensitive folders when serving from repo root
if (!hasWebDir) {
  app.use((req, res, next) => {
    if (/^\/(server|scripts|MindBodyHeart)\b/.test(req.path)) {
      return res.status(404).end();
    }
    next();
  });
}

// Precompute current index.html hash for debug (recomputed lazily if file changes)
const indexPath = path.join(staticBaseDir, 'index.html');
function hashFile(p) {
  try { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); } catch { return 'unavailable'; }
}
let indexHash = hashFile(indexPath);
let indexMtime = fs.existsSync(indexPath) ? fs.statSync(indexPath).mtimeMs : 0;
function refreshIndexHashIfChanged() {
  try {
    const stat = fs.statSync(indexPath);
    if (stat.mtimeMs !== indexMtime) {
      indexMtime = stat.mtimeMs;
      indexHash = hashFile(indexPath);
    }
  } catch {/* ignore */}
}

// Capture git commit (Render exposes RENDER_GIT_COMMIT; fallback to reading .git)
let gitCommit = process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null;
if (!gitCommit) {
  try {
    const headPath = path.join(__dirname, '..', '.git', 'HEAD');
    if (fs.existsSync(headPath)) {
      const headRef = fs.readFileSync(headPath, 'utf8').trim();
      if (headRef.startsWith('ref:')) {
        const refPath = headRef.split(' ')[1];
        const refFullPath = path.join(__dirname, '..', '.git', refPath);
        gitCommit = fs.existsSync(refFullPath) ? fs.readFileSync(refFullPath, 'utf8').trim().slice(0,40) : null;
      } else if (/^[0-9a-f]{40}$/i.test(headRef)) {
        gitCommit = headRef.slice(0,40);
      }
    }
  } catch {/* ignore */}
}

// Version header middleware (adds app version + git commit to every response for debugging deploy cache issues)
app.use((req, res, next) => {
  refreshIndexHashIfChanged();
  // Generate per-request nonce for scripts
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.scriptNonce = nonce;
  // Custom CSP header including nonce (allow self + nonce, disallow inline otherwise)
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; font-src 'self' data:; base-uri 'self'; form-action 'self'`);
  if (!res.getHeader('X-App-Version')) {
    res.setHeader('X-App-Version', indexHash.slice(0, 12));
  }
  if (gitCommit && !res.getHeader('X-Commit')) {
    res.setHeader('X-Commit', gitCommit.slice(0,12));
  }
  next();
});

// Serve static files from the chosen base directory
app.use(express.static(staticBaseDir, {
  etag: true,
  lastModified: true,
  cacheControl: true,
  maxAge: '5m'
}));

// Explicit manifest routes (some platforms cache aggressively or rewrite)
app.get(['/manifest.json','/manifest.webmanifest'], (req, res) => {
  const webManifestPath = path.join(staticBaseDir, 'manifest.webmanifest');
  const jsonManifestPath = path.join(staticBaseDir, 'manifest.json');
  const file = req.path.endsWith('.webmanifest') && fs.existsSync(webManifestPath)
    ? webManifestPath
    : (fs.existsSync(jsonManifestPath) ? jsonManifestPath : path.join(ROOT_DIR, 'manifest.json'));
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(file);
});

// Explicit Service Worker route(s) to avoid rewrites and wrong MIME type
// Serve the canonical SW from /service-worker.js and also respond to /web/service-worker.js
app.get(['/service-worker.js', '/web/service-worker.js'], (req, res) => {
  const swPath = path.join(staticBaseDir, 'service-worker.js');
  // Ensure correct headers; prevent caching to avoid stale SW
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  // Optional: allow root scope explicitly (not required at root, but harmless)
  res.setHeader('Service-Worker-Allowed', '/');

  try {
    const text = fs.readFileSync(swPath, 'utf8');
    // Detect accidental merge-conflict markers or HTML mis-serve
    const hasConflict = /<<<<<<<|=======|>>>>>>>/.test(text);
    const looksHtml = /<!DOCTYPE|<html[\s>]/i.test(text.slice(0, 200));
    if (hasConflict || looksHtml) {
      // Serve a minimal, valid SW that immediately unregisters itself and reports the issue.
      const fallback = `/* fallback SW served due to conflict/html detection */\nself.addEventListener('install', e=> self.skipWaiting());\nself.addEventListener('activate', async (e)=>{\n  const clients = await self.clients.matchAll({ includeUncontrolled: true });\n  for (const c of clients) { try { c.postMessage({ type: 'SW_CONFLICT_DETECTED' }); } catch{} }\n  try { await self.registration.unregister(); } catch {}\n  self.clients.claim();\n});\nself.addEventListener('fetch', ()=>{});`;
      return res.status(200).send(fallback);
    }
  } catch (e) {
    // If reading fails, fall back to sending the file via sendFile (may still work if perms differ)
  }
  res.sendFile(swPath);
});

// Root route to handle GET requests to "/"
app.get("/", (req, res) => {
  refreshIndexHashIfChanged();
  res.set({
    'Cache-Control': 'no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Index-SHA256': indexHash
  });
  let html = fs.readFileSync(indexPath, 'utf8');
  if (res.locals.scriptNonce) {
    html = html.replace(/__NONCE__/g, res.locals.scriptNonce);
  }
  // Dynamic cache-bust for main script using index hash (avoids stale SW / browser cache)
  html = html.replace(/app-inline\.js(?:\?v=[^"']*)?/g, `app-inline.js?v=${indexHash.slice(0,8)}`);
  // Cache-bust CSS
  html = html.replace(/app.css\?v=__CSS_VERSION__/g, `app.css?v=${indexHash.slice(0,8)}`);
  res.type('html').send(html);
});

app.get("/healthz", (_, res) => res.json({ ok: true }));

// ---- Auth
app.post("/api/auth/register", async (req, res) => {
  // goal can be string or array of strings (multi-goal)
  const { email, password, goal } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const result = await register(email, password, goal);
    res.json(result);
  } catch (e) {
  // Map common Postgres missing column error to friendly text
  let msg;
  if (/duplicate key/.test(String(e))) msg = "Email already registered";
  else if (/column\s+\"?goal\"?\s+of\s+relation/i.test(String(e))) msg = "Server schema out of date (missing goal column). Please retry shortly.";
  else msg = e.message;
  console.error('[register] failed:', e.message);
    // Automatic recovery attempt if goal column missing
    if (/column\s+\"?goal\"?\s+of\s+relation/i.test(String(e))) {
      await ensureGoalColumn();
      try {
        const retry = await register(email, password, goal);
        return res.json(retry);
      } catch (e2) {
        console.error('[register] retry after ensureGoalColumn failed:', e2.message);
      }
    }
    res.status(400).json({ error: msg });
  }
});

// Forgot password placeholder (TBD implementation - returns 202 to avoid leaking users)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });
  // Intentionally do not reveal whether user exists
  res.status(202).json({ message: 'If the account exists, reset instructions will be sent (placeholder).' });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const result = await login(email, password);
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Token verification endpoint used by frontend FaceID / silent login
app.get("/api/auth/verify", requireAuth, (req, res) => {
  res.json({ user: { id: req.user.sub, email: req.user.email } });
});

app.get("/api/me", requireAuth, async (req, res) => {
  res.json({ id: req.user.sub, email: req.user.email });
});

// ---- Entries
app.get("/api/entries", requireAuth, async (req, res) => {
  const { rows } = await query(
    "select id, user_id, entry_date, weight, fitness_data, created_at, updated_at from entries where user_id=$1 order by entry_date desc",
    [req.user.sub]
  );

  // Transform all entries to match client expectations
  const entries = rows.map(row => ({
    id: String(row.id),
    userId: String(row.user_id),
    date: row.entry_date,
    exercises: row.fitness_data || {},
    weight: row.weight,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  res.json({ entries, total: rows.length, hasMore: false });
});

app.get("/api/entries/:date", requireAuth, async (req, res) => {
  const { date } = req.params; // YYYY-MM-DD
  console.log('[GET /api/entries/:date] Fetching for date:', date);
  const { rows } = await query(
    "select id, user_id, entry_date, weight, fitness_data, created_at, updated_at from entries where user_id=$1 and entry_date=$2",
    [req.user.sub, date]
  );

  const row = rows[0];
  console.log('[GET /api/entries/:date] Database returned:', { date, hasRow: !!row, fitness_data: row?.fitness_data, fitness_dataType: typeof row?.fitness_data });

  if (!row) {
    console.log('[GET /api/entries/:date] No row found, returning null');
    return res.json(null);
  }

  // Transform to match client expectations
  const entry = {
    id: String(row.id),
    userId: String(row.user_id),
    date: row.entry_date,
    exercises: row.fitness_data || {},
    weight: row.weight,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  console.log('[GET /api/entries/:date] Returning entry:', { date, exerciseKeys: Object.keys(entry.exercises), exercises: entry.exercises });
  res.json(entry);
});

app.post("/api/entries", requireAuth, async (req, res) => {
  const { date, weight, fitnessData } = req.body || {};
  console.log('[POST /api/entries] ===== SAVE REQUEST =====');
  console.log('[POST /api/entries] Received:', { date, weight, fitnessData, fitnessDataType: typeof fitnessData, fitnessDataKeys: Object.keys(fitnessData || {}), fitnessDataString: JSON.stringify(fitnessData) });

  if (!date || !fitnessData) return res.status(400).json({ error: "date and fitnessData required" });

  // Convert to JSON string if needed for JSONB storage
  const fitnessDataForDB = typeof fitnessData === 'string' ? fitnessData : JSON.stringify(fitnessData);
  console.log('[POST /api/entries] Inserting with:', { userId: req.user.sub, date, weight: weight ?? null, fitnessDataForDB });

  const { rows } = await query(
    `insert into entries(user_id, entry_date, weight, fitness_data)
     values ($1,$2,$3,$4::jsonb)
     on conflict (user_id, entry_date)
     do update set weight=excluded.weight, fitness_data=excluded.fitness_data, updated_at=now()
     returning id, user_id, entry_date, weight, fitness_data, created_at, updated_at`,
    [req.user.sub, date, weight ?? null, fitnessDataForDB]
  );

  const row = rows[0];
  console.log('[POST /api/entries] Database returned:', { id: row.id, fitness_data: row.fitness_data, fitness_dataType: typeof row.fitness_data, fitness_dataKeys: Object.keys(row.fitness_data || {}) });

  // Transform to match client expectations
  const entry = {
    id: String(row.id),
    userId: String(row.user_id),
    date: row.entry_date,
    exercises: row.fitness_data || {},
    weight: row.weight,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  console.log('[POST /api/entries] Returning:', { exerciseKeys: Object.keys(entry.exercises), exercises: entry.exercises });
  console.log('[POST /api/entries] ===== END SAVE =====');
  res.json(entry);
});

app.delete("/api/entries/:date", requireAuth, async (req, res) => {
  const { date } = req.params;
  await query("delete from entries where user_id=$1 and entry_date=$2", [req.user.sub, date]);
  res.json({ ok: true });
});

// ---- Summary (group by Sunday-of-week)
app.get("/api/summary", requireAuth, async (req, res) => {
  try {
    /*
      Requirements implemented:
      - Compute true Sunday for each entry (no subtract-one-day hack). We derive Sunday by subtracting EXTRACT(DOW) days (Postgres: Sunday = 0).
      - Do NOT fabricate / enumerate Sundays without entries; only weeks having at least one entry appear.
      - Include weeks even if fitness_data is empty or only weight recorded (LEFT JOIN aggregated exercise totals).
    */
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

// Catch-all handler: send back index.html for any non-API routes
app.get('/debug/index-meta', (req, res) => {
  refreshIndexHashIfChanged();
  res.json({ hash: indexHash, mtime: indexMtime, size: fs.existsSync(indexPath) ? fs.statSync(indexPath).size : 0 });
});

app.get('/debug/csp', (req, res) => {
  // Helmet default may not set CSP; upstream/CDN might. We echo what we see.
  const csp = res.getHeader('Content-Security-Policy') || res.getHeader('content-security-policy') || 'absent';
  res.json({ cspSource: csp, note: 'If CSP is absent here but browser shows one, it is injected upstream (platform or CDN).'});
});

// Report which static base is currently active (web vs repo root)
app.get('/debug/static-base', (req, res) => {
  res.json({
    hasWebDir,
    staticBaseDir,
    indexPath,
    files: {
      indexExists: fs.existsSync(indexPath),
      swExists: fs.existsSync(path.join(staticBaseDir, 'service-worker.js')),
      manifestJsonExists: fs.existsSync(path.join(staticBaseDir, 'manifest.json')),
      manifestWebExists: fs.existsSync(path.join(staticBaseDir, 'manifest.webmanifest')),
    }
  });
});

// Inspect deployed Service Worker file to diagnose eval/MIME issues
app.get('/debug/sw', (req, res) => {
  try {
    const swPath = path.join(staticBaseDir, 'service-worker.js');
    const text = fs.readFileSync(swPath, 'utf8');
    const stat = fs.statSync(swPath);
    const sha = hashFile(swPath);
    res.json({
      path: swPath,
      size: stat.size,
      mtime: stat.mtimeMs,
      sha256: sha,
      head: text.slice(0, 200),
      conflict: /<<<<<<<|=======|>>>>>>>/.test(text),
      looksHtml: /<!DOCTYPE|<html[\s>]/i.test(text.slice(0, 200))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Simple version endpoint to confirm deploy commit & assets served
app.get('/version', (req, res) => {
  refreshIndexHashIfChanged();
  res.json({
    commit: gitCommit || null,
    branch: process.env.RENDER_GIT_BRANCH || process.env.GIT_BRANCH || null,
    indexHash,
    time: new Date().toISOString(),
    node: process.version
  });
});

app.get('*', (req, res) => {
  refreshIndexHashIfChanged();
  res.set({
    'Cache-Control': 'no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Index-SHA256': indexHash
  });
  let html = fs.readFileSync(indexPath, 'utf8');
  if (res.locals.scriptNonce) {
    html = html.replace(/__NONCE__/g, res.locals.scriptNonce);
  }
  html = html.replace(/app-inline\.js(?:\?v=[^"']*)?/g, `app-inline.js?v=${indexHash.slice(0,8)}`);
  html = html.replace(/app.css\?v=__CSS_VERSION__/g, `app.css?v=${indexHash.slice(0,8)}`);
  res.type('html').send(html);
});

const port = process.env.PORT || 10000;
app.listen(port, async () => {
  console.log(`API listening on :${port}`);
  await runMigrationsOnce();
});
