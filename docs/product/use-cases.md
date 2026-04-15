# Use Cases — MOBBING-ADMIN

> **Status:** Authoritative
> **Owner:** Product Lead + Engineering Lead
> **Cross-links:** overview.md, security.md, ux/flows.md, api-contract.md

---

See docs/ux/flows.md for end-to-end workflow diagrams.
See docs/security.md for the full permission matrix.

## Domain 1: Run Management

### UC-001: Create a Run

**Actor(s):** Dispatcher, Admin
**Preconditions:** Authenticated. Has run:create permission.
**Trigger:** User clicks New Run on the Runs dashboard.

**Main Flow:**
1. User opens the New Run form.
2. User enters title, description, department, priority, optional scheduled time.
3. User submits the form.
4. System validates all required fields.
5. System creates the run with status PENDING.
6. System records audit entry: run.created.

**Permissions:** Admin (all depts), Dispatcher (own dept only).
**Audit:** run.created — actor ID, role, run ID, department ID, initial status, timestamp.

**Acceptance Criteria:**
- Run appears in list with status PENDING after successful creation
- Audit entry run.created is present
- Dispatcher cannot create runs outside their department
- Form shows inline errors for missing fields without page reload

### UC-002: Assign a Run

**Actor(s):** Dispatcher, Admin
**Preconditions:** Run exists with status PENDING. At least one active Field Agent available.
**Trigger:** User clicks Assign on a PENDING run.

**Main Flow:**
1. User opens the run detail view.
2. User clicks Assign Agent.
3. System displays available Field Agents in the runs department.
4. User selects an agent and confirms.
5. System transitions run status from PENDING to ASSIGNED.
6. System records audit entry: run.assigned.

**Permissions:** Admin (any dept), Dispatcher (own dept only).
**Audit:** run.assigned — actor ID, role, run ID, agent ID, timestamp.

**Acceptance Criteria:**
- Run status changes to ASSIGNED immediately after confirmation
- Audit entry run.assigned is present
- Dispatcher cannot assign runs outside their department
- Reassignment dialog shown when run is already ASSIGNED

### UC-003: Monitor Run Status

**Actor(s):** Admin, Supervisor, Dispatcher
**Trigger:** User navigates to the Runs dashboard.

**Main Flow:**
1. System displays runs filtered by the users department scope.
2. Each run shows: ID, title, status (StatusPill), assigned agent, department, last updated.
3. User can filter by status, department, date range, and agent.
4. User clicks a run to open the detail view.

**Permissions:** Admin (all), Supervisor (own dept), Dispatcher (own dept).
**Audit:** Read-only — no audit entry.

**Acceptance Criteria:**
- Runs list shows correct status colors for all five statuses
- Dispatcher sees only runs from their department
- Filters persist across page navigation
- Empty state shown when no runs match filters

### UC-004: Cancel a Run

**Actor(s):** Dispatcher, Supervisor, Admin
**Preconditions:** Run exists with status PENDING, ASSIGNED, or IN_PROGRESS.
**Trigger:** User clicks Cancel Run on a run detail view.

**Main Flow:**
1. User clicks Cancel Run.
2. System shows confirmation dialog with mandatory reason field.
3. User enters reason and confirms.
4. System transitions run status to CANCEL.
5. System records audit entry: run.cancelled with reason.

**Permissions:** Admin (any), Supervisor (own dept), Dispatcher (own created runs).
**Audit:** run.cancelled — actor ID, role, run ID, previous status, reason, timestamp.

**Acceptance Criteria:**
- Confirmation dialog with mandatory reason field shown before cancellation
- Run status changes to CANCELLED after confirmation
- Audit entry run.cancelled includes the reason text
- Cancel button not visible for COMPLETED or CANCELLED runs
- Empty reason field blocks submission with inline error

### UC-005: Supervisor Override of Run Status

**Actor(s):** Supervisor, Admin
**Preconditions:** Run exists. User has run:override permission.
**Trigger:** User clicks Override Status on a run detail view.

**Main Flow:**
1. User clicks Override Status.
2. System displays override dialog: current status, target statuses, mandatory reason field.
3. User selects target status and enters reason.
4. User confirms.
5. System forces the status transition.
6. System records audit entry: run.overridden (HIGH PRIORITY).
7. Override is visually flagged in the run history.

**Permissions:** Admin (any run, any status), Supervisor (own dept, cannot override COMPLETED).
**Audit:** run.overridden — actor ID, role, run ID, prev status, new status, reason, timestamp. HIGH PRIORITY.

**Acceptance Criteria:**
- Override dialog shows current status and valid target options
- Reason field mandatory; empty reason blocks submission
- Audit entry run.overridden present with all required fields
- Override visually flagged in run history timeline
- Supervisor cannot override COMPLETED run
- Admin can override any run including COMPLETED

## Domain 2: User Management

### UC-006: Create a User

**Actor(s):** Admin only
**Trigger:** Admin clicks New User on the Users page.

**Main Flow:**
1. Admin enters name, email, role, department.
2. Admin submits.
3. System creates the user account.
4. System records audit entry: user.created.

**Audit:** user.created — actor ID, new user ID, role, department, timestamp.

**Acceptance Criteria:**
- New user appears in Users list after creation
- Duplicate email shows inline error (API 409)
- Audit entry user.created is present

### UC-007: Change User Role

**Actor(s):** Admin only
**Trigger:** Admin edits a users role from the user detail page.

**Main Flow:**
1. Admin clicks Edit Role.
2. Admin selects new role and confirms.
3. System updates the users role.
4. System records audit entry: user.role_changed (HIGH PRIORITY).

**Edge Cases:**
- Demoting the last Admin — blocked: At least one Admin must exist.

**Audit:** user.role_changed — actor ID, target user ID, previous role, new role, timestamp. HIGH PRIORITY.

**Acceptance Criteria:**
- Role change reflected immediately in user detail view
- Audit entry includes previous and new role
- Last Admin demotion blocked with clear error

### UC-008: Deactivate a User

**Actor(s):** Admin only
**Trigger:** Admin clicks Deactivate on a user detail page.

**Main Flow:**
1. Admin clicks Deactivate User.
2. System shows confirmation dialog listing active runs assigned to this user.
3. Admin confirms.
4. System deactivates the user (soft delete).
5. Any ASSIGNED runs for this user revert to PENDING.
6. System records audit entry: user.deactivated (HIGH PRIORITY).

**Edge Cases:**
- User has IN_PROGRESS runs — deactivation blocked.
- Admin deactivating themselves — blocked.

**Audit:** user.deactivated — actor ID, target user ID, affected run IDs, timestamp. HIGH PRIORITY.

**Acceptance Criteria:**
- Deactivated user no longer appears in active user lists
- Runs previously assigned revert to PENDING
- Deactivation blocked if user has IN_PROGRESS runs
- Admin cannot deactivate themselves

## Domain 3: Audit Trail

### UC-009: View Audit Trail

**Actor(s):** Admin (all events), Supervisor (own department only)
**Trigger:** User navigates to the Audit Trail section.

**Main Flow:**
1. System displays paginated, reverse-chronological audit events.
2. Each entry shows: event type, actor, target entity, timestamp, details.
3. User can filter by event type, actor, date range, department, entity type.

**Permissions:** Admin (all), Supervisor (own dept), Dispatcher (no access).
**Audit:** Read-only — no audit entry for viewing.

**Acceptance Criteria:**
- Audit trail paginated (default 50 entries per page)
- Supervisor sees only events from their department
- High-priority events visually distinguished

## Domain 4: Department Management

### UC-010: Create a Department

**Actor(s):** Admin only
**Trigger:** Admin clicks New Department.

**Main Flow:**
1. Admin enters department name and optional description.
2. Admin submits.
3. System creates the department.
4. System records audit entry: department.created.

**Audit:** department.created — actor ID, department ID, name, timestamp.

**Acceptance Criteria:**
- New department appears in department list
- Duplicate name shows inline error
- Audit entry department.created is present

## Audit Event Reference

| Event              | Priority |
|--------------------|----------|
| run.created        | Normal   |
| run.assigned       | Normal   |
| run.reassigned     | Normal   |
| run.cancelled      | Normal   |
| run.overridden     | **High** |
| user.created       | Normal   |
| user.role_changed  | **High** |
| user.deactivated   | **High** |
| department.created | Normal   |

## Review Checklist

- [ ] Every use case has actor, preconditions, main flow, and acceptance criteria
- [ ] Every use case has a permissions definition
- [ ] Every use case has an audit entry definition
- [ ] Edge cases cover validation failure and permission denial
- [ ] Run lifecycle states match src/models/run.ts exactly
