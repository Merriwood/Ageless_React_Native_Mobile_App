import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import compression from "compression"; // Add compression
import rateLimit from "express-rate-limit"; // Add rate limiting
import { fileURLToPath } from 'url';
import { query } from "./db.js";
import { register, login, requireAuth } from "./auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit auth attempts
  message: { error: "Too many auth attempts" }
});

// Apply middleware
app.use(limiter);
app.use(compression()); // Gzip compression
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL || false
    : "*",
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files with caching
const staticOptions = {
  maxAge: process.env.NODE_ENV === "production" ? '1d' : 0,
  etag: true,
  lastModified: true
};
app.use(express.static(path.join(__dirname, '../web'), staticOptions));

// Health check endpoint
app.get("/healthz", (_, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0"
  });
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Auth endpoints with rate limiting
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  
  // Enhanced validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  
  try {
    const result = await register(email.toLowerCase().trim(), password);
    res.json(result);
  } catch (e) {
    const msg = /duplicate key/.test(String(e)) ? "Email already registered" : "Registration failed";
    res.status(400).json({ error: msg });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  
  try {
    const result = await login(email.toLowerCase().trim(), password);
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Protected endpoints
app.get("/api/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await query("SELECT email FROM users WHERE id = $1", [req.user.sub]);
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Optimized entries endpoint with pagination
app.get("/api/entries", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    
    const { rows } = await query(`
      SELECT entry_date, weight, fitness_data 
      FROM entries 
      WHERE user_id = $1 
      ORDER BY entry_date DESC 
      LIMIT $2 OFFSET $3
    `, [req.user.sub, limit, offset]);
    
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.get("/api/entries/:date", requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT entry_date, weight, fitness_data FROM entries WHERE user_id = $1 AND entry_date = $2",
      [req.user.sub, req.params.date]
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch entry" });
  }
});

// Enhanced entry creation with validation
app.post("/api/entries", requireAuth, async (req, res) => {
  const { date, weight, fitnessData } = req.body || {};
  
  // Validation
  if (!date || !fitnessData || typeof fitnessData !== 'object') {
    return res.status(400).json({ error: "Invalid entry data" });
  }
  
  if (weight !== null && (isNaN(weight) || weight < 50 || weight > 1000)) {
    return res.status(400).json({ error: "Weight must be between 50-1000 lbs" });
  }
  
  // Validate fitness data
  const validExercises = ["Bike", "Abs", "Chest Press", "Leg Press", "Lat", "Military", "Crunch", "Bicep Curls", "Triceps", "Overhead Pull", "Row"];
  for (const [exercise, sets] of Object.entries(fitnessData)) {
    if (!validExercises.includes(exercise)) {
      return res.status(400).json({ error: `Invalid exercise: ${exercise}` });
    }
    if (!Number.isInteger(sets) || sets < 0 || sets > 10) {
      return res.status(400).json({ error: `Invalid sets for ${exercise}: must be 0-10` });
    }
  }
  
  try {
    const { rows } = await query(`
      INSERT INTO entries(user_id, entry_date, weight, fitness_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, entry_date)
      DO UPDATE SET 
        weight = EXCLUDED.weight, 
        fitness_data = EXCLUDED.fitness_data, 
        updated_at = NOW()
      RETURNING entry_date, weight, fitness_data, updated_at
    `, [req.user.sub, date, weight, fitnessData]);
    
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to save entry" });
  }
});

app.delete("/api/entries/:date", requireAuth, async (req, res) => {
  try {
    await query("DELETE FROM entries WHERE user_id = $1 AND entry_date = $2", 
      [req.user.sub, req.params.date]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Optimized summary endpoint using the database function
app.get("/api/summary", requireAuth, async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM get_user_summary($1)", [req.user.sub]);
    res.json(rows);
  } catch (e) {
    console.error("Summary error:", e);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
