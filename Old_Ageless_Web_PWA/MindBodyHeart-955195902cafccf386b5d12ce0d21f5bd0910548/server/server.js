import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import bcrypt from "bcryptjs";
import { query } from "./db.js";
import { register, login, requireAuth } from "./auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
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

// Serve static files from the web directory
app.use(express.static(path.join(__dirname, '../web')));

// Root route to handle GET requests to "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

app.get("/healthz", async (_, res) => {
  try {
    // Test database connection
    const dbResult = await query("SELECT 1 as test");
    const dbConnected = dbResult.rows[0].test === 1;
    
    res.json({ 
      ok: true,
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
      environment: process.env.NODE_ENV || "development",
      databaseUrl: process.env.DATABASE_URL ? "configured" : "missing"
    });
  } catch (error) {
    console.error("Health check database error:", error.message);
    res.status(500).json({ 
      ok: false,
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
      environment: process.env.NODE_ENV || "development",
      databaseUrl: process.env.DATABASE_URL ? "configured" : "missing"
    });
  }
});

// ---- Auth
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const result = await register(email, password);
    res.json(result);
  } catch (e) {
    const msg = /duplicate key/.test(String(e)) ? "Email already registered" : e.message;
    res.status(400).json({ error: msg });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    console.log("🔐 Login attempt for:", email);
    const result = await login(email, password);
    console.log("✅ Login successful for:", email);
    res.json(result);
  } catch (e) {
    console.error("❌ Login failed for:", email, "Error:", e.message);
    
    // Check if it's a database connection error
    if (e.message.includes('connect') || e.message.includes('connection') || 
        e.message.includes('ECONNREFUSED') || e.message.includes('timeout')) {
      console.error("🔥 Database connection error during login");
      return res.status(503).json({ error: "Service temporarily unavailable" });
    }
    
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/auth/verify", requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name
    }
  });
});

app.get("/api/me", requireAuth, async (req, res) => {
  res.json({ id: req.user.sub, email: req.user.email });
});

// ---- Entries
app.get("/api/entries", requireAuth, async (req, res) => {
  const { rows } = await query(
    "select entry_date, weight, fitness_data, created_at, updated_at from entries where user_id=$1 order by entry_date desc",
    [req.user.sub]
  );
  res.json(rows);
});

app.get("/api/entries/:date", requireAuth, async (req, res) => {
  const { date } = req.params; // YYYY-MM-DD
  const { rows } = await query(
    "select entry_date, weight, fitness_data from entries where user_id=$1 and entry_date=$2",
    [req.user.sub, date]
  );
  res.json(rows[0] || null);
});

app.post("/api/entries", requireAuth, async (req, res) => {
  const { date, weight, fitnessData } = req.body || {};
  if (!date || !fitnessData) return res.status(400).json({ error: "date and fitnessData required" });
  const { rows } = await query(
    `insert into entries(user_id, entry_date, weight, fitness_data)
     values ($1,$2,$3,$4)
     on conflict (user_id, entry_date)
     do update set weight=excluded.weight, fitness_data=excluded.fitness_data, updated_at=now()
     returning entry_date, weight, fitness_data, updated_at`,
    [req.user.sub, date, weight ?? null, fitnessData]
  );
  res.json(rows[0]);
});

app.delete("/api/entries/:date", requireAuth, async (req, res) => {
  const { date } = req.params;
  await query("delete from entries where user_id=$1 and entry_date=$2", [req.user.sub, date]);
  res.json({ ok: true });
});

// ---- Debug endpoint to check database schema
app.get("/api/debug-schema", requireAuth, async (req, res) => {
  try {
    // Check what tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    // Check entries table columns
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'entries'
      ORDER BY ordinal_position
    `);
    
    // Check if user has entries
    const entryCount = await query("SELECT COUNT(*) as count FROM entries WHERE user_id = $1", [req.user.sub]);
    
    // Sample entry
    const sampleEntry = await query("SELECT * FROM entries WHERE user_id = $1 LIMIT 1", [req.user.sub]);
    
    res.json({
      tables: tables.rows,
      columns: columns.rows,
      userEntryCount: entryCount.rows[0],
      sampleEntry: sampleEntry.rows[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- Summary (group by Sunday-of-week)
app.get("/api/summary", requireAuth, async (req, res) => {
  try {
    console.log("Building real weekly summary...");
    
    // Build the summary in steps to avoid complex CTE issues
    
    // Step 1: Get all user entries
    const entries = await query(
      "SELECT entry_date, weight, fitness_data FROM entries WHERE user_id = $1 ORDER BY entry_date DESC",
      [req.user.sub]
    );
    
    console.log(`Found ${entries.rows.length} total entries`);
    
    if (entries.rows.length === 0) {
      return res.json([]);
    }
    
    // Step 2: Process data in JavaScript to build weekly summaries
    const weeklyData = {};
    
    entries.rows.forEach((entry, index) => {
      try {
        // Calculate Sunday of the week more precisely
        let entryDate;
        if (entry.entry_date instanceof Date) {
          entryDate = entry.entry_date;
        } else {
          // Handle string dates
          const dateStr = entry.entry_date.toString();
          entryDate = new Date(dateStr);
        }
        
        console.log(`Processing entry ${index}: date=${entry.entry_date}, parsed=${entryDate}`);
        
        if (isNaN(entryDate.getTime())) {
          console.log(`Invalid date for entry ${index}: ${entry.entry_date}`);
          return; // Skip this entry
        }
        
        // Calculate Sunday of this week more precisely
        const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
        const sunday = new Date(entryDate);
        
        // If today is Sunday (dayOfWeek = 0), use today
        // If today is Monday (dayOfWeek = 1), subtract 1 day to get Sunday
        // If today is Tuesday (dayOfWeek = 2), subtract 2 days to get Sunday, etc.
        sunday.setDate(entryDate.getDate() - dayOfWeek);
        
        const sundayKey = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
        
        console.log(`Entry: ${entry.entry_date} (${entryDate.toDateString()}, day ${dayOfWeek}) -> Sunday: ${sundayKey} (${sunday.toDateString()}, day ${sunday.getDay()})`);
        
        // Double-check that calculated Sunday is actually a Sunday
        if (sunday.getDay() !== 0) {
          console.error(`ERROR: Calculated Sunday ${sundayKey} is not actually a Sunday! Day of week: ${sunday.getDay()}`);
        }
        
        if (!weeklyData[sundayKey]) {
          weeklyData[sundayKey] = {
            week_of_sunday: sundayKey,
            weights: [],
            exercises: {}
          };
        }
        
        // Add weight if exists
        if (entry.weight) {
          weeklyData[sundayKey].weights.push(parseFloat(entry.weight));
        }
        
        // Add exercises
        if (entry.fitness_data && typeof entry.fitness_data === 'object') {
          Object.keys(entry.fitness_data).forEach(exercise => {
            const sets = parseInt(entry.fitness_data[exercise]) || 0;
            if (sets > 0) {
              weeklyData[sundayKey].exercises[exercise] = 
                (weeklyData[sundayKey].exercises[exercise] || 0) + sets;
            }
          });
        }
      } catch (dateError) {
        console.error(`Error processing entry ${index}:`, dateError, entry);
      }
    });
    
    // Step 3: Convert to final format with proper Sunday dates
    const result = Object.keys(weeklyData)
      .sort((a, b) => b.localeCompare(a)) // Sort by date descending (newest first)
      .slice(0, 12) // Last 12 weeks
      .map(sundayKey => {
        const week = weeklyData[sundayKey];
        const weight_avg = week.weights.length > 0 
          ? Math.round((week.weights.reduce((a, b) => a + b, 0) / week.weights.length) * 100) / 100
          : null;
          
        // Ensure the date is properly formatted for JavaScript Date parsing
        // Format: YYYY-MM-DD which JavaScript will parse as local date
        return {
          week_of_sunday: sundayKey, // Already in YYYY-MM-DD format
          weight_avg: weight_avg,
          totals: week.exercises
        };
      });
    
    console.log(`Returning ${result.length} weeks of data`);
    console.log("Weekly data keys:", Object.keys(weeklyData));
    console.log("Sample week with Sunday verification:", result[0]);
    
    // Verify the first Sunday date
    if (result.length > 0) {
      const firstSunday = new Date(result[0].week_of_sunday);
      console.log(`First Sunday: ${result[0].week_of_sunday} -> ${firstSunday.toDateString()} (day ${firstSunday.getDay()})`);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error("Summary endpoint error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch summary data: " + error.message });
  }
});

// Catch-all handler: send back index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`🚀 API listening on :${port}`);
  
  // Test database connection after server starts
  setTimeout(async () => {
    try {
      console.log("🔍 Testing database connection...");
      await query("SELECT 1 as test");
      console.log("✅ Database connection successful");
      
      // Create demo user if it doesn't exist
      await createDemoUser();
    } catch (error) {
      console.error("❌ Database connection failed on startup:");
      console.error("Error:", error.message);
      console.error("DATABASE_URL configured:", !!process.env.DATABASE_URL);
      console.error("Environment:", process.env.NODE_ENV || "development");
    }
  }, 1000);
});

async function createDemoUser() {
  try {
    const demoEmail = 'demo@test.com';
    const demoPassword = 'demo123';
    
    // Check if demo user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [demoEmail]);
    
    if (existingUser.rows.length === 0) {
      // Create demo user
      const hashedPassword = await bcrypt.hash(demoPassword, 10);
      await query(
        'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, NOW())',
        [demoEmail, hashedPassword, 'Demo User']
      );
      console.log('✅ Demo user created successfully');
    } else {
      console.log('ℹ️ Demo user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
  }
}
