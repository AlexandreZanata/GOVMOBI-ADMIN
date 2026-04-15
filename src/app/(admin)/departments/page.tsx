import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { DepartmentsPageClient } from "@/components/organisms/DepartmentsPageClient";
import { UserRole } from "@/models";

/**
 * Departments management page — lists and creates departments.
 *
 * @returns Admin departments route with permission-aware content
 */
export default function DepartmentsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PermissionsProvider role={UserRole.ADMIN}>
        <Suspense
          fallback={
            <section
              data-testid="departments-suspense-fallback"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 w-full animate-pulse rounded-lg bg-neutral-200"
                />
              ))}
            </section>
          }
        >
          <DepartmentsPageClient />
        </Suspense>
      </PermissionsProvider>
    </div>
  );
}
