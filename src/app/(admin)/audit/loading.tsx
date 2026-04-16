/**
 * Route-level loading UI for the Audit Trail page.
 */
export default function AuditLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-36 animate-pulse rounded-md bg-neutral-200" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
