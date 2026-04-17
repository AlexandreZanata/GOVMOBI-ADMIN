import { Suspense } from "react";

import { MotoristasPageClient } from "@/components/organisms/MotoristasPageClient";

/**
 * Motoristas management page — lists, registers, edits, and manages
 * operational status and activation state of motoristas.
 */
export default function MotoristasPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
          <div className="h-24 w-full animate-pulse rounded-md bg-neutral-200" />
        </section>
      }
    >
      <MotoristasPageClient />
    </Suspense>
  );
}
