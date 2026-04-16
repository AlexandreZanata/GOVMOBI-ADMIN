/**
 * Route-level loading UI for the Users page.
 * Rendered instantly by Next.js App Router while the page JS loads.
 */
export default function UsersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded-md bg-neutral-200" />
        <div className="h-8 w-28 animate-pulse rounded-md bg-neutral-200" />
      </div>
      <div className="space-y-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
