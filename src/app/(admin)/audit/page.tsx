import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { AuditPageClient } from "@/components/organisms/AuditPageClient";
import { UserRole } from "@/models";

/**
 * Audit trail page — read-only timeline of state-changing operations.
 *
 * @returns Admin audit route with permission-aware content
 */
export default function AuditPage() {
  return (
    <PermissionsProvider role={UserRole.SUPERVISOR}>
      <Suspense
        fallback={
          <section data-testid="audit-suspense-fallback" className="space-y-3">
            <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-24 w-full animate-pulse rounded-md bg-neutral-200" />
          </section>
        }
      >
        <AuditPageClient />
      </Suspense>
    </PermissionsProvider>
  );
}
