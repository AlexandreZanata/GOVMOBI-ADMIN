# Loading Patterns — GOVMOBI-ADMIN

> **Cross-links:** [`design-pattern.md`](./design-pattern.md) · [`../design-system/design-system-components.md`](../design-system/design-system-components.md)

---

## Loading State Decision Tree

```
Is the user waiting for initial data?
  └─ Yes → Skeleton screen

Is the user waiting for a button action?
  └─ Yes → Button isLoading spinner

Is data refreshing in the background?
  └─ Yes → Subtle isFetching indicator (not blocking)

Is data potentially stale?
  └─ Yes → "Last updated X ago" timestamp

Is there no data at all?
  └─ Yes → Empty state (not a loading state)
```

---

## 1. Skeleton Screen

**Use for:** Initial page load, initial list load, initial detail view load.

**Do not use for:** Background refetches or button actions.

```tsx
// RunListSkeleton — matches the shape of the real RunTable
function RunListSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label={t("common:loading")}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-[var(--radius-md)] bg-neutral-200 animate-pulse"
        />
      ))}
    </div>
  );
}

// Usage
const { data, isLoading } = useRunList(filters);
if (isLoading) return <RunListSkeleton />;
```

### Rules

- Skeleton must match the approximate shape and size of the real content.
- Use `animate-pulse` (Tailwind) for the shimmer effect.
- Set `aria-busy="true"` and `aria-label` on the skeleton container.
- Do not show a skeleton for background refetches — use the `isFetching` indicator instead.

---

## 2. Button Loading Spinner

**Use for:** Any button that triggers an async action (save, assign, cancel, override).

```tsx
<Button
  variant="primary"
  isLoading={isAssigning}
  onClick={handleAssign}
  data-testid="button-assign-agent"
>
  {t("runs:actions.assign")}
</Button>
```

### Rules

- The button label remains visible alongside the spinner (do not replace text with spinner).
- The button is `disabled` while loading (prevents double-submission).
- `aria-busy="true"` is set automatically by the `Button` component when `isLoading=true`.
- The spinner is the SVG defined in `Button.tsx` — do not use a different spinner component.

---

## 3. Background Refetch Indicator

**Use for:** Indicating that data is being refreshed in the background (TanStack Query `isFetching`).

```tsx
function RunsPageHeader() {
  const { isFetching } = useRunList(filters);

  return (
    <div className="flex items-center gap-2">
      <h1>{t("runs:title")}</h1>
      {isFetching && (
        <span
          className="text-xs text-neutral-500 flex items-center gap-1"
          aria-live="polite"
        >
          <SpinnerIcon className="h-3 w-3 animate-spin" aria-hidden="true" />
          {t("common:refreshing")}
        </span>
      )}
    </div>
  );
}
```

### Rules

- Background refetch indicator must be subtle — it should not disrupt the user's current task.
- Use `aria-live="polite"` so screen readers announce it without interrupting.
- Do not block interaction during background refetch.

---

## 4. Stale Data Indicator

**Use for:** Showing when data was last successfully fetched, especially in operational dashboards.

```tsx
function RunDetailHeader({ run }: { run: Run }) {
  return (
    <div className="flex items-center justify-between">
      <h2>{run.title}</h2>
      <span className="text-xs text-neutral-500">
        {t("common:lastUpdated", {
          time: formatRelativeTime(run.updatedAt)
        })}
      </span>
    </div>
  );
}
```

### Rules

- Show "last updated" timestamp on detail views and dashboards.
- If data is older than the `staleTime` threshold, show a "Refresh" button.
- Never silently serve stale data without any indication.

---

## 5. Empty State

**Use for:** When a query succeeds but returns no results.

```tsx
function RunsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="runs-empty-state"
    >
      <EmptyRunsIllustration aria-hidden="true" />
      <h3 className="mt-4 text-neutral-800 font-medium">
        {t("runs:empty.title")}
      </h3>
      <p className="mt-2 text-neutral-500 text-sm max-w-sm">
        {t("runs:empty.description")}
      </p>
      <Can perform="run:create">
        <Button className="mt-6" onClick={openCreateDialog}>
          {t("runs:actions.create")}
        </Button>
      </Can>
    </div>
  );
}
```

### Rules

- Empty state must explain why there is no data (no results vs. no permission vs. filtered out).
- Include a contextual action when appropriate (e.g. "Create Run" for empty run list).
- Wrap the action in `<Can />` — do not show actions the user cannot perform.
- "No results for current filters" empty state must include a "Clear filters" action.

---

## TanStack Query State Mapping

```tsx
// Mandatory pattern for all data-fetching components
function RunList() {
  const { data, isLoading, isFetching, isError, refetch } = useRunList(filters);

  // 1. Initial load
  if (isLoading) return <RunListSkeleton />;

  // 2. Error
  if (isError) return <ErrorState onRetry={refetch} />;

  // 3. Empty
  if (!data?.items.length) return <RunsEmptyState />;

  // 4. Data (with optional background fetch indicator)
  return (
    <>
      {isFetching && <BackgroundRefetchIndicator />}
      <RunTable runs={data.items} />
    </>
  );
}
```

---

## Review Checklist

- [ ] All five loading states are documented with implementation examples
- [ ] Decision tree covers all cases
- [ ] TanStack Query state mapping is complete (isLoading, isFetching, isError, empty)
- [ ] Accessibility requirements (aria-busy, aria-live) are documented per pattern
- [ ] Rules distinguish initial load from background refetch
