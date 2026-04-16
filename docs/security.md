# Security — GOVMOBI-ADMIN

> **Status:** Authoritative — Mandatory for all contributors
> **Owner:** Security Lead + Engineering Lead
> **Last reviewed:** See git log
> **Cross-links:** [`product/use-cases.md`](./product/use-cases.md) · [`api-contract.md`](./api-contract.md) · [`devops.md`](./devops.md) · [`architecture/system-design.md`](./architecture/system-design.md)

---

## 1. Security Principles

1. **Frontend is not the security boundary.** All permission enforcement happens server-side. UI gates are UX-only.
2. **Least privilege.** Every role has the minimum permissions required to perform its function.
3. **Audit everything.** Every state-changing action produces an immutable server-side audit record.
4. **Defense in depth.** Multiple layers: auth, RBAC, input validation, CSP, HTTPS-only.
5. **Fail closed.** When permission state is unknown or ambiguous, deny access and show an error.

---

## 2. Authentication

| Property                | Requirement                                                           |
|-------------------------|-----------------------------------------------------------------------|
| Provider                | External SSO / OAuth2 (platform-managed)                              |
| Token format            | JWT (RS256 signed)                                                    |
| Token storage           | `httpOnly`, `Secure`, `SameSite=Strict` cookie — never `localStorage` |
| Token expiry            | Access token: 15 minutes. Refresh token: 8 hours (session duration).  |
| Session expiry handling | Redirect to `/login?reason=session_expired`                           |
| Token refresh           | Handled transparently by the auth service via refresh token cookie    |
| Logout                  | Clears cookies server-side; invalidates refresh token                 |

### Forbidden Authentication Patterns

```typescript
// ❌ Never store tokens in localStorage
localStorage.setItem("token", jwt);

// ❌ Never store tokens in sessionStorage
sessionStorage.setItem("token", jwt);

// ❌ Never expose token to JavaScript
document.cookie = "token=...; SameSite=Strict"; // missing httpOnly

// ❌ Never decode JWT client-side for security decisions
const { role } = jwtDecode(token); // UI display only — never for access control
```

---

## 3. Role-Based Access Control (RBAC)

### Permission Matrix

| Permission          | Admin        | Supervisor        | Dispatcher       | Analyst    | Field Agent |
|---------------------|--------------|-------------------|------------------|------------|-------------|
| `run:create`        | ✅            | ❌                 | ✅ (own dept)     | ❌          | ❌           |
| `run:read`          | ✅ all        | ✅ own dept        | ✅ own dept       | ✅ all (v2) | ❌           |
| `run:assign`        | ✅            | ❌                 | ✅ (own dept)     | ❌          | ❌           |
| `run:cancel`        | ✅            | ✅ (own dept)      | ✅ (own, created) | ❌          | ❌           |
| `run:override`      | ✅ any status | ✅ excl. COMPLETED | ❌                | ❌          | ❌           |
| `user:create`       | ✅            | ❌                 | ❌                | ❌          | ❌           |
| `user:read`         | ✅ all        | ✅ own dept        | ✅ own dept       | ❌          | ❌           |
| `user:edit`         | ✅            | ❌                 | ❌                | ❌          | ❌           |
| `user:deactivate`   | ✅            | ❌                 | ❌                | ❌          | ❌           |
| `user:role_change`  | ✅            | ❌                 | ❌                | ❌          | ❌           |
| `department:create` | ✅            | ❌                 | ❌                | ❌          | ❌           |
| `department:read`   | ✅            | ✅ own             | ✅ own            | ❌          | ❌           |
| `department:edit`   | ✅            | ❌                 | ❌                | ❌          | ❌           |
| `audit:read`        | ✅ all        | ✅ own dept        | ❌                | ❌          | ❌           |
| `report:read`       | ✅            | ✅ own dept        | ❌                | ✅ all (v2) | ❌           |

> **Note:** "own dept" means the user's assigned department(s) only. The API enforces this scope — the frontend filters the UI accordingly.

### Frontend Permission Enforcement

- ✅ Correct — use `<Can />` component: `<Can perform="run:override"><Button variant="destructive">Override Status</Button></Can>`
- ✅ Correct — use `usePermissions()` hook: `const { can } = usePermissions();` and deny UI when `!can("run:create")`
- ❌ Forbidden — hardcoded role check: `if (user.role === "ADMIN") { ... }`

### API-Level Enforcement (Mandatory)

The backend must enforce all permissions independently. The frontend permission gates are **UX convenience only** — they do not constitute a security control. Any API call made without proper authorization must return `403 Forbidden`.

---

## 4. Audit Log Requirements

### What Must Be Logged

Every state-changing action must produce an audit record. The frontend is responsible for triggering the action; the backend is responsible for recording it.

| Event                | Required Fields                                                          |
|----------------------|--------------------------------------------------------------------------|
| `run.created`        | actor_id, actor_role, run_id, department_id, initial_status, timestamp   |
| `run.assigned`       | actor_id, actor_role, run_id, agent_id, timestamp                        |
| `run.reassigned`     | actor_id, actor_role, run_id, prev_agent_id, new_agent_id, timestamp     |
| `run.cancelled`      | actor_id, actor_role, run_id, prev_status, reason, timestamp             |
| `run.overridden`     | actor_id, actor_role, run_id, prev_status, new_status, reason, timestamp |
| `user.created`       | actor_id, new_user_id, role, department_id, timestamp                    |
| `user.role_changed`  | actor_id, target_user_id, prev_role, new_role, timestamp                 |
| `user.deactivated`   | actor_id, target_user_id, affected_run_ids[], timestamp                  |
| `department.created` | actor_id, department_id, name, timestamp                                 |

### Audit Log Properties

- **Immutable:** Audit records cannot be edited or deleted (append-only).
- **Server-side only:** The frontend displays audit records; it never creates or modifies them directly.
- **Tamper-evident:** Audit records must include a server-generated timestamp (not client-provided).
- **High-priority events** (`run.overridden`, `user.role_changed`, `user.deactivated`) must be visually distinguished in the audit trail UI.

---

## 5. Input Validation

### Client-Side (UX Layer)

- All forms must validate inputs before submission.
- Validation errors must be shown inline (not as alerts).
- Client-side validation is for UX only — the API must re-validate all inputs.

### Server-Side (Security Layer)

- All inputs are validated server-side regardless of client-side validation.
- The API returns structured `ApiError` objects for validation failures (see [`api-contract.md`](./api-contract.md)).

### Forbidden Input Patterns

- ❌ Never use `dangerouslySetInnerHTML` with user-provided content (example: `<div dangerouslySetInnerHTML={{ __html: userInput }} />`)
- ❌ Never construct URLs from unvalidated input (example: `window.location.href = userProvidedUrl;`)
- ❌ Never eval user input (example: `eval(userProvidedCode);`)

---

## 6. Content Security Policy (CSP)

The following CSP headers must be set by the server/CDN:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.govmobile.internal;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

- `unsafe-eval` is **forbidden**.
- `unsafe-inline` for scripts is **forbidden** (use nonces).
- `frame-ancestors 'none'` prevents clickjacking.

---

## 7. Secrets Handling

| Secret Type          | Storage                             | Access                                                               |
|----------------------|-------------------------------------|----------------------------------------------------------------------|
| API base URL         | `.env.local` / environment variable | Server-side only (`NEXT_PUBLIC_` prefix forbidden for internal URLs) |
| Auth client secret   | Server environment variable         | Never in client bundle                                               |
| JWT signing key      | Auth service only                   | Never in admin panel                                                 |
| Database credentials | Backend only                        | Never in frontend                                                    |

### Environment Variable Rules

```bash
# ✅ Safe — public config only
NEXT_PUBLIC_APP_NAME=GovMobile Admin

# ❌ Forbidden — internal API URL exposed to client
NEXT_PUBLIC_API_URL=https://api.govmobile.internal

# ✅ Correct — server-side only
API_URL=https://api.govmobile.internal
```

---

## 8. Dependency Security

- **Mandatory:** Run `npm audit` in CI. Fail the build on high/critical vulnerabilities.
- **Mandatory:** Pin dependency versions in `package.json` (no `^` for production dependencies in releases).
- **Recommended:** Use Dependabot or equivalent for automated dependency updates.
- **Forbidden:** Installing packages with known critical CVEs without a documented exception.

---

## 9. Compliance Posture

| Requirement              | Status               | Notes                                                                                                |
|--------------------------|----------------------|------------------------------------------------------------------------------------------------------|
| WCAG 2.1 AA              | Mandatory            | See [`design-system/design-system-accessibility.md`](./design-system/design-system-accessibility.md) |
| Audit trail completeness | Mandatory            | 100% of state-changing actions logged                                                                |
| Data residency           | Mandatory            | All data within government network boundary                                                          |
| Session timeout          | Mandatory            | 8-hour maximum session; 15-minute token expiry                                                       |
| HTTPS only               | Mandatory            | HTTP requests redirected to HTTPS                                                                    |
| No PII in logs           | Mandatory            | Frontend logs must not include user PII                                                              |
| GDPR / local data law    | Pending legal review | Flag: OQ5 in product/overview.md                                                                     |

---

## 10. Security Testing Requirements

| Test Type                | Scope                   | Frequency               |
|--------------------------|-------------------------|-------------------------|
| RBAC unit tests          | All permission gates    | Every PR                |
| API error handling tests | 401, 403, 422 responses | Every PR                |
| Dependency audit         | All packages            | Every CI run            |
| Manual penetration test  | Full application        | Pre-release             |
| Accessibility audit      | Full application        | Pre-release + quarterly |

---

## Review Checklist

- [ ] Permission matrix covers all five roles and all domains
- [ ] Authentication token storage rules are explicit (httpOnly cookie only)
- [ ] All audit events have required field definitions
- [ ] CSP policy is defined and `unsafe-eval` is forbidden
- [ ] Secrets handling rules cover all secret types
- [ ] Compliance requirements have clear status and owners
- [ ] Security testing requirements are defined with frequency
