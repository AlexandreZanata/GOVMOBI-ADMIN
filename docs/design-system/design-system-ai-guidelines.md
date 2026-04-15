# Design System AI Guidelines — GOVMOBI-ADMIN

> **Audience:** AI coding assistants (Kiro, Copilot, Claude, etc.) and engineers using AI tools
> **Cross-links:** [`design-system.md`](./design-system.md) · [`design-system-tokens.md`](./design-system-tokens.md) · [`../implementation/ai-driver-dispatcher-prompt-guide.md`](../implementation/ai-driver-dispatcher-prompt-guide.md) · [`../engineering-standards.md`](../engineering-standards.md)

---

## Mandatory Rules for AI-Generated Code

When generating any UI component or modifying existing ones, AI assistants MUST follow these rules without exception.

---

### Rule 1: Use Design Tokens — Never Hardcode Values

```tsx
// ✅ REQUIRED
<div className="bg-brand-primary text-white" />
<div className="rounded-[var(--radius-md)]" />
<div className="text-danger" />
<div className="bg-neutral-50 border-neutral-200" />

// ❌ FORBIDDEN — will be rejected in code review
<div style={{ backgroundColor: "#1a56db" }} />
<div className="bg-blue-600" />
<div className="rounded-lg" /> // only if not mapped to a token
<div style={{ color: "red" }} />
```

### Rule 2: Use i18n for All User-Visible Strings

```tsx
// ✅ REQUIRED
const { t } = useTranslation("runs");
<Button>{t("runs:actions.assign")}</Button>
<input aria-label={t("common:search")} />

// ❌ FORBIDDEN
<Button>Assign Agent</Button>
<input aria-label="Search" />
```

### Rule 3: Include data-testid on Every New Component

```tsx
// ✅ REQUIRED
<Button data-testid="button-assign-agent" />
<Input data-testid="input-run-title" />
<StatusPill data-testid={`status-pill-${run.id}`} />

// ❌ FORBIDDEN — component without data-testid
<Button onClick={handleAssign}>Assign</Button>
```

### Rule 4: Include JSDoc on Every Exported Element

```tsx
// ✅ REQUIRED
/**
 * Displays the current status of a Run as a color-coded pill.
 *
 * @param props.status - RunStatus enum value
 * @param props.data-testid - Test selector
 * @returns Accessible status badge with color and text label
 */
export function StatusPill({ status, "data-testid": testId }: StatusPillProps) {
  return <span data-testid={testId}>{status}</span>;
}

// ❌ FORBIDDEN — exported component without JSDoc
export function StatusPillWithoutDoc({ status }: StatusPillProps) {
  return <span>{status}</span>;
}
```

### Rule 5: Follow the Data Flow — No Direct Fetch in Components

```tsx
// ✅ REQUIRED — component calls hook
function RunList() {
  const { data, isLoading, isError } = useRunList(filters);
}

// ✅ REQUIRED — hook calls facade
function useRunList(filters: RunFilters) {
  return useQuery({
    queryKey: runKeys.list(filters),
    queryFn: () => runFacade.getList(filters),
  });
}

// ❌ FORBIDDEN — direct fetch in component
function RunListWithDirectFetch() {
  const [runs, setRuns] = useState([]);
  useEffect(() => {
    fetch("/api/runs").then(r => r.json()).then(setRuns);
  }, []);
}
```

### Rule 6: Use Permission Gates — Never Hardcode Role Checks

```tsx
// ✅ REQUIRED
<Can perform="run:override">
  <Button variant="destructive">Override Status</Button>
</Can>

const { can } = usePermissions();
const canCreate = can("run:create");

// ❌ FORBIDDEN
const isSupervisor = user.role === "SUPERVISOR";
const showOverride = user.role !== "DISPATCHER";
```

### Rule 7: Handle All Three States — Loading, Error, Empty

- ✅ REQUIRED pattern: `if (isLoading) return <RunListSkeleton />; if (isError) return <ErrorState onRetry={refetch} />; if (!data?.items.length) return <EmptyState />;`
- ❌ FORBIDDEN pattern: `return <RunTable runs={data?.items ?? []} />;` (without dedicated loading/error/empty states)

### Rule 8: Zero TypeScript `any`

- ✅ REQUIRED: `const runPage: PaginatedResponse<Run> = await runFacade.getList(filters);`
- ❌ FORBIDDEN: `const runPageAny: any = await runFacade.getList(filters); const data = runPageAny as any;`

---

## Prompt Templates for AI Assistants

Use these templates when asking an AI to generate code for this project.

### Template: New Atom Component

```
Create a new atom component called [ComponentName] for GOVMOBI-ADMIN.

Requirements:
- File: src/components/atoms/[ComponentName].tsx
- "use client" directive (atoms are client components)
- Props interface exported as [ComponentName]Props
- data-testid prop accepted
- All user-visible strings use useTranslation() from react-i18next
- All colors use design tokens from src/theme/tokens.ts (no hardcoded values)
- JSDoc on the exported function with @param and @returns
- Tailwind classes only (no inline styles)
- Export added to src/components/atoms/index.ts

The component should: [describe behavior]
Variants: [list variants if applicable]
i18n keys needed: [list keys and namespaces]
```

### Template: New Hook

```
Create a custom hook called use[HookName] for GOVMOBI-ADMIN.

Requirements:
- File: src/hooks/use[HookName].ts
- Uses TanStack Query (useQuery or useMutation)
- Calls [domainFacade].[method]() — never calls fetch directly
- Query key uses the [domain]Keys factory pattern
- Returns isLoading, isError, data (or mutate, isPending for mutations)
- Full TypeScript types — zero any
- JSDoc on the exported function

The hook should: [describe behavior]
Facade method to call: [facadeMethod]
Query key: [domain]Keys.[keyName]([params])
```

### Template: New Facade Method

```
Add a method to src/facades/[domain]Facade.ts for GOVMOBI-ADMIN.

Requirements:
- Method name: [methodName]
- Calls fetch to: [HTTP_METHOD] /v1/[endpoint]
- Input type: [InputType] (define if it doesn't exist)
- Return type: [ReturnType] (from src/types/ or src/models/)
- Uses handleApiResponse<T>() for error parsing
- JSDoc with @param, @returns, @throws ApiError
- Corresponding MSW handler added to src/msw/[domain]Handlers.ts

The method should: [describe behavior]
Error cases to handle: [list error cases]
```

---

## What AI Must NOT Do

| Forbidden Action                                   | Reason                                    |
|----------------------------------------------------|-------------------------------------------|
| Add `tailwind.config.ts` or `tailwind.config.js`   | Tailwind v4 uses CSS-first config         |
| Use `@tailwind base/components/utilities`          | Tailwind v4 uses `@import 'tailwindcss'`  |
| Use `vite-tsconfig-paths` plugin                   | Replaced by `resolve.tsconfigPaths: true` |
| Import from `react-i18next` without `"use client"` | i18n hooks require client components      |
| Create a Zustand store for API data                | Use TanStack Query for server state       |
| Add `Pages Router` files (`pages/`)                | This project uses App Router only         |
| Use `getServerSideProps` or `getStaticProps`       | App Router uses async Server Components   |
| Use `next/router`                                  | App Router uses `next/navigation`         |

---

## Review Checklist

- [ ] All 8 mandatory rules have correct and forbidden examples
- [ ] Prompt templates cover atom, hook, and facade creation
- [ ] "What AI must NOT do" table covers Next.js 16 / Tailwind v4 specific pitfalls
- [ ] Rules are consistent with engineering-standards.md
