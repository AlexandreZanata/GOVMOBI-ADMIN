/**
 * Route-level loading UI for the Dashboard page.
 * Rendered instantly by Next.js App Router while the page JS loads.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-36 animate-pulse rounded-md bg-neutral-200" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-neutral-200" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-neutral-200" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 w-full animate-pulse rounded-2xl bg-neutral-200" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-neutral-200" />
      </div>

      {/* Rankings skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 w-full animate-pulse rounded-2xl bg-neutral-200" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-neutral-200" />
      </div>
    </div>
  );
}
