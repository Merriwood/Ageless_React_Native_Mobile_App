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

export function issueToken(user) {
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
    console.log('[register] Attempt:', { email, passwordLength: password?.length });
    if (!email || !password) {
      const errorMsg = "email and password required";
      console.log('[register] Validation failed:', errorMsg);
      return res.status(400).json({ error: errorMsg });
    }
    const result = await registerUser(email, password, goal);
    console.log('[register] Success:', { email, userId: result.user?.id });
    res.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorCode = err?.code;
    console.error('[register] Error caught:', {
      message: errorMessage,
      code: errorCode,
      type: err instanceof Error ? 'Error' : typeof err,
      fullError: err
    });

    // Handle duplicate email error (PostgreSQL unique constraint violation)
    if (errorCode === '23505' || errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
      const response = { error: "This email is already registered" };
      console.log('[register] Sending duplicate email error:', response);
      return res.status(400).json(response);
    }

    const response = { error: errorMessage };
    console.log('[register] Sending error response:', { status: 400, response });
    res.status(400).json(response);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log('[login] Attempt:', { email, passwordLength: password?.length });
    if (!email || !password) {
      const errorMsg = "email and password required";
      console.log('[login] Validation failed:', errorMsg);
      return res.status(400).json({ error: errorMsg });
    }
    const result = await loginUser(email, password);
    console.log('[login] Success:', { email, tokenLength: result.token?.length, userId: result.user?.id });
    res.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[login] Error caught:', {
      message: errorMessage,
      type: err instanceof Error ? 'Error' : typeof err,
      fullError: err
    });

    const response = { error: errorMessage };
    console.log('[login] Sending error response:', { status: 401, response });
    res.status(401).json(response);
  }
}

export async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.sub || req.user.id;

    console.log('[changePassword] Attempt for userId:', userId);

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "oldPassword and newPassword required" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from old password" });
    }

    // Get user's current password hash
    const { rows } = await query('SELECT id, password_hash FROM users WHERE id = $1', [userId]);
    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    // Verify old password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!passwordMatch) {
      console.log('[changePassword] Old password mismatch for userId:', userId);
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash and update new password
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);

    console.log('[changePassword] Success for userId:', userId);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error('[changePassword] Error:', err.message);
    res.status(500).json({ error: "Failed to change password" });
  }
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
