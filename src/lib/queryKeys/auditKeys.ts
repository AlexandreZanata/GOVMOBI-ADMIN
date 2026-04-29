import type { AuditFilters } from "@/types/audit";

export const auditKeys = {
  all: ["audit"] as const,
  trail: (filters?: AuditFilters) =>
    [...auditKeys.all, "trail", filters ?? {}] as const,
};
