# Backend & Data Context Specification
Version: 2025-08-24
Scope: Server (Express API), PostgreSQL schema, data contracts, persistence & non-functional requirements for the Fitness Tracker PWA.
Audience: Backend / Full‑stack Engineers, QA, Security Review.

---
## 1. Objectives
- Provide a minimal, explicit REST API for user auth & workout tracking.
- Preserve cumulative daily workout data; overwrites only via explicit user action.
- Maintain deterministic schemas & contracts to avoid client drift.
- Support offline-first client (idempotent day updates, tolerant of delayed writes).

Non‑Goals (Current Phase):
- Partial set patching (fine-grained field merges) — we use full daily overwrite.
- Real-time push / websocket streaming.
- Multi-tenant org scoping (single user namespace only).

---
## 2. Environment & Configuration
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| DATABASE_URL | YES (prod) | Postgres connection string | postgresql://user:pass@host:5432/db |
| JWT_SECRET | YES | HMAC secret for signing auth tokens | (>=32 random chars) |
| NODE_ENV | Optional | Controls logging detail & Helmet behavior | production |
| PORT | Optional | HTTP port | 10000 |

Defaults: `JWT_SECRET` falls back to "dev-secret" ONLY in development — MUST override in production.

---
## 3. Data Model (Relational + JSONB)
### 3.1 users
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | SERIAL PK | UNIQUE | Surrogate key |
| email | varchar(255) | UNIQUE NOT NULL | Lowercased for canonical form |
| password_hash | varchar(255) | NOT NULL | bcrypt hash (10 salt rounds) |
| created_at | timestamp | default now | Audit only |

### 3.2 entries
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | SERIAL PK | UNIQUE | Surrogate key |
| user_id | int | FK users(id) ON DELETE CASCADE | Ownership |
| entry_date | date | NOT NULL | Calendar day (UTC) |
| weight | decimal(5,2) | nullable | Optional weight (lbs) |
| fitness_data | jsonb | NOT NULL default '{}' | { ExerciseName: setsInt } |
| created_at | timestamp | default now | Audit insert |
| updated_at | timestamp | default now | Audit last overwrite |
| UNIQUE(user_id, entry_date) | | | Enforces at most one logical daily record |

Indexes: `idx_entries_user_date`, `idx_entries_date` accelerate retrieval & summary queries.

### 3.3 Derived Weekly Summary
Not persisted as table; computed per request grouping entries by week (Sunday anchor). Fallback query provided for resiliency.

---
## 4. API Surface (Stable Contracts)
All responses JSON. All timestamps (when present) are ISO 8601 or date strings (YYYY-MM-DD). Auth required endpoints use `Authorization: Bearer <jwt>`.

### 4.1 Authentication
POST /api/auth/register
- Body: { email:string, password:string }
- 200: { token, user:{ id, email } }
- 400: { error: "Email already registered" | validation }

POST /api/auth/login
- Body identical
- 200: { token, user:{ id, email } }
- 401: { error: "Invalid credentials" }

GET /api/me
- Auth required
- 200: { id, email }
- 401: { error: "Unauthorized" }

Token TTL: 30d (configurable by code constant TOKEN_TTL).

### 4.2 Entries
GET /api/entries
- 200: [ { entry_date, weight, fitness_data, created_at, updated_at } ] (descending by date)
- 401: unauthorized

GET /api/entries/:date
- Param date: YYYY-MM-DD (UTC day)
- 200: { entry_date, weight, fitness_data } | null

POST /api/entries
- Body: { date:YYYY-MM-DD, weight: number|null, fitnessData: { <ExerciseName>: setsInt } }
- Behavior: Insert or upsert (overwrite) daily record; sets full replacement (not merge).
- 200: { entry_date, weight, fitness_data, updated_at }
- 400: missing fields

DELETE /api/entries/:date
- 200: { ok:true }
- Idempotent: Deleting non-existent date effectively returns { ok:true } (currently always true after query).

### 4.3 Summary
GET /api/summary
- 200: [ { week_of_sunday: YYYY-MM-DD, weight_avg: string|null, totals: { ExerciseName: totalSetsInt } } ] sorted desc
- 401: unauthorized
- 500: { error: "Failed to fetch summary data: ..." }

---
## 5. Validation & Normalization
| Field | Rules |
|-------|-------|
| email | Lowercased; must contain '@'; uniqueness enforced by DB |
| password | Min length (no server-side complexity enforced yet) |
| date | Must be valid date string (YYYY-MM-DD) | 
| fitnessData | Each value integer 0..MAX_SETS (client ensures; server trusts currently) |
| weight | Optional decimal; truncated to 2 dp by schema |

Enhancement Backlog: enforce server-side numeric bounds for sets; reject negative values or > configured MAX_SETS.

---
## 6. Authorization & Security
- Mechanism: JWT (HMAC SHA-256) with payload { sub:user.id, email }.
- Revocation: None built-in (manual secret rotation or token TTL expiry).
- Password Hash: bcrypt 10 rounds (increase to 12+ for higher security if performance acceptable).
- Helmet: applied globally (default CSP; inline scripts removed client-side to comply).
- CORS: `origin: *` (safe because credentials=false). Tighten to explicit origins if needed.
- Data Isolation: All entry queries constrained by `user_id = req.user.sub`.

Hardening Opportunities:
1. Explicit Helmet CSP configuration (script-src 'self', connect-src 'self').
2. Rate limiting auth endpoints (e.g., 5 attempts / minute / IP).
3. Password policy enforcement & error normalization to avoid enumeration.
4. Audit log table for security events (login failures, deletions).
5. Secret management via platform environment (no default fallback in prod).

---
## 7. Idempotency & Offline Strategy
- Daily upsert is idempotent: multiple POSTs with same date fully replace record (latest wins).
- Client outbox merges multiple offline edits by keeping last payload per date to minimize conflicts.
- Conflict Handling: Last-write-wins (server always overwrites). Future: include `updated_at` in client request; server could reject if stale.

---
## 8. Error Model
| Category | Status | Shape |
|----------|--------|-------|
| Auth missing/invalid | 401 | { error:"Unauthorized" } |
| Auth credential invalid | 401 (login) | { error:"Invalid credentials" } |
| Validation | 400 | { error:"<message>" } |
| Duplicate email | 400 | { error:"Email already registered" } |
| Server/unexpected | 500 | { error:"<message>" } |

Always a single `error` field — no nested codes presently.

---
## 9. Performance & Scalability
Current Scale Assumptions: low concurrency, per-user daily writes small (≤1/day typical).

Optimizations Already in Place:
- Composite unique index (user_id, entry_date) for upsert.
- JSONB enables flexible exercise set counts without schema migration.

Future Enhancements:
| Concern | Strategy |
|---------|----------|
| Summary query cost | Materialized view or per-entry triggers to increment weekly rollups |
| Large histories | Pagination (cursor by date) for /api/entries |
| High login volume | Add in-memory rate limiter (token bucket) |
| Cold starts | Pre-warm DB connection pool; add health check ping |

---
## 10. Migrations
Current: Simple bootstrap executing `schema.sql` on startup (idempotent CREATE IF NOT EXISTS). No version tracking table.

Future Migration Framework:
- Create `schema_migrations(version text primary key, applied_at timestamp)`.
- Each migration file `VXXX__desc.sql`. Apply sequentially.
- Rollback strategy: separate `RXXX__desc.sql` as needed.

---
## 11. Data Consistency Rules
| Rule | Enforcement Layer |
|------|-------------------|
| One row per (user, date) | DB UNIQUE constraint |
| Only authenticated user can read/write their entries | middleware + whitelisted queries |
| Weekly summary uses only authenticated user data | query filter |
| Email uniqueness | DB unique constraint |
| Password secrecy | bcrypt hash; never logged |

---
## 12. Testing Requirements (Backend)
| Test | Description |
|------|------------|
| Register & login cycle | Creates user, logs in, returns JWT containing email |
| Duplicate email | Second register returns 400 duplicate message |
| Unauthorized access | /api/entries without token -> 401 |
| Create/Upsert entry | POST same date twice -> second overwrites weight & sets |
| Get specific date | After upsert returns correct JSONB contents |
| Summary aggregation | Insert multiple days in same week -> aggregated totals correct |
| Delete entry | Deletes row; GET returns null |
| JWT expiry (simulated) | After tamper or expiration -> 401 repeatedly |

---
## 13. Logging & Observability
| Event | Log Level | Example |
|-------|-----------|---------|
| Startup migration ensured | info | [startup] Database schema ensured |
| Migration failure | error | [startup] Migration failed ... |
| Login success | (optional) debug | (not currently logged) |
| Summary fallback | info | Complex query failed, trying simple version: ... |
| Summary fatal error | error | Summary endpoint error: ... |

Enhancements: Structured JSON logs, correlation IDs, request latency metrics.

---
## 14. Security Backlog
1. Replace `origin: *` CORS with allowlist (env configured).
2. Add rate limiting and account lockout window.
3. Introduce refresh tokens & short-lived access tokens (15m) for improved revocation.
4. Add password complexity & breach reuse check (HIBP API). 
5. Enforce HTTPS redirect at edge.
6. Implement content-security-policy explicitly (Helmet config).

---
## 15. API Evolution Policy
- Additive changes only (new fields optional for clients) until major version bump.
- Breaking change requires: versioned path `/v2/` OR negotiation via `Accept` header (not yet implemented).
- Deprecation window: announce in CHANGELOG, maintain old field for ≥30 days.

---
## 16. Backup & Recovery (DB)
Recommended (Platform / DevOps):
- Daily automated snapshot of Postgres.
- Point-in-time recovery (PITR) if provider supports.
- Test restore quarterly: spin up clone, validate schema & queries.

---
## 17. Threat Model (Summary)
| Threat | Mitigation |
|--------|-----------|
| Credential brute force | Rate limiting (backlog) |
| Token theft (XSS) | CSP + no inline scripts + future cookie HttpOnly alt |
| Data exfil via multi-user queries | Strict `user_id` filters |
| Replay of stale offline payload overwriting newer data | Future: conditional upsert with `updated_at` check |
| Secret leakage (default dev secret in prod) | Deployment validation / CI check |

---
## 18. Client Interaction Assumptions
- Client WILL NOT issue partial PATCH to entries (only full POST replacement).
- Client ensures integer set counts within expected range before POST.
- Client does not rely on entry `id` (prefers `entry_date` as logical key).

---
## 19. Future Extensions
| Feature | Impact |
|---------|--------|
| Exercise catalog customization | Add exercises table + user_exercises mapping; extend fitness_data validation |
| Multi-device conflict detection | Include `clientUpdatedAt` and compare with server `updated_at` |
| Export / Import | Add signed URL endpoint generating JSON export |
| Aggregated analytics | Precompute monthly/yearly tables |
| Notifications | Add push subscription table; server triggers summary reminders |

---
## 20. Quick Reference Cheat Sheet
| Action | Method & Path | Body Core | Response Core |
|--------|---------------|-----------|---------------|
| Register | POST /api/auth/register | email, password | token, user |
| Login | POST /api/auth/login | email, password | token, user |
| Me | GET /api/me | — | id, email |
| List Entries | GET /api/entries | — | [entries] |
| Get Entry | GET /api/entries/:date | — | entry|null |
| Upsert Entry | POST /api/entries | date, fitnessData, weight | entry |
| Delete Entry | DELETE /api/entries/:date | — | { ok:true } |
| Summary | GET /api/summary | — | [weeks] |

---
## 21. Acceptance Criteria (Backend)
| Criterion | Description |
|-----------|-------------|
| Deterministic Upsert | Two identical POSTs produce same row state |
| Unique Daily Rows | DB rejects duplicate (enforced) |
| Auth Isolation | User A cannot access User B data (tests verify) |
| Summary Accuracy | Totals match sum of daily sets per week |
| Fallback Robustness | Summary fallback query always returns (even with JSON agg failure) |
| Secret Override | Production rejects default dev secret (add CI rule) |
| No Orphaned Entries | Deleting user cascades entries (FK cascade) |

---
## 22. Minimal Curl Examples (Optional)
(Replace BASE, TOKEN)
```
# Login
curl -s -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"pw"}'
# Upsert today's entry
curl -s -X POST $BASE/api/entries -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"date":"2025-08-24","weight":180.5,"fitnessData":{"Bike":4,"Abs":2}}'
```

---
End of document.
