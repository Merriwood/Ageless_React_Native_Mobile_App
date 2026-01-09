import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_TTL = "30d";

export async function register(email, password) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    "insert into users(email, password_hash) values ($1,$2) returning id, email, created_at",
    [email.toLowerCase(), hash]
  );
  return issueToken(rows[0]);
}

export async function login(email, password) {
  const { rows } = await query("select * from users where email=$1", [email.toLowerCase()]);
  if (!rows.length) throw new Error("Invalid credentials");
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("Invalid credentials");
  return issueToken(user);
}

function issueToken(user) {
  const payload = { sub: user.id, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
  return { token, user: { id: user.id, email: user.email } };
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
