import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_TTL = "30d";

// Core auth functions (used by route handlers)

async function registerUser(email, password, goal) {
  const hash = await bcrypt.hash(password, 10);
  // Accept goal as: null | string | string[]
  let storedGoal = null;
  if (Array.isArray(goal)) {
    // Deduplicate & sanitize length
    const cleaned = [...new Set(goal.map(g => String(g).trim()).filter(g => g))];
    storedGoal = cleaned.length ? JSON.stringify(cleaned) : null;
  } else if (goal) {
    storedGoal = String(goal).trim() || null;
  }
  const { rows } = await query(
    "insert into users(email, password_hash, goal) values ($1,$2,$3) returning id, email, goal, created_at",
    [email.toLowerCase(), hash, storedGoal]
  );
  return issueToken(rows[0]);
}

async function loginUser(email, password) {
  const { rows } = await query("select * from users where email=$1", [email.toLowerCase()]);
  if (!rows.length) throw new Error("Invalid credentials");
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("Invalid credentials");
  return issueToken(user);
}

function issueToken(user) {
  let parsedGoal = null;
  if (user.goal) {
    try {
      parsedGoal = JSON.parse(user.goal);
    } catch {
      parsedGoal = user.goal; // legacy single string
    }
  }
  const payload = { sub: user.id, email: user.email, goal: parsedGoal };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
  return { token, user: { id: user.id, email: user.email, goal: parsedGoal } };
}

// Express route handlers

export async function register(req, res) {
  try {
    const { email, password, goal } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    const result = await registerUser(email, password, goal);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

function issueToken(user) {
  let parsedGoal = null;
  if (user.goal) {
    try {
      parsedGoal = JSON.parse(user.goal);
    } catch {
      parsedGoal = user.goal; // legacy single string
    }
  }
  const payload = { sub: user.id, email: user.email, goal: parsedGoal };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
  return { token, user: { id: user.id, email: user.email, goal: parsedGoal } };
}

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
