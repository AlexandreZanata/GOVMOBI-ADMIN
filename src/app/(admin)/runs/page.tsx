import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { RunsPageClient } from "@/components/organisms/RunsPageClient";
import { UserRole } from "@/models";

/**
 * Runs management page for operational dispatch workflows.
 *
 * @returns Admin runs route with permission-aware content
 */
export default function RunsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PermissionsProvider role={UserRole.DISPATCHER}>
        <Suspense
          fallback={
            <section data-testid="runs-suspense-fallback" className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-[var(--radius-md)] bg-neutral-200" />
              <div className="h-24 w-full animate-pulse rounded-[var(--radius-md)] bg-neutral-200" />
            </section>
          }
        >
          <RunsPageClient />
        </Suspense>
      </PermissionsProvider>
    </div>
  );
}
