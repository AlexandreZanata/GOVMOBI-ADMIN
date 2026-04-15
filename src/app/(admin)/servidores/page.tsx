import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { ServidoresPageClient } from "@/components/organisms/ServidoresPageClient";
import { UserRole } from "@/models";

/**
 * Servidores management page — lists, creates, edits, and manages
 * activation state of public servants.
 *
 * @returns Admin servidores route with permission-aware content
 */
export default function ServidoresPage() {
  return (
    <PermissionsProvider role={UserRole.ADMIN}>
      <Suspense
        fallback={
          <section className="space-y-3">
            <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-24 w-full animate-pulse rounded-md bg-neutral-200" />
          </section>
        }
      >
        <ServidoresPageClient />
      </Suspense>
    </PermissionsProvider>
  );
}
