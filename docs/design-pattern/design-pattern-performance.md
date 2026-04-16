# Performance Patterns — GOVMOBI-ADMIN

> **Cross-links:** [`design-pattern.md`](./design-pattern.md) · [`../architecture/system-design.md`](../architecture/system-design.md) · [`../devops.md`](../devops.md)

---

## Performance Budgets (Enforced in CI)

| Metric                         | Budget           | Measurement             |
|--------------------------------|------------------|-------------------------|
| First Load JS per route        | < 200 KB gzipped | `next build` output     |
| Largest Contentful Paint (LCP) | < 2.5s           | Lighthouse / RUM        |
| Dashboard data load            | < 2s (p95)       | TanStack Query timing   |
| Run list render (100 items)    | < 100ms          | React DevTools profiler |
| Time to Interactive (TTI)      | < 3.5s           | Lighthouse              |

---

## 1. Code Splitting

Next.js App Router automatically code-splits at the route level. No manual configuration needed for route-level splitting.

**For heavy components within a route, use dynamic imports:**

```tsx
// ✅ Lazy-load heavy chart/report components
import dynamic from "next/dynamic";

const RunsReportChart = dynamic(
  () => import("@/components/organisms/RunsReportChart"),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts are client-only
  }
);
```

### Rules

- Lazy-load any component > 50KB that is not needed on initial render.
- Always provide a `loading` fallback for dynamic imports.
- Use `ssr: false` for components that use browser-only APIs.

---

## 2. List Virtualization

**Use when:** A list renders more than 50 items simultaneously.

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualRunList({ runs }: { runs: Run[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: runs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Row height in px
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: virtualItem.start,
              height: virtualItem.size,
              width: "100%",
            }}
          >
            <RunRow run={runs[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Rules

- Virtualize any list that can exceed 50 items.
- Default to server-side pagination (25 items per page) before reaching for virtualization.
- Virtualization and pagination can be combined for very large datasets.

---

## 3. Memoization

**Use `useMemo` when:** A computation is expensive (> 10ms) and its inputs change infrequently.

**Use `useCallback` when:** A function is passed as a prop to a memoized child component.

**Use `React.memo` when:** A component re-renders frequently with the same props.

```tsx
// ✅ useMemo for expensive filter computation
const filteredRuns = useMemo(
  () => runs.filter(run => matchesFilters(run, filters)),
  [runs, filters]
);

// ✅ useCallback for stable event handler passed to memoized child
const handleRowClick = useCallback(
  (runId: string) => router.push(`/runs/${runId}`),
  [router]
);

// ✅ React.memo for a row component that renders many times
const RunRow = React.memo(function RunRow({ run }: { run: Run }) {
  return <tr>...</tr>;
});
```

### Rules

- Do not memoize everything — only when there is a measurable performance problem.
- Profile with React DevTools before adding memoization.
- `useMemo` and `useCallback` have a cost — unnecessary use makes code harder to read.

---

## 4. TanStack Query Caching Strategy

```typescript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // Data is fresh for 30 seconds
      gcTime: 5 * 60_000,     // Cache retained for 5 minutes after unmount
      retry: 2,               // Retry failed requests twice
      refetchOnWindowFocus: true, // Refetch when user returns to tab
    },
  },
});

// Per-query overrides
// Audit trail — always fresh (no stale time)
useQuery({
  queryKey: auditKeys.list(filters),
  queryFn: () => auditFacade.getList(filters),
  staleTime: 0,
});

// Department list — rarely changes (longer stale time)
useQuery({
  queryKey: departmentKeys.all,
  queryFn: () => departmentFacade.getList(),
  staleTime: 5 * 60_000, // 5 minutes
});
```

---

## 5. Image and Asset Optimization

- Use `next/image` for all images (automatic WebP conversion, lazy loading, size optimization).
- SVG icons are inlined as React components (no external requests).
- Fonts are loaded via `next/font/google` (automatic subsetting and preloading).

```tsx
// ✅ Correct
import Image from "next/image";
<Image src="/logo.png" alt="GovMobile" width={120} height={40} priority />

// ❌ Forbidden — unoptimized img tag
<img src="/logo.png" alt="GovMobile" />
```

---

## 6. Bundle Analysis

```bash
# Analyze bundle composition
ANALYZE=true npm run build

# Check bundle sizes in CI
npm run build 2>&1 | grep "First Load JS"
```

If a route exceeds the 200KB budget:
1. Identify the largest modules with bundle analyzer.
2. Apply dynamic imports for non-critical components.
3. Check for duplicate dependencies.
4. Consider moving heavy logic to server components.

---

## Review Checklist

- [ ] Performance budgets are defined with measurement methods
- [ ] Code splitting rules cover both route-level and component-level
- [ ] Virtualization threshold (50 items) is documented
- [ ] Memoization rules include "when NOT to use"
- [ ] TanStack Query caching strategy has per-domain overrides
- [ ] Bundle analysis process is documented
