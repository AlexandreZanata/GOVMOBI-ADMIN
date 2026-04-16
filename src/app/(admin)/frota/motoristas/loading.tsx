/**
 * Route-level loading UI for the Motoristas page.
 */
export default function MotoristasLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 animate-pulse rounded-md bg-neutral-200" />
        <div className="h-8 w-28 animate-pulse rounded-md bg-neutral-200" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
