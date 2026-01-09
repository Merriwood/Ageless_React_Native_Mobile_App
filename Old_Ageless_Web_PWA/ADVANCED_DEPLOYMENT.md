# Advanced Deployment & Operations Guide

This document complements `DEPLOYMENT.md` and `DEPLOY_NOW.md` with production hardening, scaling, observability, and automation practices. Use it after the first successful deployment.

## 1. Environments & Branch Strategy
- dev (optional): rapid iteration; permissive CORS; seed demo data.
- staging: mirrors production schema; feature freeze gate before prod.
- production: protected branch (`main`); squash merges only; required CI checks.

Suggested branches:
- feature/*  → Pull Request → main (auto-deploy to staging)
- tag (vX.Y.Z) → production deploy (manual or automated promotion)

## 2. Environment Variable Matrix
| Variable | dev | staging | production | Notes |
|----------|-----|---------|------------|-------|
| DATABASE_URL | local docker | managed staging | managed prod | Use separate DB instances |
| JWT_SECRET | throwaway | random 48B | random 64B | Rotate via secret manager |
| NODE_ENV | development | production | production | Influences logging & helmet |
| CORS_ORIGIN | * | staging web URL | production web URL | Comma-separated if multi |
| FORCE_DB_SSL | false | true | true | Force encryption in hosted env |
| PORT | 10000 | platform assigned | platform assigned | Render injects |
| FT_VERBOSE_LOG | true | false | false | Controls extra diagnostics |
| FT_DISABLE_AUTO_MIGRATE | false | true | true | Prefer explicit migrations in higher envs |

## 3. Database Lifecycle
### Migrations
Current code performs a one-time idempotent schema ensure on boot. For rigor, adopt explicit migrations:
1. Create `server/migrations/` (timestamped SQL files).
2. Add migration runner (tracks applied versions in `schema_migrations` table).
3. Disable auto ensure by setting `FT_DISABLE_AUTO_MIGRATE=true` and removing boot logic once runner exists.

### Backups & DR
- Automated daily snapshot (provider-level) + 7 day retention.
- Weekly logical dump (pg_dump) stored in versioned object storage bucket: `fitness-tracker-backups/YYYY/MM/DD.sql.gz`.
- Quarterly restore test to a disposable database (validate checksum & app boot).

### Performance Indexes
Already: UNIQUE (user_id, entry_date). Consider future:
- `(user_id, updated_at)` for sync windows.
- GIN index on `fitness_data` if querying aggregated keys grows.

## 4. Security Hardening
| Area | Action | Status |
|------|--------|--------|
| Headers | Add explicit Content-Security-Policy | TODO |
| Auth | Enforce bcrypt cost 10 (already) | OK |
| Tokens | Rotate `JWT_SECRET` (grace period) | TODO (introduce dual validation window) |
| Rate Limit | 100 req / 15m per IP (login stricter) | TODO |
| Logging | Redact passwords & tokens | OK (not logged) |
| Dependency Audit | `npm audit --production` in CI | TODO |
| TLS | Force HTTPS redirect at CDN/proxy | Platform |
| CORS | Narrow allowed origins (no `*`) | After frontend URL known |
| CSP Fallback | Remove inline allowances; serve hashed assets | Planned with build pipeline |

Example minimal CSP once hashed assets in `dist/web`:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
```
(Consider hashing inline styles or extracting CSS to drop `'unsafe-inline'`.)

## 5. Build & Asset Strategy
Current: Plain static files in `/web` delivered unbundled.
Optional progression:
1. Phase 1 (now): `node build-prod.js` → hashed `app.[hash].js`, `service-worker.[hash].js` & manifest.
2. Phase 2: Introduce Vite for ES module splitting & automatic hash filenames.
3. Phase 3: Service worker update mode: `stale-while-revalidate` or precache manifest injection.
4. Long-term: Add integrity attributes (SRI) for hashed JS.

Service Worker Improvement TODO:
- Add version constant from manifest; if mismatch, trigger `skipWaiting()` & client refresh prompt.

## 6. Observability
### Logs
- Structure: `[level][timestamp][request-id] message` (future: pino or Winston).
- Add a lightweight middleware that attaches `x-request-id` (UUID) if absent.

### Metrics (Phase 2)
- Expose `/metrics` (Prometheus) behind auth token: request count, latency histogram, DB queue wait.

### Synthetic Health
- External monitor hitting: `/healthz` every 1m; alert if 3 consecutive failures.

### Error Tracking (Phase 3)
- Integrate Sentry (client + server) if error density increases.

## 7. CI/CD (GitHub Actions Example)
Create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 } # LTS
      - run: npm install --workspaces
      - run: npm --prefix server audit --omit=dev || true
      - run: npm run build
      - name: Lint Placeholder
        run: echo "No linter configured" 
```
Add deploy job conditioned on tag or main merges using provider-specific action (Render offers deploy hooks / webhooks).

## 8. Rate Limiting (Planned Implementation)
Add `express-rate-limit`:
- Global: 300 requests / 5 min / IP.
- Auth endpoints: 10 logins / 5 min / IP.
- Return `429` JSON: `{ error: "Too many requests" }`.

## 9. Token Rotation Strategy (Future)
1. Introduce `JWT_PREVIOUS_SECRET`.
2. Verification attempts: try current secret; if fails, try previous.
3. On rotation window completion (e.g., 24h), drop previous.
4. Automate via secret manager schedule.

## 10. Offline & Sync Evolution
- Current: last-write-wins per date (client queue). 
- Future conflict detection: add `updated_at` to POST request; if server row newer than client timestamp, return `409` with authoritative record.
- Add `If-Unmodified-Since` header variant (custom) to enforce optimistic concurrency.

## 11. Data Retention & Privacy
| Data Type | Retention | Rationale |
|----------|-----------|-----------|
| User account | Until user deletes | Core identity |
| Entries | Indefinite (configurable) | Long-term fitness trends |
| Logs | 14 days (app) / 30 days (infra) | Debug / compliance balance |
| Backups | 30 daily, 12 monthly | Disaster recovery |

Add user-facing delete-account endpoint (queued item in backlog).

## 12. Accessibility & Compliance (Roadmap)
- Modal focus trap & ESC close (add utility).
- ARIA roles on interactive elements (stations as buttons or listitems).
- Color contrast audit (WCAG AA) once palette finalized.

## 13. Capacity Planning
Assumptions:
- 1 entry/day/user (POST) + 2 reads (GET /entries + /summary).
- 1k users → ~3k RPS peak << Express single instance capacity.
Scale triggers:
- p95 latency > 300ms or CPU > 70% sustained.
Actions:
- Horizontal scaling (platform) or move static web to CDN + API behind autoscaler.

## 14. Backup & Restore Runbook (Condensed)
1. Trigger manual backup: `pg_dump --format=custom` to object storage.
2. Incident restore: provision new DB; `pg_restore --clean --if-exists`.
3. Point `DATABASE_URL` env to restored DB; restart service.
4. Post-restore verification: run health, sample user login, count entries.

## 15. Penetration Test Prep Checklist
- [ ] All dependencies updated
- [ ] Rate limiting active
- [ ] CSP strict with no inline scripts
- [ ] Security headers validated (Mozilla Observatory >= B+)
- [ ] Secrets rotated within last 90 days
- [ ] No endpoints exposing stack traces

## 16. Quick Hardening TODO Queue
| Priority | Item |
|----------|------|
| High | Add explicit CORS allowlist & rate limiting |
| High | Implement CSP with hashed assets |
| Medium | Structured logging + request IDs |
| Medium | Migration runner & disable auto-migrate |
| Medium | Conflict detection (updated_at) |
| Low | Prometheus metrics endpoint |
| Low | Sentry integration |

---
If you want any of these items implemented next (e.g., rate limiting, CSP header, GitHub Actions workflow), request it and we can add the code incrementally.
