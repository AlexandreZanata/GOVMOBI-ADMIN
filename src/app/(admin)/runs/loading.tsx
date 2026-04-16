/**
 * Route-level loading UI for the Runs page.
 * Rendered instantly by Next.js App Router while the page JS loads.
 */
export default function RunsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded-md bg-neutral-200" />
        <div className="flex gap-2">
          <div className="h-8 w-28 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-8 w-28 animate-pulse rounded-md bg-neutral-200" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
