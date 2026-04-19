import { Suspense } from "react";

import { VeiculosPageClient } from "@/components/organisms/VeiculosPageClient";

/**
 * Vehicles management page — lists, registers, edits, and manages
 * activation state of fleet vehicles.
 */
export default function VeiculosPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200" />
          <div className="h-24 w-full animate-pulse rounded-md bg-neutral-200" />
        </section>
      }
    >
      <VeiculosPageClient />
    </Suspense>
  );
}
