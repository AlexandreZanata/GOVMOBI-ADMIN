import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { MotoristasPageClient } from "@/components/organisms/MotoristasPageClient";
import { UserRole } from "@/models";

/**
 * Motoristas management page — lists, registers, edits, and manages
 * operational status and activation state of motoristas.
 *
 * @returns Admin motoristas route with permission-aware content
 */
export default function MotoristasPage() {
  return (
    <PermissionsProvider role={UserRole.ADMIN}>
      <Suspense
        fallback={
          <section
            data-testid="motoristas-suspense-fallback"
            className="space-y-3"
          >
            <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-24 w-full animate-pulse rounded-md bg-neutral-200" />
          </section>
        }
      >
        <MotoristasPageClient />
      </Suspense>
    </PermissionsProvider>
  );
}
