import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { CargosPageClient } from "@/components/organisms/CargosPageClient";
import { UserRole } from "@/models";

export default function CargosPage() {
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
        <CargosPageClient />
      </Suspense>
    </PermissionsProvider>
  );
}
