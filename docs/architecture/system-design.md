# System Design — GOVMOBI-ADMIN Frontend Architecture

> **Status:** Authoritative
> **Owner:** Engineering Lead
> **Last reviewed:** See git log
> **Cross-links:** [`../engineering-standards.md`](../engineering-standards.md) · [`../decisions/adr-001-facade-pattern.md`](../decisions/adr-001-facade-pattern.md) · [`../decisions/adr-002-atomic-design.md`](../decisions/adr-002-atomic-design.md) · [`../decisions/adr-003-client-state-strategy.md`](../decisions/adr-003-client-state-strategy.md) · [`../api-contract.md`](../api-contract.md)

---

## 1. Architecture Overview

GOVMOBI-ADMIN is a **Next.js 16 App Router** application with a strict layered architecture. Every data interaction follows a single, enforced flow:

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / Client                     │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Server      │    │  Client      │                  │
│  │  Components  │    │  Components  │ ← "use client"   │
│  │  (default)   │    │  (explicit)  │                  │
│  └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                           │
│         └─────────┬─────────┘                           │
│                   ▼                                     │
│           ┌──────────────┐                             │
│           │  Custom Hooks │  ← TanStack Query /        │
│           │  (use*.ts)    │    Zustand                  │
│           └──────┬───────┘                             │
│                  ▼                                      │
│           ┌──────────────┐                             │
│           │   Facades    │  ← runFacade, userFacade    │
│           │  (*Facade.ts) │                             │
│           └──────┬───────┘                             │
└──────────────────┼──────────────────────────────────────┘
                   ▼
     ┌─────────────────────────┐
     │  MSW (dev/test)         │  ← Intercepts fetch
     │  or Real API (prod)     │
     └─────────────────────────┘
```

**The flow is unidirectional and non-negotiable.** See [`../engineering-standards.md`](../engineering-standards.md) for enforcement rules.

---

## 2. Next.js App Router Structure

### Route Groups

```
src/app/
  (auth)/                   ← Login, session expiry pages (no admin shell)
    login/
      page.tsx
    layout.tsx              ← Minimal layout (no sidebar/nav)

  (admin)/                  ← Authenticated admin shell
    layout.tsx              ← Admin shell: sidebar, topbar, permission provider
    dashboard/
      page.tsx
    runs/
      page.tsx              ← Run list
      [id]/
        page.tsx            ← Run detail
    users/
      page.tsx
      [id]/
        page.tsx
    departments/
      page.tsx
    audit/
      page.tsx
    reports/
      page.tsx              ← v2 / Analyst role

  layout.tsx                ← Root layout (fonts, global CSS, metadata)
  page.tsx                  ← Redirect to /dashboard or /login
```

### Rendering Strategy

| Route               | Strategy                          | Reason                                                     |
|---------------------|-----------------------------------|------------------------------------------------------------|
| `(auth)/login`      | Server Component                  | No interactivity at page level                             |
| `(admin)/layout`    | Server Component                  | Shell is static; interactive children use `"use client"`   |
| `(admin)/dashboard` | Server Component + Client islands | Initial data fetched server-side; live updates client-side |
| `(admin)/runs`      | Client Component                  | Requires filtering, pagination, real-time status           |
| `(admin)/runs/[id]` | Server Component + Client islands | Static detail + interactive actions                        |
| `(admin)/audit`     | Server Component                  | Read-only, paginated                                       |

---

## 3. Module Boundaries

### Modules and Ownership

| Module        | Path                        | Responsibility        | Can Import From                             |
|---------------|-----------------------------|-----------------------|---------------------------------------------|
| **Atoms**     | `src/components/atoms/`     | Primitive UI elements | `models/`, `theme/`, `i18n/`                |
| **Molecules** | `src/components/molecules/` | Composed atoms        | `atoms/`, `models/`, `hooks/`               |
| **Organisms** | `src/components/organisms/` | Feature-level UI      | `molecules/`, `atoms/`, `hooks/`, `stores/` |
| **Templates** | `src/components/templates/` | Page layout shells    | `organisms/`, `molecules/`                  |
| **Hooks**     | `src/hooks/`                | Data orchestration    | `facades/`, `stores/`, `models/`            |
| **Facades**   | `src/facades/`              | API abstraction       | `types/`, `models/`                         |
| **Stores**    | `src/stores/`               | Client state          | `models/`, `types/`                         |
| **MSW**       | `src/msw/`                  | Mock handlers         | `models/`, `types/`                         |
| **Models**    | `src/models/`               | Domain types/enums    | Nothing (leaf module)                       |
| **Types**     | `src/types/`                | Shared TS types       | `models/`                                   |

### Forbidden Cross-Module Imports

```typescript
// ❌ Atom importing from a hook
import { useRunList } from "@/hooks/useRunList"; // in an atom

// ❌ Facade importing from a component
import { Button } from "@/components/atoms/Button"; // in a facade

// ❌ Store importing from a hook
import { useRunQuery } from "@/hooks/useRunQuery"; // in a store

// ❌ Component importing from MSW
import { runHandlers } from "@/msw/runHandlers"; // in a component
```

---

## 4. State Management Strategy

### Two-Layer State Model

```
┌─────────────────────────────────────────────────────┐
│                   State Layers                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         Server State (TanStack Query)        │   │
│  │                                             │   │
│  │  • Run list, run detail                     │   │
│  │  • User list, user detail                   │   │
│  │  • Department list                          │   │
│  │  • Audit trail                              │   │
│  │  • Automatic caching, background refetch    │   │
│  │  • Optimistic updates for mutations         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         Client State (Zustand)               │   │
│  │                                             │   │
│  │  • Active filters (status, department, etc) │   │
│  │  • Modal open/close state                   │   │
│  │  • Current user session / role context      │   │
│  │  • Toast/notification queue                 │   │
│  │  • Sidebar collapsed state                  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### TanStack Query Conventions

```typescript
// Query key factory pattern (mandatory)
export const runKeys = {
  all: ["runs"] as const,
  list: (filters: RunFilters) => ["runs", "list", filters] as const,
  detail: (id: string) => ["runs", "detail", id] as const,
};

// Hook pattern (mandatory)
export function useRunList(filters: RunFilters) {
  return useQuery({
    queryKey: runKeys.list(filters),
    queryFn: () => runFacade.getList(filters),
    staleTime: 30_000, // 30 seconds
  });
}
```

### Zustand Store Conventions

```typescript
// One store per domain (mandatory)
// src/stores/runStore.ts
interface RunStore {
  filters: RunFilters;
  setFilters: (filters: Partial<RunFilters>) => void;
  resetFilters: () => void;
}

export const useRunStore = create<RunStore>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
```

---

## 5. Facade Pattern

See [`../decisions/adr-001-facade-pattern.md`](../decisions/adr-001-facade-pattern.md) for the decision record.

### Facade Structure

```typescript
// src/facades/runFacade.ts

/**
 * Run domain facade — single point of contact for all run API operations.
 * Used exclusively by hooks; never called directly from components.
 */
export const runFacade = {
  /**
   * Fetches a paginated list of runs.
   * @param filters - Active filter state
   * @returns Paginated run list
   * @throws ApiError on network or server failure
   */
  async getList(filters: RunFilters): Promise<PaginatedResponse<Run>> {
    const response = await fetch(`/api/runs?${toQueryString(filters)}`);
    return handleApiResponse<PaginatedResponse<Run>>(response);
  },

  // Other domain operations follow the same fetch + error handling pattern.
  async getById(id: string): Promise<Run> {
    throw new Error("Not implemented in documentation snippet");
  },
  async create(data: CreateRunInput): Promise<Run> {
    throw new Error("Not implemented in documentation snippet");
  },
  async assign(id: string, agentId: string): Promise<Run> {
    throw new Error("Not implemented in documentation snippet");
  },
  async cancel(id: string, reason: string): Promise<Run> {
    throw new Error("Not implemented in documentation snippet");
  },
  async override(id: string, input: OverrideInput): Promise<Run> {
    throw new Error("Not implemented in documentation snippet");
  },
};
```

---

## 6. MSW Mock Layer

- **Mandatory in development and test environments.**
- MSW handlers live in `src/msw/` — one file per domain.
- Handlers must simulate: realistic latency (200–800ms), error states (4xx, 5xx), and full lifecycle transitions.
- **Forbidden:** Importing MSW handlers from any file outside `src/msw/` and `src/test/`.

```typescript
// src/msw/runHandlers.ts
export const runHandlers = [
  http.get("/api/runs", async ({ request }) => {
    await delay(300); // Simulate network latency
    const url = new URL(request.url);
    // ... filter and return mock data
    return HttpResponse.json(mockRunList);
  }),

  http.post("/api/runs/:id/override", async ({ request }) => {
    await delay(500);
    // Simulate permission check
    const body = await request.json();
    if (!body.reason) {
      return HttpResponse.json(
        { code: "VALIDATION_ERROR", message: "Reason is required" },
        { status: 422 }
      );
    }
    return HttpResponse.json(mockOverriddenRun);
  }),
];
```

---

## 7. Authentication and Session

- Authentication is handled externally (SSO/OAuth2). The admin panel receives a JWT.
- The JWT is stored in an `httpOnly` cookie (set by the auth service — not accessible to JavaScript).
- All API requests include the cookie automatically.
- Session expiry is handled by redirecting to `(auth)/login` with a `?reason=session_expired` param.
- The current user's role and department are decoded from the JWT and stored in a Zustand session store.
- **Forbidden:** Storing the JWT in `localStorage` or `sessionStorage`.

---

## 8. Permission Architecture

```typescript
// src/stores/sessionStore.ts
interface SessionStore {
  user: AuthenticatedUser | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
}

// src/hooks/usePermissions.ts
export function usePermissions() {
  const { permissions, hasPermission } = useSessionStore();
  return { permissions, can: hasPermission };
}

// src/components/atoms/Can.tsx
export function Can({
  perform,
  children,
  fallback = null,
}: CanProps) {
  const { can } = usePermissions();
  return can(perform) ? children : fallback;
}
```

---

## 9. Error Handling

### API Error Model

```typescript
interface ApiError {
  code: string;        // Machine-readable: "VALIDATION_ERROR", "NOT_FOUND", etc.
  message: string;     // Human-readable description
  field?: string;      // For validation errors: which field failed
  details?: unknown;   // Optional additional context
}
```

### Error Handling Layers

| Layer     | Responsibility                                                    |
|-----------|-------------------------------------------------------------------|
| Facade    | Parses HTTP errors into `ApiError`; throws typed errors           |
| Hook      | Catches errors from TanStack Query; exposes `isError` and `error` |
| Component | Renders error state UI; shows toast for mutation errors           |
| Global    | `global-error.tsx` catches unhandled errors; shows fallback UI    |

---

## 10. Performance Targets

| Metric                      | Target          | Measurement             |
|-----------------------------|-----------------|-------------------------|
| Initial page load (LCP)     | < 2.5s          | Lighthouse / RUM        |
| Dashboard data load         | < 2s (p95)      | TanStack Query timing   |
| Run list render (100 items) | < 100ms         | React DevTools profiler |
| Bundle size (initial JS)    | < 200KB gzipped | `next build` output     |

See [`../design-pattern/design-pattern-performance.md`](../design-pattern/design-pattern-performance.md) for implementation patterns.

---

## Review Checklist

- [ ] Architecture diagram accurately reflects the actual implementation
- [ ] All module boundaries are defined with forbidden import rules
- [ ] State management split (TanStack Query vs. Zustand) is clear and unambiguous
- [ ] Facade pattern is documented with a concrete code example
- [ ] MSW mock layer conventions are defined
- [ ] Authentication and session strategy is documented
- [ ] Permission architecture matches the `<Can />` and `usePermissions()` implementation
- [ ] Error model is consistent with `api-contract.md`
- [ ] Performance targets have measurement methods
