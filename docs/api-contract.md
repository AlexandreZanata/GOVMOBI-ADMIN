# API Contract — GOVMOBI-ADMIN

> **Status:** Draft — Pending backend team sign-off (see OQ1–OQ3 in product/overview.md)
> **Owner:** Engineering Lead + Backend Team
> **Last reviewed:** See git log
> **Cross-links:** [`architecture/system-design.md`](./architecture/system-design.md) · [`security.md`](./security.md) · [`testing-strategy.md`](./testing-strategy.md)

---

## 1. General Conventions

| Property   | Value                                                                    |
|------------|--------------------------------------------------------------------------|
| Base URL   | `https://api.govmobile.internal/v1` (configurable via `API_URL` env var) |
| Protocol   | HTTPS only                                                               |
| Format     | JSON (`Content-Type: application/json`)                                  |
| Auth       | JWT via `httpOnly` cookie (set by auth service)                          |
| Versioning | URL path versioning: `/v1/`, `/v2/`                                      |
| Pagination | Cursor-based for audit trail; offset-based for lists                     |
| Timestamps | ISO 8601 UTC: `2026-04-15T10:00:00Z`                                     |
| IDs        | UUID v4 strings                                                          |

---

## 2. Authentication

All admin panel API requests require a valid session cookie. The cookie is set by the auth service and sent automatically by the browser.

```
Cookie: govmobile_session=<httpOnly JWT>
```

### Auth Error Responses

| Status | Code           | Meaning                                    |
|--------|----------------|--------------------------------------------|
| `401`  | `UNAUTHORIZED` | No valid session cookie                    |
| `403`  | `FORBIDDEN`    | Valid session but insufficient permissions |

---

## 3. Error Model

All error responses use this structure:

```typescript
interface ApiError {
  code: string;       // Machine-readable error code (see codes below)
  message: string;    // Human-readable description (for logging, not display)
  field?: string;     // For VALIDATION_ERROR: which field failed
  details?: unknown;  // Optional additional context
}
```

### Standard Error Codes

| HTTP Status | Code                  | When                                           |
|-------------|-----------------------|------------------------------------------------|
| `400`       | `BAD_REQUEST`         | Malformed request body                         |
| `401`       | `UNAUTHORIZED`        | Missing or expired session                     |
| `403`       | `FORBIDDEN`           | Insufficient permissions for this action       |
| `404`       | `NOT_FOUND`           | Resource does not exist                        |
| `409`       | `CONFLICT`            | Duplicate resource (e.g. email already exists) |
| `422`       | `VALIDATION_ERROR`    | Request body fails validation; `field` is set  |
| `429`       | `RATE_LIMITED`        | Too many requests                              |
| `500`       | `SERVER_ERROR`        | Unexpected server error                        |
| `503`       | `SERVICE_UNAVAILABLE` | Downstream service unavailable                 |

### Error Response Examples

```text
// 422 Validation Error
{
  "code": "VALIDATION_ERROR",
  "message": "Reason is required for run cancellation",
  "field": "reason"
}

// 403 Forbidden
{
  "code": "FORBIDDEN",
  "message": "Dispatchers cannot override run status"
}

// 409 Conflict
{
  "code": "CONFLICT",
  "message": "A user with this email address already exists"
}
```

---

## 4. Pagination

### List Responses (Offset-Based)

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;      // Total matching records
  page: number;       // Current page (1-indexed)
  pageSize: number;   // Items per page
  hasMore: boolean;   // Whether more pages exist
}
```

### Default Pagination Parameters

| Parameter  | Default | Max   |
|------------|---------|-------|
| `page`     | `1`     | —     |
| `pageSize` | `25`    | `100` |

---

## 5. Run Endpoints

### GET /v1/runs

Fetch paginated run list. Scope is enforced server-side based on the authenticated user's role and department.

**Query Parameters:**

| Parameter      | Type        | Description                            |
|----------------|-------------|----------------------------------------|
| `status`       | `RunStatus` | Filter by status                       |
| `departmentId` | `string`    | Filter by department                   |
| `agentId`      | `string`    | Filter by assigned agent               |
| `from`         | `ISO8601`   | Filter by createdAt >=                 |
| `to`           | `ISO8601`   | Filter by createdAt <=                 |
| `page`         | `number`    | Page number (default: 1)               |
| `pageSize`     | `number`    | Items per page (default: 25, max: 100) |

**Response `200`:**
```json
{
  "items": [
    {
      "id": "run-uuid",
      "title": "Inspection Route A",
      "description": "Weekly inspection of Zone 3",
      "status": "PENDING",
      "priority": "HIGH",
      "departmentId": "dept-uuid",
      "agentId": null,
      "createdBy": "user-uuid",
      "createdAt": "2026-04-15T08:00:00Z",
      "updatedAt": "2026-04-15T08:00:00Z",
      "scheduledAt": null
    }
  ],
  "total": 142,
  "page": 1,
  "pageSize": 25,
  "hasMore": true
}
```

---

### GET /v1/runs/:id

Fetch a single run with full detail and history.

**Response `200`:**
```json
{
  "id": "run-uuid",
  "title": "Inspection Route A",
  "status": "ASSIGNED",
  "departmentId": "dept-uuid",
  "agentId": "agent-uuid",
  "history": [
    {
      "status": "PENDING",
      "timestamp": "2026-04-15T08:00:00Z",
      "actorId": "user-uuid",
      "actorRole": "DISPATCHER",
      "note": null
    },
    {
      "status": "ASSIGNED",
      "timestamp": "2026-04-15T08:05:00Z",
      "actorId": "user-uuid",
      "actorRole": "DISPATCHER",
      "note": null,
      "isOverride": false
    }
  ]
}
```

---

### POST /v1/runs

Create a new run.

**Request Body:**
```json
{
  "title": "Inspection Route A",
  "description": "Weekly inspection of Zone 3",
  "departmentId": "dept-uuid",
  "priority": "HIGH",
  "agentId": null,
  "scheduledAt": null
}
```

**Response `201`:** Created run object (same shape as GET /v1/runs/:id).

**Errors:** `403` (no permission), `422` (validation), `404` (department not found).

---

### POST /v1/runs/:id/assign

Assign or reassign a run to a Field Agent.

**Request Body:**
```json
{ "agentId": "agent-uuid" }
```

**Response `200`:** Updated run object.

**Errors:** `403`, `404` (run or agent not found), `409` (agent unavailable), `422` (run not in assignable status).

---

### POST /v1/runs/:id/cancel

Cancel a run.

**Request Body:**
```json
{ "reason": "Operation postponed due to weather conditions" }
```

**Response `200`:** Updated run object.

**Errors:** `403`, `404`, `422` (run already completed/cancelled, or missing reason).

---

### POST /v1/runs/:id/override

Supervisor/Admin override of run status.

**Request Body:**
```json
{
  "targetStatus": "COMPLETED",
  "reason": "Agent confirmed completion verbally; mobile app offline"
}
```

**Response `200`:** Updated run object.

**Errors:** `403` (insufficient role or scope), `422` (same status, missing reason).

---

## 6. User Endpoints

### GET /v1/users

**Query Parameters:** `role`, `departmentId`, `status` (`active`|`inactive`), `page`, `pageSize`.

**Response `200`:** `PaginatedResponse<User>`

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "DISPATCHER" | "FIELD_AGENT";
  departmentId: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}
```

---

### POST /v1/users

Create a user.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@gov.internal",
  "role": "DISPATCHER",
  "departmentId": "dept-uuid"
}
```

**Response `201`:** Created user object.
**Errors:** `403`, `409` (duplicate email), `422`.

---

### PATCH /v1/users/:id

Update user fields (role, department, name).

**Request Body:** Partial user fields.
**Response `200`:** Updated user object.
**Errors:** `403`, `404`, `422` (e.g. demoting last admin).

---

### POST /v1/users/:id/deactivate

Deactivate a user.

**Response `200`:** `{ "deactivatedUserId": "uuid", "affectedRunIds": ["run-uuid"] }`
**Errors:** `403`, `404`, `422` (user has IN_PROGRESS runs).

---

## 7. Audit Trail Endpoints

### GET /v1/audit

**Query Parameters:** `eventType`, `actorId`, `entityType`, `entityId`, `departmentId`, `from`, `to`, `page`, `pageSize`.

**Response `200`:**
```json
{
  "items": [
    {
      "id": "audit-uuid",
      "eventType": "run.overridden",
      "actorId": "user-uuid",
      "actorRole": "SUPERVISOR",
      "entityType": "run",
      "entityId": "run-uuid",
      "departmentId": "dept-uuid",
      "payload": {
        "prevStatus": "IN_PROGRESS",
        "newStatus": "COMPLETED",
        "reason": "Agent confirmed verbally"
      },
      "priority": "high",
      "timestamp": "2026-04-15T10:30:00Z"
    }
  ],
  "total": 847,
  "page": 1,
  "pageSize": 50,
  "hasMore": true
}
```

---

## 8. Department Endpoints

### GET /v1/departments

**Response `200`:** `PaginatedResponse<Department>`

```typescript
interface Department {
  id: string;
  name: string;
  description: string | null;
  userCount: number;
  activeRunCount: number;
  createdAt: string;
}
```

### POST /v1/departments

**Request Body:** `{ "name": "Zone 3 Operations", "description": "..." }`
**Response `201`:** Created department object.
**Errors:** `403`, `409` (duplicate name), `422`.

---

## 9. Health Endpoint

### GET /health

No authentication required.

**Response `200`:**
```json
{
  "status": "ok",
  "version": "1.2.3",
  "timestamp": "2026-04-15T10:00:00Z"
}
```

---

## 10. MSW Mock Parity

Every endpoint defined in this contract must have a corresponding MSW handler in `src/msw/`. The MSW handler is the source of truth during development and testing.

| Endpoint          | MSW Handler File                |
|-------------------|---------------------------------|
| `/v1/runs`        | `src/msw/runHandlers.ts`        |
| `/v1/users`       | `src/msw/userHandlers.ts`       |
| `/v1/audit`       | `src/msw/auditHandlers.ts`      |
| `/v1/departments` | `src/msw/departmentHandlers.ts` |
| `/health`         | `src/msw/healthHandlers.ts`     |

---

## Review Checklist

- [ ] All endpoints have request/response shapes defined
- [ ] Error model is consistent across all endpoints
- [ ] Pagination shape is consistent
- [ ] Auth requirements are explicit per endpoint
- [ ] MSW handler parity table is complete
- [ ] Breaking change notation is used for any contract changes
- [ ] All run lifecycle transitions have corresponding endpoints
