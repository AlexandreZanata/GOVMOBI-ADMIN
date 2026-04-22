import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { DashboardPageClient } from "@/components/organisms/DashboardPageClient";
import { UserRole } from "@/models";

/**
 * Dashboard page — operational overview with KPI cards, rankings, and status charts.
 * First page in the admin navigation, accessible to all authenticated roles.
 *
 * @returns Admin dashboard route with real-time operational metrics
 */
export default function DashboardPage() {
  return (
    <PermissionsProvider role={UserRole.DISPATCHER}>
      <Suspense
        fallback={
          <section data-testid="dashboard-suspense-fallback" className="space-y-8">
            <div className="space-y-2">
              <div className="h-7 w-36 animate-pulse rounded-md bg-neutral-200" />
              <div className="h-4 w-56 animate-pulse rounded-md bg-neutral-200" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-neutral-200" />
              ))}
            </div>
          </section>
        }
      >
        <DashboardPageClient />
      </Suspense>
    </PermissionsProvider>
  );
}
