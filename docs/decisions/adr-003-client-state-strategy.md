# ADR-003: Client State Strategy — Zustand + TanStack Query

> **Status:** Accepted
> **Date:** 2026-04-15
> **Deciders:** Engineering Lead, Senior Frontend Engineers
> **Note:** The original spec referenced "Redux Toolkit" — this ADR documents the actual decision and the rationale for not choosing Redux Toolkit.
> **Cross-links:** [`../architecture/system-design.md`](../architecture/system-design.md) · [`../engineering-standards.md`](../engineering-standards.md)

---

## Context

The admin panel has two distinct categories of state:

1. **Server state** — data that lives on the server and is fetched, cached, and synchronized: run lists, user lists, audit trail, department data.
2. **Client state** — UI state that lives only in the browser: active filters, modal open/close, sidebar collapsed, current session/role context, toast queue.

These two categories have fundamentally different characteristics and should be managed by different tools. The team evaluated three approaches:
- Redux Toolkit (RTK) for all state
- TanStack Query for server state + Redux Toolkit for client state
- TanStack Query for server state + Zustand for client state

---

## Decision

We use:
- **TanStack Query** for all server/remote state
- **Zustand** for all client/UI state

Redux Toolkit is not used.

---

## Rationale

### Why TanStack Query for server state

Server state has unique requirements: caching, background refetching, stale-while-revalidate, optimistic updates, and request deduplication. TanStack Query handles all of these out of the box. Implementing equivalent behavior with Redux Toolkit requires significant boilerplate (RTK Query is better, but still more complex than TanStack Query for this use case).

### Why Zustand for client state

Client state in the admin panel is simple: a handful of stores for filters, modals, and session context. Zustand provides:
- Minimal boilerplate (no actions, reducers, or slices)
- TypeScript-first API
- No Provider required (uses module-level stores)
- Tiny bundle size (~1KB)

### Why not Redux Toolkit

Redux Toolkit is well-suited for complex, interconnected client state with many derived values and time-travel debugging needs. The admin panel's client state does not meet this threshold. RTK would add:
- Significant boilerplate (slices, actions, selectors)
- A larger bundle
- A steeper learning curve for new contributors
- No meaningful benefit over Zustand for the actual state complexity we have

RTK Query (the server state solution in RTK) is a valid alternative to TanStack Query, but TanStack Query has a larger ecosystem, better documentation, and more flexible cache invalidation.

---

## Alternatives Considered

### Option A: Redux Toolkit for all state

**Pros:** Single state management solution; familiar to many engineers; excellent DevTools.
**Cons:** Significant boilerplate; RTK Query is less flexible than TanStack Query; overkill for simple client state.

**Rejected:** Complexity does not match the problem.

### Option B: TanStack Query + Redux Toolkit

**Pros:** Best-in-class for both server and client state.
**Cons:** Two large libraries; RTK adds boilerplate for simple client state that Zustand handles in 10 lines.

**Rejected:** Zustand is sufficient for client state; RTK adds unnecessary weight.

### Option C: TanStack Query + React Context

**Pros:** No additional library for client state.
**Cons:** Context re-renders all consumers on every state change; poor performance for frequently-updated state (filters, toasts).

**Rejected:** Performance concerns for filter state that changes on every keystroke.

---

## State Boundary Rules (Mandatory)

| State          | Tool                         | Examples                                  |
|----------------|------------------------------|-------------------------------------------|
| Remote data    | TanStack Query               | Run list, user detail, audit trail        |
| Mutations      | TanStack Query `useMutation` | Create run, assign agent, override status |
| Active filters | Zustand                      | `useRunStore.filters`                     |
| Modal state    | Zustand                      | `useUIStore.isOverrideDialogOpen`         |
| Session / role | Zustand                      | `useSessionStore.user`                    |
| Toast queue    | Zustand                      | `useToastStore.toasts`                    |
| Form state     | React controlled state       | Local to the form component               |
| URL state      | Next.js `searchParams`       | Pagination, shareable filters             |

**Forbidden:** Using Zustand to cache API responses. **Forbidden:** Using TanStack Query for UI state.

---

## Consequences

### Positive
- Server state is automatically cached, deduplicated, and kept fresh
- Client state stores are small, focused, and easy to test
- Minimal boilerplate — new stores take ~15 lines
- Bundle size is significantly smaller than RTK

### Negative / Trade-offs
- Two libraries to learn instead of one
- No Redux DevTools for client state (Zustand has its own devtools middleware)
- Engineers must consciously decide which tool to use for new state

### Risks
- Blurring the boundary (e.g. caching API data in Zustand) — mitigated by the state boundary rules table above and code review

---

## Compliance

- State boundary rules are enforced via code review
- TanStack Query key factory pattern is mandatory (see [`../architecture/system-design.md`](../architecture/system-design.md))
- Zustand stores must be scoped per domain (no global god-store)

---

## Review Checklist

- [ ] Both tools are justified with specific rationale
- [ ] Redux Toolkit rejection is explicitly documented
- [ ] State boundary rules table is complete and unambiguous
- [ ] Forbidden patterns are stated
- [ ] Consequences include the trade-off (two libraries)
