import { Suspense } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { LotacoesPageClient } from "@/components/organisms/LotacoesPageClient";
import { UserRole } from "@/models";

/**
 * Lotações management page — lists, creates, edits, and soft-deletes lotações.
 *
 * @returns Admin lotações route with permission-aware content
 */
export default function LotacoesPage() {
  return (
    <PermissionsProvider role={UserRole.ADMIN}>
      <Suspense
        fallback={
          <section
            data-testid="lotacoes-suspense-fallback"
            className="space-y-3"
          >
            <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
            <div className="h-24 w-full animate-pulse rounded-md bg-neutral-200" />
          </section>
        }
      >
        <LotacoesPageClient />
      </Suspense>
    </PermissionsProvider>
  );
}
