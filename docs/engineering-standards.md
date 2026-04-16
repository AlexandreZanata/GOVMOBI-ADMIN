# Engineering Standards — GOVMOBI-ADMIN

> **Status:** Authoritative — Mandatory for all contributors
> **Owner:** Engineering Lead
> **Last reviewed:** See git log
> **Cross-links:** [`architecture/system-design.md`](./architecture/system-design.md) · [`testing-strategy.md`](./testing-strategy.md) · [`git-workflow.md`](./git-workflow.md) · [`commit-rules.md`](./commit-rules.md)

---

## 1. TypeScript Standards

### Mandatory Rules

| Rule                                                                     | Enforcement                                        |
|--------------------------------------------------------------------------|----------------------------------------------------|
| `strict: true` in `tsconfig.json`                                        | ✅ Already configured                               |
| Zero use of `any`                                                        | ESLint `@typescript-eslint/no-explicit-any: error` |
| All exported functions must have explicit return types                   | ESLint rule                                        |
| All props interfaces must be explicitly typed (no inferred object types) | Code review                                        |
| Enums for all domain status values (e.g. `RunStatus`)                    | Code review — see `src/models/run.ts`              |
| No `as` type assertions without a comment explaining why                 | Code review                                        |
| No `!` non-null assertions without a comment explaining why              | Code review                                        |

### Type Organization

```
src/
  models/          ← Domain types and enums (RunStatus, UserRole, etc.)
  types/           ← Shared utility types, API response shapes
  components/      ← Component prop types defined in the same file as the component
```

- **Mandatory:** Domain models live in `src/models/`. Never define domain types inline in components.
- **Mandatory:** API response types live in `src/types/api.ts`. Never define them in hooks or facades.
- **Forbidden:** Importing types from component files into non-component files.

---

## 2. Architecture Rules

### The Data Flow Contract (Mandatory)

```
UI Component → Custom Hook → Facade → (MSW Mock | API)
```

| Layer        | Responsibility                                                     | Forbidden                                 |
|--------------|--------------------------------------------------------------------|-------------------------------------------|
| UI Component | Render, handle user events, call hooks                             | Direct fetch, business logic, mock access |
| Custom Hook  | Orchestrate data fetching and mutations via TanStack Query         | Direct API calls, UI logic                |
| Facade       | Abstract API calls; single point of contact with the network layer | UI logic, state management                |
| MSW Handler  | Simulate API responses with realistic latency and errors           | Being called from UI or hooks directly    |

**Violation of this flow is a blocking PR review issue.**

### Server vs. Client Components

- **Default:** All components are Server Components unless they require interactivity.
- **Use `"use client"` when:** The component uses `useState`, `useEffect`, event handlers, browser APIs, or custom hooks.
- **Mandatory:** All atom components (`src/components/atoms/`) are Client Components (they use i18n hooks and event handlers).
- **Forbidden:** Importing server-only modules into Client Components.

### State Management Rules

| State Type                          | Tool                                          | Rule                                                 |
|-------------------------------------|-----------------------------------------------|------------------------------------------------------|
| Server/remote data                  | TanStack Query                                | All API data goes through `useQuery` / `useMutation` |
| UI state (modals, filters, session) | Zustand                                       | Scoped stores; no global god-store                   |
| Form state                          | React controlled components or a form library | No Zustand for form state                            |
| URL state (filters, pagination)     | Next.js `searchParams`                        | Persist filterable state in URL                      |

---

## 3. Folder and File Conventions

### Source Structure

```
src/
  app/                    ← Next.js App Router (routes, layouts, pages)
    (admin)/              ← Route group for authenticated admin shell
    (auth)/               ← Route group for login/auth flows
  components/
    atoms/                ← Smallest reusable UI units (Button, Badge, Input, etc.)
    molecules/            ← Composed atoms (FormField, SearchBar, etc.)
    organisms/            ← Feature-level components (RunTable, UserCard, etc.)
    templates/            ← Page layout shells
  facades/                ← API abstraction layer (one file per domain)
  hooks/                  ← Custom React hooks (one file per concern)
  models/                 ← Domain types and enums
  stores/                 ← Zustand stores (one file per domain)
  theme/                  ← Design tokens and CSS
  types/                  ← Shared TypeScript types
  i18n/                   ← i18next config and locale files
  test/                   ← Test utilities, mocks, setup
  msw/                    ← MSW handlers (one file per domain)
```

### File Naming

| Type             | Convention                        | Example                   |
|------------------|-----------------------------------|---------------------------|
| React components | PascalCase `.tsx`                 | `RunStatusPill.tsx`       |
| Hooks            | camelCase, `use` prefix           | `useRunList.ts`           |
| Facades          | camelCase, `Facade` suffix        | `runFacade.ts`            |
| Zustand stores   | camelCase, `Store` suffix         | `runStore.ts`             |
| MSW handlers     | camelCase, `Handlers` suffix      | `runHandlers.ts`          |
| Types/models     | camelCase                         | `run.ts`, `user.ts`       |
| Test files       | Same name as subject, `.test.tsx` | `Button.test.tsx`         |
| Test utilities   | camelCase                         | `renderWithProviders.tsx` |

### Import Rules (Mandatory)

```typescript
// ✅ Correct — absolute import via @/ alias
import { Button } from "@/components/atoms/Button";
import { RunStatus } from "@/models/run";

// ❌ Forbidden — relative imports crossing module boundaries
import { Button } from "../../../components/atoms/Button";

// ✅ Correct — barrel export from index
import { Button, Badge, Input } from "@/components/atoms";

// ❌ Forbidden — importing from component internals
import { variantClasses } from "@/components/atoms/Button";
```

---

## 4. Component Standards

### Every Exported Component Must

- [ ] Accept a `data-testid` prop
- [ ] Use i18n for all user-visible strings (no hardcoded English)
- [ ] Use design tokens only (no hardcoded colors, no inline styles)
- [ ] Include JSDoc with `@param` and `@returns`
- [ ] Be typed with an explicit props interface
- [ ] Export its props interface for consumers

### JSDoc Template (Mandatory)

```tsx
/**
 * Brief description of what this component does.
 *
 * @param props.variant - Visual style variant
 * @param props.isLoading - Shows spinner and disables interaction
 * @param props.children - Button label content
 * @returns Accessible button element
 */
export function Button({ variant, isLoading, children }: ButtonProps) {
  return <button>{children}</button>;
}
```

### Forbidden Patterns

```tsx
// ❌ Hardcoded color
<div style={{ color: "#1a56db" }} />

// ❌ Hardcoded string
<button aria-label="Submit form">Submit</button>

// ❌ Inline style
<span style={{ padding: "8px 16px" }}>Label</span>

// ❌ Role check in component
if (user.role === "ADMIN") {
  return null;
}

// ❌ Direct fetch in component
fetch("/api/runs").then((r) => r.json());
```

---

## 5. Styling Rules

- **Mandatory:** Use Tailwind utility classes only.
- **Mandatory:** Use design tokens from `src/theme/tokens.ts` for all color, radius, and font references.
- **Forbidden:** Hardcoded color values anywhere in component files.
- **Forbidden:** Inline `style` props (except for dynamic values that cannot be expressed as Tailwind classes — must include a comment).
- **Forbidden:** CSS Modules for component styling (use Tailwind; CSS Modules only for global/layout concerns).
- **Recommended:** Use `cn()` or equivalent class merging utility for conditional class composition.

---

## 6. Internationalization (i18n)

- **Mandatory:** All user-visible strings must use `useTranslation()` from `react-i18next`.
- **Mandatory:** Use namespaces: `common`, `runs`, `users`, `auth`.
- **Forbidden:** Hardcoded English strings in component JSX or aria attributes.
- **Mandatory:** i18n keys must be descriptive: `runs:status.PENDING`, not `runs:s1`.
- **Mandatory:** New i18n keys must be added to all locale files simultaneously (even if only `en` is active).

---

## 7. Permission System

- **Mandatory:** Use `usePermissions()` hook or `<Can />` component for all role-based UI gating.
- **Forbidden:** Hardcoded role checks (`if (user.role === "ADMIN")`) in components.
- **Mandatory:** Permission gates are UX-only. The API must enforce all permissions server-side.

```tsx
// ✅ Correct
<Can perform="run:override">
  <Button variant="destructive">Override Status</Button>
</Can>

// ❌ Forbidden
const showOverrideForSupervisor = user.role === "SUPERVISOR";
```

---

## 8. Testing Minimums (Mandatory)

| Layer         | Minimum Coverage                                    | Tool                     |
|---------------|-----------------------------------------------------|--------------------------|
| Atoms         | 100% of variants and states                         | Vitest + Testing Library |
| Hooks         | All query/mutation states (loading, success, error) | Vitest + MSW             |
| Facades       | All endpoints, success + error paths                | Vitest + MSW             |
| Feature flows | Happy path + permission denial + error state        | Vitest + Testing Library |
| E2E           | Critical paths (login, run assignment, override)    | Playwright               |

See [`testing-strategy.md`](./testing-strategy.md) for full details.

---

## 9. Observability Requirements

Every feature must handle and render:

| State      | Required UI                                                  |
|------------|--------------------------------------------------------------|
| Loading    | Skeleton or spinner (see design-pattern-loading-gestures.md) |
| Error      | Error message with retry action                              |
| Empty      | Empty state with contextual message and action               |
| Stale data | Visual indicator when data may be outdated                   |

**Mandatory:** Use TanStack Query's `isLoading`, `isError`, `data` states — never manage these manually.

---

## 10. Code Review Standards

### PR Requirements (Mandatory)

- [ ] TypeScript compiles with zero errors (`npx tsc --noEmit`)
- [ ] All tests pass (`npm run test`)
- [ ] No new ESLint errors (`npm run lint`)
- [ ] No hardcoded strings, colors, or role checks
- [ ] Data flow follows UI → Hook → Facade → API
- [ ] New components have `data-testid`, JSDoc, and i18n
- [ ] Affected documentation is updated or explicitly noted as unchanged
- [ ] Commit messages follow [`commit-rules.md`](./commit-rules.md)

### Review Checklist for Reviewers

- [ ] Does the code follow the architecture data flow?
- [ ] Are permissions enforced via `<Can />` or `usePermissions()`?
- [ ] Are all user-visible strings using i18n?
- [ ] Are design tokens used (no hardcoded colors)?
- [ ] Are loading, error, and empty states handled?
- [ ] Are tests present and meaningful (not just coverage padding)?
- [ ] Is JSDoc present on all exported elements?

### Blocking Issues (Must Fix Before Merge)

- Any `any` type without justification comment
- Direct fetch in a component
- Hardcoded role check in a component
- Missing `data-testid` on a new component
- Missing tests for a new feature
- Broken TypeScript compilation

### Non-Blocking Issues (Should Fix, Can Merge)

- Missing JSDoc on internal (non-exported) functions
- Suboptimal Tailwind class ordering
- Minor naming inconsistencies

---

## Review Checklist

- [ ] TypeScript strict rules are documented and enforced via ESLint
- [ ] Architecture data flow is clearly defined with forbidden patterns
- [ ] Folder structure matches the actual `src/` layout
- [ ] All component standards are actionable and checkable
- [ ] Testing minimums are defined per layer
- [ ] Code review checklist distinguishes blocking from non-blocking issues
- [ ] i18n and permission rules are explicit
