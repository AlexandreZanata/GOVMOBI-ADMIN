# DevOps — GOVMOBI-ADMIN

> **Status:** Authoritative
> **Owner:** DevOps Lead + Engineering Lead
> **Last reviewed:** See git log
> **Cross-links:** [`security.md`](./security.md) · [`testing-strategy.md`](./testing-strategy.md) · [`git-workflow.md`](./git-workflow.md)

---

## 1. Environments

| Environment    | Purpose                      | URL Pattern                                   | Deploy Trigger                |
|----------------|------------------------------|-----------------------------------------------|-------------------------------|
| **local**      | Developer workstation        | `http://localhost:3000`                       | Manual (`npm run dev`)        |
| **preview**    | Per-PR ephemeral environment | `https://pr-{number}.govmobile-admin.preview` | Auto on PR open/push          |
| **staging**    | Pre-production integration   | `https://staging.govmobile-admin.internal`    | Auto on merge to `main`       |
| **production** | Live internal platform       | `https://admin.govmobile.internal`            | Manual promotion from staging |

### Environment Configuration

Each environment uses a separate `.env` file. **Never commit `.env.local` or `.env.production`.**

```bash
# .env.development (committed — no secrets)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=GovMobile Admin (Dev)
API_URL=http://localhost:4000

# .env.staging (injected by CI — not committed)
NEXT_PUBLIC_APP_ENV=staging
API_URL=https://api.staging.govmobile.internal

# .env.production (injected by CI — not committed)
NEXT_PUBLIC_APP_ENV=production
API_URL=https://api.govmobile.internal
```

---

## 2. CI/CD Pipeline

### Pipeline Stages (Mandatory — all must pass)

```
Push / PR
    │
    ▼
┌─────────────────┐
│  1. Install     │  npm ci
└────────┬────────┘
         ▼
┌─────────────────┐
│  2. Type Check  │  npx tsc --noEmit
└────────┬────────┘
         ▼
┌─────────────────┐
│  3. Lint        │  npm run lint
└────────┬────────┘
         ▼
┌─────────────────┐
│  4. Unit Tests  │  npm run test
└────────┬────────┘
         ▼
┌─────────────────┐
│  5. Build       │  npm run build
└────────┬────────┘
         ▼
┌─────────────────┐
│  6. Audit       │  npm audit --audit-level=high
└────────┬────────┘
         ▼
┌─────────────────┐  (staging/prod only)
│  7. E2E Tests   │  playwright test
└────────┬────────┘
         ▼
┌─────────────────┐  (staging/prod only)
│  8. Deploy      │  platform-specific
└─────────────────┘
```

### Gate Rules

| Stage            | Failure Action                    |
|------------------|-----------------------------------|
| Type Check       | Block merge; notify author        |
| Lint             | Block merge; notify author        |
| Unit Tests       | Block merge; notify author        |
| Build            | Block merge; notify author        |
| Dependency Audit | Block merge on high/critical CVEs |
| E2E Tests        | Block staging deploy; notify team |

---

## 3. Build Configuration

```bash
# Production build
npm run build

# Expected output
Route (app)                    Size     First Load JS
┌ ○ /                          1.2 kB   87 kB
├ ○ /login                     3.1 kB   89 kB
├ ● /dashboard                 8.4 kB   94 kB
├ ● /runs                      12 kB    98 kB
└ ● /runs/[id]                 9.2 kB   95 kB

# Bundle size budget (enforced in CI)
First Load JS budget: < 200 KB gzipped per route
```

### Build Checks (Mandatory)

- [ ] `next build` exits with code 0
- [ ] No TypeScript errors during build
- [ ] No missing environment variables (build fails fast on missing required vars)
- [ ] Bundle size within budget (CI fails if exceeded)

---

## 4. Release Process

### Standard Release

1. **Feature complete on `main`** — all PRs merged, CI green.
2. **Staging deploy** — automatic on merge to `main`.
3. **Staging validation** — QA runs smoke tests + E2E suite on staging.
4. **Release sign-off** — Engineering Lead + QA Lead approve.
5. **Production deploy** — Manual trigger by DevOps Lead.
6. **Post-deploy smoke test** — Automated health check + manual spot check.
7. **Release tag** — `git tag v{major}.{minor}.{patch}` on the deployed commit.

### Hotfix Release

1. Branch from the production tag: `hotfix/{description}`.
2. Fix, test locally, open PR against `main`.
3. After merge, cherry-pick to a `hotfix-deploy` branch if `main` has unreleased changes.
4. Deploy hotfix branch directly to production after QA sign-off.
5. Tag: `v{major}.{minor}.{patch+1}`.

### Version Scheme

`MAJOR.MINOR.PATCH` — Semantic Versioning:
- `MAJOR`: Breaking change to the admin panel's public behavior or API contract
- `MINOR`: New feature, backward compatible
- `PATCH`: Bug fix, no new functionality

---

## 5. Rollback Strategy

### Automatic Rollback Triggers

- Post-deploy health check fails (HTTP 5xx rate > 1% for 2 minutes)
- Error rate spikes > 5x baseline within 5 minutes of deploy

### Manual Rollback Procedure

```bash
# 1. Identify the last stable tag
git tag --sort=-version:refname | head -5

# 2. Deploy the previous tag
# (platform-specific deploy command with previous image/tag)
deploy --tag v1.2.3

# 3. Verify health check passes
curl https://admin.govmobile.internal/api/health

# 4. Notify team in incident channel
# 5. Create post-mortem issue
```

### Rollback Decision Matrix

| Severity                         | Response Time     | Action                             |
|----------------------------------|-------------------|------------------------------------|
| P0 — Platform down               | Immediate         | Auto-rollback + page on-call       |
| P1 — Critical feature broken     | < 15 min          | Manual rollback + incident channel |
| P2 — Non-critical feature broken | < 1 hour          | Hotfix or rollback decision        |
| P3 — Minor issue                 | Next business day | Standard hotfix process            |

---

## 6. Monitoring and Observability

### Health Check Endpoint

```
GET /api/health
Response: { status: "ok", version: "1.2.3", timestamp: "2026-04-15T10:00:00Z" }
```

### Metrics to Monitor

| Metric                  | Alert Threshold    | Tool                |
|-------------------------|--------------------|---------------------|
| HTTP 5xx error rate     | > 1% over 2 min    | APM                 |
| Page load time (p95)    | > 3 seconds        | RUM                 |
| API response time (p95) | > 2 seconds        | APM                 |
| JavaScript error rate   | > 0.5% of sessions | Error tracking      |
| Failed login attempts   | > 10 in 5 min      | Security monitoring |
| Build failure rate      | Any failure        | CI notifications    |

### Frontend Error Tracking

- All unhandled JavaScript errors are captured and reported.
- Error reports must **not** include PII or JWT tokens.
- Errors are grouped by type and linked to the source map for the deployed version.
- Source maps are uploaded to the error tracking service and **not** served publicly.

### Logging Rules

```typescript
// ✅ Acceptable log
console.error("Run assignment failed", { runId, errorCode });

// ❌ Forbidden — PII in logs
console.error("User login failed", { email: user.email });

// ❌ Forbidden — token in logs
console.log("Auth token", token);
```

---

## 7. Infrastructure Requirements

| Requirement     | Specification                                               |
|-----------------|-------------------------------------------------------------|
| Node.js version | 20.9+ (per Next.js 16 requirements)                         |
| Container       | Docker image based on `node:20-alpine`                      |
| Memory          | Minimum 512MB; recommended 1GB                              |
| CPU             | Minimum 0.5 vCPU; recommended 1 vCPU                        |
| HTTPS           | Mandatory; HTTP redirects to HTTPS                          |
| CDN             | Static assets served via CDN                                |
| Network         | Internal government network only; no public internet access |

---

## 8. Dependency Management

```bash
# Check for outdated packages (weekly)
npm outdated

# Security audit (every CI run)
npm audit --audit-level=high

# Update dependencies (monthly, in a dedicated PR)
npm update
npm run test  # Verify nothing broke
```

---

## Review Checklist

- [ ] All four environments are defined with deploy triggers
- [ ] CI pipeline stages are ordered correctly with gate rules
- [ ] Release process has explicit sign-off steps
- [ ] Rollback procedure is documented with a decision matrix
- [ ] Monitoring metrics have alert thresholds
- [ ] Logging rules explicitly forbid PII
- [ ] Infrastructure requirements match the actual deployment target
