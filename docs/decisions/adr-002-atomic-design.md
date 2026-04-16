# ADR-002: Atomic Design as Component Architecture

> **Status:** Accepted
> **Date:** 2026-04-15
> **Deciders:** Engineering Lead, Design Lead, Senior Frontend Engineers
> **Cross-links:** [`../design-system/design-system.md`](../design-system/design-system.md) · [`../engineering-standards.md`](../engineering-standards.md)

---

## Context

The admin panel requires a large number of UI components across many feature domains. Without a clear component hierarchy, components tend to become monolithic, hard to reuse, and inconsistently styled. The team needed a shared mental model for component granularity that both engineers and designers could use.

---

## Decision

We adopt **Atomic Design** as the component architecture, with five levels:

| Level         | Path                        | Description                          | Examples                                 |
|---------------|-----------------------------|--------------------------------------|------------------------------------------|
| **Atoms**     | `src/components/atoms/`     | Smallest indivisible UI units        | Button, Badge, Input, Avatar, StatusPill |
| **Molecules** | `src/components/molecules/` | Composed atoms with a single purpose | FormField, SearchBar, RunStatusFilter    |
| **Organisms** | `src/components/organisms/` | Feature-level UI sections            | RunTable, UserCard, AuditLogEntry        |
| **Templates** | `src/components/templates/` | Page layout shells                   | AdminShell, AuthLayout                   |
| **Pages**     | `src/app/`                  | Next.js route pages                  | Handled by App Router                    |

### Governance Rules

1. **Atoms** have zero business logic. They accept props and render UI.
2. **Molecules** may have local UI state (e.g. dropdown open/close) but no API calls.
3. **Organisms** may use hooks and access server state via TanStack Query.
4. **Templates** define layout only — no data fetching.
5. **A lower-level component may never import from a higher level.**

```typescript
// ✅ Atom importing from nothing (leaf)
// ✅ Molecule importing from atoms
// ✅ Organism importing from molecules and atoms
// ❌ Atom importing from a molecule
// ❌ Molecule importing from an organism
```

---

## Rationale

- **Shared vocabulary:** Designers and engineers use the same terms (atom, molecule, organism).
- **Reusability:** Atoms and molecules are domain-agnostic and reusable across features.
- **Testability:** Atoms are easy to unit test in isolation; organisms are tested with MSW.
- **Scalability:** New features add organisms without touching atoms.

---

## Alternatives Considered

### Option A: Feature-based folders

```
src/components/
  runs/
  users/
  dashboard/
```

**Pros:** Co-locates everything for a feature.
**Cons:** Shared components get duplicated or placed arbitrarily. No clear reuse hierarchy.

**Rejected:** Leads to duplication and inconsistency at scale.

### Option B: Flat components folder

```
src/components/
  Button.tsx
  RunTable.tsx
  UserCard.tsx
```

**Pros:** Simple.
**Cons:** No hierarchy; no guidance on granularity; becomes unmanageable beyond ~20 components.

**Rejected:** Does not scale.

---

## Consequences

### Positive
- Clear, enforced component hierarchy
- Atoms are fully reusable and independently testable
- Designers and engineers share a common language
- New team members can orient quickly

### Negative / Trade-offs
- Requires discipline to place components at the correct level
- "Molecule vs. organism" boundary can be ambiguous — resolved by the rule: if it uses a hook, it's an organism

### Risks
- Organisms can grow too large — mitigate by splitting into sub-organisms if a file exceeds ~150 lines

---

## Compliance

- **Folder structure** is enforced by the `src/` layout in [`../engineering-standards.md`](../engineering-standards.md)
- **Import direction** is enforced via code review
- **Atom standards** (data-testid, JSDoc, i18n, tokens) are enforced via PR checklist

---

## Review Checklist

- [ ] Five levels are defined with paths and examples
- [ ] Governance rules are explicit (especially import direction)
- [ ] Alternatives were genuinely considered
- [ ] "Molecule vs. organism" ambiguity is resolved
