import type { AuditFilters } from "@/types/audit";

/**
 * Audit query key factory for TanStack Query caches.
 */
export const auditKeys = {
  all: ["audit"] as const,
  trail: (filters?: AuditFilters) =>
    [...auditKeys.all, "trail", filters ?? {}] as const,
};
