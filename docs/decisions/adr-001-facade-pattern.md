# ADR-001: Facade Pattern as API Abstraction Layer

> **Status:** Accepted
> **Date:** 2026-04-15
> **Deciders:** Engineering Lead, Senior Frontend Engineers
> **Cross-links:** [`../architecture/system-design.md`](../architecture/system-design.md) · [`../engineering-standards.md`](../engineering-standards.md)

---

## Context

The admin panel makes many API calls across multiple domains (runs, users, departments, audit). Without a structured abstraction, API calls tend to proliferate across hooks, components, and utilities — making the codebase hard to test, hard to mock, and tightly coupled to the API contract.

Additionally, during early development, the real API is not yet available. We need a clean seam where MSW mocks can substitute for real API calls without touching component or hook code.

The team evaluated three approaches:
1. Direct `fetch` calls in hooks
2. A repository pattern (class-based)
3. A facade pattern (plain object with async methods)

---

## Decision

We adopt the **Facade pattern** as the mandatory abstraction layer between hooks and the network layer (real API or MSW).

Every domain has exactly one facade file (`src/facades/{domain}Facade.ts`). Hooks call facade methods. Facades call `fetch`. MSW intercepts `fetch` in development and test environments.

```
UI Component → Custom Hook → Facade → fetch ← MSW (dev/test) | Real API (prod)
```

No component or hook may call `fetch` directly.

---

## Rationale

- **Testability:** Hooks can be tested by controlling MSW handlers — no need to mock the facade itself.
- **Replaceability:** Switching from REST to GraphQL or adding request middleware only requires changing the facade, not every hook.
- **Clarity:** A single file per domain makes it obvious where all API calls for that domain live.
- **MSW compatibility:** MSW intercepts at the `fetch` level, so the facade requires no modification between dev/test and production.

---

## Alternatives Considered

### Option A: Direct fetch in hooks

```typescript
// In useRunList.ts
const data = await fetch("/api/runs");
```

**Pros:** Simple, no extra layer.
**Cons:** Impossible to test without mocking `fetch` globally. Business logic mixed with transport. No single place to add auth headers, error parsing, or logging.

**Rejected:** Violates separation of concerns; makes testing fragile.

### Option B: Class-based Repository

```typescript
class RunRepository {
  async getList(filters: RunFilters) {
    throw new Error("Example only");
  }
}
export const runRepository = new RunRepository();
```

**Pros:** Familiar OOP pattern; supports dependency injection.
**Cons:** Unnecessary complexity for a frontend context. Class instantiation adds boilerplate. No meaningful benefit over a plain object facade in this use case.

**Rejected:** Over-engineered for the problem at hand.

---

## Consequences

### Positive
- All API calls are centralized and discoverable
- Hooks are testable via MSW without any mocking of the facade
- Adding request middleware (auth headers, retry logic) is a single-file change
- The seam between frontend and backend is explicit and auditable

### Negative / Trade-offs
- One extra layer of indirection for simple CRUD operations
- Engineers must remember to add new API calls to the facade, not directly in hooks

### Risks
- Facade files can grow large if a domain has many endpoints — mitigate by splitting into sub-facades if a file exceeds ~200 lines

---

## Compliance

- **Engineering Standards:** Enforced via code review checklist item "No direct fetch in components or hooks"
- **Testing:** All facade methods must have unit tests covering success and error paths (see [`../testing-strategy.md`](../testing-strategy.md))
- **MSW:** Every facade method must have a corresponding MSW handler

---

## Review Checklist

- [ ] Context explains the problem clearly
- [ ] Decision is unambiguous
- [ ] All three alternatives were genuinely considered
- [ ] Consequences include the trade-off (extra indirection layer)
- [ ] Compliance section links to enforcement mechanisms
