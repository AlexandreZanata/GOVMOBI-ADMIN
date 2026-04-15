# Design Pattern Quick Reference — GOVMOBI-ADMIN

> One-page cheat sheet. For full details follow the links.

---

## Interaction Patterns

| Pattern             | When to Use                                              | Key Rule                                           |
|---------------------|----------------------------------------------------------|----------------------------------------------------|
| Confirmation Dialog | Any destructive or irreversible action                   | Mandatory reason field for overrides/cancellations |
| Optimistic Update   | Mutations with high success rate (assign, status change) | Always roll back on error with toast               |
| Inline Edit         | Simple field edits (run title, notes)                    | Show save/cancel inline; never auto-save           |
| Bulk Action         | Operating on multiple runs at once                       | Show count in confirmation; audit each item        |
| Error Recovery      | Any failed mutation                                      | Show error toast + retry button                    |

---

## Loading Patterns

| State                     | Pattern                          | Component                   |
|---------------------------|----------------------------------|-----------------------------|
| Initial page load         | Skeleton screen                  | `<RunListSkeleton />`       |
| Button action in progress | Button spinner (`isLoading`)     | `<Button isLoading>`        |
| Background refetch        | Subtle spinner in header         | TanStack Query `isFetching` |
| Stale data                | "Last updated X ago" indicator   | `updatedAt` timestamp       |
| Empty state               | Illustrated empty state + action | `<EmptyState />`            |

---

## Navigation Patterns

| Pattern         | Implementation                                                 |
|-----------------|----------------------------------------------------------------|
| Page transition | Instant (no animation) — operational context                   |
| Modal open      | Fade in 150ms — `prefers-reduced-motion` respected             |
| Drawer open     | Slide in 200ms from right — `prefers-reduced-motion` respected |
| Back navigation | Browser back or explicit "Back" button — never auto-navigate   |
| Breadcrumb      | Always shown for nested routes (runs/[id], users/[id])         |

---

## Status Communication

Always use color + text. Never color alone.

```tsx
// ✅ Color + text
<StatusPill status={RunStatus.IN_PROGRESS} />

// ✅ Color + icon + text (for alerts)
<AlertBanner variant="warning" icon={<WarningIcon />}>
  {t("runs:alerts.agentUnresponsive")}
</AlertBanner>

// ❌ Color only
<span className="bg-warning w-3 h-3 rounded-full" />
```

---

## Confirmation Dialog Pattern

```tsx
// Mandatory for: cancel run, override status, deactivate user, role change
<ConfirmDialog
  title={t("runs:override.title")}
  description={t("runs:override.description")}
  requireReason  // mandatory for override and cancel
  onConfirm={handleOverride}
  variant="destructive"
/>
```

---

## Error State Pattern

```tsx
// Every data-fetching component
if (isError) return (
  <ErrorState
    message={t("common:errors.loadFailed")}
    onRetry={refetch}
  />
);
```

---

## Empty State Pattern

```tsx
if (!data?.items.length) return (
  <EmptyState
    title={t("runs:empty.title")}
    description={t("runs:empty.description")}
    action={
      <Can perform="run:create">
        <Button onClick={openCreateDialog}>
          {t("runs:actions.create")}
        </Button>
      </Can>
    }
  />
);
```

---

## Performance Quick Rules

| Rule                      | Threshold                                    |
|---------------------------|----------------------------------------------|
| Virtualize lists          | > 50 items                                   |
| Paginate API results      | Default 25, max 100                          |
| Memoize expensive renders | > 10ms render time                           |
| Code-split routes         | All routes (Next.js does this automatically) |
| Bundle size budget        | < 200KB gzipped per route                    |
