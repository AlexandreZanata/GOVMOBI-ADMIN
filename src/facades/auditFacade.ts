import { handleApiResponse } from "@/lib/handleApiResponse";
import type { AuditFilters, AuditTrailPage, ListAuditTrailInput } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

/**
 * Facade for audit trail read operations.
 */
export const auditFacade = {
  /**
   * Retrieves a cursor-based page of audit entries.
   *
   * @param input - Optional filters and cursor token
   * @returns Promise resolving to one cursor page of audit entries
   * @throws ApiError on non-2xx responses
   */
  async listAuditTrail(input: ListAuditTrailInput = {}): Promise<AuditTrailPage> {
    const params = new URLSearchParams();
    const filters: AuditFilters | undefined = input.filters;

    if (filters?.eventType) params.set("eventType", filters.eventType);
    if (filters?.actorId) params.set("actorId", filters.actorId);
    if (filters?.entityType) params.set("entityType", filters.entityType);
    if (filters?.entityId) params.set("entityId", filters.entityId);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.pageSize) params.set("pageSize", String(filters.pageSize));
    if (input.cursor) params.set("cursor", input.cursor);

    const queryString = params.toString();
    const response = await fetch(
      `${BASE_URL}/v1/audit${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
      }
    );

    return handleApiResponse<AuditTrailPage>(response);
  },
};
