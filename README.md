# GovMobile — Admin Panel

> **Web-based control surface for the Government Operational Mobility System.**
> Role-aware, auditable, and built for operational clarity.

---

## Table of Contents

1. [Recommended Stack](#1-recommended-stack)
2. [Project Architecture](#2-project-architecture)
3. [Prompt Contract](#3-prompt-contract)
4. [Implementation Roadmap](#4-implementation-roadmap)
   - [Step 1 — Project Bootstrap & Design System](#step-1--project-bootstrap--design-system)
   - [Step 2 — Domain Models & TypeScript Contracts](#step-2--domain-models--typescript-contracts)
   - [Step 3 — Permission & Policy Layer](#step-3--permission--policy-layer)
   - [Step 4 — MSW Mock Layer & Service Facades](#step-4--msw-mock-layer--service-facades)
   - [Step 5 — i18n Infrastructure](#step-5--i18n-infrastructure)
   - [Step 6 — Auth & Role-Based Routing](#step-6--auth--role-based-routing)
   - [Step 7 — Dashboard & Analytics](#step-7--dashboard--analytics)
   - [Step 8 — Run Management Module](#step-8--run-management-module)
   - [Step 9 — Agent & User Management](#step-9--agent--user-management)
   - [Step 10 — Final Assembly & Observability](#step-10--final-assembly--observability)
5. [Definition of Done Per Step](#5-definition-of-done-per-step)
6. [Documentation Map](#6-documentation-map)
7. [Quick Start](#7-quick-start)

---

## 1. Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 14** (App Router) | File-based routing, RSC-ready, layout nesting for role shells |
| Language | **TypeScript 5** (strict) | Contract parity with the mobile app domain models |
| Styling | **Tailwind CSS** + **shadcn/ui** | Radix primitives + headless accessibility, fully themeable |
| Server state | **TanStack Query v5** | Async state, caching, background refetch, optimistic updates |
| Client state | **Zustand** | Lightweight slices, minimal boilerplate, devtools support |
| Forms | **React Hook Form** + **Zod** | Schema-driven validation, matches TypeScript contracts |
| i18n | **react-i18next** + **i18next** | Namespace-based, same pattern as mobile app i18n |
| Mock layer | **MSW v2** (Mock Service Worker) | Intercepts fetch at the network level — seamless swap to real API |
| Testing | **Vitest** + **Testing Library** + **MSW** | Unit + integration, mock layer reused in tests |
| Charts | **Recharts** | Composable, accessible, Tailwind-compatible |
| Icons | **Lucide React** | Consistent icon set used across the project |
| Linting | **ESLint** + **Prettier** | Enforced code style |
| Commits | **Commitlint** + **Conventional Commits** | Matches mobile app commit rules |

---

## 2. Project Architecture

```text
govmobile-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (admin)/                  # Role shell — Admin only
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── runs/
│   │   │   ├── agents/
│   │   │   ├── dispatchers/
│   │   │   └── settings/
│   │   ├── (dispatcher)/             # Role shell — Dispatcher
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   └── runs/
│   │   ├── (supervisor)/             # Role shell — Supervisor
│   │   │   ├── layout.tsx
│   │   │   ├── reports/
│   │   │   └── review/
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── atoms/                    # Button, Badge, Input, Avatar…
│   │   ├── molecules/                # RunCard, UserRow, StatusPill…
│   │   ├── organisms/                # RunTable, AgentMap, StatsGrid…
│   │   └── templates/                # DashboardShell, AuthShell…
│   │
│   ├── models/                       # Shared domain types (mirrors mobile)
│   │   ├── Run.ts
│   │   ├── User.ts
│   │   ├── Permission.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── facades/                  # Business action contracts
│   │   │   ├── RunFacade.ts
│   │   │   ├── UserFacade.ts
│   │   │   ├── AuthFacade.ts
│   │   │   └── index.ts
│   │   ├── mock/                     # MSW handlers + seed data
│   │   │   ├── handlers/
│   │   │   │   ├── runs.handlers.ts
│   │   │   │   ├── users.handlers.ts
│   │   │   │   └── auth.handlers.ts
│   │   │   ├── data/
│   │   │   │   ├── runs.seed.ts
│   │   │   │   └── users.seed.ts
│   │   │   └── browser.ts            # MSW browser worker setup
│   │   └── api/                      # Real API implementations (future)
│   │       ├── runs.api.ts
│   │       └── users.api.ts
│   │
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   ├── useRunStore.ts
│   │   └── useUIStore.ts
│   │
│   ├── hooks/
│   │   ├── useRuns.ts
│   │   ├── useAgents.ts
│   │   ├── usePermissions.ts
│   │   └── useCurrentUser.ts
│   │
│   ├── utils/
│   │   ├── permissions.ts
│   │   ├── runLifecycle.ts
│   │   └── delay.ts
│   │
│   ├── i18n/
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en/
│   │       │   ├── common.json
│   │       │   ├── runs.json
│   │       │   ├── users.json
│   │       │   └── auth.json
│   │       └── pt/
│   │           ├── common.json
│   │           ├── runs.json
│   │           ├── users.json
│   │           └── auth.json
│   │
│   └── theme/
│       ├── tokens.ts                 # Design tokens (colors, spacing, radius)
│       └── govmobile.css             # Tailwind + CSS variable overrides
│
├── public/
│   └── mockServiceWorker.js          # MSW service worker (generated)
│
├── docs/
│   ├── engineering-standards.md
│   ├── commit-rules.md
│   └── design-system.md
│
├── vitest.config.ts
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Data Flow

```text
UI Component
  └── Custom Hook (useRuns, useAgents…)
        └── Facade (RunFacade, UserFacade…)
              └── [MSW Mock Handler | Real API]  ← toggled by ENV.MOCK_MODE
```

The UI never imports from `services/mock/` or `services/api/` directly.
All state transitions must pass through a facade method.

---

## 3. Prompt Contract

**Prepend this block to every step prompt below before sending to an LLM.**

```text
You are implementing the GovMobile Admin Panel — the web-based control surface
for a Government Operational Mobility System.

Domain context (mandatory):
- Internal fleet coordination platform for public servants. Not a consumer app.
- Core entity is Run with lifecycle: PENDING → ASSIGNED → IN_PROGRESS → COMPLETED/CANCELLED.
- Actors: Field Agent, Dispatcher, Supervisor, Admin.
- Every feature must support operational clarity, role-based permissions, and auditable transitions.

Engineering requirements (mandatory):
1. Framework: Next.js 14 App Router. Use server components where stateless, client components where interactive.
2. TypeScript strict mode. Zero "any". Shared domain models from src/models/ must be reused as-is.
3. Styling: Tailwind CSS utility classes only. Use design tokens from src/theme/tokens.ts. No inline hex values.
4. All user-facing strings via react-i18next. Namespace: common, runs, users, auth.
5. All async data via TanStack Query. No raw fetch in components.
6. All business actions via facade methods. Never call mock/api layers from UI directly.
7. Mock layer: MSW handlers only. Toggle via process.env.NEXT_PUBLIC_MOCK_MODE.
8. Every exported hook, facade, and utility must have JSDoc.
9. Add or update the step POC test (Vitest + Testing Library + MSW).
10. Validate role permissions before rendering actions or navigating to protected routes.
```

---

## 4. Implementation Roadmap

---

### Step 1 — Project Bootstrap & Design System

**Goal:** Initialize the project with the full stack configured and a working design system that enforces the GovMobile visual language across all future components.

**Target files:**

```text
next.config.ts
tailwind.config.ts
tsconfig.json
vitest.config.ts
src/theme/tokens.ts
src/theme/govmobile.css
src/components/atoms/Button.tsx
src/components/atoms/Badge.tsx
src/components/atoms/Input.tsx
src/components/atoms/Avatar.tsx
src/components/atoms/StatusPill.tsx
src/components/atoms/index.ts
src/app/layout.tsx
```

**Prompt (after contract):**

```text
Step 1 — Project Bootstrap & Design System.

Initialize the GovMobile Admin Panel project.

Stack setup:
- next.config.ts: enable App Router, strict mode, src dir, absolute imports from "@/".
- tailwind.config.ts: extend theme with govmobile tokens (colors, radius, font).
- tsconfig.json: strict true, paths alias "@/*" → "src/*".
- vitest.config.ts: jsdom environment, alias parity with tsconfig, setup file for Testing Library.

Design system:
- src/theme/tokens.ts: export a typed tokens object.
  Colors: brand.primary (institutional blue), brand.secondary, semantic success/warning/danger/info,
  neutral scale 50–900. All as HSL CSS variable references.
- src/theme/govmobile.css: define CSS variables mapped to tokens. Utility classes
  for run status (status-pending, status-assigned, status-in-progress, status-completed, status-cancelled).

Atoms (each as a typed, accessible React component with Tailwind + Radix/shadcn where appropriate):
- Button: variants primary | secondary | ghost | destructive. Size sm | md | lg. Loading state.
- Badge: color derived from semantic token. Label as children.
- Input: label prop, error prop, helper text. Wraps shadcn Input.
- Avatar: initials fallback + image src. Size sm | md | lg.
- StatusPill: accepts RunStatus enum, renders color-coded label via i18n key.

All atoms must:
- Accept a data-testid prop.
- Use i18n for any internal label (aria-label, placeholder).
- Export from src/components/atoms/index.ts.
```

**POC — `src/components/atoms/__tests__/atoms.test.tsx`:**

```text
Test cases:
1. Button renders with correct label and calls onClick.
2. Button shows loading spinner when isLoading=true and is disabled.
3. Badge renders correct semantic color class for each variant.
4. Input displays error message when error prop is set.
5. Avatar renders initials when no src is provided.
6. StatusPill renders the correct i18n label for each RunStatus value.
```

---

### Step 2 — Domain Models & TypeScript Contracts

**Goal:** Establish exhaustive TypeScript interfaces for all GovMobile domain entities. These contracts must be shared with the mobile app and form the single source of truth for all facades, store slices, and MSW handlers.

**Target files:**

```text
src/models/Run.ts
src/models/User.ts
src/models/Permission.ts
src/models/index.ts
```

**Prompt (after contract):**

```text
Step 2 — Domain Models & TypeScript Contracts.

Define all domain entities as TypeScript interfaces and enums.
No classes. Interfaces only — these are plain data contracts.

src/models/Run.ts:
  - RunStatus enum: PENDING | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
  - RunType enum: TRANSPORT | INSPECTION | EMERGENCY | MAINTENANCE | ADMINISTRATIVE
  - RunPriority enum: LOW | MEDIUM | HIGH | CRITICAL
  - RunProof interface: id, fileUrl, fileType ("photo" | "document"), uploadedAt, uploadedBy (userId)
  - Run interface: id, type (RunType), status (RunStatus), priority (RunPriority), title,
    description, location (lat, lng, address), assignedAgentId, dispatcherId, createdAt,
    updatedAt, completedAt, notes, proofs (RunProof[]), departmentId
  - RunTransition interface: fromStatus, toStatus, triggeredBy (userId), timestamp, reason

src/models/User.ts:
  - UserRole enum: AGENT | DISPATCHER | SUPERVISOR | ADMIN
  - UserStatus enum: ACTIVE | INACTIVE | ON_MISSION
  - User interface: id, name, email, role (UserRole), status (UserStatus), departmentId,
    avatarUrl, createdAt, lastActiveAt

src/models/Permission.ts:
  - Permission enum: all capability keys (VIEW_RUNS, CREATE_RUN, ASSIGN_RUN,
    ACCEPT_RUN, UPDATE_STATUS, VIEW_REPORTS, OVERRIDE_ACTION, MANAGE_USERS,
    CONFIGURE_SYSTEM, VIEW_AUDIT_LOG)
  - RolePermissionMap: Record<UserRole, Permission[]> — defines which roles hold which permissions

src/models/index.ts:
  - Re-export all models from a single barrel.

All fields must have JSDoc comments.
```

**POC — `src/models/__tests__/domain-models.test.ts`:**

```text
Test cases:
1. RunStatus enum contains exactly the five expected values.
2. RunType enum contains exactly the five expected types.
3. UserRole enum contains exactly the four roles.
4. RolePermissionMap covers all UserRole values.
5. RolePermissionMap — AGENT does not contain CREATE_RUN or MANAGE_USERS.
6. RolePermissionMap — ADMIN contains all Permission values.
7. RolePermissionMap — SUPERVISOR contains OVERRIDE_ACTION but not CONFIGURE_SYSTEM.
```

---

### Step 3 — Permission & Policy Layer

**Goal:** Implement a centralized permission resolution utility. All components, route guards, and facades must use this layer — never implement permission checks inline.

**Target files:**

```text
src/utils/permissions.ts
src/hooks/usePermissions.ts
src/components/atoms/Can.tsx
```

**Prompt (after contract):**

```text
Step 3 — Permission & Policy Layer.

src/utils/permissions.ts:
  - hasPermission(role: UserRole, permission: Permission): boolean
    Resolves from RolePermissionMap. Pure function. No side effects.
  - hasAnyPermission(role: UserRole, permissions: Permission[]): boolean
  - hasAllPermissions(role: UserRole, permissions: Permission[]): boolean
  - getPermissionsForRole(role: UserRole): Permission[]
  Full JSDoc on all exports.

src/hooks/usePermissions.ts:
  - usePermissions(): { can: (permission: Permission) => boolean; role: UserRole }
  Reads current user role from useAuthStore. Memoizes the can resolver.

src/components/atoms/Can.tsx:
  - <Can permission={Permission.CREATE_RUN}>{children}</Can>
  - Renders children only if the current user has the permission.
  - Accepts optional fallback prop for denied state.
  - Uses usePermissions() internally. Never accepts a role prop — permission only.

All three must have JSDoc.
```

**POC — `src/utils/__tests__/permissions.test.ts`:**

```text
Test cases:
1. hasPermission(AGENT, VIEW_RUNS) returns true.
2. hasPermission(AGENT, CREATE_RUN) returns false.
3. hasPermission(ADMIN, CONFIGURE_SYSTEM) returns true.
4. hasAnyPermission(DISPATCHER, [CREATE_RUN, CONFIGURE_SYSTEM]) returns true.
5. hasAllPermissions(SUPERVISOR, [VIEW_REPORTS, OVERRIDE_ACTION]) returns true.
6. hasAllPermissions(SUPERVISOR, [VIEW_REPORTS, CONFIGURE_SYSTEM]) returns false.
7. <Can permission={CREATE_RUN}> renders children when DISPATCHER role is active.
8. <Can permission={CONFIGURE_SYSTEM}> renders fallback when AGENT role is active.
```

---

### Step 4 — MSW Mock Layer & Service Facades

**Goal:** Build the full simulation layer. MSW handles all network interception. Facades expose typed business action methods that the UI calls. No component ever touches MSW handlers directly.

**Target files:**

```text
src/services/mock/data/runs.seed.ts
src/services/mock/data/users.seed.ts
src/services/mock/handlers/runs.handlers.ts
src/services/mock/handlers/users.handlers.ts
src/services/mock/handlers/auth.handlers.ts
src/services/mock/browser.ts
src/utils/delay.ts
src/services/facades/RunFacade.ts
src/services/facades/UserFacade.ts
src/services/facades/AuthFacade.ts
src/services/facades/index.ts
```

**Prompt (after contract):**

```text
Step 4 — MSW Mock Layer & Service Facades.

src/utils/delay.ts:
  - delay(ms: number): Promise<void> — simulates network latency.
  - randomDelay(min: number, max: number): Promise<void>
  - shouldSimulateError(rate = 0.15): boolean — returns true with 15% probability.

Seed data:
  - runs.seed.ts: generate 20 typed Run objects spanning all statuses, types, and priorities.
    Use deterministic IDs (run-001 ... run-020).
  - users.seed.ts: generate 10 typed User objects covering all four roles.
    Use deterministic IDs (user-001 ... user-010).

MSW handlers (each handler must):
  - Call randomDelay(200, 800) before responding.
  - Call shouldSimulateError() and return HTTP 500 with a typed ErrorResponse at the configured rate.
  - Return typed response bodies matching domain interfaces exactly.

runs.handlers.ts endpoints:
  GET  /api/runs                — paginated list, supports ?status= and ?agentId= filters
  GET  /api/runs/:id            — single run
  POST /api/runs                — create run (PENDING status)
  PUT  /api/runs/:id/assign     — assign agent (PENDING → ASSIGNED)
  PUT  /api/runs/:id/start      — start (ASSIGNED → IN_PROGRESS)
  PUT  /api/runs/:id/complete   — complete with notes + proof (IN_PROGRESS → COMPLETED)
  PUT  /api/runs/:id/cancel     — cancel with reason
  POST /api/runs/:id/proof      — upload proof attachment

users.handlers.ts endpoints:
  GET  /api/users               — list, supports ?role= filter
  GET  /api/users/:id           — single user
  POST /api/users               — create user
  PUT  /api/users/:id           — update user
  PUT  /api/users/:id/status    — update UserStatus

auth.handlers.ts endpoints:
  POST /api/auth/login          — returns { user: User, token: string }
  POST /api/auth/logout
  GET  /api/auth/me             — returns current user from session

browser.ts:
  - Export setupWorker(...handlers) for browser use.
  - Export a startMockWorker() function that only activates when NEXT_PUBLIC_MOCK_MODE=true.

Facades:
  RunFacade.ts — typed methods that call fetch (intercepted by MSW in mock mode):
    getRuns(filters?), getRunById(id), createRun(payload), assignRun(id, agentId),
    startRun(id), completeRun(id, payload), cancelRun(id, reason), uploadProof(id, file)
  
  UserFacade.ts:
    getUsers(filters?), getUserById(id), createUser(payload), updateUser(id, payload),
    updateUserStatus(id, status)
  
  AuthFacade.ts:
    login(email, password), logout(), getCurrentUser()

  All facade methods: typed params, typed returns (Promise<T>), JSDoc with @param and @returns.
  facades/index.ts: barrel export.
```

**POC — `src/services/facades/__tests__/facades.test.ts`:**

```text
Setup: Use MSW server (setupServer) with all handlers in a beforeAll block.

Test cases:
1. RunFacade.getRuns() returns an array of Run objects matching the Run interface.
2. RunFacade.getRuns({ status: 'PENDING' }) returns only PENDING runs.
3. RunFacade.getRunById('run-001') returns the correct run.
4. RunFacade.createRun(payload) returns a run with status PENDING.
5. RunFacade.assignRun('run-001', 'user-003') returns a run with status ASSIGNED.
6. RunFacade.completeRun('run-003', payload) returns a run with status COMPLETED.
7. UserFacade.getUsers({ role: 'AGENT' }) returns only AGENT users.
8. AuthFacade.login('admin@gov.br', 'password') returns a user and a token.
9. On simulated 500 error, RunFacade.getRuns() throws a typed ApiError.
```

---

### Step 5 — i18n Infrastructure

**Goal:** Configure all translation infrastructure. Every user-facing string in the admin panel must be resolved through i18next. No hardcoded UI text in JSX.

**Target files:**

```text
src/i18n/config.ts
src/i18n/locales/en/common.json
src/i18n/locales/en/runs.json
src/i18n/locales/en/users.json
src/i18n/locales/en/auth.json
src/i18n/locales/pt/common.json
src/i18n/locales/pt/runs.json
src/i18n/locales/pt/users.json
src/i18n/locales/pt/auth.json
src/app/layout.tsx          (integrate I18nProvider)
```

**Prompt (after contract):**

```text
Step 5 — i18n Infrastructure.

src/i18n/config.ts:
  - Initialize i18next with react-i18next.
  - Language detection: localStorage → navigator.language → fallback "en".
  - Namespaces: common, runs, users, auth.
  - Export a useT(namespace) wrapper over useTranslation for type safety.
  - Export a typed TranslationKey<NS> helper.

Locale files (English baseline — Portuguese mirrors same keys):

common.json keys (minimum):
  nav.dashboard, nav.runs, nav.agents, nav.dispatchers, nav.settings, nav.logout,
  status.pending, status.assigned, status.in_progress, status.completed, status.cancelled,
  priority.low, priority.medium, priority.high, priority.critical,
  role.agent, role.dispatcher, role.supervisor, role.admin,
  action.save, action.cancel, action.delete, action.confirm, action.back,
  action.assign, action.complete, action.upload,
  feedback.loading, feedback.error_generic, feedback.saved, feedback.no_results,
  time.just_now, time.minutes_ago, time.hours_ago

runs.json keys (minimum):
  run.title, run.type, run.status, run.priority, run.location, run.agent,
  run.created_at, run.completed_at, run.notes, run.proof, run.transitions,
  run.create_title, run.assign_title, run.complete_title,
  type.transport, type.inspection, type.emergency, type.maintenance, type.administrative,
  list.title, list.empty, list.filter_by_status, list.filter_by_type,
  detail.title, detail.assign_agent, detail.complete_run, detail.cancel_run

users.json keys (minimum):
  user.name, user.email, user.role, user.status, user.department, user.last_active,
  list.title, list.empty, list.filter_by_role,
  status.active, status.inactive, status.on_mission,
  create.title, edit.title

auth.json keys (minimum):
  login.title, login.subtitle, login.email, login.password, login.submit,
  login.error_invalid, login.error_network,
  session.expired

Update src/app/layout.tsx to wrap children with I18nextProvider.
All atoms from Step 1 must use i18n keys — update any hardcoded strings found.
```

**POC — `src/i18n/__tests__/i18n.test.ts`:**

```text
Test cases:
1. All keys defined in en/common.json have a corresponding key in pt/common.json.
2. All keys defined in en/runs.json have a corresponding key in pt/runs.json.
3. All keys defined in en/users.json have a corresponding key in pt/users.json.
4. useT('runs')('run.title') returns the correct English string.
5. StatusPill renders the correct runs i18n label for each RunStatus value.
6. No test file or component directly imports a locale JSON — all strings go through useT.
```

---

### Step 6 — Auth & Role-Based Routing

**Goal:** Implement authentication flow, session persistence, and role-aware route shells. Each role has its own navigation structure and only sees its permitted routes.

**Target files:**

```text
src/store/useAuthStore.ts
src/hooks/useCurrentUser.ts
src/app/(auth)/login/page.tsx
src/app/(auth)/login/LoginForm.tsx
src/app/(admin)/layout.tsx
src/app/(dispatcher)/layout.tsx
src/app/(supervisor)/layout.tsx
src/components/templates/DashboardShell.tsx
src/components/templates/Sidebar.tsx
src/components/templates/TopBar.tsx
```

**Prompt (after contract):**

```text
Step 6 — Auth & Role-Based Routing.

src/store/useAuthStore.ts (Zustand):
  State: user (User | null), token (string | null), isAuthenticated (boolean)
  Actions: setSession(user, token), clearSession()
  Persistence: use zustand/middleware persist with localStorage key "govmobile_session".

src/hooks/useCurrentUser.ts:
  Returns { user, isAuthenticated, role } from useAuthStore.
  Guards: throws if used outside authenticated context.

Login page (src/app/(auth)/login/):
  - LoginForm.tsx: React Hook Form + Zod schema (email required valid, password min 6).
    On submit calls AuthFacade.login(), stores session, redirects by role:
    ADMIN → /admin/dashboard | DISPATCHER → /dispatcher/dashboard | SUPERVISOR → /supervisor/reports
  - page.tsx: server component wrapping LoginForm.
  - Uses auth.json i18n namespace.
  - Shows toast on error. Shows loading state on submit.

Role shells (layouts):
  - Each layout checks isAuthenticated and required role using useCurrentUser + usePermissions.
  - Unauthorized: redirect to /login.
  - Wrong role: redirect to the correct role root path.
  - Renders DashboardShell with role-specific nav items.

DashboardShell.tsx:
  - Accepts navItems: NavItem[] (label i18n key, href, permission, icon).
  - Renders Sidebar (desktop) and collapsible drawer (mobile).
  - Renders TopBar with user avatar, role badge, and logout action.
  - Filters nav items using Can / usePermissions before rendering.

Sidebar.tsx and TopBar.tsx: pure presentational, all labels via i18n.
```

**POC — `src/app/__tests__/auth-routing.test.tsx`:**

```text
Setup: wrap render with I18nextProvider + QueryClientProvider + MSW server.

Test cases:
1. /login renders the login form with email and password fields.
2. Submitting valid credentials calls AuthFacade.login() and sets session in store.
3. Submitting invalid credentials shows the i18n error message.
4. Authenticated ADMIN navigates to /admin/dashboard after login.
5. Authenticated DISPATCHER navigates to /dispatcher/dashboard after login.
6. Unauthenticated visit to /admin/dashboard redirects to /login.
7. AGENT role visiting /admin/dashboard redirects to /login (wrong role).
8. DashboardShell only renders nav items permitted for the current role.
9. Clicking logout calls AuthFacade.logout() and clears the session store.
```

---

### Step 7 — Dashboard & Analytics

**Goal:** Build the operational overview screen for each role. Real-time stats, run status distribution, and priority queue summary.

**Target files:**

```text
src/components/organisms/StatsGrid.tsx
src/components/organisms/RunStatusChart.tsx
src/components/organisms/PriorityQueue.tsx
src/components/organisms/ActiveAgentsList.tsx
src/hooks/useRunStats.ts
src/app/(admin)/dashboard/page.tsx
src/app/(dispatcher)/dashboard/page.tsx
src/app/(supervisor)/reports/page.tsx
```

**Prompt (after contract):**

```text
Step 7 — Dashboard & Analytics.

src/hooks/useRunStats.ts:
  Uses TanStack Query to fetch GET /api/runs.
  Returns: totalRuns, byStatus (Record<RunStatus, number>), byPriority (Record<RunPriority, number>),
  activeAgents (number), completionRate (number), averageCompletionTime (minutes).
  Refetch interval: 30 seconds.

Organisms:

StatsGrid.tsx:
  4-cell metric grid: Total Runs | Active Agents | Completion Rate | Critical Pending.
  Each cell has an icon, label (i18n), value, and optional delta indicator.

RunStatusChart.tsx:
  Recharts PieChart or BarChart showing run count per RunStatus.
  Each segment/bar colored by the govmobile status token (from theme/tokens.ts).
  Uses runs i18n namespace for status labels.
  Shows a loading skeleton while fetching.

PriorityQueue.tsx:
  Scrollable list of PENDING + ASSIGNED runs ordered by priority (CRITICAL first).
  Each item: run title, type badge, priority badge, time since creation, assign button (guarded by Can).
  Empty state uses runs.list.empty i18n key.

ActiveAgentsList.tsx:
  List of AGENT users with status ON_MISSION or ACTIVE.
  Each row: avatar, name, current run (if assigned), UserStatus badge.

Pages:
  - /admin/dashboard: StatsGrid + RunStatusChart + PriorityQueue + ActiveAgentsList.
  - /dispatcher/dashboard: StatsGrid (filtered) + PriorityQueue + ActiveAgentsList.
  - /supervisor/reports: StatsGrid + RunStatusChart only (read-only, no assign actions).

All pages: use Suspense boundaries with skeleton fallbacks.
No hardcoded strings or color values.
```

**POC — `src/app/__tests__/dashboard.test.tsx`:**

```text
Test cases:
1. StatsGrid renders four metric cells with correct labels.
2. StatsGrid shows skeleton while data is loading.
3. RunStatusChart renders a chart element for each RunStatus value.
4. PriorityQueue renders CRITICAL runs before MEDIUM runs.
5. PriorityQueue shows the empty state when no runs are returned.
6. ActiveAgentsList renders agent rows from the mock user seed.
7. Assign button in PriorityQueue is visible for DISPATCHER role.
8. Assign button in PriorityQueue is hidden for SUPERVISOR role.
```

---

### Step 8 — Run Management Module

**Goal:** Full CRUD and lifecycle management interface for runs. Includes list, detail, create, assign, complete, and cancel flows with audit trail.

**Target files:**

```text
src/components/molecules/RunCard.tsx
src/components/molecules/RunFilters.tsx
src/components/organisms/RunTable.tsx
src/components/organisms/RunLifecycleActions.tsx
src/components/organisms/RunTransitionLog.tsx
src/hooks/useRuns.ts
src/hooks/useRunDetail.ts
src/app/(admin)/runs/page.tsx
src/app/(admin)/runs/[id]/page.tsx
src/app/(admin)/runs/new/page.tsx
src/app/(dispatcher)/runs/page.tsx
src/app/(dispatcher)/runs/[id]/page.tsx
```

**Prompt (after contract):**

```text
Step 8 — Run Management Module.

src/hooks/useRuns.ts:
  TanStack Query — fetches GET /api/runs with optional filter params.
  Exposes: runs, isLoading, error, refetch, filters, setFilters.

src/hooks/useRunDetail.ts:
  Fetches GET /api/runs/:id. Exposes: run, isLoading, error.
  Mutations: assignRun, startRun, completeRun, cancelRun — each invalidates the query on success.

RunCard.tsx:
  Compact card: title, RunType badge, RunStatus pill, priority badge, location, agent name, time ago.
  onClick navigates to the detail page.

RunFilters.tsx:
  Filter bar: status (multi-select), type (multi-select), priority (multi-select), search by title.
  Uses runs i18n namespace. Calls setFilters from useRuns.

RunTable.tsx:
  Sortable table of runs using RunCard rows. Pagination (20 per page).
  Shows total count. Loading skeleton for rows.

RunLifecycleActions.tsx:
  Renders context-aware action buttons based on current run.status and user role:
  - PENDING + DISPATCHER → Assign Agent (opens agent picker modal)
  - ASSIGNED + DISPATCHER → Start Run
  - IN_PROGRESS + DISPATCHER/SUPERVISOR → Complete Run (opens modal with notes + proof upload)
  - Any non-COMPLETED/CANCELLED + SUPERVISOR/DISPATCHER → Cancel (requires reason)
  All actions guarded by Can. All labels via runs i18n.

RunTransitionLog.tsx:
  Ordered list of RunTransition entries for a run.
  Each row: fromStatus → toStatus, actor name, timestamp, reason.

Pages:
  /runs (list): RunFilters + RunTable. ADMIN sees all. DISPATCHER sees only their department.
  /runs/[id] (detail): run header, RunLifecycleActions, RunTransitionLog, proof attachments.
  /runs/new (create): React Hook Form with Zod. Fields: title, type, priority, location, description.
    On submit calls RunFacade.createRun(). Redirects to the new run detail page.
```

**POC — `src/app/__tests__/run-management.test.tsx`:**

```text
Test cases:
1. RunTable renders a row for each run returned by MSW.
2. RunFilters status filter calls setFilters with the correct value.
3. Search input debounces and filters runs by title.
4. DISPATCHER sees "Assign Agent" button on a PENDING run detail.
5. SUPERVISOR does not see "Assign Agent" button.
6. Assign Agent action calls RunFacade.assignRun and invalidates the query.
7. Complete Run modal requires notes field before submitting.
8. Cancel Run modal requires a reason before confirming.
9. RunTransitionLog renders one entry per RunTransition in the run.
10. Create run form shows Zod validation errors for missing required fields.
11. Successful create run redirects to the new run's detail page.
```

---

### Step 9 — Agent & User Management

**Goal:** Admin-only screens for full user management: list, create, edit, deactivate, and role assignment. Includes department-aware filtering.

**Target files:**

```text
src/components/molecules/UserRow.tsx
src/components/organisms/UserTable.tsx
src/hooks/useUsers.ts
src/hooks/useUserDetail.ts
src/app/(admin)/agents/page.tsx
src/app/(admin)/agents/[id]/page.tsx
src/app/(admin)/agents/new/page.tsx
src/app/(admin)/dispatchers/page.tsx
src/app/(admin)/settings/page.tsx
```

**Prompt (after contract):**

```text
Step 9 — Agent & User Management.

All pages in this step require Permission.MANAGE_USERS. Enforce via Can and route guard.

src/hooks/useUsers.ts:
  Fetches GET /api/users with optional role filter.
  Exposes: users, isLoading, error, refetch, filters, setFilters.

src/hooks/useUserDetail.ts:
  Fetches GET /api/users/:id.
  Mutations: updateUser, updateUserStatus — each invalidates the query on success.

UserRow.tsx:
  Table row: Avatar + name, email, role badge, UserStatus badge, last active time, edit button.

UserTable.tsx:
  Table with UserRow rows. Filter by role (tabs: AGENT | DISPATCHER | SUPERVISOR | ADMIN).
  Sort by name or last active. Pagination (20 per page). Loading skeleton.

Agent list page (/admin/agents):
  UserTable filtered to role=AGENT.
  "New Agent" button (ADMIN only, guarded by Can) navigates to /admin/agents/new.

Agent detail page (/admin/agents/[id]):
  User profile card: avatar, name, email, role, status, department.
  Recent runs list (last 10 runs assigned to this agent).
  Edit form: name, email, status (Active/Inactive). Role cannot be changed here — by design.
  Deactivate action: sets UserStatus to INACTIVE with confirmation dialog.

Agent create page (/admin/agents/new):
  Form: name (required), email (required, valid), role (select), department.
  On success: redirect to the created user's detail page.

Dispatchers page (/admin/dispatchers):
  Same as agents page but filtered to role=DISPATCHER.

Settings page (/admin/settings):
  Language switcher (changes i18next language and persists to localStorage).
  Theme preview (reserved slot — no implementation required yet).
  Current user profile section.
```

**POC — `src/app/__tests__/user-management.test.tsx`:**

```text
Test cases:
1. UserTable renders a row for each user returned by MSW (role=AGENT filter).
2. Role tab filter calls setFilters with correct role value.
3. "New Agent" button is visible for ADMIN role.
4. "New Agent" button is hidden for DISPATCHER role.
5. Create user form validates email format.
6. Successful user creation redirects to the new user's detail page.
7. Deactivate button shows a confirmation dialog before calling updateUserStatus.
8. UserStatus badge updates immediately after deactivation (optimistic update).
9. Agent detail page shows the last 10 runs for that agent.
```

---

### Step 10 — Final Assembly & Observability

**Goal:** Wire all modules together, add global error boundaries, network state detection, toast notifications, and validate the full app boots without errors under all role contexts.

**Target files:**

```text
src/app/layout.tsx                (providers tree finalization)
src/app/error.tsx                 (Next.js error boundary)
src/app/not-found.tsx
src/components/atoms/Toast.tsx
src/components/atoms/NetworkBanner.tsx
src/hooks/useNetworkStatus.ts
src/hooks/useToast.ts
src/app/(admin)/dashboard/page.tsx   (final wiring check)
src/app/(dispatcher)/dashboard/page.tsx
src/app/(supervisor)/reports/page.tsx
```

**Prompt (after contract):**

```text
Step 10 — Final Assembly & Observability.

Provider tree in src/app/layout.tsx:
  Order: I18nextProvider → QueryClientProvider (with ReactQueryDevtools in dev) →
  ZustandHydrator → ToastProvider → children.
  Ensure MSW startMockWorker() is called in a client-side effect only when NEXT_PUBLIC_MOCK_MODE=true.

src/app/error.tsx:
  Next.js error boundary: shows a friendly i18n error message + "Reload" button.
  Logs error details to console in development only.

src/app/not-found.tsx:
  404 page with navigation back to the user's role root.

Toast system:
  - Toast.tsx: accessible toast using Radix Toast. Variants: success | warning | error | info.
    All labels via common i18n namespace.
  - useToast.ts: imperative hook — toast.success(key), toast.error(key), toast.info(key).
  - Integrate toast calls into: all facade mutation errors, all lifecycle action successes.

NetworkBanner.tsx:
  - Displays a dismissible banner when navigator.onLine is false.
  - Uses useNetworkStatus.ts (listens to online/offline window events).
  - Label via common.feedback i18n key.

Final integration checks:
  - All pages use Suspense with correct skeleton fallbacks.
  - All forms show loading state during mutation.
  - TanStack Query error states surface via useToast.
  - All role shells boot without console errors in mock mode.
  - Run type-check (tsc --noEmit) passes with zero errors.
```

**POC — `src/app/__tests__/final-assembly.test.tsx`:**

```text
Test cases:
1. App renders without crashing under ADMIN session in mock mode.
2. App renders without crashing under DISPATCHER session in mock mode.
3. App renders without crashing under SUPERVISOR session in mock mode.
4. error.tsx renders the i18n error message when a component throws.
5. not-found.tsx renders and links back to the correct role root.
6. NetworkBanner appears when navigator.onLine is set to false.
7. NetworkBanner disappears when navigator.onLine is restored to true.
8. Facade mutation error triggers a toast with the error variant.
9. Successful run assignment triggers a toast with the success variant.
10. tsc --noEmit exits with code 0.
```

---

## 5. Definition of Done Per Step

A step is complete only when **all** of the following pass:

| Check | Command |
|---|---|
| TypeScript clean | `npx tsc --noEmit` |
| Step POC tests pass | `npx vitest run src/.../__tests__/<step>.test.tsx` |
| No hardcoded strings in JSX | `grep -r "\"[A-Z]" src/app src/components` → zero matches |
| No hardcoded design tokens | `grep -r "color:" src/components` → zero matches outside `theme/` |
| Public APIs documented | All exported hooks, facades, utils have JSDoc |
| Permissions validated | All write actions guarded by `<Can>` or `usePermissions` |
| MSW handler exists | Every facade method has a corresponding MSW handler |
| i18n keys complete | pt locale mirrors all en keys for the step's namespaces |

---

## 6. Documentation Map

| Document | Path |
|---|---|
| Engineering standards | `docs/engineering-standards.md` |
| Commit rules | `docs/commit-rules.md` |
| Design system | `docs/design-system.md` |
| i18n conventions | `docs/i18n-conventions.md` |
| Facade pattern guide | `docs/facade-pattern.md` |
| MSW mock layer guide | `docs/mock-layer.md` |
| AI implementation prompts | `docs/implementation/admin-panel-prompt-guide.md` |

---

## 7. Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_MOCK_MODE=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Run (mock mode)

```bash
npm run dev
```

### Run tests

```bash
npm run test           # run all tests
npm run test:watch     # watch mode
npm run type-check     # TypeScript validation only
```

### Conventional commit

```bash
git commit -m "feat(runs): implement run lifecycle actions with facade pattern"
git commit -m "feat(auth): add role-based route shells and session persistence"
git commit -m "test(dashboard): add StatsGrid and PriorityQueue POC tests"
```

---

> **Scope reminder:** This README covers the interface layer only.
> All data originates from the MSW mock layer.
> The swap to a real API requires only replacing the facade implementations
> in `src/services/api/` and toggling `NEXT_PUBLIC_MOCK_MODE=false`.
