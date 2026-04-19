import type { CorridasFilters } from "@/models/Run";

/**
 * Corridas query key factory for TanStack Query caches.
 */
export const runsKeys = {
  all: ["corridas"] as const,
  list: (filters?: CorridasFilters) => [...runsKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...runsKeys.all, "detail", id] as const,
};
