import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { UsersPageClient } from "@/components/organisms/UsersPageClient";
import { UserRole } from "@/models";

/**
 * Users management page — lists, creates, edits, and deactivates users.
 *
 * @returns Admin users route with permission-aware content
 */
export default function UsersPage() {
  return (
    <PermissionsProvider role={UserRole.ADMIN}>
      <Suspense
        fallback={
          <section
            data-testid="users-suspense-fallback"
            className="space-y-3"
          >
            <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-12 w-full animate-pulse rounded-md bg-neutral-200" />
          </section>
        }
      >
        <UsersPageClient />
      </Suspense>
    </PermissionsProvider>
  );
}
