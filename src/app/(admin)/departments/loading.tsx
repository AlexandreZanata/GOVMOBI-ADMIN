/**
 * Route-level loading UI for the Departments page.
 * Rendered instantly by Next.js App Router while the page JS loads.
 */
export default function DepartmentsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-36 animate-pulse rounded-md bg-neutral-200" />
        <div className="h-8 w-32 animate-pulse rounded-md bg-neutral-200" />
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-full animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </section>
    </div>
  );
}
