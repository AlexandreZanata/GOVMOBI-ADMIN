# UX Flows — GOVMOBI-ADMIN

> **Status:** Authoritative
> **Owner:** Product Lead + Design Lead
> **Cross-links:** [`../product/use-cases.md`](../product/use-cases.md) · [`../security.md`](../security.md) · [`../design-pattern/design-pattern-interactions.md`](../design-pattern/design-pattern-interactions.md)

---

## Flow Format

Each flow documents:
- **Actor** and entry point
- **Step-by-step path** (happy path)
- **Decision points** (branching logic)
- **Permission gates** (what is checked and when)
- **Error paths** (what happens when something fails)
- **Audit trigger** (what gets logged)

---

## Flow 1: Run Assignment

**Actor:** Dispatcher
**Entry:** Runs dashboard → PENDING run row

```
[Dispatcher opens /runs]
        │
        ▼
[Runs list loads — filtered to own department]
        │
        ├─ No PENDING runs → Empty state: "No pending runs"
        │
        ▼
[Dispatcher clicks a PENDING run]
        │
        ▼
[Run detail page /runs/[id]]
        │
        ▼
[<Can perform="run:assign"> gate passes]
        │
        ├─ Gate fails (not Dispatcher/Admin) → "Assign Agent" button hidden
        │
        ▼
[Dispatcher clicks "Assign Agent"]
        │
        ▼
[Agent selection dialog opens]
[System loads available agents in run's department]
        │
        ├─ No available agents → Dialog shows "No agents available" + disabled confirm
        │
        ▼
[Dispatcher selects agent → clicks Confirm]
        │
        ▼
[POST /v1/runs/:id/assign]
        │
        ├─ 409 Agent unavailable → Error toast + dialog stays open + list refreshes
        ├─ 403 Forbidden → Error toast "You don't have permission to assign this run"
        ├─ 500 Server error → Error toast + retry button
        │
        ▼
[Run status → ASSIGNED (optimistic update)]
[Audit: run.assigned logged]
[Success toast: "Run assigned to [Agent Name]"]
[Dialog closes, run detail refreshes]
```

---

## Flow 2: Supervisor Override

**Actor:** Supervisor
**Entry:** Run detail page → any non-terminal run

```
[Supervisor opens /runs/[id]]
        │
        ▼
[<Can perform="run:override"> gate passes]
        │
        ├─ Gate fails → "Override Status" button hidden
        │
        ▼
[Supervisor clicks "Override Status"]
        │
        ▼
[Override dialog opens]
[Shows: current status, available target statuses, mandatory reason field]
        │
        ├─ Target status = current status → Confirm button disabled
        │   "Status is already [X]"
        │
        ▼
[Supervisor selects target status, enters reason, clicks Confirm]
        │
        ├─ Reason field empty → Inline validation error, confirm blocked
        │
        ▼
[POST /v1/runs/:id/override]
        │
        ├─ 403 Forbidden (e.g. Supervisor trying to override COMPLETED)
        │   → Error toast "You cannot override a completed run"
        ├─ 422 Validation error → Inline error in dialog
        ├─ 500 → Error toast + retry
        │
        ▼
[Run status updated to target status]
[Audit: run.overridden logged — HIGH PRIORITY]
[Override flagged in run history: "⚠ Override by [Supervisor Name] — [reason]"]
[Success toast: "Run status overridden to [New Status]"]
[Dialog closes, run detail refreshes]
```

---

## Flow 3: User Deactivation

**Actor:** Admin
**Entry:** Users page → User detail page

```
[Admin opens /users/[id]]
        │
        ▼
[User detail loads]
        │
        ├─ User is already inactive → "Deactivate" button not shown
        ├─ User is the logged-in Admin → "Deactivate" button not shown
        │
        ▼
[Admin clicks "Deactivate User"]
        │
        ▼
[Deactivation confirmation dialog opens]
[System checks for active runs assigned to this user]
        │
        ├─ User has IN_PROGRESS runs →
        │   Dialog shows: "Cannot deactivate — user has [N] in-progress runs"
        │   Confirm button disabled
        │   Shows list of affected runs with links
        │
        ├─ User has ASSIGNED runs →
        │   Dialog shows: "Deactivating will unassign [N] runs (they will return to PENDING)"
        │   Confirm button enabled
        │
        ▼
[Admin clicks Confirm]
        │
        ▼
[POST /v1/users/:id/deactivate]
        │
        ├─ 422 User has IN_PROGRESS runs → Error toast (should not reach here if UI is correct)
        ├─ 403 Forbidden → Error toast
        ├─ 500 → Error toast + retry
        │
        ▼
[User status → inactive]
[ASSIGNED runs → PENDING]
[Audit: user.deactivated logged — HIGH PRIORITY]
[Success toast: "User deactivated. [N] runs returned to pending."]
[Redirect to /users]
```

---

## Flow 4: Role Change

**Actor:** Admin
**Entry:** User detail page → Edit Role

```
[Admin opens /users/[id]]
        │
        ▼
[Admin clicks "Edit Role"]
        │
        ▼
[Role change dialog opens]
[Shows: current role, role dropdown]
        │
        ├─ Selected role = current role → Confirm button disabled
        │
        ├─ Changing from ADMIN and this is the last Admin →
        │   Confirm button disabled: "At least one Admin must remain"
        │
        ▼
[Admin selects new role, clicks Confirm]
        │
        ▼
[PATCH /v1/users/:id with { role: newRole }]
        │
        ├─ 422 Last admin demotion → Error toast
        ├─ 403 → Error toast
        ├─ 500 → Error toast + retry
        │
        ▼
[User role updated]
[Audit: user.role_changed logged — HIGH PRIORITY]
[Success toast: "Role changed to [New Role]"]
[Dialog closes, user detail refreshes]
```

---

## Flow 5: Run Cancellation

**Actor:** Dispatcher, Supervisor, or Admin
**Entry:** Run detail page

```
[User opens /runs/[id]]
        │
        ├─ Run status is COMPLETED or CANCELLED →
        │   "Cancel Run" button not shown
        │
        ▼
[<Can perform="run:cancel"> gate passes]
        │
        ├─ Gate fails → "Cancel Run" button hidden
        │
        ▼
[User clicks "Cancel Run"]
        │
        ▼
[Cancellation confirmation dialog opens]
[Mandatory reason field]
        │
        ├─ Reason empty → Confirm button disabled + inline error
        │
        ▼
[User enters reason, clicks Confirm]
        │
        ▼
[POST /v1/runs/:id/cancel]
        │
        ├─ 422 Run already cancelled/completed → Error toast
        ├─ 403 → Error toast "You don't have permission to cancel this run"
        ├─ 500 → Error toast + retry
        │
        ▼
[Run status → CANCELLED]
[Audit: run.cancelled logged with reason]
[Success toast: "Run cancelled"]
[Dialog closes, run detail refreshes]
```

---

## Flow 6: Audit Trail Review

**Actor:** Admin (all events) or Supervisor (own department)
**Entry:** /audit

```
[User navigates to /audit]
        │
        ▼
[<Can perform="audit:read"> gate passes]
        │
        ├─ Gate fails → Redirect to /dashboard with "Access denied" toast
        │
        ▼
[Audit trail loads — paginated, reverse-chronological]
[Scope: Admin sees all; Supervisor sees own department only]
        │
        ├─ No events match filters → Empty state: "No audit events found"
        │   + "Clear filters" action
        │
        ▼
[User applies filters: event type, actor, date range, department]
        │
        ▼
[Filtered results load]
[HIGH PRIORITY events (run.overridden, user.role_changed, user.deactivated)
 displayed with ⚠ indicator]
        │
        ▼
[User clicks an audit entry]
        │
        ▼
[Audit entry detail panel opens (drawer or inline expansion)]
[Shows: full payload, actor details, timestamp, affected entity link]
```

---

## Flow 7: Session Expiry

**Actor:** Any authenticated user
**Trigger:** JWT access token expires (15 minutes) and refresh fails

```
[User is on any admin panel page]
        │
        ▼
[API request returns 401 UNAUTHORIZED]
        │
        ▼
[Global error handler intercepts 401]
        │
        ▼
[Attempt silent token refresh via refresh token cookie]
        │
        ├─ Refresh succeeds → Retry original request transparently
        │
        ├─ Refresh fails (refresh token expired or revoked) →
        │   Save current URL to sessionStorage
        │   Redirect to /login?reason=session_expired
        │
        ▼
[Login page shows: "Your session has expired. Please sign in again."]
        │
        ▼
[User signs in]
        │
        ▼
[Redirect to saved URL (or /dashboard if none saved)]
```

---

## Review Checklist

- [ ] All seven flows have happy path, decision points, and error paths
- [ ] Permission gates are documented at the point they are checked
- [ ] Audit triggers are noted in each flow
- [ ] Error paths include specific HTTP status codes and user-facing messages
- [ ] Session expiry flow covers both silent refresh and hard redirect
- [ ] Flows are consistent with use cases in product/use-cases.md
